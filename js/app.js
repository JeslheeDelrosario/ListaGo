//js\app.js
import { loadTasks, getTasks, setTasks } from './modules/storage.js';
import { 
    addTask, 
    toggleTask, 
    deleteTask, 
    editTask, 
    setCurrentFilter, 
    setRenderCallback,
    deleteAllCompletedTasks
} from './modules/taskManager.js';
import { renderTasks, setupFilters, updateStats } from './modules/uiRenderer.js';
import { setupModal } from './modules/modal.js';
import { showNotification } from './modules/notifications.js';
import { debounce } from './modules/utils.js';
import { setupEditModal, showEditModal, setupInlineEdit } from './modules/editModal.js';
import { setupSidebar, updateSidebarStats } from './modules/sidebar.js';
import { setupProjectModal, renderProjectsList } from './modules/projectModal.js';
import { getProjects, loadProjects } from './modules/projectManager.js';

// Mobile sidebar toggle functionality
function setupMobileSidebar() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (!hamburgerMenu || !sidebar || !sidebarOverlay) return;
    
    // Toggle sidebar when hamburger is clicked
    hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    });
    
    // Close sidebar when overlay is clicked
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Close sidebar when a navigation item or project is clicked (for better UX)
    const navItems = sidebar.querySelectorAll('.nav-item, .project-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close sidebar when Escape key is pressed
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Handle window resize - if screen becomes larger than mobile, reset sidebar
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Initialize the app
function init() {
    // Load tasks from storage
    const savedTasks = loadTasks();
    setTasks(savedTasks);
    
    // Set up render callback
    setRenderCallback(() => {
        renderTasks();
        updateSidebarStats();
    });
    
    // Set up modal
    setupModal();
    setupEditModal();
    
    // Load saved projects from localStorage
    loadProjects();
    
    // Set up filters
    setupFilters();
    
    // Set up sidebar navigation
    setupSidebar();
    
    // Set up project modal
    setupProjectModal();
    renderProjectsList();
    
    // Mobile sidebar toggle setup
    setupMobileSidebar();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Set today's date as minimum for date picker
    setDatePickerMin();

    window.showEditModal = showEditModal;
    
    // Initial render
    renderTasks();
    
    console.log('App initialized! 🚀');
}

// NEW: Update custom project dropdown
function updateProjectDropdown() {
    const dropdownMenu = document.getElementById('projectDropdownMenu');
    const hiddenInput = document.getElementById('projectSelect');
    const trigger = document.getElementById('projectDropdownTrigger');
    
    if (!dropdownMenu || !hiddenInput) return;
    
    // Clear existing items except "No Project"
    dropdownMenu.innerHTML = `
        <div class="dropdown-item" data-project-id="">
            <span class="dropdown-item-text">No Project</span>
        </div>
    `;
    
    // Add click handler for "No Project" option
    const noProjectItem = dropdownMenu.querySelector('[data-project-id=""]');
    if (noProjectItem) {
        noProjectItem.addEventListener('click', (e) => {
            e.stopPropagation();
            selectProject('', 'No Project', null, null);
        });
    }
    
    // Add projects from project manager
    const projects = getProjects();
    projects.forEach(project => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.setAttribute('data-project-id', project.id);
        item.innerHTML = `
            <div class="dropdown-item-icon" style="background-color: ${project.color}">
                <i class="${project.icon}"></i>
            </div>
            <span class="dropdown-item-text">${project.name}</span>
        `;
        
        // Add click handler for selection
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectProject(project.id, project.name, project.color, project.icon);
        });
        
        dropdownMenu.appendChild(item);
    });
    
    // Set up dropdown toggle
    if (trigger) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        closeDropdown();
    });
}

