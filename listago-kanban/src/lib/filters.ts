import type { Task } from "@/types";

/**
 * Pure filtering, counting and date helpers.
 *
 * Shared by the Kanban board, the sidebar stats and the task store's
 * selectors so the logic exists exactly once.
 */

/** Formats a date as a local `YYYY-MM-DD` string (no timezone drift). */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Returns today's date as `YYYY-MM-DD`. */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Returns a `YYYY-MM-DD` string `days` from today (negative = past). */
export function daysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** A task is overdue when it has a past due date and is not finished yet. */
export function isOverdue(task: Task): boolean {
  return Boolean(task.dueDate && !task.completed && task.dueDate < todayISO());
}

/** A task is due today when its due date equals today and it is unfinished. */
export function isToday(task: Task): boolean {
  return Boolean(
    task.dueDate && !task.completed && task.dueDate === todayISO(),
  );
}

/** A task is upcoming when it is due in the next 7 days (exclusive of today). */
export function isUpcoming(task: Task): boolean {
  if (!task.dueDate || task.completed) return false;
  const today = todayISO();
  if (task.dueDate <= today) return false;
  return task.dueDate <= daysFromToday(7);
}

/** Options for {@link filterTasks}. */
export interface FilterOptions {
  /** Tasks to filter. */
  tasks: readonly Task[];
  /**
   * Project filter. `undefined` = all projects, `null` = only tasks without
   * a project, a string = only tasks in that project.
   */
  projectId?: string | null;
  /** Free-text query matched against title and description (case-insensitive). */
  query?: string;
}

/**
 * Applies the ListaGo filter pipeline in the required order:
 * 1. project filter, 2. search query. Grouping by status happens in the
 *   board afterwards, so tasks from other projects never leak into columns.
 */
export function filterTasks({
  tasks,
  projectId,
  query,
}: FilterOptions): Task[] {
  let result = tasks.slice();

  if (projectId !== undefined) {
    result = result.filter((task) => task.projectId === projectId);
  }

  const needle = query?.trim().toLowerCase();
  if (needle) {
    result = result.filter(
      (task) =>
        task.title.toLowerCase().includes(needle) ||
        task.description.toLowerCase().includes(needle),
    );
  }

  return result;
}

/** Live task counts shown in the sidebar stats strip. */
export interface TaskCounts {
  /** Every task. */
  total: number;
  /** Tasks that are not completed. */
  pending: number;
  /** Completed tasks. */
  done: number;
  /** Unfinished tasks past their due date. */
  overdue: number;
}

/** Computes the sidebar stats strip values for a list of tasks. */
export function getTaskCounts(tasks: readonly Task[]): TaskCounts {
  let pending = 0;
  let done = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.completed) {
      done += 1;
    } else {
      pending += 1;
      if (isOverdue(task)) overdue += 1;
    }
  }

  return { total: tasks.length, pending, done, overdue };
}
