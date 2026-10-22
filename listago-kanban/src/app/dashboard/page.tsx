"use client";

import { FiX } from "react-icons/fi";
import { format } from "date-fns";

import { OverdueView } from "@/components/dashboard/OverdueView";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TaskCharts } from "@/components/dashboard/TaskCharts";
import { TodayView } from "@/components/dashboard/TodayView";
import { UpcomingView } from "@/components/dashboard/UpcomingView";
import { useIsMounted } from "@/hooks/useScopedTasks";
import { useProjectStore } from "@/store/useProjectStore";
import { useUIStore } from "@/store/useUIStore";

/** Time-of-day greeting (there is no user profile to address by name). */
function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * The dashboard: greeting, live stats, charts and the three quick views.
 *
 * Every section reads through the dashboard components, which scope
 * themselves to the project selected in the sidebar — selecting a project
 * (here or via `/projects/[id]`) narrows the whole page to its data.
 * Sections fade in with staggered delays from `globals.css`.
 */
export default function DashboardPage() {
  const isMounted = useIsMounted();

  const selectedProjectId = useUIStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useUIStore(
    (state) => state.setSelectedProjectId,
  );
  const selectedProject = useProjectStore((state) =>
    selectedProjectId === null
      ? null
      : (state.projects.find((project) => project.id === selectedProjectId) ??
        null),
  );

  return (
    <div className="flex flex-col">
      {/* Welcome header */}
      <header className="flex animate-fade-in-up flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {isMounted ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight text-white/90 sm:text-3xl">
                {greetingForHour(new Date().getHours())}!
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </>
          ) : (
            // Skeleton until hydration: the prerendered clock would
            // otherwise mismatch the client (or be days stale).
            <div className="flex flex-col gap-2" aria-hidden>
              <div className="h-8 w-56 animate-pulse rounded-lg bg-white/5" />
              <div className="h-4 w-40 animate-pulse rounded bg-white/5" />
            </div>
          )}
        </div>

        {selectedProject ? (
          <button
            type="button"
            onClick={() => setSelectedProjectId(null)}
            aria-label={`Clear the "${selectedProject.name}" project filter`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-3 pr-2 text-xs text-white/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white/90"
          >
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ backgroundColor: selectedProject.color }}
            />
            Showing
            <span className="font-semibold text-white/90">
              {selectedProject.name}
            </span>
            <FiX size={13} className="text-white/40" aria-hidden />
          </button>
        ) : null}
      </header>

      {/* Live statistics */}
      <div className="mt-6 animate-fade-in-up delay-100">
        <StatsGrid />
      </div>

      {/* Charts */}
      <div className="mt-4 animate-fade-in-up delay-200">
        <TaskCharts />
      </div>

      {/* Quick views */}
      <section className="mt-6 animate-fade-in-up delay-300">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
          Quick Views
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <TodayView />
          <UpcomingView />
          <OverdueView />
        </div>
      </section>
    </div>
  );
}
