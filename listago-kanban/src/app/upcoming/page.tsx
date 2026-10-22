import type { Metadata } from "next";

import { BackToDashboard } from "@/components/dashboard/BackToDashboard";
import { UpcomingView } from "@/components/dashboard/UpcomingView";

export const metadata: Metadata = {
  title: "Upcoming",
};

/**
 * `/upcoming` — the Upcoming quick view as a standalone page. The view
 * scopes itself to the project selected in the sidebar, so project
 * filtering keeps working here too.
 */
export default function UpcomingPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <BackToDashboard />
      <UpcomingView />
    </div>
  );
}
