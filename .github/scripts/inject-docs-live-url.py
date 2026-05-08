#!/usr/bin/env python3
"""Replace INJECT_LIVE_APP markers in docs/index.html when PORTER_LIVE_URL is set."""
import os
import pathlib
import re

url = (os.environ.get("PORTER_LIVE_URL") or "").strip().rstrip("/")
path = pathlib.Path("docs/index.html")
text = path.read_text(encoding="utf-8")
pattern = re.compile(
    r"<!-- INJECT_LIVE_APP_START -->.*?<!-- INJECT_LIVE_APP_END -->",
    re.DOTALL,
)
if url:
    inner = (
        f'<a class="btn" href="{url}">Open live app</a>'
    )
    replacement = f"<!-- INJECT_LIVE_APP_START -->\n          {inner}\n          <!-- INJECT_LIVE_APP_END -->"
else:
    replacement = (
        "<!-- INJECT_LIVE_APP_START -->\n"
        "          <!-- INJECT_LIVE_APP_END -->"
    )
text = pattern.sub(replacement, text)
path.write_text(text, encoding="utf-8")
