"use client";

import { useMemo, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiBarChart2 } from "react-icons/fi";

import {
  getPriorityBreakdown,
  getWeeklyCompletionData,
} from "@/lib/filters";
import { useScopedTasks } from "@/hooks/useScopedTasks";

/** Priority slice/legend colors from the ListaGo design system. */
const PRIORITY_PIE = [
  { name: "Urgent", key: "urgent", color: "#ef4444" },
  { name: "High", key: "high", color: "#f97316" },
  { name: "Medium", key: "medium", color: "#eab308" },
  { name: "Low", key: "low", color: "#22c55e" },
] as const;

/**
 * Dashboard charts: weekly created/completed activity and the priority
 * donut. Both read through {@link useScopedTasks}, so they respect the
 * selected project and only render data after hydration (the weekly buckets
 * depend on the current date and persisted tasks).
 */
export function TaskCharts() {
  const { tasks, isMounted } = useScopedTasks();

  const weekly = useMemo(
    () => (isMounted ? getWeeklyCompletionData(tasks) : null),
    [isMounted, tasks],
  );
  const breakdown = useMemo(() => getPriorityBreakdown(tasks), [tasks]);

  const pieData = PRIORITY_PIE.map((entry) => ({
    name: entry.name,
    value: breakdown[entry.key],
    color: entry.color,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Chart 1 — created vs completed over the last 7 days */}
      <ChartCard
        title="Weekly Activity"
        subtitle="Created vs completed · last 7 days"
        headerExtra={
          <div className="flex items-center gap-3 text-xs text-white/50">
            <LegendDot color="#6366f1" label="Created" />
            <LegendDot color="#22c55e" label="Completed" />
          </div>
        }
      >
        {!isMounted ? (
          <ChartSkeleton />
        ) : tasks.length === 0 ? (
          <ChartEmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={weekly ?? []}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weeklyCreatedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="weeklyCompletedFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={34}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#weeklyCompletedFill)"
              />
              <Area
                type="monotone"
                dataKey="created"
                name="Created"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#weeklyCreatedFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Chart 2 — priority distribution donut */}
      <ChartCard
        title="Priority Breakdown"
        subtitle="How the backlog is distributed"
      >
        {!isMounted ? (
          <ChartSkeleton />
        ) : tasks.length === 0 ? (
          <ChartEmptyState />
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  position="bottom"
                  itemSorter={null}
                  iconType="circle"
                  iconSize={8}
                  formatter={(name) => {
                    // `entry.value` is the label itself for pie legends, so
                    // the count comes from the data we built above.
                    const count = pieData.find(
                      (entry) => entry.name === name,
                    )?.value;
                    return (
                      <span className="text-xs text-white/60">
                        {name}
                        <span className="text-white/40"> · {count ?? 0}</span>
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Total in the donut hole */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[calc(100%-40px)] flex-col items-center justify-center">
              <span className="text-2xl font-bold leading-none tabular-nums text-white">
                {tasks.length}
              </span>
              <span className="mt-1 text-[11px] uppercase tracking-wide text-white/40">
                tasks
              </span>
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

/** Glass card wrapping one chart with its title and optional header content. */
function ChartCard({
  title,
  subtitle,
  headerExtra,
  children,
}: {
  title: string;
  subtitle: string;
  headerExtra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white/80">{title}</h3>
          <p className="mt-0.5 text-xs text-white/40">{subtitle}</p>
        </div>
        {headerExtra}
      </header>
      {children}
    </section>
  );
}

/** Colored dot + label used as the area chart's inline legend. */
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

/** Pulse placeholder while localStorage-backed data is not available yet. */
function ChartSkeleton() {
  return (
    <div className="h-[260px] animate-pulse rounded-xl bg-white/5" aria-hidden />
  );
}

/** Friendly empty state when there is nothing to chart. */
function ChartEmptyState() {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center gap-3 text-center">
      <span className="rounded-2xl bg-white/8 p-3 text-white/40">
        <FiBarChart2 size={22} />
      </span>
      <p className="text-sm text-white/50">No data yet</p>
      <p className="text-xs text-white/30">
        Create some tasks to see this chart come alive
      </p>
    </div>
  );
}
