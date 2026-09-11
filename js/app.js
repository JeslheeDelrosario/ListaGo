/**
 * app.js - Main entry point for ListaGo Task Management Application
 */

import { Projects } from "./modules/projectManager.js";
import { Tasks } from "./modules/taskManager.js";
import { Notifications } from "./modules/notifications.js";
import { Modal } from "./modules/modal.js";
import { ProjectModal } from "./modules/projectModal.js";
import { TaskFormModal } from "./modules/taskFormModal.js";
import { UI } from "./modules/uiRenderer.js";
import { Sidebar } from "./modules/sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✨ ListaGo Task Manager initializing with Glassmorphism UI...");

  // Initialize core subsystems
  Notifications.init();
  Projects.init();
  Tasks.init();
  Modal.init();
  ProjectModal.init();
  TaskFormModal.init();
  UI.init();
  Sidebar.init();

  // Initial view is dashboard
  UI.setView("dashboard");

  // Keyboard Shortcuts
  setupKeyboardShortcuts();

  // Setup shortcuts modal button
  const shortcutsBtn = document.getElementById("btn-shortcuts-help");
  if (shortcutsBtn) {
    shortcutsBtn.addEventListener("click", () => {
      Modal.open("shortcuts-modal");
    });
  }

  console.log("🚀 ListaGo is ready!");
});

function setupKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    // If user is actively typing inside an input/textarea/contenteditable, skip some global shortcuts
    const isEditing =
      ["INPUT", "TEXTAREA"].includes(e.target.tagName) ||
      e.target.isContentEditable;

    // `/` shortcut - Focus search bar (from anywhere if not editing)
    if (e.key === "/" && !isEditing) {
      e.preventDefault();
      const searchInput =
        document.getElementById("header-search-input") ||
        document.getElementById("content-search-input");
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    // `Ctrl/Cmd + A` - Quick Add or focus task input
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "a" || e.key === "A") &&
      !isEditing
    ) {
      e.preventDefault();
      const quickInput = document.getElementById("quick-add-input");
      if (quickInput && quickInput.offsetParent !== null) {
        quickInput.focus();
      } else {
        TaskFormModal.openCreate();
      }
      return;
    }

    // `Delete` - Clear all completed tasks (when not editing an input)
    if (e.key === "Delete" && !isEditing && !Modal.activeModal) {
      e.preventDefault();
      Modal.confirmClearCompleted();
      return;
    }

    // `?` - Show keyboard shortcuts
    if (e.key === "?" && !isEditing) {
      e.preventDefault();
      Modal.open("shortcuts-modal");
      return;
    }
  });
}
