"use client";

import { useEffect, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
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
        index={0}
        icon={<FiList size={18} />}
        label="Total Tasks"
        value={stats.total}
        iconClassName="bg-indigo-500/20 text-indigo-400"
      />
      <StatCard
        index={1}
        icon={<FiClock size={18} />}
        label="In Progress"
        value={stats.inprogress}
        iconClassName="bg-amber-500/20 text-amber-400"
      />
      <StatCard
        index={2}
        icon={<FiCheckCircle size={18} />}
        label="Completed"
        value={stats.done}
        iconClassName="bg-green-500/20 text-green-400"
      />
      <StatCard
        index={3}
        icon={<FiSun size={18} />}
        label="Due Today"
        value={dueToday}
        iconClassName="bg-cyan-500/20 text-cyan-400"
      />
      <StatCard
        index={4}
        icon={<FiAlertTriangle size={18} />}
        label="Overdue"
        value={stats.overdue}
        iconClassName="bg-red-500/20 text-red-400"
        // Gentle attention pulse only while something is actually late.
        highlight={stats.overdue > 0}
        valueClassName={stats.overdue > 0 ? "text-red-400" : undefined}
      />
      <StatCard
        index={5}
        icon={<FiTrendingUp size={18} />}
        label="Completion Rate"
        value={stats.completionRate}
        suffix="%"
        iconClassName="bg-purple-500/20 text-purple-400"
      >
        <CompletionRing rate={stats.completionRate} />
      </StatCard>
    </div>
  );
}

interface StatCardProps {
  /** Zero-based position in the grid, used to stagger the entry animation. */
  index: number;
  /** Feather icon rendered inside the colored circle. */
  icon: ReactNode;
  /** Caption under the number. */
  label: string;
  /** Main figure, counted up from zero on mount. */
  value: number;
  /** Optional suffix appended to the number (e.g. "%"). */
  suffix?: string;
  /** Tailwind classes for the icon's colored circle (`bg-…/20 text-…`). */
  iconClassName: string;
  /** Adds a red pulsing glow while true (used by the overdue card). */
  highlight?: boolean;
  /** Extra classes for the number (e.g. red when overdue > 0). */
  valueClassName?: string;
  /** Optional side visual, e.g. the completion ring. */
  children?: ReactNode;
}

/** Single glassmorphism statistic card with count-up and hover lift. */
function StatCard({
  index,
  icon,
  label,
  value,
  suffix,
  iconClassName,
  highlight = false,
  valueClassName,
  children,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -4, transition: { duration: 0.15 } }}
    >
      <article
        className={`group relative rounded-2xl border bg-white/8 p-4 backdrop-blur-xl transition-colors duration-200 ${
          highlight ? "border-red-500/40" : "border-white/10"
        }`}
      >
        {/* Red pulsing halo, animated only while the card is highlighted. */}
        {highlight ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(239,68,68,0.35)",
                "0 0 20px 2px rgba(239,68,68,0.15)",
                "0 0 0 0 rgba(239,68,68,0)",
              ],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ) : null}

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
          <CountUp value={value} suffix={suffix} />
        </div>
        <div className="mt-1.5 text-sm text-white/50">{label}</div>
      </article>
    </motion.div>
  );
}

/**
 * Animates a number from its previous value to the new one over ~1s. Keeps a
 * motion value across renders so live store changes spring from where the
 * last animation ended rather than snapping from zero each time.
 */
function CountUp({ value, suffix }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [motionValue, value]);

  return (
    <span>
      {display}
      {suffix}
    </span>
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
