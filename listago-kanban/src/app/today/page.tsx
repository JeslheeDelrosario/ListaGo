import type { Metadata } from "next";

import { BackToDashboard } from "@/components/dashboard/BackToDashboard";
import { TodayView } from "@/components/dashboard/TodayView";

export const metadata: Metadata = {
  title: "Today",
};

/**
 * `/today` — the Today quick view as a standalone page. The view scopes
 * itself to the project selected in the sidebar, so project filtering keeps
 * working here too.
 */
export default function TodayPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <BackToDashboard />
      <TodayView />
    </div>
  );
}
