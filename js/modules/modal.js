// js\modules\modal.js
import { Tasks } from "./taskManager.js";
import { escapeHTML } from "./utils.js";

export const Modal = {
  activeModal: null,

  open(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.add("active");
      this.activeModal = el;
      document.body.style.overflow = "hidden";
    }
  },

  close(modalId) {
    const el = modalId ? document.getElementById(modalId) : this.activeModal;
    if (el) {
      el.classList.remove("active");
      if (this.activeModal === el) {
        this.activeModal = null;
      }
    }
    // If no modals active, restore body scroll
    if (!document.querySelector(".modal-overlay.active")) {
      document.body.style.overflow = "";
    }
  },

  closeAll() {
    document.querySelectorAll(".modal-overlay.active").forEach((m) => {
      m.classList.remove("active");
    });
    this.activeModal = null;
    document.body.style.overflow = "";
  },

  /**
   * Prompts delete confirmation for a single task.
   */
  confirmDeleteTask(taskId) {
    const task = Tasks.getTaskById(taskId);
    if (!task) return;

    const modal = document.getElementById("delete-modal");
    const titleEl = document.getElementById("delete-task-title-preview");
    const confirmBtn = document.getElementById("delete-confirm-btn");

    if (titleEl) {
      titleEl.innerHTML = `<strong>"${escapeHTML(task.title)}"</strong>`;
    }

    if (confirmBtn) {
      // Replace button clone to clear previous event listeners
      const newBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

      newBtn.addEventListener("click", () => {
        Tasks.deleteTask(taskId);
        this.close("delete-modal");
      });
    }

    this.open("delete-modal");
  },

  /**
   * Prompts confirmation for bulk deleting selected tasks.
   */
  confirmBulkDelete(taskIds, onComplete) {
    if (!taskIds || !taskIds.length) return;

    const modal = document.getElementById("bulk-delete-modal");
    const descEl = document.getElementById("bulk-delete-desc");
    const confirmBtn = document.getElementById("bulk-delete-confirm-btn");

    if (descEl) {
      descEl.textContent = `Are you sure you want to permanently delete ${taskIds.length} selected task${taskIds.length > 1 ? "s" : ""}? This action cannot be undone.`;
    }

    if (confirmBtn) {
      const newBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

      newBtn.addEventListener("click", () => {
        Tasks.deleteTasks(taskIds);
        this.close("bulk-delete-modal");
        if (onComplete) onComplete();
      });
    }

    this.open("bulk-delete-modal");
  },

  /**
   * Prompts confirmation to clear all completed tasks.
   */
  confirmClearCompleted() {
    const completedTasks = Tasks.getTasks().filter((t) => t.completed);
    if (completedTasks.length === 0) return;

    const taskIds = completedTasks.map((t) => t.id);
    this.confirmBulkDelete(taskIds, null);
  },

  init() {
    // Close on backdrop click
    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.close(overlay.id);
        }
      });
    });

    // Close buttons inside modals
    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modalId = btn.getAttribute("data-close-modal");
        this.close(modalId);
      });
    });

    // Escape key closes modals
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAll();
      }
    });
  },
};
