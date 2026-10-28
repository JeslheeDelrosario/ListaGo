"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { useProjectStore } from "@/store/useProjectStore";
import { useUIStore } from "@/store/useUIStore";
import {
  isInboxProject,
  MAX_PROJECT_NAME_LENGTH,
  PROJECT_COLOR_SWATCHES,
} from "@/types";
import {
  PROJECT_ICON_CHOICES,
  ProjectIcon,
  normalizeProjectIconName,
} from "@/components/ui/ProjectIcon";
import {
  MODAL_BUTTON_GHOST_CLASSES,
  MODAL_BUTTON_PRIMARY_CLASSES,
  MODAL_ERROR_CLASSES,
  MODAL_INPUT_CLASSES,
  MODAL_LABEL_CLASSES,
  Modal,
} from "@/components/ui/Modal";

/**
 * Create/edit project modal: name (max 50 chars, required, no duplicates),
 * a visual grid of 12 preset colors and a visual grid of 19 Feather icons.
 * Reads its edit target from `editingProjectId` in the UI store; passing
 * `null` means "create new". The permanent Inbox can be renamed but offers
 * no delete path from here (deletion lives in the sidebar and its own
 * guarded modal).
 */
export function ProjectModal() {
  const isOpen = useUIStore((state) => state.isProjectModalOpen);
  const editingProjectId = useUIStore((state) => state.editingProjectId);
  const closeProjectModal = useUIStore((state) => state.closeProjectModal);

  const projects = useProjectStore((state) => state.projects);
  const editingProject = projects.find((p) => p.id === editingProjectId);

  // Remount per create/edit target: form state resets through a fresh
  // mount (lazy initializers) instead of a reset effect.
  const formKey = editingProjectId ?? "create";

  return (
    <Modal
      open={isOpen}
      onClose={closeProjectModal}
      title={editingProject ? "Edit project" : "New project"}
      footer={
        <>
          <button
            type="button"
            onClick={closeProjectModal}
            className={MODAL_BUTTON_GHOST_CLASSES}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="project-form"
            className={MODAL_BUTTON_PRIMARY_CLASSES}
          >
            Save Project
          </button>
        </>
      }
    >
      {/* Always passed: `Modal` only mounts children while open or exiting,
          so the form remains visible through the close animation. */}
      <ProjectForm
        key={formKey}
        editingProjectId={editingProjectId}
        onClose={closeProjectModal}
      />
    </Modal>
  );
}

interface ProjectFormProps {
  /** Project being edited, or `null` when creating a new one. */
  editingProjectId: string | null;
  /** Closes the modal after a successful submit. */
  onClose: () => void;
}

/** The form body; always mounted inside `Modal` under a target-specific key. */
function ProjectForm({ editingProjectId, onClose }: ProjectFormProps) {
  const projects = useProjectStore((state) => state.projects);
  const addProject = useProjectStore((state) => state.addProject);
  const updateProject = useProjectStore((state) => state.updateProject);

  const nameRef = useRef<HTMLInputElement>(null);
  const [initial] = useState(() => {
    const project = useProjectStore
      .getState()
      .projects.find((p) => p.id === editingProjectId);
    if (project) {
      return {
        name: project.name,
        color: project.color,
        icon: normalizeProjectIconName(project.icon),
        isProtected: isInboxProject(project),
      };
    }
    return {
      name: "",
      color: PROJECT_COLOR_SWATCHES[0],
      icon: "FiFolder" as string,
      isProtected: false,
    };
  });

  const [name, setName] = useState(initial.name);
  const [color, setColor] = useState(initial.color);
  const [icon, setIcon] = useState(initial.icon);
  const [nameError, setNameError] = useState<string | null>(null);

  // Focus the name input when the form mounts (no state updates involved).
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Project name is required.");
      toast.error("Project name is required");
      nameRef.current?.focus();
      return;
    }
    if (trimmed.length > MAX_PROJECT_NAME_LENGTH) {
      setNameError(
        `Project name must be ${MAX_PROJECT_NAME_LENGTH} characters or less.`,
      );
      toast.error(
        `Project name must be ${MAX_PROJECT_NAME_LENGTH} characters or less`,
      );
      return;
    }

    // Duplicate check is also enforced in the store; validate here first
    // so the error can show inline under the field.
    const duplicate = projects.some(
      (project) =>
        project.id !== editingProjectId &&
        project.name.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      setNameError("A project with this name already exists.");
      toast.error("A project with this name already exists");
      nameRef.current?.focus();
      return;
    }

    if (editingProjectId) {
      const updated = updateProject(editingProjectId, {
        name: trimmed,
        color,
        icon,
      });
      if (!updated) {
        setNameError("A project with this name already exists.");
        toast.error("A project with this name already exists");
        return;
      }
      toast.success("Project updated!");
    } else {
      const created = addProject({ name: trimmed, color, icon });
      if (!created) {
        setNameError("A project with this name already exists.");
        toast.error("A project with this name already exists");
        return;
      }
      toast.success("Project created!");
    }

    onClose();
  };

  return (
    <form
      id="project-form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      <div>
        <label htmlFor="project-name" className={MODAL_LABEL_CLASSES}>
          Project Name <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-3">
          <span className="shrink-0">
            <ProjectIcon iconName={icon} color={color} size={22} />
          </span>
          <input
            id="project-name"
            ref={nameRef}
            type="text"
            value={name}
            maxLength={MAX_PROJECT_NAME_LENGTH}
            onChange={(event) => {
              setName(event.target.value);
              if (nameError) setNameError(null);
            }}
            placeholder="Project name"
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "project-name-error" : undefined}
            className={MODAL_INPUT_CLASSES}
          />
        </div>
        <div className="mt-1 flex items-start justify-between gap-3">
          {nameError ? (
            <span id="project-name-error" className={MODAL_ERROR_CLASSES}>
              {nameError}
            </span>
          ) : (
            <span />
          )}
          <span className="text-xs tabular-nums text-white/30">
            {name.length}/{MAX_PROJECT_NAME_LENGTH}
          </span>
        </div>
      </div>

      <fieldset>
        <legend className={MODAL_LABEL_CLASSES}>Color</legend>
        <div className="flex flex-wrap gap-2.5">
          {PROJECT_COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              aria-label={`Color ${swatch}`}
              aria-pressed={color.toLowerCase() === swatch.toLowerCase()}
              className={`size-8 rounded-full border transition ${
                color.toLowerCase() === swatch.toLowerCase()
                  ? "scale-110 border-white/80 ring-2 ring-white/70 ring-offset-2 ring-offset-[#18142e]"
                  : "border-white/20 hover:scale-110"
              }`}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={MODAL_LABEL_CLASSES}>Icon</legend>
        <div className="grid grid-cols-7 gap-2">
          {PROJECT_ICON_CHOICES.map((choice) => {
            const selected = icon === choice.name;
            return (
              <button
                key={choice.name}
                type="button"
                onClick={() => setIcon(choice.name)}
                aria-label={choice.label}
                aria-pressed={selected}
                title={choice.label}
                className={`flex items-center justify-center rounded-xl border p-2.5 transition ${
                  selected
                    ? "border-accent-purple/60 bg-accent-indigo/20 text-white/90"
                    : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
                }`}
              >
                <choice.Icon size={18} color={selected ? color : undefined} />
              </button>
            );
          })}
        </div>
      </fieldset>

      {initial.isProtected ? (
        <p className="text-xs text-white/40">
          Inbox is the default project and cannot be deleted.
        </p>
      ) : null}
    </form>
  );
}
