#!/usr/bin/env python3
"""Inject live-app state into docs/index.html when PORTER_LIVE_URL is set."""
import os
import pathlib
import re

url = (os.environ.get("PORTER_LIVE_URL") or "").strip().rstrip("/")
path = pathlib.Path("docs/index.html")
text = path.read_text(encoding="utf-8")

if url:
    hero = """<h1>Your real Porter app is ready.</h1>
          <p class="subtitle">
            WhatsApp-first ordering for local retailers. Seller dashboard, admin console, APIs, and tracking links are live.
          </p>"""
    primary = f'<a class="btn primary" href="{url}" target="_blank" rel="noopener">Open Porter Dashboard</a>'
    secondary = (
        '<a class="btn" href="https://github.com/ruddvz/Porter/blob/main/README.md#quick-start" '
        'target="_blank" rel="noopener">View setup docs</a>'
    )
    status = """<div class="status-card live">
            <h3>Live app connected</h3>
            <p>
              Seller dashboard, admin console, APIs, webhooks, tracking links, and storefront are served by your
              Vercel deployment.
            </p>
          </div>"""
else:
    hero = """<h1>Run Porter like an app.</h1>
          <p class="subtitle">
            Seller dashboard, orders, inventory, chats, tracking, and admin live in the Next.js app.
          </p>"""
    primary = (
        '<a class="btn primary" '
        'href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fruddvz%2FPorter&amp;project-name=porter" '
        'target="_blank" rel="noopener">Deploy real app on Vercel</a>'
    )
    secondary = (
        '<a class="btn" href="https://github.com/ruddvz/Porter/blob/main/README.md#quick-start" '
        'target="_blank" rel="noopener">Open setup checklist</a>'
    )
    status = """<div class="status-card preview">
            <h3>Preview page only</h3>
            <p>
              GitHub Pages can show this launcher, but dashboards, login, APIs, webhooks, checkout, and admin need the
              Next.js deployment.
            </p>
          </div>"""


def replace_block(name: str, inner: str) -> None:
    global text
    pattern = re.compile(
        rf"<!-- INJECT_{name}_START -->.*?<!-- INJECT_{name}_END -->",
        re.DOTALL,
    )
    text = pattern.sub(
        f"<!-- INJECT_{name}_START -->\n          {inner}\n          <!-- INJECT_{name}_END -->",
        text,
    )


replace_block("HERO", hero)
replace_block("PRIMARY_CTA", primary)
replace_block("SECONDARY_CTA", secondary)
replace_block("STATUS_CARD", status)

path.write_text(text, encoding="utf-8")
