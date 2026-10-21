"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiSearch } from "react-icons/fi";

import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useProjectStore } from "@/store/useProjectStore";
import { useUIStore } from "@/store/useUIStore";

/**
 * Route-based project view: `/projects/[id]`.
 *
 * Selects the project in the UI store while mounted (the board filters
 * itself from `selectedProjectId` and renders the colored project header),
 * and clears the filter again on unmount so navigating away never leaves a
 * stale selection behind.
 */
export default function ProjectPage() {
  // URL data (useParams) is request-time: the Suspense boundary lets the
  // static shell prerender its fallback while the real view resolves per
  // request (Next.js "push dynamic access down" pattern).
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-16 text-sm text-white/40">
          Loading project…
        </div>
      }
    >
      <ProjectView />
    </Suspense>
  );
}

function ProjectView() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const projects = useProjectStore((state) => state.projects);
  const projectExists = projects.some((p) => p.id === projectId);

  useEffect(() => {
    if (!projectExists) return;
    // getState() keeps this a zustand write, not a React setState-in-effect.
    useUIStore.getState().setSelectedProjectId(projectId);
    return () => {
      useUIStore.getState().setSelectedProjectId(null);
    };
  }, [projectExists, projectId]);

  if (!projectExists) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/8 p-8 text-center backdrop-blur-xl">
          <span className="rounded-2xl bg-white/10 p-3 text-white/50">
            <FiSearch size={24} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-white/90">
              Project not found
            </h1>
            <p className="mt-1 text-sm text-white/50">
              The project you are looking for does not exist or was deleted.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
          >
            <FiArrowLeft size={15} />
            Back to board
          </Link>
        </div>
      </div>
    );
  }

  // The board renders the colored project header once the filter is set.
  return <KanbanBoard />;
}
