import { create } from "zustand";

import type {
  DeleteModalState,
  Status,
  TaskModalState,
} from "@/types";

/**
 * Single source of truth for all ephemeral UI state: search, project
 * filter, sidebar visibility, the five modal states and task selection.
 * Nothing here is persisted — only the task and project stores touch
 * localStorage.
 */
export interface UIState {
  /** Raw search query as typed; debounce before filtering (see the board). */
  searchQuery: string;
  /** Updates the raw search query immediately. */
  setSearchQuery: (query: string) => void;

  /** Currently selected project filter. `null` = All Tasks. */
  selectedProjectId: string | null;
  /** Applies a project filter, or `null` to show all tasks. */
  setSelectedProjectId: (projectId: string | null) => void;

  /** Whether the mobile sidebar drawer is open (ignored on desktop). */
  isSidebarOpen: boolean;
  /** Opens the mobile sidebar drawer. */
  openSidebar: () => void;
  /** Closes the mobile sidebar drawer. */
  closeSidebar: () => void;
  /** Toggles the mobile sidebar drawer. */
  toggleSidebar: () => void;

  /** Status pre-filled when the task modal opens from a column's "+ Add Task". */
  initialStatus: Status | null;

  /** State of the create/edit task modal. */
  taskModal: TaskModalState;
  /**
   * Opens the task modal in create mode, optionally pre-filling the status
   * of the column that opened it.
   */
  openCreateTask: (initialStatus?: Status | null) => void;
  /** Opens the task modal in edit mode for the given task. */
  openEditTask: (taskId: string) => void;
  /** Closes the task modal and clears the pre-filled status. */
  closeTaskModal: () => void;

  /** Task detail popup (Jira-style view): the task being viewed. */
  selectedTaskId: string | null;
  /** Whether the task detail popup is open. */
  isTaskDetailOpen: boolean;
  /** Opens the task detail popup for the given task. */
  openTaskDetail: (taskId: string) => void;
  /** Closes the task detail popup and clears the selected task. */
  closeTaskDetail: () => void;

  /** State of the delete confirmation modal (tasks and bulk selection). */
  deleteModal: DeleteModalState;
  /** Opens the delete modal for a single task. */
  openDeleteTask: (taskId: string) => void;
  /** Opens the delete modal for the currently selected tasks (bulk). */
  openBulkDelete: () => void;
  /** Closes the delete modal. */
  closeDeleteModal: () => void;

  /** Whether the create/edit project modal is open. */
  isProjectModalOpen: boolean;
  /** Project being edited, or `null` when creating a new project. */
  editingProjectId: string | null;
  /** Opens the project modal in edit mode when `projectId` is given, else create mode. */
  openProjectModal: (projectId?: string | null) => void;
  /** Closes the project modal and clears the editing id. */
  closeProjectModal: () => void;

  /** Whether the delete-project modal is open. */
  isDeleteProjectModalOpen: boolean;
  /** Project pending deletion, or `null` when nothing is being deleted. */
  deletingProjectId: string | null;
  /** Opens the delete-project modal for a project (closes the project modal). */
  openDeleteProjectModal: (projectId: string) => void;
  /** Closes the delete-project modal and clears the id. */
  closeDeleteProjectModal: () => void;

  /** Ids of tasks selected for bulk actions. */
  selectedTaskIds: string[];
  /** Replaces the task selection. */
  setSelectedTaskIds: (ids: string[]) => void;
  /** Adds or removes a single task from the selection. */
  toggleTaskSelection: (taskId: string) => void;
  /** Clears the task selection. */
  clearTaskSelection: () => void;

  /** Whether any of the modals is currently open. */
  isAnyModalOpen: () => boolean;
  /** Closes every open modal at once. */
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectedProjectId: null,
  setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),

  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  initialStatus: null,

  taskModal: { open: false, mode: "create", taskId: null },
  openCreateTask: (initialStatus = null) =>
    set({
      taskModal: { open: true, mode: "create", taskId: null },
      initialStatus,
    }),
  openEditTask: (taskId) =>
    set({
      taskModal: { open: true, mode: "edit", taskId },
      initialStatus: null,
    }),
  closeTaskModal: () =>
    set((state) => ({
      taskModal: { ...state.taskModal, open: false },
      initialStatus: null,
    })),

  selectedTaskId: null,
  isTaskDetailOpen: false,
  openTaskDetail: (taskId) =>
    set({ selectedTaskId: taskId, isTaskDetailOpen: true }),
  closeTaskDetail: () =>
    set({ selectedTaskId: null, isTaskDetailOpen: false }),

  deleteModal: { open: false, type: "task", id: null },
  openDeleteTask: (taskId) =>
    set({ deleteModal: { open: true, type: "task", id: taskId } }),
  openBulkDelete: () =>
    set({ deleteModal: { open: true, type: "bulk", id: null } }),
  closeDeleteModal: () =>
    set((state) => ({ deleteModal: { ...state.deleteModal, open: false } })),

  isProjectModalOpen: false,
  editingProjectId: null,
  openProjectModal: (projectId = null) =>
    set({ isProjectModalOpen: true, editingProjectId: projectId }),
  closeProjectModal: () =>
    set({ isProjectModalOpen: false, editingProjectId: null }),

  isDeleteProjectModalOpen: false,
  deletingProjectId: null,
  openDeleteProjectModal: (projectId) =>
    set({
      isDeleteProjectModalOpen: true,
      deletingProjectId: projectId,
      // Never stack the two project modals.
      isProjectModalOpen: false,
      editingProjectId: null,
    }),
  closeDeleteProjectModal: () =>
    set({ isDeleteProjectModalOpen: false, deletingProjectId: null }),

  selectedTaskIds: [],
  setSelectedTaskIds: (ids) => set({ selectedTaskIds: ids }),
  toggleTaskSelection: (taskId) =>
    set((state) => ({
      selectedTaskIds: state.selectedTaskIds.includes(taskId)
        ? state.selectedTaskIds.filter((id) => id !== taskId)
        : [...state.selectedTaskIds, taskId],
    })),
  clearTaskSelection: () => set({ selectedTaskIds: [] }),

  isAnyModalOpen: () => {
    const state = get();
    return (
      state.taskModal.open ||
      state.deleteModal.open ||
      state.isProjectModalOpen ||
      state.isDeleteProjectModalOpen
    );
  },
  closeAllModals: () =>
    set((state) => ({
      taskModal: { ...state.taskModal, open: false },
      deleteModal: { ...state.deleteModal, open: false },
      isProjectModalOpen: false,
      editingProjectId: null,
      isDeleteProjectModalOpen: false,
      deletingProjectId: null,
      initialStatus: null,
    })),
}));
