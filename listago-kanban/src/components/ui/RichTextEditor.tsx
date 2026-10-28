"use client";

import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";

/**
 * CKEditor is browser-only (it reads `window` at import time), so the real
 * editor is loaded on demand and never server-rendered. While the chunk
 * loads — and permanently if it fails to load — a styled textarea with the
 * same look and feel keeps the form fully usable.
 */
const CKEditorField = dynamic(() => import("./CKEditorField"), {
  ssr: false,
  loading: () => <div className={`${FIELD_CLASSES} animate-pulse`} aria-hidden />,
});

/** Shared dark-glass styling for the fallback textarea and loading box. */
const FIELD_CLASSES =
  "w-full min-h-[200px] resize-y rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/80 transition focus:border-accent-indigo/60 focus:outline-none focus:ring-2 focus:ring-accent-indigo/40 placeholder:text-white/30";

interface RichTextEditorProps {
  /** Current HTML value (controlled by the parent). */
  value: string;
  /** Called with the new HTML whenever the content changes. */
  onChange: (html: string) => void;
  /** Placeholder shown when the content is empty. */
  placeholder?: string;
  /** Disables editing. */
  disabled?: boolean;
}

/**
 * Rich text description editor (CKEditor 5, classic look) with a graceful
 * plain-textarea fallback:
 *
 * - during the lazy chunk load, a non-editable box shows the current text;
 * - if CKEditor fails to load or throws while mounting, an error boundary
 *   swaps in a plain `<textarea>` (same dark styling) so the user can still
 *   write a description.
 *
 * The parent stays in control of the HTML string, so switching between the
 * fallback and the rich editor never loses data.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
}: RichTextEditorProps) {
  return (
    <EditorErrorBoundary
      fallback={
        <textarea
          value={stripHtml(value)}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={6}
          aria-label={placeholder ?? "Description"}
          className={FIELD_CLASSES}
        />
      }
    >
      <CKEditorBootstrap
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </EditorErrorBoundary>
  );
}

/**
 * Renders the loading placeholder until the editor chunk resolves, then the
 * editor itself. `key` is stable per mount, so the loading box is replaced
 * exactly once.
 */
function CKEditorBootstrap({
  value,
  onChange,
  placeholder,
  disabled,
}: RichTextEditorProps) {
  return (
    <div className="[&_.ck-editor__editable]:min-h-[200px]">
      <CKEditorField
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

/**
 * Extracts the plain text of an HTML string for the textarea fallback, so
 * switching from the rich editor to the fallback never shows raw markup.
 */
function stripHtml(html: string): string {
  if (!html) return "";
  if (!/<[a-z][^>]*>/i.test(html)) return html;
  // A DOM-free approximation is enough here: drop tags, decode the few
  // entities CKEditor emits, restore paragraph breaks.
  return html
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

interface ErrorBoundaryProps {
  /** Rendered instead of the editor when a render error is caught. */
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

/**
 * Minimal error boundary: if the lazily-loaded CKEditor throws while
 * loading or rendering, swap to the fallback (a plain textarea) instead of
 * crashing the surrounding modal.
 */
class EditorErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the reason in dev without breaking the UI.
    console.error("RichTextEditor fell back to a textarea:", error, info);
  }

  render(): ReactNode {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}
