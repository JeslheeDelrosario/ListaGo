# Architecture

## Application layers

The project uses the Next.js App Router under `src/app/`. Route pages compose reusable client UI from `src/components/`; shared navigation, global modals, and keyboard shortcuts live in the application shell.

- `src/app/` — route entry points and global layout/styles.
- `src/components/layout/` — responsive sidebar, header, and app shell.
- `src/components/kanban/` — drag-and-drop board, columns, and task cards.
- `src/components/dashboard/` — dashboard statistics and charts.
- `src/components/modals/` — task, task-detail, project, and delete workflows.
- `src/components/ui/` — shared modal, badge, icon, and rich-text UI.
- `src/hooks/` — keyboard shortcut, scoped-task, and debounce hooks.
- `src/store/` — Zustand task, project, and UI state.
- `src/lib/` — task filtering and date/stat helpers.
- `src/types/` — shared domain types and constants.

## State and persistence

`useTaskStore` owns task data and mutations; `useProjectStore` owns projects and project deletion behavior. Both use Zustand's persist middleware with `localStorage`, storing domain data while keeping action functions in memory. `useUIStore` contains transient interface state: search, selected project, sidebar state, task selection, and modal visibility. It is not persisted.

The server-rendered shell and first client render use hydration-safe placeholders where browser state or current-time calculations are needed; persisted data is shown after hydration. This keeps the initial HTML consistent and avoids hydration mismatches.

## Board and animations

The board groups the filtered tasks by status and uses dnd-kit sensors, droppable columns, sortable cards, and a drag overlay. A successful drop updates the task store. Framer Motion animates board entry, card presence, dashboard statistics, project navigation, and modal transitions. Card layout animations are paused while dragging so dnd-kit transforms remain authoritative.

## Rich text

`RichTextEditor` dynamically imports `CKEditorField` with server rendering disabled because CKEditor depends on browser APIs. The editor uses a curated plugin/toolbar set and passes HTML strings back to the task form or detail view. A React error boundary renders a dark-styled textarea if editor initialization fails. CKEditor is configured with the `GPL` key; confirm license compatibility before distributing the app.

## Notifications and interaction

Sonner's root `Toaster` provides the shared notification surface with a 3-second duration. The shortcut hook listens at the window level, ignores typing targets, and guards plain-key actions while modals are open. Individual modal components own validation and call store actions after successful submission.
