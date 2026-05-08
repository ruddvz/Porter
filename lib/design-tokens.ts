/**
 * Porter design tokens — mirrors CSS variables in `app/globals.css` and Tailwind `porter.*`.
 */

export const porterColors = {
  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    400: "#4ade80",
    500: "#25D366",
    600: "#16a34a",
    700: "#128C7E",
    900: "#14532d",
  },
  orange: {
    400: "#fb923c",
    500: "#FF6B35",
    600: "#ea580c",
  },
  bg: {
    base: "#0a0a0a",
    surface: "#111111",
    raised: "#1a1a1a",
    border: "#2a2a2a",
  },
  text: {
    primary: "#f5f5f5",
    secondary: "#a0a0a0",
    muted: "#5a5a5a",
  },
  status: {
    paid: "#25D366",
    unpaid: "#FF6B35",
    cod: "#F59E0B",
    dispatched: "#3b82f6",
    delivered: "#A3E635",
    cancelled: "#F87171",
  },
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const shadows = {
  card: "var(--shadow-card)",
  raised: "var(--shadow-raised)",
  modal: "var(--shadow-modal)",
  glow: "var(--shadow-glow)",
} as const;

export const motion = {
  transitionFast: "150ms ease",
  transitionBase: "250ms ease",
  transitionSlow: "400ms cubic-bezier(0.16, 1, 0.3, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const fonts = {
  display: "var(--font-display), DM Mono, monospace",
  body: "var(--font-body), Geist, sans-serif",
  mono: "var(--font-display), DM Mono, monospace",
  arabic: "var(--font-arabic), Noto Naskh Arabic, serif",
} as const;
