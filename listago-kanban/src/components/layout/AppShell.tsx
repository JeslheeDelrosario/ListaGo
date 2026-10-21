"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { DeleteProjectModal } from "@/components/modals/DeleteProjectModal";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { TaskModal } from "@/components/modals/TaskModal";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  /** The routed page content (the Kanban board). */
  children: ReactNode;
}

/**
 * The chrome around the Kanban board: sidebar, header, global modals,
 * toast notifications and the keyboard shortcuts. Mounted once by the
 * root layout.
 */
export function AppShell({ children }: AppShellProps) {
  useKeyboardShortcuts();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

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
      <Toaster theme="dark" richColors position="top-right" closeButton />
    </div>
  );
}
