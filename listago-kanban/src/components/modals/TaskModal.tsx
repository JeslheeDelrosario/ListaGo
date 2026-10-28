"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";

import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useUIStore } from "@/store/useUIStore";
import {
  isInboxProject,
  KANBAN_COLUMNS,
  MAX_TASK_TITLE_LENGTH,
  type Priority,
  type Status,
} from "@/types";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  MODAL_BUTTON_GHOST_CLASSES,
  MODAL_BUTTON_PRIMARY_CLASSES,
  MODAL_ERROR_CLASSES,
  MODAL_INPUT_CLASSES,
  MODAL_LABEL_CLASSES,
  Modal,
} from "@/components/ui/Modal";

const PRIORITIES: readonly Priority[] = ["low", "medium", "high", "urgent"];

/**
 * Jira-style create/edit task modal. One component serves both modes:
 * create mode starts from defaults (optionally pre-filling the status of
 * the column that opened it), edit mode loads the existing task.
 */
export function TaskModal() {
  const { open, mode, taskId } = useUIStore((state) => state.taskModal);
  const initialStatus = useUIStore((state) => state.initialStatus);
  const closeTaskModal = useUIStore((state) => state.closeTaskModal);

  // Remount the form per create/edit target: state resets through a fresh
  // mount (lazy initializers) instead of a reset effect.
  const formKey =
    mode === "edit" && taskId
      ? `edit-${taskId}`
      : `create-${initialStatus ?? "todo"}`;

  return (
    <Modal
      open={open}
      onClose={closeTaskModal}
      title={mode === "edit" ? "Edit task" : "Create task"}
      footer={
        <>
          <button
            type="button"
            onClick={closeTaskModal}
            className={MODAL_BUTTON_GHOST_CLASSES}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            className={MODAL_BUTTON_PRIMARY_CLASSES}
          >
            {mode === "edit" ? "Save changes" : "Create task"}
          </button>
        </>
      }
    >
      {/* Always passed: `Modal` only mounts its children while open or
          exiting, so the form stays visible during the close animation and
          still resets through its key on the next open. */}
      <TaskForm
        key={formKey}
        mode={mode}
        taskId={taskId}
        initialStatus={initialStatus}
        onClose={closeTaskModal}
      />
    </Modal>
  );
}

interface TaskFormProps {
  /** Create a new task or edit an existing one. */
  mode: "create" | "edit";
  /** Id of the task being edited (`null` in create mode). */
  taskId: string | null;
  /** Status pre-filled when opening from a column's "+ Add task". */
  initialStatus: Status | null;
  /** Closes the modal after a successful submit. */
  onClose: () => void;
}

/** Initial values for a freshly mounted task form. */
interface TaskFormInitial {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  projectId: string | null;
}

