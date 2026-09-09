// taskManager.js - Handle task CRUD operations with due dates
import { getTasks as getTasksFromStorage, setTasks as setTasksInStorage, saveTasks } from './storage.js';
import { showNotification } from './notifications.js';
import { getProjectById } from './projectManager.js';

const MAX_TASK_LENGTH = 200;
let debounceTimer = null;
let currentFilter = 'all';
let renderCallback = null;

// Re-export getTasks and setTasks for other modules
export function getTasks() {
    return getTasksFromStorage();
}

export function setTasks(newTasks) {
    setTasksInStorage(newTasks);
}

export function setRenderCallback(callback) {
    renderCallback = callback;
}

export function getCurrentFilter() {
    return currentFilter;
}

export function setCurrentFilter(filter) {
    currentFilter = filter;
    if (renderCallback) renderCallback();
}

export function getFilteredTasks() {
    const tasks = getTasks();
    console.log('🔍 getFilteredTasks - all tasks:', tasks);
    
    let filtered;
    switch(currentFilter) {
        case 'active':
            filtered = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filtered = tasks.filter(task => task.completed);
            break;
        default:
            filtered = tasks;
    }
    
    console.log('🔍 getFilteredTasks - filtered:', filtered);
    return filtered;
}

// NEW: Enhanced addTask with full task properties (Jira-style)
export function addTask(taskData) {
  if (debounceTimer) return false;

  // Validation
  if (!taskData.title || taskData.title.trim() === "") {
    showNotification("Please enter a task title!", "error");
    return false;
  }

  if (taskData.title.length > MAX_TASK_LENGTH) {
    showNotification(
      `Task title must be ${MAX_TASK_LENGTH} characters or less`,
      "error",
    );
    return false;
  }

  const tasks = getTasks();
  if (
    tasks.some(
      (task) =>
        task.title && task.title.toLowerCase() === taskData.title.toLowerCase(),
    )
  ) {
    showNotification("This task already exists!", "error");
    return false;
  }

  // Backward compatibility: handle old task format if needed
  if (typeof taskData === "string") {
    const legacyTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title: taskData.trim(),
      text: taskData.trim(),
      description: "", // ← ADD THIS
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: null,
      createdDate: new Date().toDateString(),
      projectId: null,
      priority: "medium",
      status: "todo",
    };
    tasks.push(legacyTask);
    setTasks(tasks);
    return true;
  }

  // Create enhanced task with all properties
  const task = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    title: taskData.title.trim(),
    text: taskData.title.trim(),
    description: taskData.description || "", // ← MAKE SURE THIS IS HERE
    completed: taskData.status === "done",
    createdAt: new Date().toISOString(),
    dueDate: taskData.dueDate || null,
    createdDate: new Date().toDateString(),
    projectId: taskData.projectId || null,
    priority: taskData.priority || "medium",
    status: taskData.status || "todo",
  };

  console.log("Saving task with description:", task); // ← ADD THIS FOR DEBUGGING

  tasks.push(task);
  setTasks(tasks);

  if (renderCallback) renderCallback();

  // ... rest of notification code

  return true;
}

// NEW: Enhanced editTask that supports full task updates
export function editTask(taskId, updates) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id == taskId);
    
    if (taskIndex === -1) return false;
    
    // If updates is just a string (legacy support), convert to object
    if (typeof updates === 'string') {
        tasks[taskIndex].text = updates.trim();
        tasks[taskIndex].title = updates.trim();
    } else {
        // Merge updates into existing task
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updates,
            // Keep text in sync with title for backward compatibility
            text: updates.title ? updates.title.trim() : tasks[taskIndex].title,
            // Sync completed status with status field
            completed: updates.status ? updates.status === 'done' : tasks[taskIndex].completed
        };
    }
    
    setTasks(tasks);
    if (renderCallback) renderCallback();
    return true;
}

// Legacy: Keep the old updateTaskDueDate function signature for backward compatibility
export function updateTaskDueDate(id, newDueDate) {
    const tasks = getTasks();
    const task = tasks.find(task => task.id === id);
    
    if (task) {
        task.dueDate = newDueDate || null;
        setTasks(tasks);
        
        if (renderCallback) renderCallback();
        
        if (newDueDate) {
            const formattedDate = new Date(newDueDate).toLocaleDateString();
            showNotification(`Due date updated to ${formattedDate}`, 'success');
        } else {
            showNotification('Due date removed', 'info');
        }
        return true;
    }
    return false;
}

