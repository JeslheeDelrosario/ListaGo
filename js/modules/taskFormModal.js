// taskFormModal.js - Jira-style task create/edit modal with rich text support
import { addTask, editTask, getTasks } from './taskManager.js';
import { getProjects, getProjectById } from './projectManager.js';
import { showNotification } from './notifications.js';
import { renderTasks } from './uiRenderer.js';

let currentTaskId = null; // null = create mode, has value = edit mode
let ckEditorInitialized = false;
let editorInstance = null;
let currentTaskDescription = '';

// Initialize CKEditor 5 rich text editor
async function initCKEditor() {
    const textarea = document.getElementById('taskDescriptionInput');
    if (!textarea) return;
    
    if (editorInstance) {
        editorInstance.setData(currentTaskDescription || '');
        return;
    }
    
    try {
        // Check if CKEditor is available
        if (typeof window.ClassicEditor === 'undefined') {
            console.warn('CKEditor not loaded, using fallback textarea');
            textarea.style.display = 'block';
            return;
        }
        
        editorInstance = await window.ClassicEditor.create(textarea, {
            toolbar: [
                'bold', 'italic', '|',
                'bulletedList', 'numberedList', '|',
                'link', 'blockQuote'
            ],
            placeholder: 'Write your task description here...',
        });
        
        // Apply dark theme
        const editorElement = editorInstance.ui.view.editable.element;
        editorElement.style.backgroundColor = '#1a1a2e';
        editorElement.style.color = '#ffffff';
        editorElement.style.border = '1px solid #334155';
        editorElement.style.borderRadius = '0.5rem';
        editorElement.style.padding = '12px';
        editorElement.style.minHeight = '150px';
        
        ckEditorInitialized = true;
        console.log('✅ CKEditor initialized');
    } catch (error) {
        console.error('CKEditor init error:', error);
        // Fallback
        if (textarea) {
            textarea.style.display = 'block';
            textarea.style.backgroundColor = '#1a1a2e';
            textarea.style.color = '#ffffff';
            textarea.style.border = '1px solid #334155';
            textarea.style.borderRadius = '0.5rem';
            textarea.style.padding = '12px';
            textarea.style.minHeight = '150px';
        }
    }
}

function getEditorContent() {
    try {
        if (editorInstance) {
            return editorInstance.getData();
        }
    } catch (error) {
        console.error('Error getting editor content:', error);
    }
    
    // Fallback to textarea
    const textarea = document.getElementById('taskDescriptionInput');
    return textarea?.value || '';
}

function destroyEditor() {
    if (editorInstance) {
        editorInstance.destroy();
        editorInstance = null;
        ckEditorInitialized = false;
    }
}

// Populate project dropdown in the form
function populateProjectDropdown() {
    const projectSelect = document.getElementById('taskProjectSelect');
    if (!projectSelect) return;
    
    // Clear existing options except first
    projectSelect.innerHTML = '<option value="">No Project</option>';
    
    // Add all projects
    const projects = getProjects();
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
    });
}

// Close the task form modal
function closeTaskFormModal() {
    const modal = document.getElementById('taskFormModal');
    if (modal) {
        modal.style.display = 'none';
        currentTaskId = null;
        
        // Reset form
        resetTaskForm();
    }
}

// Reset form to default state
function resetTaskForm() {
    const titleInput = document.getElementById('taskTitleInput');
    const dueDateInput = document.getElementById('taskDueDateInput');
    const projectSelect = document.getElementById('taskProjectSelect');
    const prioritySelect = document.getElementById('taskPrioritySelect');
    const statusSelect = document.getElementById('taskStatusSelect');
    
    if (titleInput) titleInput.value = '';
    if (dueDateInput) dueDateInput.value = '';
    if (projectSelect) projectSelect.value = '';
    if (prioritySelect) prioritySelect.value = 'medium';
    if (statusSelect) statusSelect.value = 'todo';
    
    // Clear rich text editor
    if (editorInstance) {
        editorInstance.setData('');
    }
    
    // Update modal title and button text for create mode
    const modalTitle = document.getElementById('taskFormModalTitle');
    const confirmBtn = document.getElementById('confirmTaskFormBtn');
    if (modalTitle) modalTitle.textContent = 'Create New Task';
    if (confirmBtn) confirmBtn.textContent = 'Create Task';
}

