"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { FiX } from "react-icons/fi";

/** Shared input/select/textarea styling for all modals. */
export const MODAL_INPUT_CLASSES =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/30 transition focus:border-accent-indigo/60 focus:outline-none focus:ring-2 focus:ring-accent-indigo/40";

/** Shared label styling for modal fields. */
export const MODAL_LABEL_CLASSES =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50";

/** Primary (gradient) modal button. */
export const MODAL_BUTTON_PRIMARY_CLASSES =
  "rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/60";

/** Secondary (glass) modal button. */
export const MODAL_BUTTON_GHOST_CLASSES =
  "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white/90";

/** Destructive (red gradient) modal button. */
export const MODAL_BUTTON_DANGER_CLASSES =
  "rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:brightness-110";

/** Inline validation message under a modal field. */
export const MODAL_ERROR_CLASSES = "mt-1.5 text-xs font-medium text-red-400";

interface ModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user requests to close (overlay click, ✕, Escape). */
  onClose: () => void;
  /** Modal heading, referenced by `aria-labelledby`. */
  title: string;
  /** Modal body content. */
  children: ReactNode;
  /** Optional footer, typically the action buttons (right-aligned). */
  footer?: ReactNode;
  /** Tailwind max-width class for the panel. */
  maxWidth?: string;
}

/**
 * Shared overlay + glass panel wrapper used by the task, delete and project
 * modals. Handles accessibility basics: dialog roles, focus management,
 * a Tab focus trap and background scroll locking.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-lg",
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Minimal focus trap: keep Tab cycling inside the dialog panel.
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleTab, true);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`modal-panel relative flex max-h-[90vh] w-full ${maxWidth} animate-modal-in flex-col overflow-y-auto rounded-2xl border border-white/10 bg-white/8 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold text-white/90">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white/90"
          >
            <FiX size={16} />
          </button>
        </div>

        {children}

        {footer ? (
          <div className="mt-6 flex justify-end gap-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
