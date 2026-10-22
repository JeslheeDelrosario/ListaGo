"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { format, parseISO } from "date-fns";
import {
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClipboard,
  FiClock,
  FiEdit2,
  FiFileText,
  FiFolder,
  FiTarget,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { isOverdue } from "@/lib/filters";
import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useUIStore } from "@/store/useUIStore";
import {
  KANBAN_COLUMNS,
  MAX_TASK_TITLE_LENGTH,
  PRIORITY_COLORS,
  isInboxProject,
  type Priority,
  type Status,
  type Task,
} from "@/types";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { ProjectIcon } from "@/components/ui/ProjectIcon";

/** Priority options, most severe first. */
const PRIORITY_ORDER: readonly Priority[] = ["urgent", "high", "medium", "low"];

/** Visual variant of the metadata controls (compact header vs row). */
type ControlVariant = "pill" | "row";

/**
 * Jira-style task detail popup: a large centered card showing the full
 * task at a glance, with inline editing for the title, description, status,
 * priority, due date and project. Reads its state from the UI store
 * (`selectedTaskId` / `isTaskDetailOpen`) and is mounted once by AppShell.
 */
export function TaskDetailModal() {
  const isOpen = useUIStore((state) => state.isTaskDetailOpen);
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const closeTaskDetail = useUIStore((state) => state.closeTaskDetail);

  const task = useTaskStore((state) =>
    selectedTaskId
      ? (state.tasks.find((candidate) => candidate.id === selectedTaskId) ??
        null)
      : null,
  );

  // The task may vanish while the popup is open (deleted via the footer's
  // Delete button or a bulk delete) — close instead of showing a ghost.
  useEffect(() => {
    if (isOpen && selectedTaskId && !task) closeTaskDetail();
  }, [isOpen, selectedTaskId, task, closeTaskDetail]);

  if (!isOpen || !task) return null;

  // Keyed per task so inline-edit drafts reset when switching tasks.
  return <TaskDetailContent key={task.id} task={task} />;
}

