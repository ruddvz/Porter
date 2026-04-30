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
          bg: "#0A0F0D",
          surface: "#111A14",
          green: "#25D366",
          orange: "#FF6B35",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        display: ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
