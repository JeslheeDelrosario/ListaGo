import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { AppShell } from "@/components/layout/AppShell";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ListaGo Kanban",
    template: "%s | ListaGo Kanban",
  },
  description:
    "A glassmorphism Kanban board for managing tasks across To Do, In Progress, Review and Done — migrated from the original vanilla JS ListaGo app.",
  // Favicon set migrated from the original vanilla JS app.
  // src/app/favicon.ico is served automatically; the rest live in /public.
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-screen font-sans antialiased">
        <AppShell>{children}</AppShell>
        {/* Global toast notifications — dark glass, bottom-right. */}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={3000}
          toastOptions={{
            style: {
              background: "rgba(26, 26, 46, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(20px)",
            },
          }}
        />
      </body>
    </html>
  );
}
