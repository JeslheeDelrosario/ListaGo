"use client";

import {
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useIsPresent } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiCalendar, FiTrash2 } from "react-icons/fi";

import type { Task } from "@/types";
import { isOverdue } from "@/lib/filters";
import { useUIStore } from "@/store/useUIStore";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

/** Movement (in px) beyond which a press counts as a drag, not a click. */
const DRAG_CLICK_THRESHOLD = 5;

/** Formats a `YYYY-MM-DD` due date for display, e.g. "Oct 24". */
function formatDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Visual props shared by the sortable card and the drag overlay ghost. */
interface KanbanCardBodyProps {
  /** Task to display. */
  task: Task;
  /** Renders drag-specific styling when shown inside the DragOverlay. */
  isOverlay?: boolean;
  /** True while the card itself is being dragged (reduced opacity + tilt). */
  isDragging?: boolean;
  /** Opens the task detail popup for this task. */
  onTaskClick?: (task: Task) => void;
  /** Opens the delete confirmation modal for this task. */
  onTaskDelete?: (task: Task) => void;
}

/**
 * Presentational task card. Exported so the board's DragOverlay can render a
 * ghost without registering a second sortable with the same id.
 */
export function KanbanCardBody({
  task,
  isOverlay = false,
  isDragging = false,
  onTaskClick,
  onTaskDelete,
}: KanbanCardBodyProps) {
  const overdue = isOverdue(task);

  return (
    <article
      onClick={() => onTaskClick?.(task)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onTaskClick?.(task);
        }
      }}
      className={`group rounded-xl border p-4 backdrop-blur-xl transition-colors duration-200 ${
        isOverlay
          ? "cursor-grabbing border-accent-purple/60 bg-glass-hover shadow-2xl shadow-black/40"
          : "cursor-pointer border-white/10 bg-glass hover:border-white/20 hover:bg-glass-hover active:cursor-grabbing"
      } ${isDragging ? "rotate-2 opacity-40 shadow-2xl shadow-black/40" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <PriorityBadge priority={task.priority} />

        {onTaskDelete ? (
          <button
            type="button"
            aria-label={`Delete task "${task.title}"`}
            onClick={(event) => {
              event.stopPropagation();
              onTaskDelete(task);
            }}
            className="rounded-lg p-1 text-white/30 opacity-0 transition hover:bg-white/10 hover:text-red-400 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <FiTrash2 size={14} />
          </button>
        ) : null}
      </div>

      <h3 className="mt-2.5 line-clamp-2 text-sm font-medium leading-snug text-white/90">
        {task.title}
      </h3>

      {task.dueDate ? (
        <footer
          className={`mt-3 flex items-center gap-1.5 text-xs ${
            overdue
              ? "font-semibold text-red-400 animate-overdue-pulse"
              : "text-white/40"
          }`}
        >
          <FiCalendar size={14} className="shrink-0" />
          <time dateTime={task.dueDate}>{formatDueDate(task.dueDate)}</time>
          {overdue ? <span aria-hidden>· Overdue</span> : null}
        </footer>
      ) : null}
    </article>
  );
}

interface KanbanCardProps {
  /** Task displayed by the card. */
  task: Task;
  /**
   * True while any card on the board is being dragged. Layout animations
   * are frozen for every card during a drag: dnd-kit moves the outer
   * wrappers imperatively, and a concurrent framer-motion layout measure
   * would fight those transforms (and, at drag end, could wedge the exit
   * animation of the card that changed columns).
   */
  isDragActive?: boolean;
}

/**
 * Sortable task card (`useSortable`). A plain click opens the Jira-style
 * task detail popup; a press that turned into a drag does not (checked via
 * a small movement threshold). Delegates rendering to `KanbanCardBody`.
 *
 * Animation note: the outer div owns the dnd-kit transform (via `style`),
 * while a separate inner `motion.div` owns the framer-motion transforms
 * (entry / hover / exit / layout). Keeping them on different nodes stops the
 * two systems from fighting over the same `transform`. While this card is
 * being dragged, `layout` and `whileHover` are disabled so framer-motion
 * never interferes with the drag.
 */
export function KanbanCard({ task, isDragActive = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  /** False while this card is exiting — disables layout so the exit can finish. */
  const isPresent = useIsPresent();

  const openTaskDetail = useUIStore((state) => state.openTaskDetail);
  const openDeleteTask = useUIStore((state) => state.openDeleteTask);

  /** Press coordinates, used to tell clicks apart from drag ends. */
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handlePointerDownCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    if (!start) return;
    const moved =
      Math.hypot(event.clientX - start.x, event.clientY - start.y) >
      DRAG_CLICK_THRESHOLD;
    if (moved) {
      // This "click" is the tail of a drag — swallow it.
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDownCapture={handlePointerDownCapture}
      onClickCapture={handleClickCapture}
      className="touch-none"
    >
      <motion.div
        layout={isPresent && !isDragging && !isDragActive}
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, x: -20 }}
        whileHover={
          isDragging
            ? undefined
            : { scale: 1.02, y: -2, transition: { duration: 0.15 } }
        }
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <KanbanCardBody
          task={task}
          isDragging={isDragging}
          onTaskClick={(clicked) => openTaskDetail(clicked.id)}
          onTaskDelete={(deleted) => openDeleteTask(deleted.id)}
        />
      </motion.div>
    </div>
  );
}
