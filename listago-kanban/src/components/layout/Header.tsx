"use client";

import { FiMenu, FiPlus, FiSearch } from "react-icons/fi";

import { useProjectStore } from "@/store/useProjectStore";
import { useUIStore } from "@/store/useUIStore";
import {
  SEARCH_INPUT_ATTR,
  SEARCH_INPUT_ID,
} from "@/hooks/useKeyboardShortcuts";

/**
 * App header: mobile menu button, debounced search field, active project
 * breadcrumb and the primary "New Task" action.
 *
 * The raw query is stored in the UI store so typing stays instant; the
 * board debounces it (250ms) before running the filter pipeline.
 */
export function Header() {
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const selectedProjectId = useUIStore((state) => state.selectedProjectId);
  const openSidebar = useUIStore((state) => state.openSidebar);
  const openCreateTask = useUIStore((state) => state.openCreateTask);

  const selectedProject = useProjectStore((state) =>
    state.projects.find((project) => project.id === selectedProjectId) ?? null,
  );

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={openSidebar}
        aria-label="Open sidebar"
        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white/90 lg:hidden"
      >
        <FiMenu size={16} />
      </button>

      <div className="relative w-full max-w-md min-w-0">
        <FiSearch
          size={15}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
        />
        <input
          id={SEARCH_INPUT_ID}
          {...{ [SEARCH_INPUT_ATTR]: "" }}
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search tasks..."
          aria-label="Search tasks"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-14 text-sm text-white/90 placeholder:text-white/30 transition focus:border-accent-indigo/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        {/* Keyboard hint badge — shown until the field has content */}
        {searchQuery === "" ? (
          <kbd
            aria-hidden
            className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-sans text-xs text-white/20 sm:block"
          >
            ⌘K
          </kbd>
        ) : null}
      </div>

      {selectedProject ? (
        <span className="hidden items-center gap-1.5 text-xs text-white/40 md:flex">
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ backgroundColor: selectedProject.color }}
          />
          {selectedProject.name}
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => openCreateTask()}
        aria-label="New task"
        className="ml-auto flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
      >
        <FiPlus size={16} />
        <span className="hidden sm:inline">New Task</span>
      </button>
    </header>
  );
}
