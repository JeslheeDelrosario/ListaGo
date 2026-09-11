/**
 * taskFormModal.js - Jira-Style Task Creation and Editing Modal with Rich Text Formatting
 */

import { Tasks, MAX_TASK_LENGTH } from "./taskManager.js";
import { Projects } from "./projectManager.js";
import { Modal } from "./modal.js";
import { getTodayDateString } from "./utils.js";

export const TaskFormModal = {
  mode: "create", // 'create' | 'edit'
  editingTaskId: null,

  init() {
    this.setupToolbar();
    this.setupForm();
    this.setupQuickDateButtons();
  },

  setupToolbar() {
    const editor = document.getElementById("task-description-editor");
    if (!editor) return;

    document.querySelectorAll(".toolbar-btn[data-command]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const command = btn.getAttribute("data-command");
        const value = btn.getAttribute("data-value") || null;

        editor.focus();
        document.execCommand(command, false, value);
        this.updateToolbarState();
      });
    });

    editor.addEventListener("keyup", () => this.updateToolbarState());
    editor.addEventListener("mouseup", () => this.updateToolbarState());
  },

  updateToolbarState() {
    document.querySelectorAll(".toolbar-btn[data-command]").forEach((btn) => {
      const command = btn.getAttribute("data-command");
      try {
        if (document.queryCommandState(command)) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      } catch (e) {
        // Ignored for non-state commands like insertUnorderedList or formatBlock
      }
    });
  },

  populateProjectSelect(selectedId = "inbox") {
    const select = document.getElementById("task-form-project");
    if (!select) return;

    select.innerHTML = '<option value="inbox">📥 Inbox (General)</option>';
    const projects = Projects.getProjects();
    projects.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name}`;
      if (p.id === selectedId) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  },

  setupQuickDateButtons() {
    const dateInput = document.getElementById("task-form-duedate");
    if (!dateInput) return;

    const setDateOffset = (offset) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      dateInput.value = `${year}-${month}-${day}`;
    };

    const btnToday = document.getElementById("date-btn-today");
    const btnTomorrow = document.getElementById("date-btn-tomorrow");
    const btnNextWeek = document.getElementById("date-btn-next-week");
    const btnClear = document.getElementById("date-btn-clear");

    if (btnToday) btnToday.addEventListener("click", () => setDateOffset(0));
    if (btnTomorrow)
      btnTomorrow.addEventListener("click", () => setDateOffset(1));
    if (btnNextWeek)
      btnNextWeek.addEventListener("click", () => setDateOffset(7));
    if (btnClear)
      btnClear.addEventListener("click", () => (dateInput.value = ""));
  },

  setupForm() {
    const form = document.getElementById("task-form");
    const titleInput = document.getElementById("task-form-title");
    const charCounter = document.getElementById("task-form-counter");
    const editor = document.getElementById("task-description-editor");
    const modalTitle = document.getElementById("task-modal-title");
    const submitBtnText = document.getElementById("task-submit-btn-text");

    const modalBulletBtn = document.getElementById("modal-add-bullet-btn");
    const modalNumberBtn = document.getElementById("modal-add-number-btn");

    const insertPrefixAtCursor = (prefix) => {
      if (!titleInput) return;
      titleInput.focus();
      const start = titleInput.selectionStart;
      const end = titleInput.selectionEnd;
      const val = titleInput.value;
      const needsNewline = start > 0 && val[start - 1] !== "\n";
      const toInsert = needsNewline ? `\n${prefix}` : prefix;
      titleInput.value =
        val.substring(0, start) + toInsert + val.substring(end);
      titleInput.selectionStart = titleInput.selectionEnd =
        start + toInsert.length;
      if (charCounter)
        charCounter.textContent = `${titleInput.value.length}/${MAX_TASK_LENGTH}`;
    };

    if (modalBulletBtn) {
      modalBulletBtn.addEventListener("click", () =>
        insertPrefixAtCursor("- "),
      );
    }
    if (modalNumberBtn) {
      modalNumberBtn.addEventListener("click", () =>
        insertPrefixAtCursor("1. "),
      );
    }

    if (titleInput) {
      titleInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          // Auto-continue bullet or numbered list
          const cursorPos = titleInput.selectionStart;
          const textBefore = titleInput.value.substring(0, cursorPos);
          const currentLine = textBefore.split("\n").pop();
          const bulletMatch = currentLine.match(/^([*\-•+])\s+(.*)$/);
          const numberMatch = currentLine.match(/^(\d+)[\.\)]\s+(.*)$/);

          if (bulletMatch && bulletMatch[2].trim()) {
            e.preventDefault();
            const insertion = `\n${bulletMatch[1]} `;
            const textAfter = titleInput.value.substring(cursorPos);
            titleInput.value = textBefore + insertion + textAfter;
            titleInput.selectionStart = titleInput.selectionEnd =
              cursorPos + insertion.length;
            if (charCounter)
              charCounter.textContent = `${titleInput.value.length}/${MAX_TASK_LENGTH}`;
          } else if (numberMatch && numberMatch[2].trim()) {
            e.preventDefault();
            const nextNum = parseInt(numberMatch[1], 10) + 1;
            const insertion = `\n${nextNum}. `;
            const textAfter = titleInput.value.substring(cursorPos);
            titleInput.value = textBefore + insertion + textAfter;
            titleInput.selectionStart = titleInput.selectionEnd =
              cursorPos + insertion.length;
            if (charCounter)
              charCounter.textContent = `${titleInput.value.length}/${MAX_TASK_LENGTH}`;
          }
        }
      });
    }

    if (titleInput && charCounter) {
      titleInput.addEventListener("input", () => {
        charCounter.textContent = `${titleInput.value.length}/${MAX_TASK_LENGTH}`;
        if (titleInput.value.length > MAX_TASK_LENGTH) {
          charCounter.style.color = "#ef4444";
        } else {
          charCounter.style.color = "";
        }
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const description = editor.innerHTML === "<br>" ? "" : editor.innerHTML;
        const projectId = document.getElementById("task-form-project").value;
        const status = document.getElementById("task-form-status").value;
        const dueDate =
          document.getElementById("task-form-duedate").value || null;

        const priorityRadio = document.querySelector(
          'input[name="task-priority"]:checked',
        );
        const priority = priorityRadio ? priorityRadio.value : "medium";

        if (!title) {
          titleInput.focus();
          return;
        }

        if (this.mode === "create") {
          const newTask = Tasks.addTask({
            title,
            description,
            projectId,
            status,
            priority,
            dueDate,
          });
          if (newTask) {
            Modal.close("task-modal");
            form.reset();
            editor.innerHTML = "";
          }
        } else if (this.mode === "edit" && this.editingTaskId) {
          const updated = Tasks.updateTask(this.editingTaskId, {
            title,
            description,
            projectId,
            status,
            priority,
            dueDate,
          });
          if (updated) {
            Modal.close("task-modal");
            form.reset();
            editor.innerHTML = "";
          }
        }
      });
    }

    // Connect top header "New Task" button
    const openBtn = document.getElementById("btn-header-new-task");
    if (openBtn) {
      openBtn.addEventListener("click", () => this.openCreate());
    }
  },

  openCreate(defaultValues = {}) {
    this.mode = "create";
    this.editingTaskId = null;

    const modalTitle = document.getElementById("task-modal-title");
    const submitBtnText = document.getElementById("task-submit-btn-text");
    const form = document.getElementById("task-form");
    const editor = document.getElementById("task-description-editor");
    const charCounter = document.getElementById("task-form-counter");
    const titleInput = document.getElementById("task-form-title");

    if (modalTitle)
      modalTitle.innerHTML =
        '<i class="fas fa-plus-circle"></i> Create Jira-Style Task';
    if (submitBtnText) submitBtnText.textContent = "Create Task";

    if (form) form.reset();
    if (editor) editor.innerHTML = "";
    if (charCounter) charCounter.textContent = `0/${MAX_TASK_LENGTH}`;

    this.populateProjectSelect(defaultValues.projectId || "inbox");

    if (defaultValues.dueDate) {
      const dateInput = document.getElementById("task-form-duedate");
      if (dateInput) dateInput.value = defaultValues.dueDate;
    }

    if (defaultValues.status) {
      const statusSelect = document.getElementById("task-form-status");
      if (statusSelect) statusSelect.value = defaultValues.status;
    }

    // Default priority 'medium'
    const mediumRadio = document.querySelector(
      'input[name="task-priority"][value="medium"]',
    );
    if (mediumRadio) mediumRadio.checked = true;

    Modal.open("task-modal");
    setTimeout(() => titleInput && titleInput.focus(), 100);
  },

  openEdit(taskId) {
    const task = Tasks.getTaskById(taskId);
    if (!task) return;

    this.mode = "edit";
    this.editingTaskId = taskId;

    const modalTitle = document.getElementById("task-modal-title");
    const submitBtnText = document.getElementById("task-submit-btn-text");
    const titleInput = document.getElementById("task-form-title");
    const editor = document.getElementById("task-description-editor");
    const charCounter = document.getElementById("task-form-counter");
    const statusSelect = document.getElementById("task-form-status");
    const dateInput = document.getElementById("task-form-duedate");

    if (modalTitle)
      modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Task Details';
    if (submitBtnText) submitBtnText.textContent = "Save Changes";

    if (titleInput) {
      titleInput.value = task.title;
      if (charCounter)
        charCounter.textContent = `${task.title.length}/${MAX_TASK_LENGTH}`;
    }

    if (editor) {
      editor.innerHTML = task.description || "";
    }

    this.populateProjectSelect(task.projectId || "inbox");

    if (statusSelect) {
      statusSelect.value = task.status || (task.completed ? "done" : "todo");
    }

    if (dateInput) {
      dateInput.value = task.dueDate || "";
    }

    const priorityRadio = document.querySelector(
      `input[name="task-priority"][value="${task.priority || "medium"}"]`,
    );
    if (priorityRadio) priorityRadio.checked = true;

    Modal.open("task-modal");
    setTimeout(() => titleInput && titleInput.focus(), 100);
  },
};
