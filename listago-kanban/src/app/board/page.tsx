"use client";

import { useMemo } from "react";

import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useDebounce } from "@/hooks/useDebounce";
import { useIsMounted } from "@/hooks/useScopedTasks";
import { filterTasks } from "@/lib/filters";
import { useTaskStore } from "@/store/useTaskStore";
import { useUIStore } from "@/store/useUIStore";

/**
 * `/board` — the Kanban board's own route (moved from `/`).
 *
 * The board itself filters by `selectedProjectId` and the debounced search
 * query; the header count mirrors that exact pipeline so the number always
 * matches what is visible in the columns.
 */
export default function BoardPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const selectedProjectId = useUIStore((state) => state.selectedProjectId);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const debouncedQuery = useDebounce(searchQuery, 250);
  const isMounted = useIsMounted();

  const visibleCount = useMemo(
    () =>
      isMounted
        ? filterTasks({
            tasks,
            projectId: selectedProjectId ?? undefined,
            query: debouncedQuery,
          }).length
        : null,
    [debouncedQuery, isMounted, selectedProjectId, tasks],
  );

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">
            Kanban Board
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Drag tasks between columns to update their status.
          </p>
        </div>

        <span className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-white/60">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-accent-indigo"
          />
          {visibleCount === null
            ? "\u00A0"
            : `${visibleCount} ${visibleCount === 1 ? "task" : "tasks"}`}
        </span>
      </header>

      <KanbanBoard />
    </>
  );
}
