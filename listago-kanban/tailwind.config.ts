import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 loads this file through the `@config` directive in
 * `src/app/globals.css` (v3-style JavaScript config compatibility).
 * Source detection is automatic in v4, so no `content` array is needed.
 */
const config: Config = {
  theme: {
    extend: {
      colors: {
        /** Glassmorphism surface colors. */
        glass: {
          DEFAULT: "rgba(255,255,255,0.08)",
          hover: "rgba(255,255,255,0.12)",
        },
        /** Priority badge colors (urgent > high > medium > low). */
        priority: {
          low: "#22c55e",
          medium: "#eab308",
          high: "#f97316",
          urgent: "#ef4444",
        },
        /** Primary brand accents. */
        accent: {
          indigo: "#6366f1",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        /** Inter is injected as a CSS variable by next/font (see layout.tsx). */
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        /** Gentle pulsing used by overdue task indicators. */
        "overdue-pulse": "overdue-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        /** Modal overlay fade-in. */
        "fade-in": "fade-in 150ms ease-out",
        /** Modal panel entrance. */
        "modal-in": "modal-in 200ms ease-out",
      },
      keyframes: {
        "overdue-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "modal-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
