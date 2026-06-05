import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        porter: {
          green: {
            50: "#f0f9f2",
            100: "#e7f6eb",
            400: "#25d366",
            500: "var(--po-primary)",
            600: "var(--po-primary-hover)",
            700: "var(--po-primary-pressed)",
            900: "#07592a",
          },
          orange: {
            400: "#fb923c",
            500: "var(--po-accent)",
            600: "var(--po-accent-hover)",
          },
          bg: {
            base: "var(--po-bg)",
            surface: "var(--po-surface)",
            raised: "var(--po-surface-raised)",
            border: "var(--po-line)",
          },
          text: {
            primary: "var(--po-text)",
            secondary: "var(--po-text-soft)",
            muted: "var(--po-muted)",
          },
          status: {
            paid: "var(--po-success)",
            unpaid: "var(--po-accent)",
            cod: "var(--po-warning)",
            dispatched: "var(--po-info)",
            delivered: "var(--po-success)",
            cancelled: "var(--po-danger)",
          },
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          "Inter",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          "Inter",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        po: "var(--po-radius-md)",
        "po-lg": "var(--po-radius-lg)",
        "po-xl": "var(--po-radius-xl)",
        pill: "var(--po-radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        raised: "var(--shadow-raised)",
        modal: "var(--shadow-modal)",
        glow: "var(--shadow-glow)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "400ms",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "porter-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "porter-pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
        "porter-slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "porter-badge-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "porter-shimmer": "porter-shimmer 1.4s ease-in-out infinite",
        "porter-pulse-dot": "porter-pulse-dot 1.2s ease-in-out infinite",
        "porter-slide-in-right": "porter-slide-in-right 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "porter-badge-pulse": "porter-badge-pulse 0.6s ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
