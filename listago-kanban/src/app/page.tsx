import { KanbanBoard } from "@/components/kanban/KanbanBoard";

/**
 * Main Kanban board page.
 * Server component: the app chrome (sidebar, header, modals) lives in
 * `AppShell`, mounted by the root layout — this page is just the board.
 */
export default function Home() {
  return <KanbanBoard />;
}
