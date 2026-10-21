/**
 * Shared domain types for the ListaGo Kanban migration.
 *
 * These mirror the data models of the original vanilla JS app so that
 * data exported from localStorage can be reused with minimal changes.
 */

/** Priority levels, ordered from least to most critical. */
export type Priority = "low" | "medium" | "high" | "urgent";

/** Possible lifecycle stages of a task; each maps to a Kanban column. */
export type Status = "todo" | "inprogress" | "review" | "done";

/** Maximum allowed length for a task title (matches ListaGo). */
export const MAX_TASK_TITLE_LENGTH = 200;

/** Maximum allowed length for a project name (matches ListaGo). */
export const MAX_PROJECT_NAME_LENGTH = 50;

/** A single task, matching the original vanilla JS task object. */
export interface Task {
  /** Unique identifier (crypto.randomUUID()). */
  id: string;
  /** Short human-readable task title. */
  title: string;
  /** Rich text (HTML) description. Plain textarea in Phase 3; CKEditor later. */
  description: string;
  /** Whether the task is completed. Kept in sync with `status === "done"`. */
  completed: boolean;
  /** ISO timestamp of task creation. */
  createdAt: string;
  /** Due date in `YYYY-MM-DD` format, or `null` when the task has no due date. */
  dueDate: string | null;
  /** Owning project id, or `null` when the task has no project. */
  projectId: string | null;
  /** Task priority. */
  priority: Priority;
  /** Current Kanban column / status. */
  status: Status;
}

/** A project grouping tasks with a custom color and icon. */
export interface Project {
  /** Unique identifier (crypto.randomUUID()). */
  id: string;
  /** Display name of the project. */
  name: string;
  /** Accent color as a hex string, e.g. `#6366f1`. */
  color: string;
  /**
   * Icon stored as a react-icons/fi name string, e.g. "FiFolder".
   * Kept as a plain string so Phase 1/2 data ("fas fa-rocket", "rocket")
   * still loads; `ProjectIcon` maps legacy names onto Feather icons.
   */
  icon: string;
  /** ISO timestamp of project creation. */
  createdAt: string;
}

/**
 * The built-in default project. It is permanent: undeletable, always shown
 * first in the sidebar, and the destination for tasks when a project is
 * deleted with the "move-to-inbox" strategy.
 */
export const DEFAULT_INBOX_PROJECT: Project = {
  id: "inbox",
  name: "Inbox",
  color: "#6366f1",
  icon: "FiInbox",
  createdAt: "",
};

/**
 * Canonical Inbox id. Phase 1/2 data used "seed-project-1" — both are
 * recognized as the Inbox by {@link isInboxProject}.
 */
export const INBOX_PROJECT_ID = DEFAULT_INBOX_PROJECT.id;

/** Legacy Inbox id from Phase 1/2 seeds (still present in localStorage). */
const LEGACY_INBOX_PROJECT_ID = "seed-project-1";

/**
 * The Inbox is the built-in default project: it cannot be deleted and its
 * tasks fall back here when a project is removed. Detected by its id
 * (canonical or legacy) first — so renames keep working — and by name as a
 * last resort.
 */
export function isInboxProject(project: Project): boolean {
  return (
    project.id === INBOX_PROJECT_ID ||
    project.id === LEGACY_INBOX_PROJECT_ID ||
    project.name.trim().toLowerCase() === "inbox"
  );
}

/** What happens to a project's tasks when the project is deleted. */
export type ProjectDeletionAction = "move-to-inbox" | "delete-tasks";

/** Lucide-style Feather icon names available for projects (react-icons/fi). */
export const PROJECT_ICON_NAMES = [
  "FiInbox",
  "FiFolder",
  "FiBriefcase",
  "FiBook",
  "FiCode",
  "FiHeart",
  "FiStar",
  "FiHome",
  "FiGlobe",
  "FiMusic",
  "FiCamera",
  "FiCoffee",
  "FiZap",
  "FiTarget",
  "FiFlag",
  "FiAward",
  "FiShoppingBag",
  "FiCalendar",
  "FiUsers",
] as const;

/** Union of the available project icon names. */
export type ProjectIconName = (typeof PROJECT_ICON_NAMES)[number];

/** Preset hex swatches offered in the project color picker. */
export const PROJECT_COLOR_SWATCHES: readonly string[] = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#64748b",
  "#ffffff",
];

/** Definition of a single Kanban column on the board. */
export interface KanbanColumn {
  /** The status this column represents. */
  id: Status;
  /** Human-readable column title. */
  title: string;
  /** Accent color (hex) used for the column dot and highlights. */
  color: string;
}

/**
 * The four Kanban columns rendered on the board, in display order.
 * Drives both column rendering and drag-and-drop target resolution.
 */
export const KANBAN_COLUMNS: readonly KanbanColumn[] = [
  { id: "todo", title: "To Do", color: "#6366f1" },
  { id: "inprogress", title: "In Progress", color: "#f59e0b" },
  { id: "review", title: "Review", color: "#a855f7" },
  { id: "done", title: "Done", color: "#22c55e" },
] as const;

/** Accent color per priority level (matches the original design system). */
export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  urgent: "#ef4444",
};

/**
 * Ready-made Tailwind class strings for priority pills.
 * Uses the `priority` colors defined in `tailwind.config.ts`.
 */
export const PRIORITY_BADGE_CLASSES: Record<Priority, string> = {
  low: "border-priority-low/30 bg-priority-low/15 text-priority-low",
  medium: "border-priority-medium/30 bg-priority-medium/15 text-priority-medium",
  high: "border-priority-high/30 bg-priority-high/15 text-priority-high",
  urgent: "border-priority-urgent/30 bg-priority-urgent/15 text-priority-urgent",
};

/** Input for creating a task; `id` and `createdAt` are assigned automatically. */
export type CreateTaskInput = Omit<Task, "id" | "createdAt">;

/** Input for updating a task; only the provided fields are changed. */
export type UpdateTaskInput = Partial<Omit<Task, "id" | "createdAt">>;

/** Input for creating a project; `id` and `createdAt` are assigned automatically. */
export type CreateProjectInput = Omit<Project, "id" | "createdAt">;

/** Input for updating a project; only the provided fields are changed. */
export type UpdateProjectInput = Partial<Omit<Project, "id" | "createdAt">>;

/* -------------------------------------------------------------------------- */
/*                              UI state shapes                               */
/* -------------------------------------------------------------------------- */

/** State of the shared create/edit task modal. */
export interface TaskModalState {
  /** Whether the modal is currently open. */
  open: boolean;
  /** Create a new task or edit an existing one. */
  mode: "create" | "edit";
  /** Id of the task being edited (`null` in create mode). */
  taskId: string | null;
}

/** State of the shared delete confirmation modal (tasks and bulk only). */
export interface DeleteModalState {
  /** Whether the modal is currently open. */
  open: boolean;
  /** Which entity is being deleted. */
  type: "task" | "bulk";
  /** Id of the task being deleted (`null` for bulk). */
  id: string | null;
}
