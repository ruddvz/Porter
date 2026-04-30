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
        sans: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        display: ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      spacing: {
        "space-1": "4px",
        "space-2": "8px",
        "space-3": "12px",
        "space-4": "16px",
        "space-5": "20px",
        "space-6": "24px",
        "space-8": "32px",
        "space-10": "40px",
        "space-12": "48px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        raised: "var(--shadow-raised)",
        modal: "var(--shadow-modal)",
        glow: "var(--shadow-glow)",
      },
      transitionDuration: {
        porter: "250ms",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "porter-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "toast-out": {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
        },
      },
      animation: {
        "toast-in": "toast-in 0.25s var(--spring, cubic-bezier(0.34,1.56,0.64,1)) forwards",
        "toast-out": "toast-out 0.2s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
