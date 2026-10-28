"use client";

import { toast } from "sonner";

import { useTaskStore } from "@/store/useTaskStore";
import { useUIStore } from "@/store/useUIStore";
import {
  MODAL_BUTTON_DANGER_CLASSES,
  MODAL_BUTTON_GHOST_CLASSES,
  Modal,
} from "@/components/ui/Modal";

/**
 * Delete confirmation for tasks and bulk selections. Project deletion has
 * its own specialized modal (`DeleteProjectModal`) with task-handling
 * options. Always requires an explicit destructive confirm — nothing is
 * deleted by accident through overlay clicks or Escape.
 */
export function DeleteModal() {
  const { open, type, id } = useUIStore((state) => state.deleteModal);
  const closeDeleteModal = useUIStore((state) => state.closeDeleteModal);
  const selectedTaskIds = useUIStore((state) => state.selectedTaskIds);
  const clearTaskSelection = useUIStore((state) => state.clearTaskSelection);

  const tasks = useTaskStore((state) => state.tasks);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const deleteBulk = useTaskStore((state) => state.deleteBulk);

  const task = type === "task" ? tasks.find((t) => t.id === id) : undefined;

  let title: string;
  let message: string;
  if (type === "task") {
    title = "Delete task?";
    message = task
      ? `"${task.title}" will be permanently deleted.`
      : "This task will be permanently deleted.";
  } else {
    title = "Delete tasks?";
    message = `${selectedTaskIds.length} selected task${
      selectedTaskIds.length === 1 ? "" : "s"
    } will be permanently deleted.`;
  }

  const handleConfirm = () => {
    if (type === "task") {
      if (!task) {
        closeDeleteModal();
        return;
      }
      deleteTask(task.id);
      toast.error("Task deleted");
    } else {
      const count = selectedTaskIds.length;
      if (count > 0) {
        deleteBulk(selectedTaskIds);
        clearTaskSelection();
        toast.error(`${count} task${count === 1 ? "" : "s"} deleted`);
      }
    }
    closeDeleteModal();
  };

  return (
    <Modal
      open={open}
      onClose={closeDeleteModal}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={closeDeleteModal}
            className={MODAL_BUTTON_GHOST_CLASSES}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={MODAL_BUTTON_DANGER_CLASSES}
          >
            Delete
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-white/60">{message}</p>
    </Modal>
  );
}
