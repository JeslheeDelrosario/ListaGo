"use client";

import Image from "next/image";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  FiCalendar,
  FiEdit,
  FiLayout,
  FiList,
  FiPlus,
  FiSun,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useUIStore } from "@/store/useUIStore";
import { getTaskCounts } from "@/lib/filters";
import { isInboxProject, type Project } from "@/types";
import { ProjectIcon } from "@/components/ui/ProjectIcon";

/** Sidebar view navigation. "all" is live; the others land in Phase 4. */
type SidebarView = "dashboard" | "all" | "today" | "upcoming";

/** No-op event subscription for the hydration-detection snapshot. */
function emptySubscribe(): () => void {
  return () => {};
}

/** Stats shown during SSR/hydration (overdue needs the current date). */
const EMPTY_COUNTS = { total: 0, pending: 0, done: 0, overdue: 0 };

/**
 * Glassmorphism sidebar: branding, view navigation, full project
 * management (live counts, create/edit/delete) and a shortcuts hint.
 *
 * Desktop: fixed left rail, w-64, border-r. Mobile: hidden by default,
 * slides in as an overlay drawer when `isSidebarOpen` is true.
 */
export function Sidebar() {
  const tasks = useTaskStore((state) => state.tasks);
  const projects = useProjectStore((state) => state.projects);

  const selectedProjectId = useUIStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useUIStore(
    (state) => state.setSelectedProjectId,
  );
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const openProjectModal = useUIStore((state) => state.openProjectModal);

  const [activeView, setActiveView] = useState<SidebarView>("all");

  /**
   * Overdue counting reads the current date, which prerendering forbids
   * in client components — so stats are computed right after hydration,
   * the same way the board renders its cards.
   */
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const counts = useMemo(
    () => (isMounted ? getTaskCounts(tasks) : EMPTY_COUNTS),
    [isMounted, tasks],
  );

  /** Live per-project task counts, recomputed whenever tasks change. */
  const projectCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasks) {
      if (task.projectId === null) continue;
      map.set(task.projectId, (map.get(task.projectId) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  /** Inbox always first, then store order (new projects prepend). */
  const orderedProjects = useMemo(
    () => [
      ...projects.filter(isInboxProject),
      ...projects.filter((p) => !isInboxProject(p)),
    ],
    [projects],
  );

  /** View nav: Phase 4 adds the actual view filters; today they clear the project filter. */
  const handleViewSelect = (view: SidebarView) => {
    setActiveView(view);
    setSelectedProjectId(null);
    closeSidebar();
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    closeSidebar();
  };

  const viewActive = (view: SidebarView) =>
    activeView === view && selectedProjectId === null;

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isSidebarOpen ? (
        <div
          aria-hidden
          onClick={closeSidebar}
          className="fixed inset-0 z-30 animate-fade-in bg-black/60 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Branding */}
        <div className="mb-4 flex items-center gap-3 px-1">
          <Image
            src="/web-app-manifest-192x192.png"
            alt="ListaGo logo"
            width={34}
            height={34}
            priority
            className="rounded-xl shadow-lg shadow-black/30"
          />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            ListaGo
          </span>
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="ml-auto rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white/90 lg:hidden"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* View navigation */}
        <nav className="mb-4 flex flex-col gap-1" aria-label="Views">
          <SidebarNavButton
            icon={<FiLayout size={16} />}
            label="Dashboard"
            active={viewActive("dashboard")}
            onClick={() => handleViewSelect("dashboard")}
          />
          <SidebarNavButton
            icon={<FiList size={16} />}
            label="All Tasks"
            active={viewActive("all")}
            count={counts.total}
            onClick={() => handleViewSelect("all")}
          />
          <SidebarNavButton
            icon={<FiSun size={16} />}
            label="Today"
            active={viewActive("today")}
            onClick={() => handleViewSelect("today")}
          />
          <SidebarNavButton
            icon={<FiCalendar size={16} />}
            label="Upcoming"
            active={viewActive("upcoming")}
            onClick={() => handleViewSelect("upcoming")}
          />
        </nav>

        {/* Stats strip (Phase 2) */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          <StatTile label="Total" value={counts.total} />
          <StatTile label="Pending" value={counts.pending} />
          <StatTile label="Done" value={counts.done} />
          <StatTile label="Overdue" value={counts.overdue} danger />
        </div>

        {/* Projects */}
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Projects
          </span>
          <button
            type="button"
            onClick={() => openProjectModal()}
            aria-label="New project"
            title="New project"
            className="rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white/90"
          >
            <FiPlus size={15} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Projects">
          {orderedProjects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              count={projectCounts.get(project.id) ?? 0}
              active={selectedProjectId === project.id}
              onSelect={() => handleProjectSelect(project.id)}
            />
          ))}
        </nav>

        {/* Keyboard shortcuts hint */}
        <p className="mt-4 select-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] leading-relaxed text-white/40">
          <kbd className="font-sans font-semibold text-white/60">/</kbd> search
          <span className="mx-1.5 text-white/20">·</span>
          <kbd className="font-sans font-semibold text-white/60">⌘N</kbd> new task
          <span className="mx-1.5 text-white/20">·</span>
          <kbd className="font-sans font-semibold text-white/60">esc</kbd> close
        </p>
      </aside>
    </>
  );
}