// Open the task form modal
export async function openTaskFormModal(taskId = null) {
    const modal = document.getElementById('taskFormModal');
    if (!modal) return;
    
    // Initialize everything
    initCKEditor();
    populateProjectDropdown();
    
    currentTaskId = taskId;
    
    // If we're in edit mode, populate with existing task data
    if (taskId) {
        const tasks = getTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            // Update modal for edit mode
            const modalTitle = document.getElementById('taskFormModalTitle');
            const confirmBtn = document.getElementById('confirmTaskFormBtn');
            if (modalTitle) modalTitle.textContent = 'Edit Task';
            if (confirmBtn) confirmBtn.textContent = 'Save Changes';
            
            // Populate form fields
            const titleInput = document.getElementById('taskTitleInput');
            const dueDateInput = document.getElementById('taskDueDateInput');
            const projectSelect = document.getElementById('taskProjectSelect');
            const prioritySelect = document.getElementById('taskPrioritySelect');
            const statusSelect = document.getElementById('taskStatusSelect');
            
            if (titleInput) titleInput.value = task.title || task.text || '';
            if (dueDateInput) dueDateInput.value = task.dueDate || '';
            if (projectSelect) projectSelect.value = task.projectId || '';
            if (prioritySelect) prioritySelect.value = task.priority || 'medium';
            if (statusSelect) statusSelect.value = task.status || 'todo';
            
            // Populate rich text editor
            currentTaskDescription = task.description || '';
            if (editorInstance) {
                editorInstance.setData(currentTaskDescription);
            }
        }
    }
    
    // Show the modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus on title input
    setTimeout(() => {
        const titleInput = document.getElementById('taskTitleInput');
        if (titleInput) titleInput.focus();
    }, 100);
}

// Save the task from the form
function saveTaskFromForm() {
    const titleInput = document.getElementById('taskTitleInput');
    const dueDateInput = document.getElementById('taskDueDateInput');
    const projectSelect = document.getElementById('taskProjectSelect');
    const prioritySelect = document.getElementById('taskPrioritySelect');
    const statusSelect = document.getElementById('taskStatusSelect');
    
    // Get description from CKEditor
    const description = getEditorContent();
    
    const title = titleInput?.value.trim();
    
    if (!title) {
        showNotification('Please enter a task title!', 'error');
        return;
    }
    
    // Create task data object
    const taskData = {
        title: title,
        description: description,
        dueDate: dueDateInput?.value || null,
        projectId: projectSelect?.value || null,
        priority: prioritySelect?.value || 'medium',
        status: statusSelect?.value || 'todo'
    };
    
    if (currentTaskId) {
        // Edit existing task
        const success = editTask(currentTaskId, taskData);
        if (success) {
            showNotification('Task updated successfully!', 'success');
            renderTasks();
        }
    } else {
        // Create new task
        const success = addTask(taskData);
        if (success) {
            renderTasks();
        }
    }
    
    // Close the modal
    closeTaskFormModal();
}

// Setup the task form modal event listeners
export function setupTaskFormModal() {
    // Expose openTaskFormModal globally so the button can call it directly
    window.openTaskFormModal = openTaskFormModal;
    const modal = document.getElementById('taskFormModal');
    const closeBtn = document.getElementById('closeTaskFormModal');
    const cancelBtn = document.getElementById('cancelTaskFormBtn');
    const confirmBtn = document.getElementById('confirmTaskFormBtn');
    const openBtn = document.getElementById('openTaskFormBtn');
    const taskInput = document.getElementById('taskInput'); // The readonly input that opens the modal
    
    // Close modal events
    if (closeBtn) closeBtn.addEventListener('click', closeTaskFormModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeTaskFormModal);
    
    // Click outside to close
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeTaskFormModal();
        });
    }
    
    // Confirm/save button
    if (confirmBtn) confirmBtn.addEventListener('click', saveTaskFromForm);
    
    // Open modal when clicking the create button or the readonly input
    if (openBtn) openBtn.addEventListener('click', () => openTaskFormModal());
    if (taskInput) taskInput.addEventListener('click', () => openTaskFormModal());
    
    // Also make the global showEditModal function use our new form instead of the old edit modal
    window.showEditModal = (taskId) => {
        openTaskFormModal(taskId);
    };
}