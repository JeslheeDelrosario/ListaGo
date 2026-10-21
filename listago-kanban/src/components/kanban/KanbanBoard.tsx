"use client";

import { useState, useSyncExternalStore } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { KANBAN_COLUMNS, type Status, type Task } from "@/types";
import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useUIStore } from "@/store/useUIStore";
import { useDebounce } from "@/hooks/useDebounce";
import { filterTasks } from "@/lib/filters";
import { ProjectIcon } from "@/components/ui/ProjectIcon";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCardBody } from "./KanbanCard";

/** No-op event subscription for the hydration-detection snapshot. */
function emptySubscribe(): () => void {
  return () => {};
}

/**
 * Interactive Kanban board.
 *
 * Wraps the four status columns in a `DndContext`. Cards are sortable
 * (`useSortable`) and columns are droppable (`useDroppable`); dropping a
 * card calls `moveTask` from the Zustand store, which persists to
 * localStorage.
 *
 * Filtering runs in the required order before grouping into columns:
 *   1. project filter (`selectedProjectId`), 2. debounced search query,
 *   3. status grouping — so tasks from other projects never leak into
 *   columns. A colored project header is shown while a project is selected.
 */
export function KanbanBoard() {
  const tasks = useTaskStore((state) => state.tasks);
  const moveTask = useTaskStore((state) => state.moveTask);
  const projects = useProjectStore((state) => state.projects);

  const searchQuery = useUIStore((state) => state.searchQuery);
  const selectedProjectId = useUIStore((state) => state.selectedProjectId);
  const openCreateTask = useUIStore((state) => state.openCreateTask);

  /** Raw typing stays in the store; filtering sees the settled query. */
  const debouncedQuery = useDebounce(searchQuery, 250);

  /** Task rendered in the DragOverlay while a drag is in progress. */
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  /**
   * Tasks live in localStorage, so they can differ from the server-rendered
   * seed data. `isMounted` is false during SSR and hydration and flips to
   * true right after, so task cards only render on the client and hydration
   * stays clean.
   */
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const selectedProject =
    selectedProjectId === null
      ? null
      : projects.find((project) => project.id === selectedProjectId) ?? null;

  /** 1. project filter, 2. search — grouping by status happens below. */
  const visibleTasks = filterTasks({
    tasks,
    projectId: selectedProjectId === null ? undefined : selectedProjectId,
    query: debouncedQuery,
  });

  /** Starts a drag: remember the dragged task for the DragOverlay ghost. */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveTask(tasks.find((task) => task.id === active.id) ?? null);
  };

  /**
   * Ends a drag: resolve the target column from the `over` element — it is
   * either a column id (dropped on empty column space) or another task's id
   * (dropped between cards) — and move the task there.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const overId = String(over.id);

    let targetStatus: Status | null = null;
    const overColumn = KANBAN_COLUMNS.find((column) => column.id === overId);
    if (overColumn) {
      targetStatus = overColumn.id;
    } else {
      const overTask = tasks.find((task) => task.id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    if (targetStatus) moveTask(String(active.id), targetStatus);
  };

  /** Clears the overlay ghost when a drag is cancelled (e.g. Escape). */
  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {selectedProject ? (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <span className="rounded-lg bg-white/5 p-1.5">
            <ProjectIcon
              iconName={selectedProject.icon}
              color={selectedProject.color}
              size={18}
            />
          </span>
          <h1 className="text-base font-semibold text-white/90">
            {selectedProject.name}
          </h1>
          <span aria-hidden className="h-4 w-px bg-white/10" />
          <span className="text-sm text-white/40">
            {visibleTasks.length} task{visibleTasks.length === 1 ? "" : "s"}
          </span>
          <span
            aria-hidden
            className="ml-auto size-2.5 rounded-full shadow-lg"
            style={{
              backgroundColor: selectedProject.color,
              boxShadow: `0 0 12px ${selectedProject.color}`,
            }}
          />
        </div>
      ) : null}

      <div className="flex flex-1 items-stretch gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={
              isMounted
                ? visibleTasks.filter((task) => task.status === column.id)
                : []
            }
            onAddTask={(status) => openCreateTask(status)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? <KanbanCardBody task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
