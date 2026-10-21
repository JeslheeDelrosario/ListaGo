import { PRIORITY_BADGE_CLASSES, type Priority } from "@/types";

interface PriorityBadgeProps {
  /** Priority to display. */
  priority: Priority;
  /** Optional extra classes (e.g. larger text in the modal preview). */
  className?: string;
}

/**
 * Color-coded priority pill. Shared by the Kanban cards and the task
 * modal's live priority preview.
 */
export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
        PRIORITY_BADGE_CLASSES[priority]
      } ${className}`}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}
