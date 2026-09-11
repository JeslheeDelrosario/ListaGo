/**
 * projectModal.js - Project creation and deletion modals
 */

import {
  Projects,
  AVAILABLE_PROJECT_COLORS,
  AVAILABLE_PROJECT_ICONS,
} from "./projectManager.js";
import { Tasks } from "./taskManager.js";
import { Modal } from "./modal.js";
import { escapeHTML } from "./utils.js";

export const ProjectModal = {
  selectedColor: AVAILABLE_PROJECT_COLORS[0],
  selectedIcon: AVAILABLE_PROJECT_ICONS[0],

  init() {
    this.setupColorPicker();
    this.setupIconPicker();
    this.setupForm();
    this.setupDeleteModal();
  },

  setupColorPicker() {
    const container = document.getElementById("project-color-picker");
    if (!container) return;

    container.innerHTML = "";
    AVAILABLE_PROJECT_COLORS.forEach((color, idx) => {
      const el = document.createElement("div");
      el.className = `color-option ${idx === 0 ? "selected" : ""}`;
      el.style.backgroundColor = color;
      el.setAttribute("data-color", color);

      el.addEventListener("click", () => {
        container
          .querySelectorAll(".color-option")
          .forEach((o) => o.classList.remove("selected"));
        el.classList.add("selected");
        this.selectedColor = color;
      });

      container.appendChild(el);
    });
  },

  setupIconPicker() {
    const container = document.getElementById("project-icon-picker");
    if (!container) return;

    container.innerHTML = "";
    AVAILABLE_PROJECT_ICONS.forEach((iconClass, idx) => {
      const el = document.createElement("div");
      el.className = `icon-option ${idx === 0 ? "selected" : ""}`;
      el.innerHTML = `<i class="${iconClass}"></i>`;
      el.setAttribute("data-icon", iconClass);

      el.addEventListener("click", () => {
        container
          .querySelectorAll(".icon-option")
          .forEach((o) => o.classList.remove("selected"));
        el.classList.add("selected");
        this.selectedIcon = iconClass;
      });

      container.appendChild(el);
    });
  },

  setupForm() {
    const form = document.getElementById("project-create-form");
    const nameInput = document.getElementById("project-name-input");
    const charCounter = document.getElementById("project-name-counter");

    if (nameInput && charCounter) {
      nameInput.addEventListener("input", () => {
        charCounter.textContent = `${nameInput.value.length}/50`;
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = nameInput.value;
        const project = Projects.addProject({
          name,
          color: this.selectedColor,
          icon: this.selectedIcon,
        });

        if (project) {
          form.reset();
          if (charCounter) charCounter.textContent = "0/50";
          Modal.close("project-modal");
        }
      });
    }

    // Open project modal button
    const openBtn = document.getElementById("btn-new-project");
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        if (form) form.reset();
        this.selectedColor = AVAILABLE_PROJECT_COLORS[0];
        this.selectedIcon = AVAILABLE_PROJECT_ICONS[0];
        this.setupColorPicker();
        this.setupIconPicker();
        if (charCounter) charCounter.textContent = "0/50";
        Modal.open("project-modal");
        setTimeout(() => nameInput && nameInput.focus(), 100);
      });
    }
  },

  openDeleteDialog(projectId) {
    const project = Projects.getProjectById(projectId);
    if (!project || project.isDefault) return;

    const modal = document.getElementById("delete-project-modal");
    const namePreview = document.getElementById("delete-project-name-preview");
    const countPreview = document.getElementById("delete-project-task-count");
    const confirmBtn = document.getElementById("delete-project-confirm-btn");
    const actionSelect = document.getElementById(
      "delete-project-action-select",
    );

    const projectTasks = Tasks.getTasks().filter(
      (t) => t.projectId === projectId,
    );

    if (namePreview) {
      namePreview.textContent = project.name;
    }
    if (countPreview) {
      countPreview.textContent = `${projectTasks.length} task${projectTasks.length !== 1 ? "s" : ""}`;
    }

    if (confirmBtn) {
      const newBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

      newBtn.addEventListener("click", () => {
        const action = actionSelect ? actionSelect.value : "move";
        if (action === "move") {
          Tasks.moveTasksToInbox(projectId);
        } else {
          Tasks.deleteTasksByProject(projectId);
        }

        Projects.deleteProject(projectId);
        Modal.close("delete-project-modal");
      });
    }

    Modal.open("delete-project-modal");
  },

  setupDeleteModal() {
    // Handled via openDeleteDialog
  },
};
