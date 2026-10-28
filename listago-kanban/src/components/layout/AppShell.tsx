"use client";

import { Suspense, type ReactNode } from "react";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { DeleteProjectModal } from "@/components/modals/DeleteProjectModal";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";
import { TaskModal } from "@/components/modals/TaskModal";
import { Header } from "./Header";
import { Sidebar, SidebarFallback } from "./Sidebar";

interface AppShellProps {
  /** The routed page content (the Kanban board). */
  children: ReactNode;
}

/**
 * The chrome around the Kanban board: sidebar, header, global modals,
 * the keyboard shortcuts and (via the root layout) toast notifications.
 * Mounted once by the root layout.
 */
export function AppShell({ children }: AppShellProps) {
  useKeyboardShortcuts();

  return (
    <div className="flex min-h-screen">
      {/* The sidebar's active-link highlight needs `usePathname`, which
          suspends while prerendering routes whose params are only known at
          request time (e.g. `/projects/[id]`). The boundary keeps the rest
          of the shell prerendered; static routes resolve instantly. */}
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar />
      </Suspense>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <TaskModal />
      <DeleteModal />
      <ProjectModal />
      <DeleteProjectModal />
      {/* Rendered last so it stacks above the other modals; it closes
          itself before opening the delete or edit modals from its footer. */}
      <TaskDetailModal />
    </div>
  );
}
