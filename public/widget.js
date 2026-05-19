/**
 * Porter embeddable store widget (Phase 3–4).
 * Usage:
 * <script src="https://your-app.com/widget.js" data-store="store-slug" data-mode="catalog"></script>
 * Modes: button | catalog | featured | search
 */
(function () {
  const script = document.currentScript;
  if (!script) return;

  const storeSlug = script.getAttribute("data-store");
  const mode = script.getAttribute("data-mode") || "button";
  const containerId = script.getAttribute("data-container");
  const baseUrl = (script.getAttribute("data-base") || script.src.replace(/\/widget\.js.*$/, "")).replace(/\/$/, "");

  if (!storeSlug) {
    console.error("[Porter widget] data-store is required");
    return;
  }

  const mount =
    (containerId && document.getElementById(containerId)) ||
    script.parentElement ||
    document.body;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function styles(theme) {
    return `
      .porter-w{font-family:system-ui,sans-serif;color:${theme.text};max-width:100%}
      .porter-w a.porter-btn{display:inline-block;padding:12px 24px;background:${theme.primary};color:#fff;border-radius:8px;text-decoration:none;font-weight:600}
      .porter-w .porter-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-top:12px}
      .porter-w .porter-card{border:1px solid #EADFCE;border-radius:12px;padding:12px;background:#fff}
      .porter-w .porter-price{color:${theme.primary};font-weight:600}
      .porter-w .porter-muted{color:#667085;font-size:12px}
      .porter-w input{width:100%;padding:8px 12px;border:1px solid #EADFCE;border-radius:8px;margin-bottom:8px}
    `;
  }

  async function fetchJson(path) {
    const res = await fetch(baseUrl + path);
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error?.message || "Porter API error");
    return json.data;
  }

  async function render() {
    const config = await fetchJson("/api/widget/" + encodeURIComponent(storeSlug) + "/config");
    const theme = config.theme || { primary: "#0F7A3A", accent: "#F26B00", text: "#111827" };
    const root = el("div", "porter-w");
    const styleTag = document.createElement("style");
    styleTag.textContent = styles(theme);
    root.appendChild(styleTag);

    if (mode === "button") {
      const a = el("a", "porter-btn", "Order Online");
      a.href = config.storeUrl;
      a.target = "_blank";
      a.rel = "noopener";
      root.appendChild(a);
      mount.appendChild(root);
      return;
    }

    const products = await fetchJson("/api/widget/" + encodeURIComponent(storeSlug) + "/products?limit=24");

    if (mode === "search") {
      const input = el("input");
      input.placeholder = "Search products…";
      root.appendChild(input);
      const grid = el("div", "porter-grid");
      root.appendChild(grid);
      function draw(list) {
        grid.innerHTML = "";
        list.forEach(function (p) {
          const card = el("div", "porter-card");
          card.appendChild(el("div", null, p.name));
          card.appendChild(el("div", "porter-price", "₹" + Math.round(Number(p.price))));
          const stock = p.stock_quantity ?? 0;
          card.appendChild(el("div", "porter-muted", stock > 0 ? stock + " available" : "Sold out"));
          const link = el("a", "porter-btn", "Order");
          link.href = config.storeUrl;
          link.target = "_blank";
          link.style.fontSize = "12px";
          link.style.padding = "6px 12px";
          link.style.marginTop = "8px";
          card.appendChild(link);
          grid.appendChild(card);
        });
      }
      draw(products);
      input.addEventListener("input", function () {
        const q = input.value.toLowerCase();
        draw(products.filter(function (p) {
          return !q || (p.name && p.name.toLowerCase().indexOf(q) >= 0);
        }));
      });
      mount.appendChild(root);
      return;
    }

    const grid = el("div", "porter-grid");
    const list = mode === "featured" ? products.slice(0, 6) : products;
    list.forEach(function (p) {
      const card = el("div", "porter-card");
      card.appendChild(el("div", null, p.name));
      card.appendChild(el("div", "porter-price", "₹" + Math.round(Number(p.price))));
      const sq = p.stock_quantity ?? 0;
      card.appendChild(el("div", "porter-muted", sq > 0 ? "In stock" : "Sold out"));
      grid.appendChild(card);
    });
    const footer = el("a", "porter-btn", "View full store");
    footer.href = config.storeUrl;
    footer.target = "_blank";
    footer.style.marginTop = "12px";
    root.appendChild(grid);
    root.appendChild(footer);
    mount.appendChild(root);
  }

  render().catch(function (e) {
    console.error("[Porter widget]", e);
    mount.appendChild(el("p", null, "Could not load Porter catalog."));
  });
})();
