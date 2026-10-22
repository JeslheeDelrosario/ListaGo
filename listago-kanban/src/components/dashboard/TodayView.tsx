"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { FiCheckCircle } from "react-icons/fi";

import { getTodayTasks } from "@/lib/filters";
import { useScopedTasks } from "@/hooks/useScopedTasks";
import type { Priority } from "@/types";
import {
  TaskListItem,
  ViewCountBadge,
  ViewEmptyState,
  ViewListSkeleton,
} from "./TaskListItem";

/** Sort weight so urgent tasks float to the top of every view. */
const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Sorts a copy of the list by priority (urgent first, low last). */
function byPriority(tasks: ReturnType<typeof getTodayTasks>) {
  return tasks
    .slice()
    .sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
    );
}

/**
 * Quick view of everything due today as a compact vertical list (not Kanban
 * columns). Cards open the edit modal on click; the date and count update
 * live with the task store and respect the selected project.
 */
export function TodayView() {
  const { tasks, isMounted } = useScopedTasks();

  const todayTasks = useMemo(
    () => byPriority(getTodayTasks(tasks)),
    [tasks],
  );

  return (
    <section className="flex flex-col rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white/90">Today</h2>
          <p className="mt-0.5 truncate text-xs text-white/40">
            {/* Gated on hydration: the prerendered date would otherwise differ
                from the client clock on later visits. */}
            {isMounted ? format(new Date(), "EEEE, MMMM d") : "\u00A0"}
          </p>
        </div>
        <ViewCountBadge count={todayTasks.length} />
      </header>

      {!isMounted ? (
        <ViewListSkeleton />
      ) : todayTasks.length === 0 ? (
        <ViewEmptyState
          icon={<FiCheckCircle size={22} />}
          message="No tasks due today! 🎉"
          hint="Enjoy the clear runway — or get ahead with a new task."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {todayTasks.map((task) => (
            <TaskListItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}
