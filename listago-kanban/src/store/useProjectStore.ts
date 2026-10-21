import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { useTaskStore } from "./useTaskStore";
import { DEFAULT_INBOX_PROJECT, isInboxProject } from "@/types";
import type {
  CreateProjectInput,
  Project,
  ProjectDeletionAction,
  UpdateProjectInput,
} from "@/types";

export { DEFAULT_INBOX_PROJECT };

/**
 * Initial projects so the sidebar is never empty: the permanent Inbox
 * first, then sample projects. Ids are deterministic (not random) so
 * server and client render identical data on first load and task seeds
 * can reference them reliably. Persisted data always wins over seeds.
 */
function createSeedProjects(): Project[] {
  const createdAt = new Date().toISOString();

  return [
    DEFAULT_INBOX_PROJECT,
    {
      id: "work",
      name: "Work",
      color: "#3b82f6",
      icon: "FiBriefcase",
      createdAt,
    },
    {
      id: "personal",
      name: "Personal",
      color: "#22c55e",
      icon: "FiHeart",
      createdAt,
    },
    {
      id: "learning",
      name: "Learning",
      color: "#f97316",
      icon: "FiBook",
      createdAt,
    },
  ];
}

/** Case-insensitive duplicate-name check across existing projects. */
function hasDuplicateName(
  projects: readonly Project[],
  name: string,
  excludeId?: string,
): boolean {
  const needle = name.trim().toLowerCase();
  if (!needle) return false;
  return projects.some(
    (project) =>
      project.id !== excludeId &&
      project.name.trim().toLowerCase() === needle,
  );
}

/** Shape of the project store: project data plus actions and selectors. */
export interface ProjectState {
  /** All projects, including the permanent Inbox. */
  projects: Project[];

  /**
   * Creates a new project with a fresh `crypto.randomUUID()` id.
   * Returns `null` (and creates nothing) when the name is empty or
   * duplicates an existing project name, case-insensitively.
   */
  addProject: (input: CreateProjectInput) => Project | null;

  /**
   * Merges the provided partial updates into the project with the given id.
   * Returns `null` (and changes nothing) when the project does not exist
   * or the new name duplicates another project, case-insensitively.
   */
  updateProject: (id: string, updates: UpdateProjectInput) => Project | null;

  /**
   * Deletes a project, moving its tasks to the Inbox first (the safe
   * default). The Inbox itself cannot be deleted — calls for it are ignored.
   */
  deleteProject: (id: string) => void;

  /**
   * Deletes a project with an explicit strategy for its tasks:
   * - "move-to-inbox": reassign every task to the Inbox project
   * - "delete-tasks": permanently delete every task in the project
   *
   * Returns `true` when the project was deleted, `false` when the target
   * is missing or is the (undeletable) Inbox.
   */
  deleteProjectWithTasks: (
    projectId: string,
    action: ProjectDeletionAction,
  ) => boolean;

  /** Returns a single project by id, or `undefined` if it does not exist. */
  getProjectById: (id: string) => Project | undefined;

  /** Counts the tasks currently assigned to a project (live, from the task store). */
  getProjectTaskCount: (projectId: string) => number;
}

/** Only project data is written to localStorage; actions stay runtime-only. */
interface PersistedProjectState {
  projects: Project[];
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: createSeedProjects(),

      addProject: (input) => {
        const name = input.name.trim();
        if (!name) return null;
        if (hasDuplicateName(get().projects, name)) return null;

        const project: Project = {
          ...input,
          name,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [project, ...state.projects] }));
        return project;
      },

      updateProject: (id, updates) => {
        const existing = get().projects.find((p) => p.id === id);
        if (!existing) return null;

        const name = (updates.name ?? existing.name).trim();
        if (!name) return null;
        if (hasDuplicateName(get().projects, name, id)) return null;

        const project: Project = { ...existing, ...updates, name };
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? project : p)),
        }));
        return project;
      },

      deleteProject: (id) => {
        get().deleteProjectWithTasks(id, "move-to-inbox");
      },

      deleteProjectWithTasks: (projectId, action) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project || isInboxProject(project)) return false;

        const taskStore = useTaskStore.getState();
        if (action === "delete-tasks") {
          const ids = taskStore.tasks
            .filter((task) => task.projectId === projectId)
            .map((task) => task.id);
          if (ids.length > 0) taskStore.deleteBulk(ids);
        } else {
          const inbox =
            get().projects.find(isInboxProject) ?? DEFAULT_INBOX_PROJECT;
          taskStore.reassignTasksToProject(projectId, inbox.id);
        }

        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        }));
        return true;
      },

      getProjectById: (id) =>
        get().projects.find((project) => project.id === id),

      getProjectTaskCount: (projectId) =>
        useTaskStore
          .getState()
          .tasks.filter((task) => task.projectId === projectId).length,
    }),
    {
      name: "listago-projects",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedProjectState => ({ projects: state.projects }),
    },
  ),
);
