import { redirect } from "next/navigation";

/**
 * `/` lands on the dashboard now — the Kanban board moved to `/board`
 * (FILE 8 of the Phase 4 migration).
 */
export default function Home() {
  redirect("/dashboard");
}
