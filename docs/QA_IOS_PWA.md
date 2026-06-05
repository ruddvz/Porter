# iOS PWA QA checklist

Automated checks cover layout overflow and route smoke tests (Playwright iPhone SE / iPhone 14 viewports). **Physical device QA** is still required before production sign-off.

## Automated (CI / local)

| Check | Command / test |
|-------|----------------|
| Public routes load | `e2e/routes.spec.ts` |
| Dashboard auth redirect | `e2e/routes.spec.ts` |
| No horizontal overflow (375px) | `e2e/routes.spec.ts` |
| 16px inputs (no zoom) | `globals.css` `font-size: 16px` on inputs |
| Safe-area tokens | `globals.css` `--safe-area-*` |

## Manual matrix (owner)

| Page | Safari | Installed PWA | Notes |
|------|--------|---------------|-------|
| `/dashboard` | ☐ | ☐ | Bottom nav, home indicator |
| `/dashboard/orders` | ☐ | ☐ | Live board / list |
| `/dashboard/inventory` | ☐ | ☐ | |
| `/dashboard/categories` | ☐ | ☐ | |
| `/dashboard/conversations` | ☐ | ☐ | |
| `/dashboard/analytics` | ☐ | ☐ | |
| `/dashboard/settings` | ☐ | ☐ | |
| `/onboarding` | ☐ | ☐ | |
| `/offline` | ☐ | ☐ | |
| `/store/[slug]` | ☐ | ☐ | Checkout |
| `/track/[slug]` | ☐ | ☐ | |

**Viewports:** 375 (SE), 390, 393, 430 (Pro Max), 768 (tablet).

**Modes:** light/dark, reduced motion, keyboard open, push denied/granted, poor network.

## Screenshots

Place device screenshots under `docs/screenshots/pwa/` with filenames like `dashboard-home-safari-375.png`.

## Install / SW / push

- `PWAInstallBanner` / `InstallPrompt` — dismiss persistence
- `PWAUpdateBanner` — service worker update (`public/sw.js`)
- `PushPrompt` — permission timing and denied copy
