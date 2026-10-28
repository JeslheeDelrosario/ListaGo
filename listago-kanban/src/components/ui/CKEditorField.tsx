"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
  Strikethrough,
  Underline,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

/**
 * Toolbar limited to the essentials, matching the original vanilla ListaGo
 * editor. `code` is the inline-code style; `blockQuote` and the two list
 * types round out the formatting set.
 */
const TOOLBAR_ITEMS = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "|",
  "bulletedList",
  "numberedList",
  "|",
  "heading",
  "|",
  "link",
  "blockQuote",
  "code",
  "|",
  "undo",
  "redo",
] as const;

const EDITOR_PLUGINS = [
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  Link,
  BlockQuote,
];

interface CKEditorFieldProps {
  /** Current HTML value (controlled by the parent). */
  value: string;
  /** Called with the new HTML whenever the editor content changes. */
  onChange: (html: string) => void;
  /** Called once the editor instance is ready (used to swap out the loader). */
  onReady?: () => void;
  /** Placeholder shown when the editor is empty. */
  placeholder?: string;
  /** Disables editing (renders the editor read-only). */
  disabled?: boolean;
}

/**
 * Thin wrapper around the CKEditor 5 React binding with a fixed dark-friendly
 * plugin set. Only ever imported client-side — `RichTextEditor` loads this via
 * `next/dynamic` with `ssr: false`, because CKEditor touches `window` at import
 * time and would crash during server rendering.
 */
export default function CKEditorField({
  value,
  onChange,
  onReady,
  placeholder,
  disabled = false,
}: CKEditorFieldProps) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      disabled={disabled}
      onReady={() => onReady?.()}
      onChange={(_event, editor) => onChange(editor.getData())}
      config={{
        // CKEditor 5 v44+ refuses to boot without a license key. "GPL" is
        // the free token for open-source (GPLv2+) projects; replace it with
        // your commercial key from https://ckeditor.com/ before shipping a
        // proprietary build.
        licenseKey: "GPL",
        plugins: EDITOR_PLUGINS,
        toolbar: { items: [...TOOLBAR_ITEMS] },
        placeholder: placeholder ?? "",
        heading: {
          options: [
            { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
            {
              model: "heading2",
              view: "h2",
              title: "Heading 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Heading 3",
              class: "ck-heading_heading3",
            },
          ],
        },
      }}
    />
  );
}