/** The modal card itself. Mounted only while the popup is open. */
function TaskDetailContent({ task }: { task: Task }) {
  const closeTaskDetail = useUIStore((state) => state.closeTaskDetail);
  const openDeleteTask = useUIStore((state) => state.openDeleteTask);
  const openEditTask = useUIStore((state) => state.openEditTask);

  const updateTask = useTaskStore((state) => state.updateTask);
  const toggleComplete = useTaskStore((state) => state.toggleComplete);

  const titleId = useId();

  /** Inline-edit drafts: `null` = viewing, a string = actively editing. */
  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(
    null,
  );
  /** Transient "✓ Saved" indicator after any inline edit. */
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Shows the saved indicator for 2s (re-triggering restarts it). */
  const flashSaved = () => {
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
  };

  // While the popup is open the page behind it must not scroll.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(
    () => () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    },
    [],
  );

  // Escape closes the popup (Escape inside an inline editor cancels that
  // editor first — those handlers stop propagation).
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTaskDetail();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeTaskDetail]);

  const saveTitle = () => {
    const value = titleDraft?.trim();
    setTitleDraft(null);
    if (value && value !== task.title) {
      updateTask(task.id, { title: value });
      flashSaved();
    }
  };

  const saveDescription = () => {
    const value = descriptionDraft;
    setDescriptionDraft(null);
    if (value !== null && value !== task.description) {
      updateTask(task.id, { description: value });
      flashSaved();
    }
  };

  const cancelTitleEdit = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setTitleDraft(null);
  };

  const cancelDescriptionEdit = (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ) => {
    event.stopPropagation();
    setDescriptionDraft(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay — click to close */}
      <div
        aria-hidden
        onClick={closeTaskDetail}
        className="absolute inset-0 animate-overlay-fade-in bg-black/60 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="task-detail-scroll relative mx-4 flex max-h-[90vh] w-full max-w-3xl animate-modal-scale-in flex-col overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1a2e]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-7"
      >
        {/* Header: status + priority + saved indicator + close */}
        <div className="flex items-center gap-2">
          <StatusControl task={task} variant="pill" onSaved={flashSaved} />
          <PriorityControl task={task} variant="pill" onSaved={flashSaved} />

          <div className="ml-auto flex items-center gap-3">
            {saved ? (
              <span
                role="status"
                className="animate-saved flex items-center gap-1 text-xs font-semibold text-green-400"
              >
                <FiCheck size={12} aria-hidden />
                Saved
              </span>
            ) : null}
            <button
              type="button"
              onClick={closeTaskDetail}
              aria-label="Close task details"
              className="rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white/90"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Title — click to edit inline */}
        {titleDraft === null ? (
          <h2
            id={titleId}
            onClick={() => setTitleDraft(task.title)}
            title="Click to edit"
            className="mt-4 cursor-text rounded-lg px-2 py-1 text-2xl font-bold leading-snug text-white transition hover:bg-white/5"
          >
            {task.title}
          </h2>
        ) : (
          <input
            autoFocus
            type="text"
            value={titleDraft}
            maxLength={MAX_TASK_TITLE_LENGTH}
            aria-label="Task title"
            onChange={(event) => setTitleDraft(event.target.value)}
            onBlur={saveTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                saveTitle();
              } else if (event.key === "Escape") {
                cancelTitleEdit(event);
              }
            }}
            className="inline-edit-active mt-4 w-full bg-transparent text-2xl font-bold leading-snug text-white"
          />
        )}

        <hr className="my-5 border-white/10" />

        {/* Metadata: interactive details left, reference details right */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          <div className="flex flex-col gap-3">
            <MetaRow icon={<FiClipboard size={14} />} label="Status">
              <StatusControl
                task={task}
                variant="row"
                onSaved={flashSaved}
              />
            </MetaRow>
            <MetaRow icon={<FiTarget size={14} />} label="Priority">
              <PriorityControl
                task={task}
                variant="row"
                onSaved={flashSaved}
              />
            </MetaRow>
            <MetaRow icon={<FiCheckCircle size={14} />} label="Completed">
              <button
                type="button"
                role="switch"
                aria-checked={task.completed}
                aria-label="Toggle completed"
                onClick={() => {
                  toggleComplete(task.id);
                  flashSaved();
                }}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  task.completed ? "bg-green-500/80" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
                    task.completed ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
              <span className="text-sm text-white/60">
                {task.completed ? "Done" : "Open"}
              </span>
            </MetaRow>
          </div>

          <div className="flex flex-col gap-3">
            <MetaRow icon={<FiCalendar size={14} />} label="Due date">
              <DueDateControl task={task} onSaved={flashSaved} />
            </MetaRow>
            <MetaRow icon={<FiFolder size={14} />} label="Project">
              <ProjectControl task={task} onSaved={flashSaved} />
            </MetaRow>
            <MetaRow icon={<FiClock size={14} />} label="Created">
              <span className="text-sm text-white/60">
                {format(parseISO(task.createdAt), "MMM d, yyyy")}
              </span>
            </MetaRow>
          </div>
        </div>

        <hr className="my-5 border-white/10" />

        {/* Description — the focal point of the popup */}
        <section>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/60">
              <FiFileText size={15} aria-hidden />
              Description
            </h3>
            {descriptionDraft === null ? (
              <button
                type="button"
                onClick={() => setDescriptionDraft(task.description)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/50 transition hover:bg-white/10 hover:text-white/90"
              >
                <FiEdit2 size={13} aria-hidden />
                Edit
              </button>
            ) : (
              <span className="text-xs text-white/40">
                Ctrl+Enter to save · Esc to cancel
              </span>
            )}
          </div>

          {descriptionDraft === null ? (
            <div
              onClick={() => setDescriptionDraft(task.description)}
              title="Click to edit"
              className="min-h-[200px] cursor-text whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70 transition hover:border-white/20"
            >
              <TaskDescription description={task.description} />
            </div>
          ) : (
            <textarea
              autoFocus
              value={descriptionDraft}
              aria-label="Task description"
              onChange={(event) => setDescriptionDraft(event.target.value)}
              onBlur={saveDescription}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  saveDescription();
                } else if (event.key === "Escape") {
                  cancelDescriptionEdit(event);
                }
              }}
              className="min-h-[200px] w-full resize-y rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70 transition focus:border-accent-indigo/60 focus:outline-none focus:ring-2 focus:ring-accent-indigo/40"
            />
          )}
        </section>

        <hr className="my-5 border-white/10" />

        {/* Footer: delete (left) and full-form edit (right) */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              // Close first: the shared DeleteModal then owns the screen.
              closeTaskDetail();
              openDeleteTask(task.id);
            }}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-sm font-medium text-red-400 transition hover:border-red-500/50 hover:bg-red-500/20"
          >
            <FiTrash2 size={15} aria-hidden />
            Delete Task
          </button>

          <button
            type="button"
            onClick={() => {
              closeTaskDetail();
              openEditTask(task.id);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
          >
            <FiEdit2 size={15} aria-hidden />
            Edit in Form
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Description                                   */
/* -------------------------------------------------------------------------- */

/**
 * Renders the description as CKEditor HTML (`task-description` prose
 * styles), as pre-wrapped plain text, or as an italic placeholder when
 * empty.
 */
function TaskDescription({ description }: { description: string }) {
  if (!description.trim()) {
    return (
      <p className="text-sm italic text-white/30">
        No description yet. Click Edit to add one.
      </p>
    );
  }

  if (/<[a-z][^>]*>/i.test(description)) {
    return (
      <div
        className="task-description text-sm"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    );
  }

  return <span className="text-sm">{description}</span>;
}

/* -------------------------------------------------------------------------- */
/*                             Metadata helpers                               */
/* -------------------------------------------------------------------------- */

/** A label + control row in the metadata grid. */
function MetaRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-28 shrink-0 items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/40">
        <span className="text-white/30" aria-hidden>
          {icon}
        </span>
        {label}
      </span>
      {children}
    </div>
  );
}

