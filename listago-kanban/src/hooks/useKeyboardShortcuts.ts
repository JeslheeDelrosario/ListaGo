"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUIStore } from "@/store/useUIStore";

/** Id of the header search input, focused by the "/" shortcut. */
export const SEARCH_INPUT_ID = "kanban-search-input";

/** Data attribute on the header search input (used by the shortcut hook). */
export const SEARCH_INPUT_ATTR = "data-search-input";

/** True when the event target is a text-entry element (input/textarea/…). */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    target.isContentEditable
  );
}

/** True when an input, textarea or contentEditable has focus. */
function isInputFocused(): boolean {
  return isTypingTarget(document.activeElement);
}

/** Focuses the header search bar (by data attribute, with the id as fallback). */
function focusSearchInput(): void {
  const input =
    document.querySelector<HTMLInputElement>(`[${SEARCH_INPUT_ATTR}]`) ??
    document.getElementById(SEARCH_INPUT_ID);
  input?.focus();
}

/**
 * Registers ListaGo's global keyboard shortcuts (all ignored while the user
 * is typing in a field or while a modal is open, except Escape):
 *
 * - Escape      → close the topmost open modal (detail popup first, then the
 *                 task modal, project modal, delete-project modal and delete
 *                 modal); with no modal open it clears the search instead
 * - "/"         → focus the search bar
 * - Ctrl/Cmd+K  → focus the search bar (modern alternative to "/")
 * - "n" or "c"  → open the create-task modal
 * - "d"         → navigate to the dashboard
 * - "b"         → navigate to the board
 */
export function useKeyboardShortcuts(): void {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape works even while a modal is open (topmost first).
      if (event.key === "Escape") {
        const ui = useUIStore.getState();
        if (ui.isTaskDetailOpen) {
          ui.closeTaskDetail();
          event.preventDefault();
          return;
        }
        if (ui.taskModal.open) {
          ui.closeTaskModal();
          event.preventDefault();
          return;
        }
        if (ui.isProjectModalOpen) {
          ui.closeProjectModal();
          event.preventDefault();
          return;
        }
        if (ui.isDeleteProjectModalOpen) {
          ui.closeDeleteProjectModal();
          event.preventDefault();
          return;
        }
        if (ui.deleteModal.open) {
          ui.closeDeleteModal();
          event.preventDefault();
          return;
        }
        // No modal open: clear the search and leave the field.
        if (ui.searchQuery !== "") ui.setSearchQuery("");
        const active = document.activeElement;
        if (active instanceof HTMLElement && active.id === SEARCH_INPUT_ID) {
          active.blur();
        }
        return;
      }

      // Never steal keystrokes while the user is typing in a field.
      if (isInputFocused()) return;

      // Ctrl/Cmd + K — focus the search bar (also beats the browser's
      // quick-find in Firefox).
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        focusSearchInput();
        return;
      }

      // Any other chord (Ctrl/Cmd/Alt + …) is left to the browser.
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === "/") {
        event.preventDefault();
        focusSearchInput();
        return;
      }

      // Modal-open guard for the plain-key shortcuts below.
      if (useUIStore.getState().isAnyModalOpen()) return;

      switch (event.key.toLowerCase()) {
        case "n":
        case "c":
          event.preventDefault();
          useUIStore.getState().openCreateTask();
          break;
        case "d":
          event.preventDefault();
          router.push("/dashboard");
          break;
        case "b":
          event.preventDefault();
          router.push("/board");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}
