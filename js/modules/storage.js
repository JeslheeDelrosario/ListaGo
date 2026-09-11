/**
 * storage.js - Persistent localStorage management strictly for user data
 */

const STORAGE_KEY_TASKS = "listago_tasks";
const STORAGE_KEY_PROJECTS = "listago_projects";

/**
 * Default sample projects to seed for first-time visitors
 */
const DEFAULT_PROJECTS = [
  {
    id: "proj-work-sprint",
    name: "Work Sprint",
    color: "#6366f1",
    icon: "fas fa-rocket",
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-design-system",
    name: "Design System",
    color: "#ec4899",
    icon: "fas fa-palette",
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-personal-goals",
    name: "Personal Goals",
    color: "#10b981",
    icon: "fas fa-bullseye",
    createdAt: new Date().toISOString(),
  },
];

export const Storage = {
  /**
   * Loads tasks strictly from user localStorage.
   * Defaults to an empty list without any hardcoded tasks.
   * @returns {Array} Array of task objects
   */
  getTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TASKS);
      if (raw !== null) {
        const tasks = JSON.parse(raw);
        if (Array.isArray(tasks)) {
          // One-time cleanup of any legacy hardcoded sample tasks from earlier sessions
          if (!localStorage.getItem("listago_hardcoded_cleaned_v2")) {
            const sampleIdentifiers = [
              "Review Q3 Security Audit",
              "Design interactive Glassmorphism cards",
              "Prepare presentation deck",
              "Complete 5km morning run",
              "Refactor state management",
              "Weekly grocery shopping",
            ];
            const cleaned = tasks.filter(
              (t) =>
                !sampleIdentifiers.some(
                  (sig) => t.title && t.title.includes(sig),
                ),
            );
            this.saveTasks(cleaned);
            localStorage.setItem("listago_hardcoded_cleaned_v2", "true");
            return cleaned;
          }
          return tasks;
        }
      }
    } catch (e) {
      console.warn("Failed to parse tasks from localStorage:", e);
    }

    // Pure user local storage: default is empty array
    return [];
  },

  /**
   * Saves tasks to localStorage.
   * @param {Array} tasks
   * @returns {boolean} Success status
   */
  saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
      return true;
    } catch (e) {
      console.error("Storage quota exceeded or unavailable:", e);
      return false;
    }
  },

  /**
   * Loads projects from localStorage or seeds defaults.
   * @returns {Array} Array of project objects
   */
  getProjects() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Failed to parse projects from localStorage:", e);
    }

    // Seed default projects if empty
    this.saveProjects(DEFAULT_PROJECTS);
    return DEFAULT_PROJECTS;
  },

  /**
   * Saves projects to localStorage.
   * @param {Array} projects
   * @returns {boolean} Success status
   */
  saveProjects(projects) {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
      return true;
    } catch (e) {
      console.error("Failed to save projects to localStorage:", e);
      return false;
    }
  },
};