// Helper function to select a project
function selectProject(projectId, projectName, projectColor, projectIcon) {
    const hiddenInput = document.getElementById('projectSelect');
    const triggerText = document.querySelector('.trigger-text');
    const trigger = document.getElementById('projectDropdownTrigger');
    
    // Update hidden input value
    hiddenInput.value = projectId;
    
    // Update trigger to show selected project with icon
    if (projectId === '') {
        trigger.innerHTML = `
            <span class="trigger-text">No Project</span>
            <i class="fas fa-chevron-down dropdown-arrow"></i>
        `;
    } else {
        trigger.innerHTML = `
            <div class="trigger-content">
                <div class="trigger-icon" style="background-color: ${projectColor}">
                    <i class="${projectIcon}"></i>
                </div>
                <span class="trigger-text">${projectName}</span>
            </div>
            <i class="fas fa-chevron-down dropdown-arrow"></i>
        `;
    }
    
    // Update selected state in dropdown items
    const items = document.querySelectorAll('.dropdown-item');
    items.forEach(item => {
        if (item.getAttribute('data-project-id') === projectId) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    // Close dropdown
    closeDropdown();
}

// Toggle dropdown open/closed
function toggleDropdown() {
    const trigger = document.getElementById('projectDropdownTrigger');
    const menu = document.getElementById('projectDropdownMenu');
    
    if (trigger && menu) {
        trigger.classList.toggle('active');
        menu.classList.toggle('active');
    }
}

// Close dropdown
function closeDropdown() {
    const trigger = document.getElementById('projectDropdownTrigger');
    const menu = document.getElementById('projectDropdownMenu');
    
    if (trigger && menu) {
        trigger.classList.remove('active');
        menu.classList.remove('active');
    }
}

// Set minimum date to today for date picker
function setDatePickerMin() {
    const taskDate = document.getElementById('taskDate');
    if (taskDate) {
        const today = new Date().toISOString().split('T')[0];
        taskDate.min = today;
    }
}

// UPDATED: Set up event listeners with project and date support
function setupEventListeners() {
    const addButton = document.getElementById('addTaskButton');
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const projectSelect = document.getElementById('projectSelect');
    
    if (addButton) {
        addButton.addEventListener('click', () => {
            const input = document.getElementById('taskInput');
            const dateInput = document.getElementById('taskDate');
            const projectSelect = document.getElementById('projectSelect');
            const taskText = input.value.trim();
            const dueDate = dateInput ? dateInput.value : null;
            const projectId = projectSelect ? projectSelect.value : null;
            
            if (taskText) {
                // Pass task text, due date, and project ID
                addTask(taskText, dueDate, projectId);
                if (input) input.value = '';
                if (dateInput) dateInput.value = ''; // Clear date picker
                if (projectSelect) projectSelect.value = ''; // Clear project selection
                // Reset dropdown trigger to show "Select Project"
                const trigger = document.getElementById('projectDropdownTrigger');
                if (trigger) {
                    trigger.innerHTML = `
                        <span class="trigger-text">Select Project</span>
                        <i class="fas fa-chevron-down dropdown-arrow"></i>
                    `;
                    // Remove selected state from all dropdown items
                    const items = document.querySelectorAll('.dropdown-item');
                    items.forEach(item => item.classList.remove('selected'));
                }
                input.focus();
            }
        });
    }
    
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const dateInput = document.getElementById('taskDate');
                const projectSelect = document.getElementById('projectSelect');
                const taskText = e.target.value.trim();
                const dueDate = dateInput ? dateInput.value : null;
                const projectId = projectSelect ? projectSelect.value : null;
                
                if (taskText) {
                    addTask(taskText, dueDate, projectId);
                    e.target.value = '';
                    if (dateInput) dateInput.value = '';
                    if (projectSelect) projectSelect.value = '';
                    // Reset dropdown trigger to show "Select Project"
                    const trigger = document.getElementById('projectDropdownTrigger');
                    if (trigger) {
                        trigger.innerHTML = `
                            <span class="trigger-text">Select Project</span>
                            <i class="fas fa-chevron-down dropdown-arrow"></i>
                        `;
                        // Remove selected state from all dropdown items
                        const items = document.querySelectorAll('.dropdown-item');
                        items.forEach(item => item.classList.remove('selected'));
                    }
                }
            }
        });
    }
    
    // Update project dropdown when projects change
    updateProjectDropdown();

    // Handle header "New Task" button - Smart behavior with Dashboard
    const headerAddBtn = document.getElementById('addTaskBtn');
    if (headerAddBtn) {
        headerAddBtn.addEventListener('click', () => {
            const currentView = window.getCurrentView ? window.getCurrentView() : 'dashboard';
            
            if (currentView === 'dashboard') {
                // Switch to All Tasks view first
                const allNavBtn = document.querySelector('.nav-item[data-view="all"]');
                if (allNavBtn) {
                    allNavBtn.click();   // This triggers switchView('all')
                }
            }
            
            // Focus the input after a tiny delay (so view has time to switch)
            setTimeout(() => {
                const taskInput = document.getElementById('taskInput');
                if (taskInput) {
                    taskInput.focus();
                }
            }, 80);
        });
    }
}

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + A to focus input
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            if (document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('taskInput')?.focus();
            }
        }
        
        // Delete key to clear completed tasks
        if (e.key === 'Delete' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            if (confirm('Delete all completed tasks?')) {
                deleteAllCompletedTasks();
            }
        }
        
        // Escape to reset filter
        if (e.key === 'Escape') {
            setCurrentFilter('all');
            const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
            if (allBtn) {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                allBtn.classList.add('active');
                renderTasks();
            }
        }
    });
}

// Make functions available globally for inline event handlers
window.toggleTaskHandler = (id) => toggleTask(id);
window.editTaskHandler = (id) => {
    showEditModal(id);  // Opens the modal instead of prompt
};
window.deleteTaskHandler = (id, taskText) => {
    window.showDeleteConfirmation(id, taskText, (confirmedId) => {
        deleteTask(confirmedId);
    });
};
window.setFilterHandler = (filter) => {
    setCurrentFilter(filter);
    renderTasks();
};

// Start the app
init();