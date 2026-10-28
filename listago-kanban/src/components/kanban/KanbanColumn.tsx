"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FiPlus } from "react-icons/fi";

import type {
  KanbanColumn as KanbanColumnDefinition,
  Status,
  Task,
} from "@/types";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  /** Column definition (id/title/color) from KANBAN_COLUMNS. */
  column: KanbanColumnDefinition;
  /** Tasks currently displayed in this column. */
  tasks: Task[];
  /** Zero-based column index, used to stagger the entry animation. */
  columnIndex: number;
  /** True while any card is being dragged (freezes card layout animations). */
  isDragActive: boolean;
  /**
   * Opens the create-task modal with this column's status pre-filled.
   * The modal itself also defaults the project to the currently selected
   * one (via useUIStore), so both fields arrive pre-filled.
   */
  onAddTask: (status: Status) => void;
}

/**
 * A single Kanban column. Acts as a drop target (`useDroppable`) and hosts
 * its sortable cards inside a `SortableContext`. The column id is the task
 * status, so dropping a card here moves the task to that status.
 *
 * Animation note: the column slides in staggered by index, the card list is
 * wrapped in `AnimatePresence` so cards animate on entry and exit, and the
 * droppable area gets a colored glow while a dragged card hovers over it.
 * The glow uses the dnd-kit `isOver` state, so it tracks drag timing exactly.
 */
export function KanbanColumn({
  column,
  tasks,
  columnIndex,
  isDragActive,
  onAddTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const taskIds = tasks.map((task) => task.id);

  return (
    <motion.section
      aria-label={`${column.title} column`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: columnIndex * 0.1, ease: "easeOut" }}
      className="flex w-72 shrink-0 grow flex-col rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl sm:w-80 lg:w-auto"
    >
      <header className="mb-3 flex items-center gap-2 px-1">
        <span
          aria-hidden
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">
          {column.title}
        </h2>
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium tabular-nums text-white/60">
          {tasks.length}
        </span>
      </header>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <motion.div
          ref={setNodeRef}
          animate={{
            // Subtle column-colored glow while a card hovers over this drop zone.
            boxShadow: isOver
              ? `0 0 20px ${column.color}40`
              : "0 0 0px rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`flex flex-1 flex-col gap-3 rounded-xl p-1 transition-colors duration-150 ${
            isOver ? "bg-accent-indigo/10 ring-2 ring-accent-indigo/50" : ""
          }`}
        >
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                isDragActive={isDragActive}
              />
            ))}
          </AnimatePresence>

          {tasks.length === 0 ? (
            <div className="flex min-h-28 items-center justify-center rounded-xl border-2 border-dashed border-white/10 px-4 text-center text-sm text-white/40">
              Drop tasks here
            </div>
          ) : null}
        </motion.div>
      </SortableContext>

      <button
        type="button"
        onClick={() => onAddTask(column.id)}
        className="mt-3 flex items-center gap-1.5 rounded-xl border border-dashed border-white/10 px-3 py-2 text-sm text-white/40 transition hover:border-white/20 hover:bg-white/5 hover:text-white/70"
      >
        <FiPlus size={15} />
        Add task
      </button>
    </motion.section>
  );
}
