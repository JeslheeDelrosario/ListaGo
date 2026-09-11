// js\modules\notifications\notifications.js
class NotificationManager {
  constructor() {
    this.container = null;
  }

  init() {
    this.container = document.getElementById("toast-container");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      document.body.appendChild(this.container);
    }
  }

  /**
   * Shows a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {number} duration
   */
  show(message, type = "info", duration = 3000) {
    if (!this.container) {
      this.init();
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconClass = "fas fa-info-circle";
    if (type === "success") iconClass = "fas fa-check-circle";
    if (type === "error") iconClass = "fas fa-exclamation-triangle";
    if (type === "warning") iconClass = "fas fa-exclamation-circle";

    toast.innerHTML = `
      <i class="${iconClass} toast-icon"></i>
      <div class="toast-message">${message}</div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  success(msg, duration) {
    this.show(msg, "success", duration);
  }

  error(msg, duration) {
    this.show(msg, "error", duration);
  }

  info(msg, duration) {
    this.show(msg, "info", duration);
  }

  warning(msg, duration) {
    this.show(msg, "warning", duration);
  }
}

export const Notifications = new NotificationManager();
