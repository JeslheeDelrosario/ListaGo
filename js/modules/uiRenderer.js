/**
 * uiRenderer.js - Main UI rendering with priority badges, status indicators, multi-select, and quick add
 */

import { Tasks, MAX_TASK_LENGTH } from "./taskManager.js";
import { Projects } from "./projectManager.js";
import {
  isOverdue,
  isToday,
  formatDate,
  escapeHTML,
  renderFormattedContent,
  isLongTask,
} from "./utils.js";
import { TaskFormModal } from "./taskFormModal.js";
import { Modal } from "./modal.js";
import { DashboardView } from "./views/dashboardView.js";

class UIRenderer {
  constructor() {
    this.currentView = "dashboard"; // 'dashboard' | 'all' | 'today' | 'upcoming' | 'completed' | 'project'
    this.currentProjectId = null;
    this.currentStatusFilter = "all";
    this.currentPriorityFilter = "all";
    this.currentSortBy = "dueDate";
    this.searchQuery = "";
    this.selectedTaskIds = new Set();
    this.expandedTaskIds = new Set();
  }

  init() {
    this.setupViewControls();
    this.setupQuickAdd();
    this.setupBulkActions();
    this.setupSearch();
  }

  setupSearch() {
    const searchInputs = [
      document.getElementById("header-search-input"),
      document.getElementById("content-search-input"),
    ];

    searchInputs.forEach((input) => {
      if (!input) return;
      input.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        // Keep both search inputs in sync if both exist
        searchInputs.forEach((other) => {
          if (other && other !== input) other.value = this.searchQuery;
        });
        this.renderCurrentView();
      });
    });
  }

  setupViewControls() {
    // Status Tabs (All, To Do, In Progress, Review, Done)
    document.querySelectorAll(".status-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document
          .querySelectorAll(".status-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.currentStatusFilter = tab.getAttribute("data-status");
        this.renderCurrentView();
      });
    });

    // Priority filter dropdown
    const prioritySelect = document.getElementById("view-filter-priority");
    if (prioritySelect) {
      prioritySelect.addEventListener("change", (e) => {
        this.currentPriorityFilter = e.target.value;
        this.renderCurrentView();
      });
    }

    // Sort by dropdown
    const sortSelect = document.getElementById("view-sort-by");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSortBy = e.target.value;
        this.renderCurrentView();
      });
    }
  }

  setupQuickAdd() {
    const textarea = document.getElementById("quick-add-input");
    const prioritySelect = document.getElementById("quick-add-priority");
    const projectSelect = document.getElementById("quick-add-project");
    const submitBtn = document.getElementById("quick-add-btn");
    const expandBtn = document.getElementById("quick-add-expand-btn");
    const bulletBtn = document.getElementById("quick-add-bullet-btn");

    // Auto-resizing textarea as user types long tasks or lists
    const autoResize = () => {
      if (!textarea) return;
      textarea.style.height = "auto";
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 28), 160);
      textarea.style.height = `${newHeight}px`;
    };

    if (textarea) {
      textarea.addEventListener("input", autoResize);
    }

    // Bullet insert helper button
    if (bulletBtn && textarea) {
      bulletBtn.addEventListener("click", () => {
        textarea.focus();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        const needsNewline = start > 0 && value[start - 1] !== "\n";
        const prefix = needsNewline ? "\n- " : "- ";
        textarea.value =
          value.substring(0, start) + prefix + value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
        autoResize();
      });
    }

    const handleAdd = () => {
      if (!textarea) return;
      const title = textarea.value.trim();
      if (!title) {
        textarea.focus();
        return;
      }

      const priority = prioritySelect ? prioritySelect.value : "medium";
      const projectId = projectSelect
        ? projectSelect.value
        : this.currentProjectId || "inbox";

      // Default due date: if in today view, set to today
      let dueDate = null;
      if (this.currentView === "today") {
        const now = new Date();
        dueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      }

      const task = Tasks.addTask({
        title,
        priority,
        projectId,
        dueDate,
        status: "todo",
      });

      if (task) {
        textarea.value = "";
        textarea.style.height = "auto";
        textarea.focus();
      }
    };

    if (submitBtn) {
      submitBtn.addEventListener("click", handleAdd);
    }

    if (textarea) {
      textarea.addEventListener("keydown", (e) => {
        // Enter without Shift submits; Shift+Enter creates a new line or auto-continues bullet
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleAdd();
        } else if (e.key === "Enter" && e.shiftKey) {
          // Check if current line starts with bullet (- or * or 1.)
          const cursorPos = textarea.selectionStart;
          const textBefore = textarea.value.substring(0, cursorPos);
          const currentLine = textBefore.split("\n").pop();
          const bulletMatch = currentLine.match(/^([*\-•+])\s+(.*)$/);
          const numberMatch = currentLine.match(/^(\d+)[\.\)]\s+(.*)$/);

          if (bulletMatch && bulletMatch[2].trim()) {
            e.preventDefault();
            const insertion = `\n${bulletMatch[1]} `;
            const textAfter = textarea.value.substring(cursorPos);
            textarea.value = textBefore + insertion + textAfter;
            textarea.selectionStart = textarea.selectionEnd =
              cursorPos + insertion.length;
            autoResize();
          } else if (numberMatch && numberMatch[2].trim()) {
            e.preventDefault();
            const nextNum = parseInt(numberMatch[1], 10) + 1;
            const insertion = `\n${nextNum}. `;
            const textAfter = textarea.value.substring(cursorPos);
            textarea.value = textBefore + insertion + textAfter;
            textarea.selectionStart = textarea.selectionEnd =
              cursorPos + insertion.length;
            autoResize();
          }
        }
      });
    }

    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        const title = textarea ? textarea.value.trim() : "";
        TaskFormModal.openCreate({
          title,
          projectId: this.currentProjectId || "inbox",
        });
      });
    }
  }

  setupBulkActions() {
    const deleteBtn = document.getElementById("bulk-delete-btn");
    const cancelBtn = document.getElementById("bulk-cancel-btn");
    const selectAllBtn = document.getElementById("bulk-select-all-btn");

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        const ids = Array.from(this.selectedTaskIds);
        Modal.confirmBulkDelete(ids, () => {
          this.selectedTaskIds.clear();
          this.updateBulkActionBar();
        });
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.selectedTaskIds.clear();
        this.updateBulkActionBar();
        this.renderTaskListOnly();
      });
    }

    if (selectAllBtn) {
      selectAllBtn.addEventListener("click", () => {
        const tasks = this.getFilteredTasks();
        tasks.forEach((t) => this.selectedTaskIds.add(t.id));
        this.updateBulkActionBar();
        this.renderTaskListOnly();
      });
    }
  }

  updateBulkActionBar() {
    const bar = document.getElementById("bulk-actions-bar");
    const countEl = document.getElementById("bulk-selection-count");
    if (!bar || !countEl) return;

    const count = this.selectedTaskIds.size;
    if (count > 0) {
      bar.classList.add("show");
      countEl.textContent = `${count} task${count > 1 ? "s" : ""} selected`;
    } else {
      bar.classList.remove("show");
    }
  }

  setView(view, projectId = null) {
    this.currentView = view;
    this.currentProjectId = projectId;
    this.selectedTaskIds.clear();
    this.updateBulkActionBar();
    this.renderCurrentView();
  }

  getFilteredTasks() {
    return Tasks.filterTasks({
      view: this.currentView,
      projectId: this.currentProjectId,
      status: this.currentStatusFilter,
      priority: this.currentPriorityFilter,
      search: this.searchQuery,
      sortBy: this.currentSortBy,
    });
  }

  renderCurrentView() {
    const dashboardContainer = document.getElementById("dashboard-view");
    const tasksContainer = document.getElementById("tasks-view");
    const viewHeader = document.getElementById("view-header");
    const controlsBar = document.getElementById("view-controls-bar");
    const quickAddContainer = document.getElementById("quick-add-container");

    if (this.currentView === "dashboard") {
      if (dashboardContainer) dashboardContainer.style.display = "block";
      if (tasksContainer) tasksContainer.style.display = "none";
      if (viewHeader) viewHeader.style.display = "none";
      if (controlsBar) controlsBar.style.display = "none";
      if (quickAddContainer) quickAddContainer.style.display = "none";
      DashboardView.render(dashboardContainer);
      return;
    }

    // Task list views (all, today, upcoming, completed, project)
    if (dashboardContainer) dashboardContainer.style.display = "none";
    if (tasksContainer) tasksContainer.style.display = "block";
    if (viewHeader) viewHeader.style.display = "flex";
    if (controlsBar) controlsBar.style.display = "flex";
    if (quickAddContainer) quickAddContainer.style.display = "flex";

    this.renderViewHeader();
    this.populateQuickAddProjects();
    this.renderTaskListOnly();
  }

  populateQuickAddProjects() {
    const select = document.getElementById("quick-add-project");
    if (!select) return;

    select.innerHTML = '<option value="inbox">📥 Inbox</option>';
    const projects = Projects.getProjects();
    projects.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name}`;
      if (this.currentProjectId === p.id) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  }

  renderViewHeader() {
    const titleEl = document.getElementById("view-title");
    const subtitleEl = document.getElementById("view-subtitle");
    if (!titleEl || !subtitleEl) return;

    if (this.currentView === "all") {
      titleEl.innerHTML =
        '<i class="fas fa-list-check" style="color: #6366f1;"></i> All Tasks';
      subtitleEl.textContent =
        "Complete inventory of all scheduled and active tasks";
    } else if (this.currentView === "today") {
      titleEl.innerHTML =
        '<i class="fas fa-sun" style="color: #fbbf24;"></i> Today';
      subtitleEl.textContent = "Tasks scheduled for completion today";
    } else if (this.currentView === "upcoming") {
      titleEl.innerHTML =
        '<i class="fas fa-calendar-alt" style="color: #818cf8;"></i> Upcoming (7 Days)';
      subtitleEl.textContent = "Tasks due within the next week";
    } else if (this.currentView === "completed") {
      titleEl.innerHTML =
        '<i class="fas fa-check-circle" style="color: #10b981;"></i> Completed';
      subtitleEl.textContent = "Finished tasks and archived items";
    } else if (this.currentView === "project" && this.currentProjectId) {
      const project = Projects.getProjectById(this.currentProjectId);
      titleEl.innerHTML = `<i class="${project.icon}" style="color: ${project.color}"></i> ${escapeHTML(project.name)}`;
      subtitleEl.textContent = `Tasks organized under ${escapeHTML(project.name)}`;
    }
  }

  renderTaskListOnly() {
    const container = document.getElementById("tasks-list-container");
    if (!container) return;

    const tasks = this.getFilteredTasks();

    if (tasks.length === 0) {
      let emptyTitle = "No tasks found";
      let emptyDesc = "No tasks match your current view or filter criteria.";

      if (this.searchQuery) {
        emptyTitle = "No matching tasks";
        emptyDesc = `No tasks found matching "${escapeHTML(this.searchQuery)}".`;
      } else if (this.currentView === "today") {
        emptyTitle = "Nothing due today";
        emptyDesc =
          "You have no tasks scheduled for today. Take a break or plan ahead!";
      } else if (this.currentView === "upcoming") {
        emptyTitle = "No upcoming tasks";
        emptyDesc = "You have a clear horizon for the next 7 days.";
      } else if (this.currentView === "completed") {
        emptyTitle = "No completed tasks yet";
        emptyDesc = "Tasks you complete will be neatly logged here.";
      }

      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <div class="empty-state-title">${emptyTitle}</div>
          <div class="empty-state-desc">${emptyDesc}</div>
          <button class="btn-primary" id="empty-state-add-btn" style="margin-top: 0.5rem;">
            <i class="fas fa-plus"></i> Create First Task
          </button>
        </div>
      `;

      const emptyAddBtn = container.querySelector("#empty-state-add-btn");
      if (emptyAddBtn) {
        emptyAddBtn.addEventListener("click", () => {
          TaskFormModal.openCreate({
            projectId: this.currentProjectId || "inbox",
          });
        });
      }
      return;
    }

    container.innerHTML = tasks
      .map((task) => this.renderTaskCard(task))
      .join("");
    this.attachTaskEvents(container);
  }

  renderTaskCard(task) {
    const project = Projects.getProjectById(task.projectId);
    const dateFormatted = task.dueDate ? formatDate(task.dueDate) : null;
    const isTaskOverdue =
      !task.completed && task.dueDate && isOverdue(task.dueDate);
    const isTaskToday =
      !task.completed && task.dueDate && isToday(task.dueDate);

    let dateClass = "";
    if (isTaskOverdue) dateClass = "overdue";
    else if (isTaskToday) dateClass = "today";

    const isSelected = this.selectedTaskIds.has(task.id);
    const isExpanded = this.expandedTaskIds.has(task.id);
    const hasLongContent = isLongTask(task.title, task.description);

    // Format title and description (supports bullet points -, *, 1. and rich formatting)
    const formattedTitle = renderFormattedContent(task.title);
    const formattedDescription = task.description
      ? renderFormattedContent(task.description)
      : "";

    return `
      <div class="task-item ${task.completed ? "completed" : ""} ${hasLongContent ? "has-long-content" : ""} ${isExpanded ? "expanded" : ""}" data-task-id="${task.id}">
        <div class="task-left-section">
          <input type="checkbox" class="task-select-checkbox" ${isSelected ? "checked" : ""} data-action="select" data-id="${task.id}" title="Select for bulk action">
          <div class="task-checkbox-wrapper">
            <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} data-action="toggle" data-id="${task.id}" title="${task.completed ? "Mark incomplete" : "Mark complete"}">
          </div>
          <div class="task-details" data-action="edit" data-id="${task.id}">
            <div class="task-title-formatted ${!isExpanded && hasLongContent ? "collapsed" : ""}">${formattedTitle}</div>
            ${
              formattedDescription
                ? `
              <div class="task-description-formatted ${!isExpanded ? "collapsed" : ""}">
                <div class="description-header"><i class="fas fa-align-left"></i> Notes / Acceptance Criteria:</div>
                <div class="description-body">${formattedDescription}</div>
              </div>
            `
                : ""
            }
            <div class="task-meta-row">
              <span class="badge badge-priority-${task.priority}" title="Priority: ${task.priority}">
                <i class="fas fa-flag"></i> ${task.priority}
              </span>
              <span class="badge badge-status ${task.status}" title="Status: ${task.status}">
                ${task.status}
              </span>
              <span class="badge badge-project" title="Project: ${escapeHTML(project.name)}">
                <i class="${project.icon}" style="color: ${project.color}"></i> ${escapeHTML(project.name)}
              </span>
              ${
                dateFormatted
                  ? `
                <span class="badge-date ${dateClass}" title="Due: ${task.dueDate}">
                  <i class="fas fa-calendar-day"></i> ${dateFormatted}
                </span>
              `
                  : ""
              }
              ${
                hasLongContent
                  ? `
                <button type="button" class="btn-task-expand" data-action="toggle-expand" data-id="${task.id}" title="${isExpanded ? "Collapse task" : "Expand full task & bullets"}">
                  <i class="fas ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"}"></i>
                  <span>${isExpanded ? "Show less" : "Show full task"}</span>
                </button>
              `
                  : ""
              }
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="task-btn" title="Edit Task" data-action="edit" data-id="${task.id}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="task-btn delete" title="Delete Task" data-action="delete" data-id="${task.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `;
  }

  attachTaskEvents(container) {
    // Completion toggle
    container.querySelectorAll('[data-action="toggle"]').forEach((chk) => {
      chk.addEventListener("change", () => {
        const id = chk.getAttribute("data-id");
        Tasks.toggleComplete(id);
      });
    });

    // Multi-select checkbox
    container.querySelectorAll('[data-action="select"]').forEach((chk) => {
      chk.addEventListener("change", (e) => {
        const id = chk.getAttribute("data-id");
        if (chk.checked) {
          this.selectedTaskIds.add(id);
        } else {
          this.selectedTaskIds.delete(id);
        }
        this.updateBulkActionBar();
      });
    });

    // Expand/collapse long task toggle
    container
      .querySelectorAll('[data-action="toggle-expand"]')
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.getAttribute("data-id");
          if (this.expandedTaskIds.has(id)) {
            this.expandedTaskIds.delete(id);
          } else {
            this.expandedTaskIds.add(id);
          }
          this.renderTaskListOnly();
        });
      });

    // Edit modal trigger
    container.querySelectorAll('[data-action="edit"]').forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target.closest('[data-action="toggle-expand"]')) return;
        const id = el.getAttribute("data-id");
        TaskFormModal.openEdit(id);
      });
    });

    // Delete trigger
    container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        Modal.confirmDeleteTask(id);
      });
    });
  }
}

export const UI = new UIRenderer();
