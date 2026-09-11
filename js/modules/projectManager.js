/**
 * projectManager.js - Project CRUD, color palette, and icons
 */

import { Storage } from "./storage.js";
import { generateUUID } from "./utils.js";
import { Notifications } from "./notifications.js";

export const DEFAULT_INBOX_PROJECT = {
  id: "inbox",
  name: "Inbox",
  color: "#6366f1",
  icon: "fas fa-inbox",
  isDefault: true,
};

export const AVAILABLE_PROJECT_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#84cc16", // Lime
];

export const AVAILABLE_PROJECT_ICONS = [
  "fas fa-folder",
  "fas fa-rocket",
  "fas fa-briefcase",
  "fas fa-code",
  "fas fa-palette",
  "fas fa-bullseye",
  "fas fa-star",
  "fas fa-heart",
  "fas fa-bookmark",
  "fas fa-graduation-cap",
  "fas fa-layer-group",
  "fas fa-lightbulb",
];

class ProjectManager {
  constructor() {
    this.projects = [];
    this.listeners = [];
  }

  init() {
    this.projects = Storage.getProjects();
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    Storage.saveProjects(this.projects);
    this.listeners.forEach((cb) => cb(this.getProjects()));
  }

  getProjects() {
    return this.projects;
  }

  getProjectById(id) {
    if (!id || id === "inbox") {
      return DEFAULT_INBOX_PROJECT;
    }
    return this.projects.find((p) => p.id === id) || DEFAULT_INBOX_PROJECT;
  }

  addProject({ name, color, icon }) {
    const trimmed = (name || "").trim();
    if (!trimmed) {
      Notifications.error("Project name cannot be empty");
      return null;
    }

    if (trimmed.length > 50) {
      Notifications.error("Project name cannot exceed 50 characters");
      return null;
    }

    // Check duplicate
    const exists =
      this.projects.some(
        (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
      ) || trimmed.toLowerCase() === "inbox";
    if (exists) {
      Notifications.error(`Project "${trimmed}" already exists`);
      return null;
    }

    const newProject = {
      id: generateUUID(),
      name: trimmed,
      color: color || AVAILABLE_PROJECT_COLORS[0],
      icon: icon || AVAILABLE_PROJECT_ICONS[0],
      createdAt: new Date().toISOString(),
    };

    this.projects.push(newProject);
    this.notify();
    Notifications.success(`Project "${newProject.name}" created`);
    return newProject;
  }

  deleteProject(id) {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return false;

    this.projects = this.projects.filter((p) => p.id !== id);
    this.notify();
    Notifications.info(`Project "${project.name}" deleted`);
    return true;
  }
}

export const Projects = new ProjectManager();
