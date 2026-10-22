"use client";

import { useMemo, useSyncExternalStore } from "react";

import { useTaskStore } from "@/store/useTaskStore";
import { useUIStore } from "@/store/useUIStore";
import type { Task } from "@/types";

/** No-op event subscription for the hydration-detection snapshot. */
function emptySubscribe(): () => void {
  return () => {};
}

/**
 * `false` during SSR/prerender and hydration, `true` right after.
 *
 * Task data lives in localStorage and date helpers read the clock, so any
 * value derived from either can differ between the prerendered HTML and the
 * first client render — gate those renders on this flag (the same pattern
 * the Kanban board and sidebar stats already use).
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

/** Result of {@link useScopedTasks}. */
export interface ScopedTasks {
  /** Tasks in scope — empty until the component is mounted. */
  tasks: Task[];
  /** Whether localStorage-backed data is available yet (render skeletons while false). */
  isMounted: boolean;
}

/**
 * Tasks visible to the current view:
 * - scoped to `selectedProjectId` when a project is selected in the sidebar
 *   (`null` = every task), so the dashboard, board, today and upcoming views
 *   always agree;
 * - empty until hydration, because server-rendered seed data can differ
 *   from what is persisted in localStorage.
 */
export function useScopedTasks(): ScopedTasks {
  const allTasks = useTaskStore((state) => state.tasks);
  const selectedProjectId = useUIStore((state) => state.selectedProjectId);
  const isMounted = useIsMounted();

  const tasks = useMemo(() => {
    if (!isMounted) return [];
    if (selectedProjectId === null) return allTasks;
    return allTasks.filter((task) => task.projectId === selectedProjectId);
  }, [allTasks, isMounted, selectedProjectId]);

  return { tasks, isMounted };
}
