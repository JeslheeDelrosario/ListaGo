"use client";

import { useEffect } from "react";

import { useUIStore } from "@/store/useUIStore";

/** Id of the header search input, focused by the "/" shortcut. */
export const SEARCH_INPUT_ID = "kanban-search-input";

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

/**
 * Registers ListaGo's global keyboard shortcuts:
 * - "/" focuses the search input (ignored while typing in a field)
 * - "c" opens the create-task modal (ignored while typing) — plain keys are
 *   used because browsers reserve Ctrl/Cmd + N (and C) for themselves
 * - Ctrl/Cmd + N also opens the create-task modal, for muscle memory
 * - Escape closes any open modal, or clears the search when none is open
 */
export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const ui = useUIStore.getState();
      const typing = isTypingTarget(event.target);

      if (event.key === "Escape") {
        if (ui.isAnyModalOpen()) {
          ui.closeAllModals();
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
      if (typing) return;

      if (event.key === "/") {
        event.preventDefault();
        document.getElementById(SEARCH_INPUT_ID)?.focus();
        return;
      }

      const key = event.key.toLowerCase();

      // Plain "c" — safe because a Ctrl/Cmd/Alt chord would have been
      // swallowed above only for the combos we handle explicitly.
      if (key === "c" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        ui.openCreateTask();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && key === "n") {
        event.preventDefault();
        ui.openCreateTask();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
