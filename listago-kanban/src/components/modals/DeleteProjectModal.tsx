"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiAlertTriangle, FiInbox, FiTrash2 } from "react-icons/fi";

import { useProjectStore } from "@/store/useProjectStore";
import { useUIStore } from "@/store/useUIStore";
import { isInboxProject } from "@/types";
import type { Project, ProjectDeletionAction } from "@/types";
import { ProjectIcon } from "@/components/ui/ProjectIcon";
import {
  MODAL_BUTTON_DANGER_CLASSES,
  MODAL_BUTTON_GHOST_CLASSES,
  Modal,
} from "@/components/ui/Modal";

/**
 * Project-specific delete confirmation. Shows the project (icon, color,
 * name) and its task count, then asks what should happen to those tasks:
 * the safe default is moving them to the Inbox; deleting them is an
 * explicit, red-flagged choice. The permanent Inbox is guarded here as
 * well as in the store.
 *
 * The dialog is remounted per target project (key), so the radio choice
 * always starts on the safe option without any reset effect.
 */
export function DeleteProjectModal() {
  const isOpen = useUIStore((state) => state.isDeleteProjectModalOpen);
  const deletingProjectId = useUIStore((state) => state.deletingProjectId);
  const projects = useProjectStore((state) => state.projects);

  const project = projects.find((p) => p.id === deletingProjectId) ?? null;

  // Render whenever a target project exists — even while closing, so the
  // exit animation can play (`Modal` hides its content once `open` is false).
  // Never render for a missing project or the Inbox.
  if (!project || isInboxProject(project)) return null;

  return <DeleteProjectDialog key={project.id} project={project} open={isOpen} />;
}

/** The dialog body; remounted per project via the key above. */
function DeleteProjectDialog({
  project,
  open,
}: {
  project: Project;
  open: boolean;
}) {
  const closeDeleteProjectModal = useUIStore(
    (state) => state.closeDeleteProjectModal,
  );
  const selectedProjectId = useUIStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useUIStore(
    (state) => state.setSelectedProjectId,
  );
  const deleteProjectWithTasks = useProjectStore(
    (state) => state.deleteProjectWithTasks,
  );
  const getProjectTaskCount = useProjectStore(
    (state) => state.getProjectTaskCount,
  );

  const [action, setAction] = useState<ProjectDeletionAction>("move-to-inbox");
  const taskCount = getProjectTaskCount(project.id);

  const handleConfirm = () => {
    const deleted = deleteProjectWithTasks(project.id, action);
    if (!deleted) {
      toast.error("The Inbox cannot be deleted");
      closeDeleteProjectModal();
      return;
    }
    if (selectedProjectId === project.id) setSelectedProjectId(null);
    if (action === "delete-tasks") {
      toast.error("Project deleted");
    } else {
      toast.success("Tasks moved to Inbox");
    }
    closeDeleteProjectModal();
  };

  return (
    <Modal
      open={open}
      onClose={closeDeleteProjectModal}
      title="Delete project?"
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={closeDeleteProjectModal}
            className={MODAL_BUTTON_GHOST_CLASSES}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={MODAL_BUTTON_DANGER_CLASSES}
          >
            Delete Project
          </button>
        </>
      }
    >
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <span className="rounded-lg bg-white/5 p-1.5">
          <ProjectIcon iconName={project.icon} color={project.color} size={20} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white/90">
            {project.name}
          </div>
          <div className="text-xs text-white/40">
            This project has {taskCount} task{taskCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <fieldset className="mt-4 flex flex-col gap-2">
        <legend className="sr-only">What should happen to its tasks?</legend>

        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
            action === "move-to-inbox"
              ? "border-accent-indigo/60 bg-accent-indigo/10"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          <input
            type="radio"
            name="project-delete-action"
            value="move-to-inbox"
            checked={action === "move-to-inbox"}
            onChange={() => setAction("move-to-inbox")}
            className="mt-0.5 accent-indigo-500"
          />
          <span className="flex items-start gap-2">
            <FiInbox className="mt-0.5 shrink-0 text-indigo-300" size={14} />
            <span>
              <span className="block text-sm font-medium text-white/90">
                Move tasks to Inbox
              </span>
              <span className="block text-xs text-white/40">
                Keeps every task, re-assigned to the default project.
              </span>
            </span>
          </span>
        </label>

        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
            action === "delete-tasks"
              ? "border-red-500/60 bg-red-500/10"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          <input
            type="radio"
            name="project-delete-action"
            value="delete-tasks"
            checked={action === "delete-tasks"}
            onChange={() => setAction("delete-tasks")}
            className="mt-0.5 accent-red-500"
          />
          <span className="flex items-start gap-2">
            <FiAlertTriangle className="mt-0.5 shrink-0 text-red-400" size={14} />
            <span>
              <span className="block text-sm font-medium text-white/90">
                Delete all tasks in this project
              </span>
              <span className="block text-xs font-medium text-red-400">
                Warning: removes {taskCount} task
                {taskCount === 1 ? "" : "s"} permanently. This cannot be undone.
              </span>
            </span>
          </span>
        </label>
      </fieldset>

      {action === "delete-tasks" ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <FiTrash2 size={14} className="shrink-0" />
          You are about to permanently delete {taskCount} task
          {taskCount === 1 ? "" : "s"}.
        </div>
      ) : null}
    </Modal>
  );
}
