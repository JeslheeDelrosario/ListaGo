import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { isOverdue, isToday, isUpcoming, daysFromToday } from "@/lib/filters";
import type {
  CreateTaskInput,
  Status,
  Task,
  UpdateTaskInput,
} from "@/types";

/* -------------------------------------------------------------------------- */
/*                                  Seed data                                 */
/* -------------------------------------------------------------------------- */

/**
 * Sample tasks so the board is never empty on first load.
 * Ids are deterministic (not random) so server and client render identical
 * data on the first visit and seed projects can be referenced reliably.
 */
function createSeedTasks(): Task[] {
  const createdAt = new Date().toISOString();
  const base = { completed: false, description: "", createdAt };

  return [
    {
      ...base,
      id: "seed-task-1",
      title: "Fix login redirect loop on mobile",
      description:
        "<p>Users get bounced between <code>/login</code> and <code>/dashboard</code> on iOS Safari.</p>",
      dueDate: daysFromToday(-2),
      projectId: "inbox",
      priority: "urgent",
      status: "inprogress",
    },
    {
      ...base,
      id: "seed-task-2",
      title: "Write Q3 launch announcement",
      dueDate: daysFromToday(0),
      projectId: "work",
      priority: "high",
      status: "todo",
    },
    {
      ...base,
      id: "seed-task-3",
      title: "Review onboarding flow redesign",
      description: "<p>Check copy, empty states and the new welcome checklist.</p>",
      dueDate: daysFromToday(1),
      projectId: "work",
      priority: "medium",
      status: "review",
    },
    {
      ...base,
      id: "seed-task-4",
      title: "Refactor storage module to TypeScript",
      dueDate: daysFromToday(5),
      projectId: "inbox",
      priority: "low",
      status: "todo",
    },
    {
      ...base,
      id: "seed-task-5",
      title: "Buy groceries",
      dueDate: null,
      projectId: "personal",
      priority: "low",
      status: "todo",
    },
    {
      ...base,
      id: "seed-task-6",
      title: "Set up CI pipeline",
      completed: true,
      completedAt: createdAt,
      dueDate: daysFromToday(-3),
      projectId: "inbox",
      priority: "high",
      status: "done",
    },
  ] satisfies Task[];
}

/* -------------------------------------------------------------------------- */
/*                                   Store                                    */
/* -------------------------------------------------------------------------- */

/** Shape of the task store: task data plus actions and derived selectors. */
export interface TaskState {
  /** All tasks, across every status and project. */
  tasks: Task[];

  /**
   * Creates a new task with a fresh `crypto.randomUUID()` id and
   * `createdAt` timestamp, then prepends it to the list.
   */
  addTask: (input: CreateTaskInput) => Task;

  /**
   * Merges the provided partial updates into the task with the given id.
   * Does nothing when the task does not exist.
   */
  updateTask: (id: string, updates: UpdateTaskInput) => void;

  /** Deletes a single task by id. */
  deleteTask: (id: string) => void;

  /** Deletes every task whose id is contained in `ids` (bulk delete). */
  deleteBulk: (ids: string[]) => void;

  /**
   * Moves a task to a new Kanban column. This is the drag-and-drop entry
   * point; it also keeps `completed` in sync with the target status.
   */
  moveTask: (taskId: string, newStatus: Status) => void;

  /**
   * Toggles `completed` on a task. Completing a task moves it to the
   * "done" column; un-completing sends it back to "todo".
   */
  toggleComplete: (id: string) => void;

  /**
   * Moves every task of `fromProjectId` to `toProjectId`. Used when a
   * project is deleted: its tasks are reassigned to the Inbox (`null` is
   * used as a last resort when no Inbox project exists).
   */
  reassignTasksToProject: (
    fromProjectId: string | null,
    toProjectId: string | null,
  ) => void;

  /** Returns all tasks belonging to the given status/column. */
  getTasksByStatus: (status: Status) => Task[];

  /** Returns a single task by id, or `undefined` if it does not exist. */
  getTaskById: (id: string) => Task | undefined;

  /**
   * Returns the tasks of a project. Passing `null` returns tasks without
   * a project.
   */
  getTasksByProject: (projectId: string | null) => Task[];

  /** Returns unfinished tasks whose due date lies in the past. */
  getOverdueTasks: () => Task[];

  /** Returns unfinished tasks due today. */
  getTodayTasks: () => Task[];

  /** Returns unfinished tasks due within the next 7 days. */
  getUpcomingTasks: () => Task[];

  /** Case-insensitive search across task titles and descriptions. */
  searchTasks: (query: string) => Task[];
}

/** Only task data is written to localStorage; actions stay runtime-only. */
interface PersistedTaskState {
  tasks: Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: createSeedTasks(),

      addTask: (input) => {
        const task: Task = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [task, ...state.tasks] }));
        return task;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task,
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      deleteBulk: (ids) => {
        const toDelete = new Set(ids);
        set((state) => ({
          tasks: state.tasks.filter((task) => !toDelete.has(task.id)),
        }));
      },

      moveTask: (taskId, newStatus) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const completed = newStatus === "done";
            return {
              ...task,
              status: newStatus,
              completed,
              // Stamp completion time for the dashboard charts; clear it
              // when the task leaves "done". A legacy done task without a
              // stamp gets backfilled the first time it is moved.
              completedAt: completed
                ? (task.completedAt ?? new Date().toISOString())
                : null,
            };
          }),
        }));
      },

      toggleComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const completed = !task.completed;
            return {
              ...task,
              completed,
              status: completed ? "done" : "todo",
              completedAt: completed ? new Date().toISOString() : null,
            };
          }),
        }));
      },

      reassignTasksToProject: (fromProjectId, toProjectId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.projectId === fromProjectId
              ? { ...task, projectId: toProjectId }
              : task,
          ),
        }));
      },

      getTasksByStatus: (status) =>
        get().tasks.filter((task) => task.status === status),

      getTaskById: (id) => get().tasks.find((task) => task.id === id),

      getTasksByProject: (projectId) =>
        get().tasks.filter((task) => task.projectId === projectId),

      getOverdueTasks: () => get().tasks.filter(isOverdue),

      getTodayTasks: () => get().tasks.filter(isToday),

      getUpcomingTasks: () => get().tasks.filter(isUpcoming),

      searchTasks: (query) => {
        const needle = query.trim().toLowerCase();
        if (!needle) return get().tasks;
        return get().tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(needle) ||
            task.description.toLowerCase().includes(needle),
        );
      },
    }),
    {
      name: "listago-tasks",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedTaskState => ({ tasks: state.tasks }),
    },
  ),
);
