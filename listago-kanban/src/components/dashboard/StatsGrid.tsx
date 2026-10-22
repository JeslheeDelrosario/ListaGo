"use client";

import type { ReactNode } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiList,
  FiSun,
  FiTrendingUp,
} from "react-icons/fi";

import { getCompletionStats, getTodayTasks } from "@/lib/filters";
import { useScopedTasks } from "@/hooks/useScopedTasks";

/**
 * Grid of live task statistics.
 *
 * All numbers derive from the Zustand task store through
 * {@link useScopedTasks}, so they update the instant a task changes — and
 * they respect the project selected in the sidebar. Before hydration the
 * scope is empty and every card shows zero, the same pattern the sidebar
 * stats strip uses to keep prerendered HTML and the first client render
 * identical.
 */
export function StatsGrid() {
  const { tasks } = useScopedTasks();

  const stats = getCompletionStats(tasks);
  const dueToday = getTodayTasks(tasks).length;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <StatCard
        icon={<FiList size={18} />}
        label="Total Tasks"
        value={stats.total}
        iconClassName="bg-indigo-500/20 text-indigo-400"
      />
      <StatCard
        icon={<FiClock size={18} />}
        label="In Progress"
        value={stats.inprogress}
        iconClassName="bg-amber-500/20 text-amber-400"
      />
      <StatCard
        icon={<FiCheckCircle size={18} />}
        label="Completed"
        value={stats.done}
        iconClassName="bg-green-500/20 text-green-400"
      />
      <StatCard
        icon={<FiSun size={18} />}
        label="Due Today"
        value={dueToday}
        iconClassName="bg-cyan-500/20 text-cyan-400"
      />
      <StatCard
        icon={<FiAlertTriangle size={18} />}
        label="Overdue"
        value={stats.overdue}
        iconClassName="bg-red-500/20 text-red-400"
        // Gentle attention pulse only while something is actually late.
        highlightClassName={
          stats.overdue > 0 ? "border-red-500/40 animate-pulse-red" : undefined
        }
        valueClassName={stats.overdue > 0 ? "text-red-400" : undefined}
      />
      <StatCard
        icon={<FiTrendingUp size={18} />}
        label="Completion Rate"
        value={`${stats.completionRate}%`}
        iconClassName="bg-purple-500/20 text-purple-400"
      >
        <CompletionRing rate={stats.completionRate} />
      </StatCard>
    </div>
  );
}

interface StatCardProps {
  /** Feather icon rendered inside the colored circle. */
  icon: ReactNode;
  /** Caption under the number. */
  label: string;
  /** Main figure (number or formatted percentage). */
  value: ReactNode;
  /** Tailwind classes for the icon's colored circle (`bg-…/20 text-…`). */
  iconClassName: string;
  /** Extra classes for the card border (used to highlight the overdue card). */
  highlightClassName?: string;
  /** Extra classes for the number (e.g. red when overdue > 0). */
  valueClassName?: string;
  /** Optional side visual, e.g. the completion ring. */
  children?: ReactNode;
}

/** Single glassmorphism statistic card with hover lift. */
function StatCard({
  icon,
  label,
  value,
  iconClassName,
  highlightClassName,
  valueClassName,
  children,
}: StatCardProps) {
  return (
    <article
      className={`group rounded-2xl border bg-white/8 p-4 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-white/25 ${
        highlightClassName ?? "border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className={`rounded-xl p-2.5 ${iconClassName}`}
        >
          {icon}
        </span>
        {children}
      </div>
      <div
        className={`mt-3 text-3xl font-bold leading-none tabular-nums text-white ${
          valueClassName ?? ""
        }`}
      >
        {value}
      </div>
      <div className="mt-1.5 text-sm text-white/50">{label}</div>
    </article>
  );
}

/** Small circular progress indicator for the completion-rate card. */
function CompletionRing({ rate }: { rate: number }) {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(rate, 0), 100) / 100);

  return (
    <svg
      viewBox="0 0 44 44"
      className="size-11 shrink-0 -rotate-90"
      aria-hidden
    >
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="4"
      />
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}
