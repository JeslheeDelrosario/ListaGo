# Getting started

## Prerequisites

- Node.js 20.9 or newer is recommended for the installed Next.js version.
- npm, with the checked-in `package-lock.json`.

Check versions before starting:

```bash
node --version
npm --version
```

## Install and run

Run commands from the `listago-kanban/` project directory:

```bash
npm ci
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The home route redirects to `/dashboard`.

## Useful scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server with hot reload. |
| `npm run lint` | Run ESLint. |
| `npx tsc --noEmit` | Type-check the TypeScript project. |
| `npm run build` | Compile and statically generate the production app. |
| `npm run start` | Serve a completed production build. |

Before a production run:

```bash
npm run build
npm run start
```

## Routes

| Route | View |
| --- | --- |
| `/` | Redirects to `/dashboard`. |
| `/dashboard` | Summary statistics and activity charts. |
| `/board` | Four-column Kanban board. |
| `/today` | Tasks due today. |
| `/upcoming` | Tasks due soon. |
| `/projects/[id]` | Tasks filtered to a project. |

## Local data

Task and project stores use Zustand persistence with the browser's `localStorage`. Data is per-browser and per-origin; it is not shared across devices or users. To reset demo data, clear this site's local storage in your browser's developer tools. This permanently removes local changes.

## Troubleshooting

- If port 3000 is already in use, stop the process using it or set a different `PORT` when starting Next.js.
- If an install is inconsistent after changing branches or dependencies, run `npm ci` to restore the versions from the lockfile.
- CKEditor loads on demand in the browser. If it fails to initialize, the description field falls back to a plain textarea.
