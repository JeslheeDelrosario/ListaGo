"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

/**
 * "Back to Dashboard" link shared by the standalone `/today` and
 * `/upcoming` routes.
 */
export function BackToDashboard() {
  return (
    <Link
      href="/dashboard"
      className="group inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white/90"
    >
      <FiArrowLeft
        size={15}
        aria-hidden
        className="transition-transform group-hover:-translate-x-0.5"
      />
      Back to Dashboard
    </Link>
  );
}
