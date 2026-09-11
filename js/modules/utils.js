/**
 * utils.js - Utility and helper functions
 */

/**
 * Escapes potentially hazardous HTML characters to prevent XSS attacks.
 * @param {string} str
 * @returns {string} Escaped string
 */
export function escapeHTML(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Checks if a string contains HTML tags.
 * @param {string} str
 * @returns {boolean}
 */
export function containsHTML(str) {
  if (!str) return false;
  return /<\/?[a-z][\s\S]*>/i.test(str);
}

/**
 * Parses markdown-style bullets and numbered lists, inline bold/italic/code,
 * or safely renders existing HTML content for task titles and descriptions.
 * @param {string} text
 * @returns {string} Safe HTML string with formatted elements
 */
export function renderFormattedContent(text) {
  if (!text) return "";
  const trimmed = text.trim();
  if (!trimmed) return "";

  // If the content already contains HTML tags (like from contenteditable or rich editor),
  // sanitize it while keeping safe formatting tags:
  if (containsHTML(trimmed)) {
    return sanitizeSafeHTML(trimmed);
  }

  // Plain-text with markdown formatting (bullet points -, *, •, numbered lists, line breaks)
  const lines = trimmed.split(/\r?\n/);
  let html = "";
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      html += "</ul>";
      inUl = false;
    }
    if (inOl) {
      html += "</ol>";
      inOl = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      closeLists();
      continue;
    }

    // Check for bullet point: "* item", "- item", "• item", "+ item"
    const bulletMatch = line.match(/^([*\-•+])\s+(.*)$/);
    if (bulletMatch) {
      if (inOl) {
        html += "</ol>";
        inOl = false;
      }
      if (!inUl) {
        html += '<ul class="task-bullets-list">';
        inUl = true;
      }
      html += `<li>${formatInlineMarkdown(bulletMatch[2])}</li>`;
      continue;
    }

    // Check for numbered list: "1. item", "2) item"
    const numberMatch = line.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numberMatch) {
      if (inUl) {
        html += "</ul>";
        inUl = false;
      }
      if (!inOl) {
        html += '<ol class="task-numbers-list">';
        inOl = true;
      }
      html += `<li>${formatInlineMarkdown(numberMatch[2])}</li>`;
      continue;
    }

    // Regular line/paragraph
    closeLists();
    html += `<p class="task-content-line">${formatInlineMarkdown(line)}</p>`;
  }

  closeLists();
  return html;
}

/**
 * Formats inline bold, italic, code, and links safely.
 * @param {string} str
 * @returns {string}
 */
export function formatInlineMarkdown(str) {
  if (!str) return "";
  let escaped = escapeHTML(str);

  // Inline code: `code`
  escaped = escaped.replace(
    /`([^`]+)`/g,
    '<code class="inline-code">$1</code>',
  );

  // Bold: **text** or __text__
  escaped = escaped.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");

  // Italic: *text* or _text_
  escaped = escaped.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");

  // Strikethrough: ~~text~~
  escaped = escaped.replace(/~~(.*?)~~/g, "<del>$1</del>");

  return escaped;
}

/**
 * Strips disallowed tags and script injections, keeping safe formatting tags.
 * @param {string} html
 * @returns {string}
 */
export function sanitizeSafeHTML(html) {
  if (!html) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove dangerous elements
  const badTags = [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "button",
    "link",
    "meta",
  ];
  badTags.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  });

  // Remove dangerous attributes like onerror, onclick, javascript: urls
  const allElements = doc.body.querySelectorAll("*");
  allElements.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const val = attr.value.toLowerCase();
      if (
        name.startsWith("on") ||
        val.includes("javascript:") ||
        val.includes("data:text/html")
      ) {
        el.removeAttribute(attr.name);
      }
    });

    // Add classes to lists for uniform styling
    if (el.tagName === "UL") el.classList.add("task-bullets-list");
    if (el.tagName === "OL") el.classList.add("task-numbers-list");
  });

  return doc.body.innerHTML;
}

/**
 * Checks if a task has multi-line or long content that can be toggled/expanded.
 * @param {string} text
 * @param {string} description
 * @returns {boolean}
 */
export function isLongTask(text, description) {
  const hasMultiLineTitle = text && (text.includes("\n") || text.length > 80);
  const hasDescription = !!(
    description &&
    description.trim() &&
    description.trim() !== "<br>"
  );
  return Boolean(hasMultiLineTitle || hasDescription);
}

/**
 * Generates a unique UUID v4 using crypto.randomUUID with fallback.
 * @returns {string} UUID string
 */
export function generateUUID() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates a debounced version of a function.
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait = 250) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 * @returns {string}
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD string into a human-readable format.
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;

  const targetDate = new Date(year, month - 1, day);
  const todayStr = getTodayDateString();

  if (dateStr === todayStr) {
    return "Today";
  }

  // Tomorrow check
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  if (dateStr === tomorrowStr) {
    return "Tomorrow";
  }

  // Yesterday check
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  if (dateStr === yesterdayStr) {
    return "Yesterday";
  }

  return targetDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      targetDate.getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
}

/**
 * Checks if a given date string (YYYY-MM-DD) is before today.
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = getTodayDateString();
  return dateStr < today;
}

/**
 * Checks if a given date string is today.
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isToday(dateStr) {
  if (!dateStr) return false;
  return dateStr === getTodayDateString();
}

/**
 * Checks if a given date is within the next 7 days (including tomorrow up to 7 days ahead).
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isUpcoming(dateStr) {
  if (!dateStr) return false;
  const today = getTodayDateString();
  if (dateStr <= today) return false;

  const [year, month, day] = dateStr.split("-").map(Number);
  const target = new Date(year, month - 1, day);

  const now = new Date();
  const next7Days = new Date();
  next7Days.setDate(now.getDate() + 7);
  next7Days.setHours(23, 59, 59, 999);

  return target <= next7Days;
}
