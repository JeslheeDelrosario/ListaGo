"use client";

import { useMemo } from "react";
import { addDays, format, isSameDay, parseISO, startOfToday } from "date-fns";
import { FiCalendar } from "react-icons/fi";

import { getUpcomingTasks } from "@/lib/filters";
import { useScopedTasks } from "@/hooks/useScopedTasks";
import type { Priority, Task } from "@/types";
import {
  TaskListItem,
  ViewCountBadge,
  ViewEmptyState,
  ViewListSkeleton,
} from "./TaskListItem";

/** Sort weight so urgent tasks float to the top of every date group. */
const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** A due date with its tasks, ready for rendering. */
interface DateGroup {
  /** The `YYYY-MM-DD` due date (group key). */
  dueDate: string;
  /** Human header: "Tomorrow" or the weekday name, e.g. "Wednesday". */
  relativeLabel: string;
  /** Short date shown next to the header, e.g. "Oct 23". */
  dateLabel: string;
  /** Tasks of this day, urgent priority first. */
  tasks: Task[];
}

/**
 * Quick view of tasks due in the next 7 days, grouped by date with
 * "Tomorrow" / weekday headers. Cards open the edit modal on click; the
 * list respects the selected project.
 */
export function UpcomingView() {
  const { tasks, isMounted } = useScopedTasks();

  const upcomingTasks = useMemo(
    () => (isMounted ? getUpcomingTasks(tasks) : []),
    [isMounted, tasks],
  );

  const groups = useMemo<DateGroup[]>(() => {
    // Reading the clock is forbidden during prerender: wait for hydration
    // (the task scope is empty until then anyway).
    if (!isMounted) return [];

    const tomorrow = addDays(startOfToday(), 1);
    const byDate = new Map<string, DateGroup>();

    // Chronological order; within a day, urgent tasks come first.
    const ordered = upcomingTasks
      .slice()
      .sort((a, b) => {
        const dateCompare = (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
        if (dateCompare !== 0) return dateCompare;
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      });

    for (const task of ordered) {
      if (!task.dueDate) continue;
      let group = byDate.get(task.dueDate);
      if (!group) {
        const parsed = parseISO(task.dueDate);
        group = {
          dueDate: task.dueDate,
          relativeLabel: isSameDay(parsed, tomorrow)
            ? "Tomorrow"
            : format(parsed, "EEEE"),
          dateLabel: format(parsed, "MMM d"),
          tasks: [],
        };
        byDate.set(task.dueDate, group);
      }
      group.tasks.push(task);
    }

    return Array.from(byDate.values());
  }, [isMounted, upcomingTasks]);

  return (
    <section className="flex flex-col rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white/90">Upcoming</h2>
          <p className="mt-0.5 text-xs text-white/40">Next 7 days</p>
        </div>
        <ViewCountBadge count={upcomingTasks.length} />
      </header>

      {!isMounted ? (
        <ViewListSkeleton rows={4} />
      ) : groups.length === 0 ? (
        <ViewEmptyState
          icon={<FiCalendar size={22} />}
          message="No upcoming tasks this week"
          hint="Tasks due within the next 7 days will show up here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.dueDate}>
              <h3 className="mb-2 flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                {group.relativeLabel}
                <span className="font-normal normal-case tracking-normal text-white/30">
                  {group.dateLabel}
                </span>
              </h3>
              <div className="flex flex-col gap-2.5">
                {group.tasks.map((task) => (
                  <TaskListItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