/** The form body; always mounted inside `Modal` under a target-specific key. */
function TaskForm({
  mode,
  taskId,
  initialStatus,
  onClose,
}: TaskFormProps) {
  const selectedProjectId = useUIStore((state) => state.selectedProjectId);
  const projects = useProjectStore((state) => state.projects);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  const titleRef = useRef<HTMLInputElement>(null);
  const [initial] = useState<TaskFormInitial>(() => {
    const taskStore = useTaskStore.getState();
    const projectStore = useProjectStore.getState();
    const task =
      mode === "edit" && taskId ? taskStore.getTaskById(taskId) : undefined;
    const inboxId =
      projectStore.projects.find(isInboxProject)?.id ??
      projectStore.projects[projectStore.projects.length - 1]?.id ??
      null;

    if (mode === "edit" && task) {
      return {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ?? "",
        priority: task.priority,
        status: task.status,
        projectId: task.projectId ?? inboxId,
      };
    }
    return {
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      status: initialStatus ?? "todo",
      projectId: selectedProjectId ?? inboxId,
    };
  });

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [dueDate, setDueDate] = useState(initial.dueDate);
  const [priority, setPriority] = useState<Priority>(initial.priority);
  const [status, setStatus] = useState<Status>(initial.status);
  const [projectId, setProjectId] = useState<string | null>(initial.projectId);
  const [titleError, setTitleError] = useState<string | null>(null);

  // Focus the title input when the form mounts (no state updates involved).
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError("Title is required.");
      toast.error("Title is required");
      titleRef.current?.focus();
      return;
    }
    if (trimmed.length > MAX_TASK_TITLE_LENGTH) {
      setTitleError(`Title must be ${MAX_TASK_TITLE_LENGTH} characters or less.`);
      toast.error(`Title must be ${MAX_TASK_TITLE_LENGTH} characters or less`);
      return;
    }

    // Duplicate prevention: same project, case-insensitive, excluding self.
    const duplicate = useTaskStore
      .getState()
      .tasks.some(
        (task) =>
          task.id !== taskId &&
          task.projectId === projectId &&
          task.title.trim().toLowerCase() === trimmed.toLowerCase(),
      );
    if (duplicate) {
      setTitleError("A task with this title already exists in this project.");
      toast.error("A task with this title already exists in this project");
      titleRef.current?.focus();
      return;
    }

    if (mode === "edit" && taskId) {
      updateTask(taskId, {
        title: trimmed,
        description,
        dueDate: dueDate || null,
        priority,
        status,
        projectId,
      });
      toast.success("Task updated!");
    } else {
      addTask({
        title: trimmed,
        description,
        completed: status === "done",
        dueDate: dueDate || null,
        projectId,
        priority,
        status,
      });
      toast.success("Task created!");
    }

    onClose();
  };

  /** Enter in the title field submits when the title is non-empty. */
  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (title.trim()) {
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form id="task-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="task-title" className={MODAL_LABEL_CLASSES}>
          Title <span className="text-red-400">*</span>
        </label>
        <input
          id="task-title"
          ref={titleRef}
          type="text"
          value={title}
          maxLength={MAX_TASK_TITLE_LENGTH}
          onChange={(event) => {
            setTitle(event.target.value);
            if (titleError) setTitleError(null);
          }}
          onKeyDown={handleTitleKeyDown}
          placeholder="What needs to be done?"
          aria-invalid={titleError !== null}
          aria-describedby={titleError ? "task-title-error" : undefined}
          className={MODAL_INPUT_CLASSES}
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          {titleError ? (
            <span id="task-title-error" className={MODAL_ERROR_CLASSES}>
              {titleError}
            </span>
          ) : (
            <span />
          )}
          <span className="text-xs tabular-nums text-white/30">
            {title.length}/{MAX_TASK_TITLE_LENGTH}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="task-description" className={MODAL_LABEL_CLASSES}>
          Description
        </label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Add more details…"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-due-date" className={MODAL_LABEL_CLASSES}>
            Due date
          </label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={MODAL_INPUT_CLASSES}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label htmlFor="task-priority" className="mb-0">
              <span className={MODAL_LABEL_CLASSES}>Priority</span>
            </label>
            <PriorityBadge priority={priority} />
          </div>
          <select
            id="task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            className={MODAL_INPUT_CLASSES}
          >
            {PRIORITIES.map((option) => (
              <option key={option} value={option} className="bg-zinc-900">
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-status" className={MODAL_LABEL_CLASSES}>
            Status
          </label>
          <select
            id="task-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as Status)}
            className={MODAL_INPUT_CLASSES}
          >
            {KANBAN_COLUMNS.map((column) => (
              <option key={column.id} value={column.id} className="bg-zinc-900">
                {column.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-project" className={MODAL_LABEL_CLASSES}>
            Project
          </label>
          <select
            id="task-project"
            value={projectId ?? ""}
            onChange={(event) => setProjectId(event.target.value || null)}
            className={MODAL_INPUT_CLASSES}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id} className="bg-zinc-900">
                {project.name}
              </option>
            ))}
          </select>
          <span className="mt-1.5 block text-xs text-white/30">
            Tasks without a project go to Inbox.
          </span>
        </div>
      </div>
    </form>
  );
}
