// uiRenderer.js - Handle all UI rendering with date support
import { getTasks, getFilteredTasks, getCurrentFilter, toggleTaskSelection, getSelectedTaskIds, clearSelectedTasks } from './taskManager.js';
import { escapeHtml } from './utils.js';
import { getProjectById } from './projectManager.js';

// Helper function to format date nicely
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

// Helper function to get date status and styling
function getDateStatus(dueDate, isCompleted) {
    if (!dueDate || isCompleted) return { class: '', text: '', icon: '📅' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);
    
    // Overdue
    if (dueDateObj < today) {
        return { 
            class: 'overdue', 
            text: ' (Overdue!)', 
            icon: '⚠️' 
        };
    }
    // Due today
    else if (dueDateObj.getTime() === today.getTime()) {
        return { 
            class: 'today', 
            text: ' (Today)', 
            icon: '🔔' 
        };
    }
    // Due tomorrow
    else if (dueDateObj.getTime() === today.getTime() + (24 * 60 * 60 * 1000)) {
        return { 
            class: 'tomorrow', 
            text: ' (Tomorrow)', 
            icon: '⏰' 
        };
    }
    // Due this week
    else if (dueDateObj < new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000))) {
        const daysDiff = Math.ceil((dueDateObj - today) / (1000 * 60 * 60 * 24));
        return { 
            class: 'upcoming', 
            text: ` (In ${daysDiff} day${daysDiff !== 1 ? 's' : ''})`, 
            icon: '📅' 
        };
    }
    
    return { class: 'future', text: '', icon: '📅' };
}

export function renderTasks(customTasks = null) {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;
    
    const tasks = customTasks || getTasks();
    const filteredTasks = customTasks || getFilteredTasks();
    const currentFilter = getCurrentFilter();
    const selectedIds = getSelectedTaskIds();
    
    // Show bulk delete toolbar if tasks are selected
    updateBulkDeleteToolbar(selectedIds);
    
    if (filteredTasks.length === 0) {
        let emptyMessage = '';
        if (currentFilter === 'active') {
            emptyMessage = 'No active tasks! 🎉';
        } else if (currentFilter === 'completed') {
            emptyMessage = 'No completed tasks yet. Complete some tasks! ✅';
        } else {
            emptyMessage = 'No tasks yet. Add your first task above! 📝';
        }
        
        taskList.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 48px;">📭</div>
                <p>${emptyMessage}</p>
            </div>
        `;
    } else {
        taskList.innerHTML = filteredTasks.map(task => {
            // Generate project label HTML if task belongs to a project
            let projectHTML = '';
            if (task.projectId && task.projectId !== 'inbox') {
                const project = getProjectById(task.projectId);
                if (project) {
                    projectHTML = `
                        <span class="task-project-label" style="background-color: ${project.color}20; color: ${project.color}; border: 1px solid ${project.color}40;">
                            <i class="${project.icon}" style="font-size: 0.7rem; margin-right: 4px;"></i>
                            ${escapeHtml(project.name)}
                        </span>
                    `;
                }
            }
            
            // Generate date HTML if task has due date
            let dateHTML = '';
            if (task.dueDate) {
                const status = getDateStatus(task.dueDate, task.completed);
                const formattedDate = formatDate(task.dueDate);
                dateHTML = `
                    <div class="task-date ${status.class}">
                        ${status.icon} ${formattedDate}${status.text}
                    </div>
                `;
            } else {
                dateHTML = `
                    <div class="task-date no-date">
                        📅 No due date
                    </div>
                `;
            }
            
            const isSelected = selectedIds.includes(task.id);
            return `
                <li class="task-item ${isSelected ? 'selected' : ''}" data-task-id="${task.id}" onclick="window.handleTaskClick(event, '${task.id}')">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''} 
                        onclick="event.stopPropagation(); window.toggleTaskHandler('${task.id}')"
                    >
                    <div class="task-content">
                        <div class="task-header">
                            <span class="task-text ${task.completed ? 'completed' : ''}" ondblclick="window.editTaskHandler('${task.id}')">
                                ${escapeHtml(task.text)}
                            </span>
                            ${projectHTML}
                        </div>
                        ${dateHTML}
                    </div>
                    <div class="task-actions">
                        <button class="edit-btn" onclick="window.editTaskHandler('${task.id}')" title="Edit task">✏️</button>
                        <button class="delete-btn" onclick="window.deleteTaskHandler('${task.id}', '${escapeHtml(task.text)}')" title="Delete task">🗑️</button>
                    </div>
                </li>
            `;
        }).join('');
    }
    
    updateStats();
}



// Make bulk selection functions globally available
window.handleTaskClick = (event, taskId) => {
    // Don't select if clicking on buttons or links
    if (event.target.closest('button') || event.target.tagName === 'INPUT') return;
    
    // Toggle selection
    toggleTaskSelection(taskId);
    renderTasks();
};

window.cancelBulkSelection = () => {
    clearSelectedTasks();
    renderTasks();
};

window.confirmBulkDelete = () => {
    const selectedIds = getSelectedTaskIds();
    if (selectedIds.length === 0) return;
    
    // Show custom bulk delete modal
    window.showBulkDeleteConfirmation(selectedIds, selectedIds.length, (ids) => {
        import('./taskManager.js').then(module => {
            module.deleteMultipleTasks(ids);
            clearSelectedTasks();
        });
    });
}

export function updateBulkDeleteToolbar(selectedIds) {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;
    
    // Save original header content if not already saved
    if (!window.originalHeaderContent) {
        window.originalHeaderContent = headerActions.innerHTML;
    }
    
    if (selectedIds.length > 0) {
        // Show bulk delete controls in header
        headerActions.innerHTML = `
            <span class="selected-count" id="selectedCount">${selectedIds.length} selected</span>
            <button class="cancel-bulk-btn" onclick="window.cancelBulkSelection()">Cancel</button>
            <button class="delete-selected-btn" onclick="window.confirmBulkDelete()">Delete Selected</button>
        `;
    } else {
        // Restore original header content
        headerActions.innerHTML = window.originalHeaderContent;
    }
}

export function updateStats() {
    const tasks = getTasks();
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;
    const overdue = tasks.filter(task => task.dueDate && !task.completed && new Date(task.dueDate) < new Date()).length;
    
    const taskCountEl = document.getElementById('taskCount');
    const completedCountEl = document.getElementById('completedCount');
    
    if (taskCountEl) {
        let taskText = `${total} task${total !== 1 ? 's' : ''}`;
        if (overdue > 0) {
            taskText += ` (${overdue} overdue)`;
        }
        taskCountEl.textContent = taskText;
    }
    if (completedCountEl) completedCountEl.textContent = `${completed} completed, ${active} active`;
}

export function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            window.setFilterHandler(filter);
        });
    });
}