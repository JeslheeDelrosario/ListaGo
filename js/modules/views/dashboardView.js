/**
 * dashboardView.js - Dashboard view rendering with statistics and organized task sections
 */

import { Tasks } from "../taskManager.js";
import { Projects } from "../projectManager.js";
import {
  isOverdue,
  isToday,
  isUpcoming,
  formatDate,
  escapeHTML,
  renderFormattedContent,
} from "../utils.js";
import { TaskFormModal } from "../taskFormModal.js";
import { Modal } from "../modal.js";

export const DashboardView = {
  render(container) {
    const stats = Tasks.getStats();
    const tasks = Tasks.getTasks();

    const overdueTasks = tasks.filter(
      (t) => !t.completed && t.dueDate && isOverdue(t.dueDate),
    );
    const todayTasks = tasks.filter(
      (t) => !t.completed && t.dueDate && isToday(t.dueDate),
    );
    const upcomingTasks = tasks.filter(
      (t) => !t.completed && t.dueDate && isUpcoming(t.dueDate),
    );
    const recentTasks = [...tasks].slice(0, 5);

    const hasOverdueClass = stats.overdue > 0 ? "has-overdue" : "";

    container.innerHTML = `
      <div class="dashboard-container">
        <!-- Statistics Grid -->
        <div class="stats-grid">
          <div class="stat-card-compact total">
            <div class="stat-info">
              <span class="stat-label">Total Tasks</span>
              <span class="stat-number">${stats.total}</span>
            </div>
            <div class="stat-icon-wrapper">
              <i class="fas fa-tasks"></i>
            </div>
          </div>

          <div class="stat-card-compact pending">
            <div class="stat-info">
              <span class="stat-label">Pending</span>
              <span class="stat-number">${stats.pending}</span>
            </div>
            <div class="stat-icon-wrapper">
              <i class="fas fa-clock"></i>
            </div>
          </div>

          <div class="stat-card-compact completed">
            <div class="stat-info">
              <span class="stat-label">Completed</span>
              <span class="stat-number">${stats.completed}</span>
            </div>
            <div class="stat-icon-wrapper">
              <i class="fas fa-check-double"></i>
            </div>
          </div>

          <div class="stat-card-compact overdue ${hasOverdueClass}">
            <div class="stat-info">
              <span class="stat-label">Overdue</span>
              <span class="stat-number">${stats.overdue}</span>
            </div>
            <div class="stat-icon-wrapper">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
          </div>
        </div>

        <!-- Completion Progress Banner -->
        <div class="completion-banner">
          <div class="completion-header">
            <div class="completion-title">
              <i class="fas fa-chart-line" style="color: #818cf8;"></i>
              Sprint Velocity & Progress
            </div>
            <div class="completion-percentage">${stats.completionRate}% Done</div>
          </div>
          <div class="progress-track">
            <div class="progress-bar-fill" style="width: ${stats.completionRate}%;"></div>
          </div>
        </div>

        ${
          stats.overdue > 0
            ? `
          <!-- Overdue Warning Alert -->
          <div class="overdue-alert-box">
            <div class="overdue-alert-left">
              <i class="fas fa-exclamation-circle"></i>
              <div>
                <strong>Attention Required:</strong> You have ${stats.overdue} overdue task${stats.overdue > 1 ? "s" : ""} past deadline.
              </div>
            </div>
            <button class="btn-sm-danger" id="dashboard-resolve-overdue-btn">
              View Overdue Tasks
            </button>
          </div>
        `
            : ""
        }

        <!-- Due Today Section -->
        <div class="dashboard-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fas fa-sun" style="color: #fbbf24;"></i>
              Due Today
              <span class="section-count-badge">${todayTasks.length}</span>
            </div>
            <button class="section-action-btn" data-switch-view="today">
              View All <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <div class="tasks-list" id="dashboard-today-list">
            ${
              todayTasks.length > 0
                ? todayTasks.map((t) => this.renderMiniTask(t)).join("")
                : `
              <div class="empty-state" style="padding: 2rem 1rem;">
                <i class="fas fa-glass-cheers" style="font-size: 1.5rem; color: #10b981;"></i>
                <div class="empty-state-title" style="font-size: 1rem;">No tasks due today</div>
                <div class="empty-state-desc" style="font-size: 0.8rem;">You are completely caught up for today!</div>
              </div>
            `
            }
          </div>
        </div>

        <!-- Upcoming (Next 7 Days) Section -->
        <div class="dashboard-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fas fa-calendar-week" style="color: #818cf8;"></i>
              Upcoming in Next 7 Days
              <span class="section-count-badge">${upcomingTasks.length}</span>
            </div>
            <button class="section-action-btn" data-switch-view="upcoming">
              View All <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <div class="tasks-list" id="dashboard-upcoming-list">
            ${
              upcomingTasks.length > 0
                ? upcomingTasks.map((t) => this.renderMiniTask(t)).join("")
                : `
              <div class="empty-state" style="padding: 2rem 1rem;">
                <i class="fas fa-calendar-check" style="font-size: 1.5rem; color: #818cf8;"></i>
                <div class="empty-state-title" style="font-size: 1rem;">No upcoming tasks</div>
                <div class="empty-state-desc" style="font-size: 0.8rem;">No tasks scheduled for the next 7 days.</div>
              </div>
            `
            }
          </div>
        </div>

        <!-- Recent Tasks Overview -->
        <div class="dashboard-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fas fa-history" style="color: #a855f7;"></i>
              Recent Tasks
              <span class="section-count-badge">${recentTasks.length}</span>
            </div>
            <button class="section-action-btn" data-switch-view="all">
              View All Tasks <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <div class="tasks-list" id="dashboard-recent-list">
            ${
              recentTasks.length > 0
                ? recentTasks.map((t) => this.renderMiniTask(t)).join("")
                : `
              <div class="empty-state" style="padding: 2rem 1rem;">
                <i class="fas fa-tasks" style="font-size: 1.5rem; color: #a855f7;"></i>
                <div class="empty-state-title" style="font-size: 1rem;">No tasks yet</div>
                <div class="empty-state-desc" style="font-size: 0.8rem;">Click '+ New Task' or use Quick Add to create your first task.</div>
              </div>
            `
            }
          </div>
        </div>
      </div>
    `;

    this.attachEvents(container);
  },

  renderMiniTask(task) {
    const project = Projects.getProjectById(task.projectId);
    const dateFormatted = task.dueDate ? formatDate(task.dueDate) : null;
    const isTaskOverdue =
      !task.completed && task.dueDate && isOverdue(task.dueDate);
    const isTaskToday =
      !task.completed && task.dueDate && isToday(task.dueDate);

    let dateClass = "";
    if (isTaskOverdue) dateClass = "overdue";
    else if (isTaskToday) dateClass = "today";

    const formattedTitle = renderFormattedContent(task.title);

    return `
      <div class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
        <div class="task-left-section">
          <div class="task-checkbox-wrapper">
            <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} data-action="toggle" data-id="${task.id}">
          </div>
          <div class="task-details" data-action="edit" data-id="${task.id}">
            <div class="task-title-formatted">${formattedTitle}</div>
            <div class="task-meta-row">
              <span class="badge badge-priority-${task.priority}">
                <i class="fas fa-flag"></i> ${task.priority}
              </span>
              <span class="badge badge-status ${task.status}">
                ${task.status}
              </span>
              <span class="badge badge-project">
                <i class="${project.icon}" style="color: ${project.color}"></i> ${escapeHTML(project.name)}
              </span>
              ${
                dateFormatted
                  ? `
                <span class="badge-date ${dateClass}">
                  <i class="fas fa-calendar-day"></i> ${dateFormatted}
                </span>
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
  },

  attachEvents(container) {
    // Checkboxes toggle completion
    container.querySelectorAll('[data-action="toggle"]').forEach((chk) => {
      chk.addEventListener("change", () => {
        const id = chk.getAttribute("data-id");
        Tasks.toggleComplete(id);
      });
    });

    // Edit task clicks
    container.querySelectorAll('[data-action="edit"]').forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        TaskFormModal.openEdit(id);
      });
    });

    // Delete task clicks
    container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        Modal.confirmDeleteTask(id);
      });
    });

    // Switch view shortcut buttons
    container.querySelectorAll("[data-switch-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetView = btn.getAttribute("data-switch-view");
        const navItem = document.querySelector(
          `.nav-item[data-view="${targetView}"]`,
        );
        if (navItem) navItem.click();
      });
    });

    // Resolve overdue button
    const resolveBtn = container.querySelector(
      "#dashboard-resolve-overdue-btn",
    );
    if (resolveBtn) {
      resolveBtn.addEventListener("click", () => {
        const navItem = document.querySelector('.nav-item[data-view="all"]');
        if (navItem) navItem.click();
        const statusFilter = document.getElementById("view-filter-status");
        if (statusFilter) {
          statusFilter.value = "all";
        }
        const sortSelect = document.getElementById("view-sort-by");
        if (sortSelect) sortSelect.value = "dueDate";
      });
    }
  },
};
