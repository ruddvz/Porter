/**
 * Porter design tokens — mirrors Tailwind `porter.*` theme and CSS variables.
 * Use for programmatic access (charts, inline styles); prefer Tailwind in UI.
 */

export const porterColors = {
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
} as const;

export const spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space8: 32,
  space10: 40,
  space12: 48,
} as const;

export const shadows = {
  card: "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(37,211,102,0.08)",
  raised: "0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,211,102,0.12)",
  modal: "0 24px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(37,211,102,0.15)",
  glow: "0 0 24px rgba(37,211,102,0.2)",
} as const;

export const motion = {
  transitionFast: "150ms ease",
  transitionBase: "250ms ease",
  transitionSlow: "400ms cubic-bezier(0.16, 1, 0.3, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const designTokens = {
  colors: porterColors,
  spacing,
  shadows,
  motion,
} as const;
