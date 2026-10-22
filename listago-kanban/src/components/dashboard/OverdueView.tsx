"use client";

import { useMemo } from "react";
import { differenceInCalendarDays, parseISO, startOfToday } from "date-fns";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

import { getOverdueTasks } from "@/lib/filters";
import { useScopedTasks } from "@/hooks/useScopedTasks";
import {
  TaskListItem,
  ViewCountBadge,
  ViewEmptyState,
  ViewListSkeleton,
} from "./TaskListItem";

/** "3 days overdue" / "1 day overdue". */
function overdueLabel(dueDate: string): string {
  const days = differenceInCalendarDays(startOfToday(), parseISO(dueDate));
  return `${days} ${days === 1 ? "day" : "days"} overdue`;
}

/**
 * Quick view of every overdue task with a red accent. Sorted oldest due
 * date first (most overdue on top); each card shows how many days late it
 * is and opens the edit modal on click. Respects the selected project.
 */
export function OverdueView() {
  const { tasks, isMounted } = useScopedTasks();

  const overdueTasks = useMemo(() => {
    if (!isMounted) return [];
    // Oldest due date first = most overdue on top.
    return getOverdueTasks(tasks)
      .slice()
      .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  }, [isMounted, tasks]);

  return (
    <section className="flex flex-col rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white/90">
            <span className="text-red-400" aria-hidden>
              <FiAlertTriangle size={16} />
            </span>
            Overdue
          </h2>
          <p className="mt-0.5 text-xs text-white/40">
            Past due and still open
          </p>
        </div>
        <ViewCountBadge
          count={overdueTasks.length}
          tone={overdueTasks.length > 0 ? "danger" : "default"}
        />
      </header>

      {!isMounted ? (
        <ViewListSkeleton rows={2} />
      ) : overdueTasks.length === 0 ? (
        <ViewEmptyState
          tone="success"
          icon={<FiCheckCircle size={22} />}
          message="No overdue tasks! Great job! ✅"
          hint="Everything due is already done or still on time."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {overdueTasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              variant="danger"
              meta={
                task.dueDate ? (
                  <span className="text-red-400">
                    {overdueLabel(task.dueDate)}
                  </span>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
