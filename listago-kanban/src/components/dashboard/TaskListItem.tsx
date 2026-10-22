"use client";

import type { ReactNode } from "react";

import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { useProjectStore } from "@/store/useProjectStore";
import { useUIStore } from "@/store/useUIStore";
import { KANBAN_COLUMNS, type Task } from "@/types";

interface TaskListItemProps {
  /** Task rendered by the card. */
  task: Task;
  /** Optional right-aligned note (e.g. "3 days overdue"). */
  meta?: ReactNode;
  /** Red accent used by the Overdue view. */
  variant?: "default" | "danger";
}

/**
 * Compact, clickable task card shared by the Today / Upcoming / Overdue
 * views: title, priority pill, status pill and owning project. Clicking
 * opens the shared edit modal (`openEditTask`).
 */
export function TaskListItem({
  task,
  meta,
  variant = "default",
}: TaskListItemProps) {
  const openEditTask = useUIStore((state) => state.openEditTask);
  const project = useProjectStore((state) =>
    task.projectId === null
      ? null
      : (state.projects.find((candidate) => candidate.id === task.projectId) ??
        null),
  );
  const status = KANBAN_COLUMNS.find((column) => column.id === task.status);

  return (
    <button
      type="button"
      onClick={() => openEditTask(task.id)}
      aria-label={`Edit task "${task.title}"`}
      className={`group w-full rounded-xl border p-3.5 text-left backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 ${
        variant === "danger"
          ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`line-clamp-2 text-sm font-medium leading-snug ${
            task.completed
              ? "text-white/45 line-through decoration-white/30"
              : "text-white/90"
          }`}
        >
          {task.title}
        </span>
        {meta ? (
          <span className="shrink-0 text-xs font-semibold">{meta}</span>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />

        {status ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/60">
            <span
              aria-hidden
              className="size-1.5 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            {status.title}
          </span>
        ) : null}

        {project ? (
          <span className="ml-auto inline-flex max-w-32 items-center gap-1.5 text-[11px] text-white/40">
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <span className="truncate">{project.name}</span>
          </span>
        ) : null}
      </div>
    </button>
  );
}

/** Count pill shown in a quick-view header. */
export function ViewCountBadge({
  count,
  tone = "default",
}: {
  count: number;
  tone?: "default" | "danger";
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
        tone === "danger"
          ? "border border-red-500/30 bg-red-500/15 text-red-400"
          : "bg-white/10 text-white/60"
      }`}
    >
      {count} {count === 1 ? "task" : "tasks"}
    </span>
  );
}

/**
 * Pulse rows shown while localStorage-backed tasks hydrate, so views never
 * flash their empty state before the real data arrives.
 */
export function ViewListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-[78px] animate-pulse rounded-xl bg-white/5"
          style={{ animationDelay: `${index * 80}ms` }}
        />
      ))}
    </div>
  );
}

/** Centered empty-state block shared by the quick views. */
export function ViewEmptyState({
  icon,
  message,
  hint,
  tone = "default",
}: {
  icon: ReactNode;
  message: string;
  hint?: string;
  tone?: "default" | "success";
}) {
  const success = tone === "success";
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 px-4 py-10 text-center">
      <span
        className={`rounded-2xl p-3 ${
          success ? "bg-green-500/10 text-green-400" : "bg-white/8 text-white/40"
        }`}
      >
        {icon}
      </span>
      <p
        className={`text-sm font-medium ${
          success ? "text-green-400" : "text-white/60"
        }`}
      >
        {message}
      </p>
      {hint ? <p className="max-w-56 text-xs text-white/30">{hint}</p> : null}
    </div>
  );
}
