// modal.js - Handle all delete confirmation modals

// Single task delete modal
let pendingDeleteId = null;
let onConfirmCallback = null;

// Bulk delete modal
let pendingBulkDeleteIds = null;
let onBulkConfirmCallback = null;

// Project delete modal
let pendingProjectDeleteId = null;
let onProjectConfirmCallback = null;

export function setupModal() {
    // ========== SINGLE TASK DELETE MODAL ==========
    const singleDeleteModal = document.getElementById('deleteTaskModal');
    const singleConfirmBtn = document.getElementById('confirmDeleteTaskBtn');
    const singleCancelBtn = document.getElementById('cancelDeleteTaskBtn');
    const singleCloseBtn = document.getElementById('closeDeleteTaskModal');
    
    // Show single task delete confirmation
    window.showDeleteConfirmation = (id, taskText, onConfirm) => {
        const taskPreview = document.getElementById('deleteTaskPreview');
        if (taskPreview) {
            taskPreview.textContent = `"${taskText}"`;
        }
        
        pendingDeleteId = id;
        onConfirmCallback = onConfirm;
        
        if (singleDeleteModal) {
            singleDeleteModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Close single delete modal
    const closeSingleDeleteModal = () => {
        if (singleDeleteModal) {
            singleDeleteModal.style.display = 'none';
            pendingDeleteId = null;
            onConfirmCallback = null;
            document.body.style.overflow = '';
        }
    };
    
    // Execute single task delete
    const executeSingleDelete = () => {
        if (pendingDeleteId !== null && onConfirmCallback) {
            onConfirmCallback(pendingDeleteId);
            closeSingleDeleteModal();
        }
    };
    
    // Single delete modal event listeners
    if (singleConfirmBtn) singleConfirmBtn.addEventListener('click', executeSingleDelete);
    if (singleCancelBtn) singleCancelBtn.addEventListener('click', closeSingleDeleteModal);
    if (singleCloseBtn) singleCloseBtn.addEventListener('click', closeSingleDeleteModal);
    
    // Close on outside click
    if (singleDeleteModal) {
        singleDeleteModal.addEventListener('click', (e) => {
            if (e.target === singleDeleteModal) closeSingleDeleteModal();
        });
    }
    
    // ========== BULK DELETE MODAL ==========
    const bulkDeleteModal = document.getElementById('bulkDeleteTasksModal');
    const bulkConfirmBtn = document.getElementById('confirmBulkDeleteBtn');
    const bulkCancelBtn = document.getElementById('cancelBulkDeleteBtn');
    const bulkCloseBtn = document.getElementById('closeBulkDeleteModal');
    
    // Show bulk delete confirmation
    window.showBulkDeleteConfirmation = (taskIds, taskCount, onConfirm) => {
        const bulkTaskCount = document.getElementById('bulkTaskCount');
        if (bulkTaskCount) {
            bulkTaskCount.textContent = taskCount;
        }
        
        pendingBulkDeleteIds = taskIds;
        onBulkConfirmCallback = onConfirm;
        
        if (bulkDeleteModal) {
            bulkDeleteModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Close bulk delete modal
    const closeBulkDeleteModal = () => {
        if (bulkDeleteModal) {
            bulkDeleteModal.style.display = 'none';
            pendingBulkDeleteIds = null;
            onBulkConfirmCallback = null;
            document.body.style.overflow = '';
        }
    };
    
    // Execute bulk delete
    const executeBulkDelete = () => {
        if (pendingBulkDeleteIds !== null && onBulkConfirmCallback) {
            onBulkConfirmCallback(pendingBulkDeleteIds);
            closeBulkDeleteModal();
        }
    };
    
    // Bulk delete modal event listeners
    if (bulkConfirmBtn) bulkConfirmBtn.addEventListener('click', executeBulkDelete);
    if (bulkCancelBtn) bulkCancelBtn.addEventListener('click', closeBulkDeleteModal);
    if (bulkCloseBtn) bulkCloseBtn.addEventListener('click', closeBulkDeleteModal);
    
    // Close on outside click
    if (bulkDeleteModal) {
        bulkDeleteModal.addEventListener('click', (e) => {
            if (e.target === bulkDeleteModal) closeBulkDeleteModal();
        });
    }
    
    // ========== PROJECT DELETE MODAL ==========
    const projectDeleteModal = document.getElementById('deleteProjectModal');
    const projectConfirmBtn = document.getElementById('confirmDeleteProjectBtn');
    const projectCancelBtn = document.getElementById('cancelDeleteProjectBtn');
    const projectCloseBtn = document.getElementById('closeDeleteProjectModal');
    
    // Show project delete confirmation
    window.showProjectDeleteConfirmation = (projectId, projectName, taskCount, onConfirm) => {
        const projectNameEl = document.getElementById('projectNameToDelete');
        const taskWarningEl = document.getElementById('projectTaskWarning');
        
        if (projectNameEl) {
            projectNameEl.textContent = projectName;
        }
        
        if (taskWarningEl) {
            if (taskCount === 0) {
                taskWarningEl.textContent = 'This action cannot be undone.';
            } else {
                taskWarningEl.textContent = `All ${taskCount} task(s) in this project will also be deleted. This action cannot be undone.`;
            }
        }
        
        pendingProjectDeleteId = projectId;
        onProjectConfirmCallback = onConfirm;
        
        if (projectDeleteModal) {
            projectDeleteModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Close project delete modal
    const closeProjectDeleteModal = () => {
        if (projectDeleteModal) {
            projectDeleteModal.style.display = 'none';
            pendingProjectDeleteId = null;
            onProjectConfirmCallback = null;
            document.body.style.overflow = '';
        }
    };
    
    // Execute project delete
    const executeProjectDelete = () => {
        if (pendingProjectDeleteId !== null && onProjectConfirmCallback) {
            onProjectConfirmCallback(pendingProjectDeleteId);
            closeProjectDeleteModal();
        }
    };
    
    // Project delete modal event listeners
    if (projectConfirmBtn) projectConfirmBtn.addEventListener('click', executeProjectDelete);
    if (projectCancelBtn) projectCancelBtn.addEventListener('click', closeProjectDeleteModal);
    if (projectCloseBtn) projectCloseBtn.addEventListener('click', closeProjectDeleteModal);
    
    // Close on outside click
    if (projectDeleteModal) {
        projectDeleteModal.addEventListener('click', (e) => {
            if (e.target === projectDeleteModal) closeProjectDeleteModal();
        });
    }
    
    // ========== GLOBAL ESCAPE KEY HANDLER ==========
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any open modal
            if (singleDeleteModal && singleDeleteModal.style.display === 'block') closeSingleDeleteModal();
            if (bulkDeleteModal && bulkDeleteModal.style.display === 'block') closeBulkDeleteModal();
            if (projectDeleteModal && projectDeleteModal.style.display === 'block') closeProjectDeleteModal();
        }
    });
}