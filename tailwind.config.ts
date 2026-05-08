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
            50: "#f0fdf4",
            100: "#dcfce7",
            400: "#4ade80",
            500: "#25D366",
            600: "#16a34a",
            700: "#128C47",
            900: "#14532d",
          },
          orange: {
            400: "#fb923c",
            500: "#FF6B35",
            600: "#ea580c",
          },
          bg: {
            base: "#0A0F0D",
            surface: "#111A14",
            raised: "#162019",
            border: "#1E2D22",
          },
          text: {
            primary: "#E8F5E9",
            secondary: "#A3B8A8",
            muted: "#5C7A63",
          },
          status: {
            paid: "#25D366",
            unpaid: "#FF6B35",
            cod: "#F59E0B",
            dispatched: "#60A5FA",
            delivered: "#A3E635",
            cancelled: "#F87171",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        mono: ["var(--font-dm-mono)", "var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
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
