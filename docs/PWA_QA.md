# PWA QA (automated + manual)

## Automated

| Check | Location |
|-------|----------|
| Route smoke (30 tests) | `e2e/routes.spec.ts` |
| Accessibility (non-contrast rules) | `e2e/a11y.spec.ts` |
| iPhone viewports | Playwright projects `iphone-se`, `iphone-14` |
| Safe-area CSS | `app/globals.css` |
| Service worker | `public/sw.js`, `PWAUpdateBanner` |

Generate reference screenshots:

```bash
npm run build
npm run start &
PLAYWRIGHT_SKIP_WEBSERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run screenshots:pwa
```

Output: `docs/screenshots/pwa/*.png`

## Manual sign-off

Use `docs/QA_IOS_PWA.md` on a physical iPhone (Safari + installed PWA) before major releases.
