# User guide

## Navigate the app

Use the sidebar to open the Dashboard, All Tasks board, Today, Upcoming, or a project. On smaller screens, use the menu button to open the sidebar. The search field filters tasks by text; clear it to restore the full view.

## Manage tasks

- Select **New Task** or a column's **Add task** button to create a task. The column button preselects its status.
- Set a title (required), description, due date, priority, status, and project. Task descriptions support rich text; the editor is loaded when needed and has a plain-text fallback.
- Drag cards between columns to change status. Click a card to open its detail view; edit common fields inline or choose **Edit in Form** for the full task form.
- Use the delete action on a card or in its detail view. Deletion requires confirmation.
- Task and project changes are saved in this browser's local storage.

## Manage projects

Use the **+** control beside Projects to create a project. Choose a name, color, and icon. Existing projects can be edited from their row. Deleting a project asks whether to move its tasks to Inbox or delete them. Inbox is protected from deletion.

## Dashboard and date views

The dashboard summarizes task totals, progress, completion rate, and activity. Today and Upcoming focus on due dates; overdue tasks are highlighted. Project pages scope task views to the selected project.

## Keyboard shortcuts

Shortcuts are ignored when focus is in an input, select, textarea, or content-editable field, so typing is not intercepted. Plain-key shortcuts also do not fire while a modal is open.

| Shortcut | Action |
| --- | --- |
| `/` | Focus task search. |
| `Ctrl+K` / `Cmd+K` | Focus task search. |
| `N` or `C` | Open the create-task modal. |
| `D` | Navigate to Dashboard. |
| `B` | Navigate to the board. |
| `Esc` | Close the topmost modal; with no modal open, clear search and blur search if focused. |

Escape remains active in open modals. Inside rich text editing, use the editor's own Escape behavior first where applicable.

## Notifications

Success and validation messages appear as toasts and dismiss automatically after three seconds. Some messages can be closed sooner using their close button.
