import {
  addDays,
  format,
  isPast,
  isSameDay,
  isToday as isTodayDate,
  isWithinInterval,
  parseISO,
  startOfToday,
  subDays,
} from "date-fns";

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

/* -------------------------------------------------------------------------- */
/*                     Date-based filters & statistics (Phase 4)              */
/* -------------------------------------------------------------------------- */

/**
 * Tasks whose due date falls on today, regardless of status — finished
 * tasks stay visible so the Today view can show what was checked off.
 */
export function getTodayTasks(tasks: readonly Task[]): Task[] {
  return tasks.filter(
    (task) => task.dueDate !== null && isTodayDate(parseISO(task.dueDate)),
  );
}

/**
 * Unfinished tasks due in the next 7 days (tomorrow through today + 7).
 *
 * The interval starts tomorrow: overdue dates and today itself fall
 * outside it by construction — today is covered by {@link getTodayTasks}
 * and the past by {@link getOverdueTasks}.
 */
export function getUpcomingTasks(tasks: readonly Task[]): Task[] {
  const start = addDays(startOfToday(), 1);
  const end = addDays(startOfToday(), 7);

  return tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") return false;
    return isWithinInterval(parseISO(task.dueDate), { start, end });
  });
}

/** Unfinished tasks whose due date lies in the past (before today). */
export function getOverdueTasks(tasks: readonly Task[]): Task[] {
  return tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") return false;
    const due = parseISO(task.dueDate);
    // Due dates are stored as local midnights, so today's date is already
    // "past" for isPast — exclude it to keep only genuinely late tasks.
    return isPast(due) && !isTodayDate(due);
  });
}

/** Generic inclusive due-date range filter ([start, end]). */
export function getTasksByDateRange(
  tasks: readonly Task[],
  start: Date,
  end: Date,
): Task[] {
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    return isWithinInterval(parseISO(task.dueDate), { start, end });
  });
}

/** Aggregate counts driving the dashboard stats grid. */
export interface CompletionStats {
  /** Every task in scope. */
  total: number;
  /** Tasks in the "todo" column. */
  todo: number;
  /** Tasks in the "inprogress" column. */
  inprogress: number;
  /** Tasks in the "review" column. */
  review: number;
  /** Tasks in the "done" column. */
  done: number;
  /** Unfinished tasks past their due date. */
  overdue: number;
  /** Share of done tasks in percent, rounded to the nearest integer. */
  completionRate: number;
}

/** Computes completion statistics for a list of tasks. */
export function getCompletionStats(tasks: readonly Task[]): CompletionStats {
  let todo = 0;
  let inprogress = 0;
  let review = 0;
  let done = 0;

  for (const task of tasks) {
    if (task.status === "todo") todo += 1;
    else if (task.status === "inprogress") inprogress += 1;
    else if (task.status === "review") review += 1;
    else done += 1;
  }

  const total = tasks.length;
  return {
    total,
    todo,
    inprogress,
    review,
    done,
    overdue: getOverdueTasks(tasks).length,
    completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

/** Task counts per priority level. */
export interface PriorityBreakdown {
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

/** Counts tasks per priority for the dashboard pie chart. */
export function getPriorityBreakdown(
  tasks: readonly Task[],
): PriorityBreakdown {
  const counts: PriorityBreakdown = { low: 0, medium: 0, high: 0, urgent: 0 };
  for (const task of tasks) counts[task.priority] += 1;
  return counts;
}

/** One day of the weekly activity chart. */
export interface WeeklyActivityPoint {
  /** Localised weekday abbreviation, e.g. "Mon". */
  day: string;
  /** Tasks completed on that day. */
  completed: number;
  /** Tasks created on that day. */
  created: number;
}

/**
 * Completion timestamp of a done task.
 *
 * `completedAt` (added in Phase 4) is authoritative; tasks finished before
 * the field existed fall back to `createdAt`, so data persisted by earlier
 * phases still charts instead of showing a permanently flat line.
 */
function completedDateOf(task: Task): string | null {
  if (task.completedAt) return task.completedAt;
  return task.status === "done" ? task.createdAt : null;
}

/**
 * Tasks created and completed per day over the last 7 days (oldest →
 * newest, ending today), shaped for the dashboard area chart.
 */
export function getWeeklyCompletionData(
  tasks: readonly Task[],
): WeeklyActivityPoint[] {
  const today = startOfToday();
  const days = Array.from({ length: 7 }, (_, index) => subDays(today, 6 - index));

  return days.map((day) => {
    let created = 0;
    let completed = 0;

    for (const task of tasks) {
      if (isSameDay(parseISO(task.createdAt), day)) created += 1;
      const completedAt = completedDateOf(task);
      if (completedAt && isSameDay(parseISO(completedAt), day)) completed += 1;
    }

    return { day: format(day, "EEE"), created, completed };
  });
}
