# ListaGo Kanban

A polished task-management app migrated from the original vanilla JavaScript ListaGo project. The current project is at **Phase 5 — Polish, Animations, Keyboard Shortcuts & Rich Text**, building on the Kanban board, project management, dashboard, and task views from Phases 1–4.

![ListaGo Kanban board preview](docs/images/listago-board-preview-phase5.png)

## Features

- Drag-and-drop Kanban board with **To Do**, **In Progress**, **Review**, and **Done** columns.
- Task creation, editing, detail view, priority, due dates, completion, project assignment, and deletion.
- Rich-text descriptions powered by CKEditor 5, with a plain-text fallback if the editor cannot load.
- Projects with color and icon selection; deleting a project can move its tasks to Inbox or delete them.
- Dashboard statistics and charts, plus Today, Upcoming, and project-filtered views.
- Search, browser-local persistence, animated interactions, keyboard shortcuts, and three-second toast notifications.
- Dark glassmorphism UI with responsive navigation.

## Tech stack

Next.js App Router, React, TypeScript, Tailwind CSS, Zustand (persisted to localStorage), dnd-kit, Framer Motion, Recharts, CKEditor 5, Sonner, and date-fns.

## Requirements

- Node.js supported by the installed Next.js version (Node.js 20.9+ recommended).
- npm (the repository includes `package-lock.json`).

## Run locally

From this directory (`listago-kanban/`):

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`; use `/board` for the Kanban board.

## Common commands

```bash
npm run dev       # Development server
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript check
npm run build     # Production build
npm run start     # Serve the production build (run npm run build first)
```

## Documentation

- [Getting started](docs/GETTING_STARTED.md) — installation, scripts, routes, and local data.
- [User guide](docs/USER_GUIDE.md) — tasks, projects, dashboard, and keyboard shortcuts.
- [Architecture guide](docs/ARCHITECTURE.md) — app structure, state, persistence, and key interaction flows.
- [Documentation index](docs/README.md) — guide directory overview.

## Data and privacy

Tasks, projects, and preferences are stored in this browser's `localStorage`. This prototype does not include an account system or cloud synchronization. Clearing browser site data removes locally stored changes. Do not use the demo seed data as a backup for real work.

## Rich-text editor licensing

The editor is configured with CKEditor's `GPL` license key. Ensure your distribution complies with CKEditor 5's GPL licensing terms; proprietary use may require an appropriate commercial license. Review CKEditor's current license before shipping.

## Project status

**Phase 5 implementation complete; local checks pass.** The feature work is ready for review. Deployment, production hosting verification, and any remaining launch-specific configuration should be completed in the intended production environment before calling the app production-ready.
