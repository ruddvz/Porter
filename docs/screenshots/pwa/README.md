# PWA QA screenshots

| File | Viewport | Route |
|------|----------|-------|
| `home-chromium-1280.png` | 1280×720 | `/` |
| `login-iphone-se-375.png` | 375×667 | `/auth/login` |
| `offline-iphone-se-375.png` | 375×667 | `/offline` |

Regenerate:

```bash
npm run build && npm run start
PLAYWRIGHT_SKIP_WEBSERVER=1 npm run screenshots:pwa
```

For production sign-off, add physical iPhone Safari + installed PWA captures per `docs/QA_IOS_PWA.md`.
