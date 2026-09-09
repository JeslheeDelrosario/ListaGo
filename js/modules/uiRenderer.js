    // uiRenderer.js - Handle all UI rendering with date support
    import { getFilteredTasks, getCurrentFilter, toggleTaskSelection, getSelectedTaskIds, clearSelectedTasks } from './taskManager.js';
    import { escapeHtml } from './utils.js';
    import { getProjectById } from './projectManager.js';

    // Helper function to get tasks from localStorage
    function getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    // Strip HTML tags to display plain text description preview
    function stripHtml(html) {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

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
        
        // Apply view class
        taskList.classList.add(`task-${currentView}-view`);
    
    // Get all tasks directly
    const allTasks = getTasks();
    
    // If customTasks is provided, use it; otherwise use all tasks
    const tasks = customTasks || allTasks;
    
    // Apply filtering
    const currentFilter = getCurrentFilter();
    let filteredTasks = tasks;
    if (!customTasks) {
        switch(currentFilter) {
            case 'active':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            default:
                filteredTasks = tasks;
        }
    }
    
    // 🔍 DEBUG: Log what we're rendering
    console.log('📋 All tasks:', allTasks);
    console.log('📋 Filtered tasks:', filteredTasks);
    filteredTasks.forEach((task, index) => {
        console.log(`  ${index + 1}. "${task.title || task.text}" - Description:`, {
            exists: !!task.description,
            value: task.description?.substring(0, 50),
            length: task.description?.length || 0
        });
    });
    
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
                
                // Generate priority and status badges
                const priorityConfig = {
                    low: { label: 'Low', class: 'priority-low', color: '#22c55e' },
                    medium: { label: 'Medium', class: 'priority-medium', color: '#eab308' },
                    high: { label: 'High', class: 'priority-high', color: '#f97316' },
                    urgent: { label: 'Urgent', class: 'priority-urgent', color: '#ef4444' }
                };
                
                const statusConfig = {
                    todo: { label: 'To Do', class: 'status-todo', color: '#6b7280' },
                    inprogress: { label: 'In Progress', class: 'status-inprogress', color: '#3b82f6' },
                    review: { label: 'Review', class: 'status-review', color: '#8b5cf6' },
                    done: { label: 'Done', class: 'status-done', color: '#22c55e' }
                };
                
                const priority = task.priority || 'medium';
                const status = task.status || 'todo';
                const priorityData = priorityConfig[priority];
                const statusData = statusConfig[status];
                
                const priorityBadge = `
                    <span class="task-badge ${priorityData.class}" style="background-color: ${priorityData.color}20; color: ${priorityData.color}; border: 1px solid ${priorityData.color}40;">
                        ${priorityData.label}
                    </span>
                `;
                
                const statusBadge = `
                    <span class="task-badge ${statusData.class}" style="background-color: ${statusData.color}20; color: ${statusData.color}; border: 1px solid ${statusData.color}40;">
                        ${statusData.label}
                    </span>
                `;
                
                const isSelected = selectedIds.includes(task.id);
                const taskTitle = task.title || task.text || 'Untitled';
                const taskDescription = task.description || '';

                // DEBUG: Log to see if description is being passed
                console.log('🔍 Rendering task:', taskTitle, 'Description exists?', !!taskDescription);

                return `
                    <li class="task-item ${isSelected ? "selected" : ""}" 
                        data-task-id="${task.id}" 
                        onclick="window.handleTaskClick(event, '${task.id}')"
                        ondblclick="window.showTaskDetail('${task.id}')">
                        <input 
                            type="checkbox" 
                            class="task-checkbox" 
                            ${task.completed ? "checked" : ""} 
                            onclick="event.stopPropagation(); window.toggleTaskHandler('${task.id}')"
                        >
                        <div class="task-content" onclick="event.stopPropagation(); window.showTaskDetail('${task.id}')">
                            <div class="task-header">
                                <span class="task-text ${task.completed ? "completed" : ""}">
                                    ${escapeHtml(taskTitle)}
                                </span>
                                <div class="task-badges">
                                    ${projectHTML}
                                    ${priorityBadge}
                                    ${statusBadge}
                                </div>
                            </div>
                            ${dateHTML}
                            ${taskDescription ? `
                                <div class="task-full-description">
                                    ${taskDescription.length > 300 ? 
                                        taskDescription.substring(0, 300) + '... <span class="view-full-link" onclick="window.viewTaskDescription(\'' + task.id + "', '" + escapeHtml(taskTitle) + "')\">View full description</span>" : 
                                        taskDescription
                                    }
                                </div>
                            ` : `
                                <div class="task-no-description" style="color: #64748b; font-size: 0.8rem; margin-top: 4px; opacity: 0.5;">
                                    No description
                                </div>
                            `}
                        </div>
                        <div class="task-actions" onclick="event.stopPropagation();">
                            <button class="edit-btn" onclick="window.editTaskHandler('${task.id}')" title="Edit task">✏️</button>
                            <button class="delete-btn" onclick="window.deleteTaskHandler('${task.id}', '${escapeHtml(taskTitle)}')" title="Delete task">🗑️</button>
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

    // Function to view full task description in a modal
    window.viewTaskDescription = (taskId, taskTitle) => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(t => t.id === taskId);
        
        if (!task || !task.description) {
            import('./notifications.js').then(module => {
                module.showNotification('No description available', 'warning');
            });
            return;
        }

        // Create and show description modal
        const descriptionModal = document.createElement('div');
        descriptionModal.className = 'modal description-modal';
        descriptionModal.innerHTML = `
            <div class="modal-content description-modal-content">
                <div class="modal-header">
                    <i class="fa-solid fa-file-lines modal-icon" style="color: var(--color-info);"></i>
                    <h3>Task Description</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <h4 style="margin: 0 0 16px 0; color: #fff; font-size: 1.1rem;">${taskTitle}</h4>
                    <div class="description-content" style="background: var(--glass-bg-base); padding: 16px; border-radius: var(--radius-lg); color: #e2e8f0; line-height: 1.6;">
                        ${task.description}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(descriptionModal);
        descriptionModal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Close when clicking outside
        descriptionModal.addEventListener('click', (e) => {
            if (e.target === descriptionModal) {
                descriptionModal.remove();
                document.body.classList.remove('modal-open');
            }
        });
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

    // ========== VIEW MANAGEMENT ==========
    let currentView = 'list';

    export function setupViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        const taskList = document.getElementById('taskList');
        
        if (!viewBtns.length || !taskList) return;
        
        // Load saved view preference from localStorage
        const savedView = localStorage.getItem('preferredView') || 'list';
        currentView = savedView;
        applyView(taskList);
        
        // Set initial active button state
        viewBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === savedView) {
                btn.classList.add('active');
            }
        });
        
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update view
                currentView = btn.dataset.view;
                applyView(taskList);
                
                // Re-render tasks with new view
                renderTasks();
                
                // Save preference to localStorage
                localStorage.setItem('preferredView', currentView);
            });
        });
    }

    function applyView(taskList) {
        if (!taskList) return;
        
        // Remove all view classes
        taskList.classList.remove('task-list-view', 'task-grid-view', 'task-compact-view');
        
        // Add the selected view class
        taskList.classList.add(`task-${currentView}-view`);
    }

    // ========== TASK DETAIL MODAL ==========
    export function showTaskDetail(taskId) {
        const tasks = getTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) return;
        
        const taskTitle = task.title || task.text || 'Untitled';
        const taskDescription = task.description || '';
        const priorityLabels = {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            urgent: 'Urgent'
        };
        const statusLabels = {
            todo: 'To Do',
            inprogress: 'In Progress',
            review: 'Review',
            done: 'Done'
        };
        
        const priority = task.priority || 'medium';
        const status = task.status || 'todo';
        
        // Get priority and status colors from existing code
        const priorityColors = {
            low: '#22c55e',
            medium: '#eab308', 
            high: '#f97316',
            urgent: '#ef4444'
        };
        
        const statusColors = {
            todo: '#64748b',
            inprogress: '#3b82f6',
            review: '#a855f7',
            done: '#22c55e'
        };
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal task-detail-modal';
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modal.style.zIndex = '10000';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.backdropFilter = 'blur(4px)';
        
        modal.innerHTML = `
            <div class="modal-content task-detail-modal-content" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); padding: 0;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-tasks" style="color: var(--color-primary);"></i>
                        <h3 style="color: #fff; margin: 0; font-size: 1rem;">Task Details</h3>
                    </div>
                    <button class="modal-close" onclick="this.closest('.modal').remove()" style="background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <div class="modal-body" style="padding: 24px;">
                    <div class="task-detail-content">
                        <h2 class="task-detail-title" style="font-size: 1.3rem; font-weight: 600; color: #fff; margin: 0 0 12px 0;">${escapeHtml(taskTitle)}</h2>
                        
                        <div class="task-detail-meta" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
                            <span style="padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; background: ${priorityColors[priority]}20; color: ${priorityColors[priority]}; border: 1px solid ${priorityColors[priority]}40;">
                                ${priorityLabels[priority]}
                            </span>
                            <span style="padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; background: ${statusColors[status]}20; color: ${statusColors[status]}; border: 1px solid ${statusColors[status]}40;">
                                ${statusLabels[status]}
                            </span>
                            ${task.dueDate ? `
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.25);">
                                    📅 ${formatDate(task.dueDate)}
                                </span>
                            ` : ''}
                            ${task.projectId ? `
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; background: rgba(99,102,241,0.1); color: #94a3b8; border: 1px solid rgba(255,255,255,0.05);">
                                    📁 ${getProjectName(task.projectId)}
                                </span>
                            ` : ''}
                        </div>
                        
                        ${taskDescription ? `
                            <div class="task-detail-description" style="color: #cbd5e1; line-height: 1.8; font-size: 0.95rem; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid var(--color-primary); max-height: 350px; overflow-y: auto;">
                                ${taskDescription}
                            </div>
                        ` : `
                            <div style="color: #64748b; font-style: italic; padding: 16px; text-align: center;">
                                No description provided
                            </div>
                        `}
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06);">
                    <button onclick="this.closest('.modal').remove()" style="padding: 8px 16px; border: none; border-radius: 6px; background: rgba(255,255,255,0.08); color: #e2e8f0; cursor: pointer; font-size: 0.85rem; transition: all 0.2s ease;">Close</button>
                    <button onclick="window.editTaskHandler('${taskId}'); this.closest('.modal').remove();" style="padding: 8px 16px; border: none; border-radius: 6px; background: var(--color-primary); color: #fff; cursor: pointer; font-size: 0.85rem; transition: all 0.2s ease;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.classList.add('modal-open');
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.classList.remove('modal-open');
            }
        });
    }

    // Helper function to get project name
    function getProjectName(projectId) {
        if (!projectId) return '';
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : 'Unknown';
    }

    // Make it globally available
    window.showTaskDetail = showTaskDetail;