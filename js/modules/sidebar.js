// js\modules\sidebar.js/

import { Tasks } from "./taskManager.js";
import { Projects } from "./projectManager.js";
import { UI } from "./uiRenderer.js";
import { ProjectModal } from "./projectModal.js";
import { Modal } from "./modal.js";
import { escapeHTML } from "./utils.js";

export const Sidebar = {
  activeView: "dashboard",
  activeProjectId: null,

  init() {
    this.setupNavigation();
    this.setupMobileToggle();
    this.setupClearCompleted();
    this.render();

    // Listen to data changes
    Tasks.onChange(() => {
      this.updateCounts();
      UI.renderCurrentView();
    });

    Projects.onChange(() => {
      this.renderProjectsList();
      this.updateCounts();
      UI.renderCurrentView();
    });
  },

  setupNavigation() {
    document.querySelectorAll(".nav-item[data-view]").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const view = item.getAttribute("data-view");
        this.setActive(view, null);
        this.closeMobileSidebar();
      });
    });

    const brandLogo = document.getElementById("brand-logo");
    if (brandLogo) {
      brandLogo.addEventListener("click", (e) => {
        e.preventDefault();
        this.setActive("dashboard", null);
        this.closeMobileSidebar();
      });
    }
  },

  setupMobileToggle() {
    const toggleBtn = document.getElementById("mobile-menu-btn");
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

    if (toggleBtn && sidebar && backdrop) {
      toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        backdrop.classList.toggle("open");
      });

      backdrop.addEventListener("click", () => {
        this.closeMobileSidebar();
      });
    }
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
  },

  setupClearCompleted() {
    const clearBtn = document.getElementById("sidebar-clear-completed-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        Modal.confirmClearCompleted();
      });
    }
  },

  setActive(view, projectId = null) {
    this.activeView = view;
    this.activeProjectId = projectId;

    // Update nav items
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("data-view") === view && !projectId) {
        item.classList.add("active");
      }
    });

    // Update project items
    document.querySelectorAll(".project-item").forEach((item) => {
      item.classList.remove("active");
      if (
        view === "project" &&
        item.getAttribute("data-project-id") === projectId
      ) {
        item.classList.add("active");
      }
    });

    UI.setView(view, projectId);
  },

  render() {
    this.renderProjectsList();
    this.updateCounts();
  },

  updateCounts() {
    const stats = Tasks.getStats();

    const elDashboard = document.getElementById("nav-badge-dashboard");
    const elAll = document.getElementById("nav-badge-all");
    const elToday = document.getElementById("nav-badge-today");
    const elUpcoming = document.getElementById("nav-badge-upcoming");
    const elCompleted = document.getElementById("nav-badge-completed");

    if (elDashboard) elDashboard.textContent = stats.total;
    if (elAll) elAll.textContent = stats.pending;
    if (elToday) elToday.textContent = stats.today;
    if (elUpcoming) elUpcoming.textContent = stats.upcoming;
    if (elCompleted) elCompleted.textContent = stats.completed;

    // Highlight overdue in nav if any
    if (elToday && stats.overdue > 0) {
      elToday.classList.add("danger");
    } else if (elToday) {
      elToday.classList.remove("danger");
    }

    // Update counts on project list items
    const tasks = Tasks.getTasks();
    document.querySelectorAll(".project-item").forEach((item) => {
      const pId = item.getAttribute("data-project-id");
      const countBadge = item.querySelector(".project-task-count");
      if (countBadge && pId) {
        const pTasks = tasks.filter(
          (t) => !t.completed && (t.projectId || "inbox") === pId,
        );
        countBadge.textContent = pTasks.length;
      }
    });
  },

  renderProjectsList() {
    const container = document.getElementById("projects-list");
    if (!container) return;

    const projects = Projects.getProjects();
    const tasks = Tasks.getTasks();

    // Default Inbox count
    const inboxTasks = tasks.filter(
      (t) => !t.completed && (!t.projectId || t.projectId === "inbox"),
    );

    let html = `
      <div class="project-item ${this.activeView === "project" && this.activeProjectId === "inbox" ? "active" : ""}" data-project-id="inbox">
        <div class="project-meta">
          <div class="project-icon-badge" style="color: #6366f1;">
            <i class="fas fa-inbox"></i>
          </div>
          <span class="project-name">Inbox</span>
        </div>
        <div class="project-actions">
          <span class="nav-badge project-task-count">${inboxTasks.length}</span>
        </div>
      </div>
    `;

    projects.forEach((p) => {
      const pTasks = tasks.filter((t) => !t.completed && t.projectId === p.id);
      const isActive =
        this.activeView === "project" && this.activeProjectId === p.id;

      html += `
        <div class="project-item ${isActive ? "active" : ""}" data-project-id="${p.id}">
          <div class="project-meta">
            <div class="project-color-dot" style="background-color: ${p.color};"></div>
            <div class="project-icon-badge" style="color: ${p.color};">
              <i class="${p.icon}"></i>
            </div>
            <span class="project-name" title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</span>
          </div>
          <div class="project-actions">
            <span class="nav-badge project-task-count">${pTasks.length}</span>
            <button class="project-delete-btn" title="Delete Project" data-delete-project="${p.id}">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Attach click events
    container.querySelectorAll(".project-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        // Prevent if clicking delete button
        if (e.target.closest(".project-delete-btn")) return;
        const pId = item.getAttribute("data-project-id");
        this.setActive("project", pId);
        this.closeMobileSidebar();
      });
    });

    container.querySelectorAll(".project-delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const pId = btn.getAttribute("data-delete-project");
        ProjectModal.openDeleteDialog(pId);
      });
    });
  },
};