/** Sidebar view nav row (Dashboard / All Tasks / Today / Upcoming). */
function SidebarNavButton({
  icon,
  label,
  active,
  count,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-center gap-2.5 rounded-xl border border-l-2 px-3 py-2 text-left text-sm transition ${
        active
          ? "border-white/10 border-l-indigo-500 bg-white/12 text-white/90"
          : "border-transparent border-l-transparent text-white/60 hover:bg-white/5 hover:text-white/90"
      }`}
    >
      <span className="shrink-0 text-white/50">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined ? (
        <span className="text-xs tabular-nums text-white/40">{count}</span>
      ) : null}
    </button>
  );
}

/**
 * A single project row: colored icon, name, live task count, and hover
 * actions for edit and delete. The permanent Inbox shows no delete action.
 */
function ProjectRow({
  project,
  count,
  active,
  onSelect,
}: {
  project: Project;
  count: number;
  active: boolean;
  onSelect: () => void;
}) {
  const openProjectModal = useUIStore((state) => state.openProjectModal);
  const openDeleteProjectModal = useUIStore(
    (state) => state.openDeleteProjectModal,
  );
  const protectedInbox = isInboxProject(project);

  return (
    <div className="group/row relative">
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "page" : undefined}        className={`flex w-full items-center gap-2.5 rounded-xl border border-l-2 px-3 py-2 text-left text-sm transition ${
          active
            ? "border-white/10 bg-white/12 text-white/90"
            : "border-transparent border-l-transparent text-white/60 hover:bg-white/5 hover:text-white/90"
          }`}
        style={active ? { borderLeftColor: project.color } : undefined}
      >
        <ProjectIcon
          iconName={project.icon}
          color={project.color}
          size={16}
        />
        <span className="flex-1 truncate">{project.name}</span>
        <span className="text-xs tabular-nums text-white/40 transition-opacity group-hover/row:opacity-0">
          {count}
        </span>
      </button>

      {/* Hover actions — swap in over the count badge */}
      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover/row:opacity-100">
        <button
          type="button"
          aria-label={`Edit project "${project.name}"`}
          onClick={(event) => {
            event.stopPropagation();
            openProjectModal(project.id);
          }}
          className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white/90"
        >
          <FiEdit size={13} />
        </button>
        {protectedInbox ? null : (
          <button
            type="button"
            aria-label={`Delete project "${project.name}"`}
            onClick={(event) => {
              event.stopPropagation();
              openDeleteProjectModal(project.id);
            }}
            className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-red-400"
          >
            <FiTrash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

/** Small stat tile in the sidebar stats strip. */
function StatTile({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div
        className={`text-lg font-semibold tabular-nums leading-tight ${
          danger && value > 0 ? "text-red-400" : "text-white/90"
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wide text-white/40">
        {label}
      </div>
    </div>
  );
}