// NEW: Get tasks sorted by due date
export function getTasksSortedByDueDate() {
    const tasks = getTasks();
    return [...tasks].sort((a, b) => {
        // Tasks without due date go to bottom
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
}

// NEW: Get tasks sorted by creation date
export function getTasksSortedByCreated() {
    const tasks = getTasks();
    return [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// NEW: Get overdue tasks
export function getOverdueTasks() {
    const tasks = getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    });
}

// NEW: Get tasks due today
export function getTasksDueToday() {
    const tasks = getTasks();
    const today = new Date().toISOString().split('T')[0];
    
    return tasks.filter(task => task.dueDate === today && !task.completed);
}

// UPDATED: Delete task
export function deleteTask(id) {
    const tasks = getTasks();
    const taskToDelete = tasks.find(task => task.id === id);
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    
    if (renderCallback) renderCallback();
    
    if (taskToDelete && taskToDelete.dueDate) {
        showNotification(`Task "${taskToDelete.text}" deleted!`, 'success');
    } else {
        showNotification('Task deleted successfully!', 'success');
    }
}

// UPDATED: Toggle task completion
export function toggleTask(id) {
    const tasks = getTasks();
    const task = tasks.find(task => task.id === id);
    
    if (task) {
        task.completed = !task.completed;
        setTasks(tasks);
        
        if (renderCallback) renderCallback();
        const status = task.completed ? 'completed ✅' : 'uncompleted 🔄';
        
        // Add special message for overdue tasks being completed
        if (task.completed && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            
            if (dueDate < today) {
                showNotification(`Great job completing an overdue task! 🎉`, 'success');
                return;
            }
        }
        
        showNotification(`Task marked as ${status}`, 'success');
    }
}



// UPDATED: Delete all completed tasks
export function deleteAllCompletedTasks() {
    const tasks = getTasks();
    const completedCount = tasks.filter(task => task.completed).length;
    
    if (completedCount === 0) {
        showNotification('No completed tasks to delete!', 'info');
        return false;
    }
    
    const updatedTasks = tasks.filter(task => !task.completed);
    setTasks(updatedTasks);
    
    if (renderCallback) renderCallback();
    showNotification(`Deleted ${completedCount} completed tasks!`, 'success');
    return true;
}

// NEW: Delete multiple selected tasks
export function deleteMultipleTasks(taskIds) {
    const tasks = getTasks();
    const deleteCount = taskIds.length;
    
    if (deleteCount === 0) {
        showNotification('No tasks selected!', 'info');
        return false;
    }
    
    const updatedTasks = tasks.filter(task => !taskIds.includes(task.id));
    setTasks(updatedTasks);
    
    if (renderCallback) renderCallback();
    showNotification(`Deleted ${deleteCount} task${deleteCount > 1 ? 's' : ''}!`, 'success');
    return true;
}

// Track selected tasks for bulk operations
let selectedTaskIds = [];

export function toggleTaskSelection(taskId) {
    const index = selectedTaskIds.indexOf(taskId);
    if (index > -1) {
        selectedTaskIds.splice(index, 1);
    } else {
        selectedTaskIds.push(taskId);
    }
    
    // Update bulk delete toolbar to show/hide delete button
    import('./uiRenderer.js').then(module => {
        module.updateBulkDeleteToolbar([...selectedTaskIds]);
    });
    
    return selectedTaskIds;
}

export function getSelectedTaskIds() {
    return [...selectedTaskIds];
}

export function clearSelectedTasks() {
    selectedTaskIds = [];
    
    // Update bulk delete toolbar to hide delete button
    import('./uiRenderer.js').then(module => {
        module.updateBulkDeleteToolbar([]);
    });
}

// NEW: Get task statistics with dates
export function getTaskStatistics() {
    const tasks = getTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const overdue = getOverdueTasks().length;
    const dueToday = getTasksDueToday().length;
    const withDueDates = tasks.filter(t => t.dueDate).length;
    
    return {
        total,
        completed,
        active,
        overdue,
        dueToday,
        withDueDates,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
    };
}