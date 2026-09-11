/**
 * taskManager.js - Task CRUD, statuses, priorities, filtering, and stats
 */

import { Storage } from "./storage.js";
import {
  generateUUID,
  isOverdue,
  isToday,
  isUpcoming,
  getTodayDateString,
} from "./utils.js";
import { Notifications } from "./notifications.js";

export const MAX_TASK_LENGTH = 5000;

class TaskManager {
  constructor() {
    this.tasks = [];
    this.listeners = [];
  }

  init() {
    this.tasks = Storage.getTasks();
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    Storage.saveTasks(this.tasks);
    this.listeners.forEach((cb) => cb(this.tasks));
  }

  getTasks() {
    return this.tasks;
  }

  getTaskById(id) {
    return this.tasks.find((t) => t.id === id);
  }

  /**
   * Adds a new task with validation and duplicate prevention.
   */
  addTask({
    title,
    description = "",
    projectId = "inbox",
    priority = "medium",
    status = "todo",
    dueDate = null,
  }) {
    const cleanTitle = (title || "").trim();

    if (!cleanTitle) {
      Notifications.error("Task title cannot be empty");
      return null;
    }

    if (cleanTitle.length > MAX_TASK_LENGTH) {
      Notifications.error(
        `Task title cannot exceed ${MAX_TASK_LENGTH} characters`,
      );
      return null;
    }

    // Duplicate check in active tasks (case insensitive)
    const duplicate = this.tasks.find(
      (t) =>
        !t.completed &&
        t.title.toLowerCase() === cleanTitle.toLowerCase() &&
        (t.projectId || "inbox") === (projectId || "inbox"),
    );
    if (duplicate) {
      Notifications.warning(
        "A task with this title already exists in this project",
      );
    }

    const isCompleted = status === "done";

    const newTask = {
      id: generateUUID(),
      title: cleanTitle,
      text: cleanTitle,
      description: description.trim(),
      completed: isCompleted,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || null,
      createdDate: new Date().toDateString(),
      projectId: projectId || "inbox",
      priority: priority || "medium",
      status: status || "todo",
    };

    this.tasks.unshift(newTask);
    this.notify();
    Notifications.success("Task created successfully");
    return newTask;
  }

  /**
   * Updates an existing task.
   */
  updateTask(id, updates) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    if (updates.title) {
      const cleanTitle = updates.title.trim();
      if (!cleanTitle) {
        Notifications.error("Task title cannot be empty");
        return null;
      }
      if (cleanTitle.length > MAX_TASK_LENGTH) {
        Notifications.error(
          `Task title cannot exceed ${MAX_TASK_LENGTH} characters`,
        );
        return null;
      }
      updates.title = cleanTitle;
      updates.text = cleanTitle;
    }

    // Sync status and completed flag
    if (updates.status !== undefined) {
      updates.completed = updates.status === "done";
    } else if (updates.completed !== undefined) {
      updates.status = updates.completed ? "done" : "todo";
    }

    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
    };

    this.notify();
    Notifications.success("Task updated");
    return this.tasks[index];
  }

  /**
   * Toggles task completion with status synchronization.
   */
  toggleComplete(id) {
    const task = this.getTaskById(id);
    if (!task) return;

    const newCompleted = !task.completed;
    const newStatus = newCompleted ? "done" : "todo";

    this.updateTask(id, {
      completed: newCompleted,
      status: newStatus,
    });

    if (newCompleted) {
      Notifications.success("Task marked as completed");
    }
  }

  /**
   * Deletes a single task.
   */
  deleteTask(id) {
    const task = this.getTaskById(id);
    if (!task) return false;

    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.notify();
    Notifications.info("Task deleted");
    return true;
  }

  /**
   * Bulk deletes multiple tasks.
   */
  deleteTasks(ids) {
    if (!ids || !ids.length) return 0;
    const initialCount = this.tasks.length;
    const idSet = new Set(ids);
    this.tasks = this.tasks.filter((t) => !idSet.has(t.id));
    const deletedCount = initialCount - this.tasks.length;
    this.notify();
    Notifications.info(`Deleted ${deletedCount} tasks`);
    return deletedCount;
  }

  /**
   * Clears all completed tasks.
   */
  clearCompleted() {
    const completedCount = this.tasks.filter((t) => t.completed).length;
    if (completedCount === 0) {
      Notifications.info("No completed tasks to clear");
      return 0;
    }
    this.tasks = this.tasks.filter((t) => !t.completed);
    this.notify();
    Notifications.info(`Cleared ${completedCount} completed tasks`);
    return completedCount;
  }

  /**
   * Move tasks from a deleted project into Inbox.
   */
  moveTasksToInbox(projectId) {
    let count = 0;
    this.tasks = this.tasks.map((t) => {
      if (t.projectId === projectId) {
        count++;
        return { ...t, projectId: "inbox" };
      }
      return t;
    });
    this.notify();
    return count;
  }

  /**
   * Delete all tasks associated with a project.
   */
  deleteTasksByProject(projectId) {
    const initialCount = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.projectId !== projectId);
    const count = initialCount - this.tasks.length;
    this.notify();
    return count;
  }

  /**
   * Computes statistics for dashboard and badges.
   */
  getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const overdue = this.tasks.filter(
      (t) => !t.completed && t.dueDate && isOverdue(t.dueDate),
    ).length;
    const today = this.tasks.filter(
      (t) => !t.completed && t.dueDate && isToday(t.dueDate),
    ).length;
    const upcoming = this.tasks.filter(
      (t) => !t.completed && t.dueDate && isUpcoming(t.dueDate),
    ).length;

    return {
      total,
      pending,
      completed,
      overdue,
      today,
      upcoming,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  /**
   * Filter and sort tasks based on view context, filters, search, and sort criteria.
   */
  filterTasks({
    view = "all",
    projectId = null,
    status = "all",
    priority = "all",
    search = "",
    sortBy = "dueDate",
  } = {}) {
    let result = [...this.tasks];

    // Filter by view
    if (view === "today") {
      result = result.filter((t) => t.dueDate && isToday(t.dueDate));
    } else if (view === "upcoming") {
      result = result.filter((t) => t.dueDate && isUpcoming(t.dueDate));
    } else if (view === "overdue") {
      result = result.filter(
        (t) => !t.completed && t.dueDate && isOverdue(t.dueDate),
      );
    } else if (view === "completed") {
      result = result.filter((t) => t.completed);
    } else if (view === "project" && projectId) {
      result = result.filter((t) => (t.projectId || "inbox") === projectId);
    }

    // Filter by status tab
    if (status && status !== "all") {
      if (status === "active") {
        result = result.filter((t) => !t.completed);
      } else if (status === "completed") {
        result = result.filter((t) => t.completed);
      } else {
        result = result.filter((t) => t.status === status);
      }
    }

    // Filter by priority
    if (priority && priority !== "all") {
      result = result.filter((t) => t.priority === priority);
    }

    // Filter by search query (title and description)
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const descMatch = (t.description || "").toLowerCase().includes(q);
        return titleMatch || descMatch;
      });
    }

    // Sorting
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };

    result.sort((a, b) => {
      // Completed tasks sink to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      } else if (sortBy === "priority") {
        return (
          (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        );
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "created") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    return result;
  }
}

export const Tasks = new TaskManager();