/** Button + popover wrapper shared by the status/priority/project controls. */
function ControlPopover({
  open,
  onToggle,
  onClose,
  button,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  button: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <span onClick={onToggle}>{button}</span>
      {open ? (
        <>
          {/* Invisible click-catcher that closes the popover */}
          <div aria-hidden className="fixed inset-0 z-10" onClick={onClose} />
          <div
            role="menu"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                onClose();
              }
            }}
            className="absolute left-0 top-full z-20 mt-1.5 min-w-48 rounded-xl border border-white/10 bg-[#1a1a2e] p-1 shadow-2xl shadow-black/50"
          >
            {children}
          </div>
        </>
      ) : null}
    </div>
  );
}

/** One selectable option inside a control popover. */
function ControlOption({
  color,
  label,
  selected,
  onSelect,
}: {
  color: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-white/70 transition hover:bg-white/10 hover:text-white/90"
    >
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="flex-1">{label}</span>
      {selected ? <FiCheck size={13} aria-hidden /> : null}
    </button>
  );
}

/** Shared button classes per variant. */
function controlButtonClasses(variant: ControlVariant) {
  return variant === "pill"
    ? "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition hover:brightness-125"
    : "flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm font-medium transition hover:bg-white/10";
}

/* -------------------------------------------------------------------------- */
/*                               Controls                                     */
/* -------------------------------------------------------------------------- */

/** Status pill / row with a 4-status dropdown (calls `moveTask`). */
function StatusControl({
  task,
  variant,
  onSaved,
}: {
  task: Task;
  variant: ControlVariant;
  onSaved: () => void;
}) {
  const moveTask = useTaskStore((state) => state.moveTask);
  const [open, setOpen] = useState(false);

  const status = KANBAN_COLUMNS.find((column) => column.id === task.status);

  const select = (id: Status) => {
    setOpen(false);
    if (id !== task.status) {
      moveTask(task.id, id);
      onSaved();
    }
  };

  return (
    <ControlPopover
      open={open}
      onToggle={() => setOpen((value) => !value)}
      onClose={() => setOpen(false)}
      button={
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Status: ${status?.title ?? task.status}`}
          className={controlButtonClasses(variant)}
          style={
            variant === "pill" && status
              ? {
                  color: status.color,
                  borderColor: `${status.color}55`,
                  backgroundColor: `${status.color}1f`,
                }
              : undefined
          }
        >
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ backgroundColor: status?.color ?? "#6366f1" }}
          />
          {status?.title ?? task.status}
          <FiChevronDown
            size={12}
            aria-hidden
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      }
    >
      {KANBAN_COLUMNS.map((column) => (
        <ControlOption
          key={column.id}
          color={column.color}
          label={column.title}
          selected={column.id === task.status}
          onSelect={() => select(column.id)}
        />
      ))}
    </ControlPopover>
  );
}

/** Priority pill / row with a 4-priority dropdown (calls `updateTask`). */
function PriorityControl({
  task,
  variant,
  onSaved,
}: {
  task: Task;
  variant: ControlVariant;
  onSaved: () => void;
}) {
  const updateTask = useTaskStore((state) => state.updateTask);
  const [open, setOpen] = useState(false);

  const color = PRIORITY_COLORS[task.priority];

  const select = (priority: Priority) => {
    setOpen(false);
    if (priority !== task.priority) {
      updateTask(task.id, { priority });
      onSaved();
    }
  };

  return (
    <ControlPopover
      open={open}
      onToggle={() => setOpen((value) => !value)}
      onClose={() => setOpen(false)}
      button={
        variant === "pill" ? (
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`Priority: ${task.priority}`}
            className="flex items-center gap-1 rounded-full transition hover:brightness-125"
          >
            <PriorityBadge priority={task.priority} />
            <FiChevronDown
              size={12}
              aria-hidden
              className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        ) : (
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`Priority: ${task.priority}`}
            className={controlButtonClasses(variant)}
          >
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="capitalize">{task.priority}</span>
            <FiChevronDown
              size={12}
              aria-hidden
              className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )
      }
    >
      {PRIORITY_ORDER.map((priority) => (
        <ControlOption
          key={priority}
          color={PRIORITY_COLORS[priority]}
          label={priority.charAt(0).toUpperCase() + priority.slice(1)}
          selected={priority === task.priority}
          onSelect={() => select(priority)}
        />
      ))}
    </ControlPopover>
  );
}

/** Project row with a dropdown of all projects (calls `updateTask`). */
function ProjectControl({
  task,
  onSaved,
}: {
  task: Task;
  onSaved: () => void;
}) {
  const projects = useProjectStore((state) => state.projects);
  const updateTask = useTaskStore((state) => state.updateTask);
  const [open, setOpen] = useState(false);

  // Inbox first, then store order (new projects prepend).
  const ordered = [
    ...projects.filter(isInboxProject),
    ...projects.filter((project) => !isInboxProject(project)),
  ];
  const current = projects.find((project) => project.id === task.projectId);

  const select = (projectId: string) => {
    setOpen(false);
    if (projectId !== task.projectId) {
      updateTask(task.id, { projectId });
      onSaved();
    }
  };

  return (
    <ControlPopover
      open={open}
      onToggle={() => setOpen((value) => !value)}
      onClose={() => setOpen(false)}
      button={
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Project: ${current?.name ?? "none"}`}
          className="flex max-w-56 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          {current ? (
            <>
              <ProjectIcon iconName={current.icon} color={current.color} size={14} />
              <span className="truncate">{current.name}</span>
            </>
          ) : (
            <span className="text-white/40">No project</span>
          )}
          <FiChevronDown
            size={12}
            aria-hidden
            className={`shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      }
    >
      {ordered.map((project) => (
        <ControlOption
          key={project.id}
          color={project.color}
          label={project.name}
          selected={project.id === task.projectId}
          onSelect={() => select(project.id)}
        />
      ))}
    </ControlPopover>
  );
}

/** Due date: formatted text that turns into a native date picker. */
function DueDateControl({
  task,
  onSaved,
}: {
  task: Task;
  onSaved: () => void;
}) {
  const updateTask = useTaskStore((state) => state.updateTask);
  const [editing, setEditing] = useState(false);

  const overdue = isOverdue(task);

  if (editing) {
    return (
      <input
        autoFocus
        type="date"
        aria-label="Due date"
        defaultValue={task.dueDate ?? ""}
        onChange={(event) => {
          updateTask(task.id, { dueDate: event.target.value || null });
          onSaved();
        }}
        onBlur={() => setEditing(false)}
        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white/90 transition focus:border-accent-indigo/60 focus:outline-none focus:ring-2 focus:ring-accent-indigo/40"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Click to set a due date"
      className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-sm transition hover:bg-white/5 ${
        overdue ? "font-semibold text-red-400" : "text-white/60"
      }`}
    >
      {task.dueDate
        ? format(parseISO(task.dueDate), "MMM d, yyyy")
        : "Set due date…"}
    </button>
  );
}
