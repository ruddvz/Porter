/**
 * Porter embeddable store widget (Phase 3–4).
 * Usage:
 * <script src="https://your-app.com/widget.js" data-store="store-slug" data-mode="cart"></script>
 * Modes: button | catalog | featured | search | cart
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
      .porter-w a.porter-btn{display:inline-block;padding:12px 24px;background:${theme.primary};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;border:none;cursor:pointer;font-size:14px}
      .porter-w button.porter-btn-sm{padding:6px 12px;font-size:12px;margin-top:8px}
      .porter-w .porter-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-top:12px}
      .porter-w .porter-card{border:1px solid #EADFCE;border-radius:12px;padding:12px;background:#fff}
      .porter-w .porter-price{color:${theme.primary};font-weight:600}
      .porter-w .porter-muted{color:#667085;font-size:12px}
      .porter-w input,.porter-w select,.porter-w textarea{width:100%;padding:8px 12px;border:1px solid #EADFCE;border-radius:8px;margin-bottom:8px;box-sizing:border-box;font:inherit}
      .porter-w .porter-cart-bar{display:flex;justify-content:space-between;align-items:center;padding:12px;background:#fff;border:1px solid #EADFCE;border-radius:12px;margin-top:12px}
      .porter-w .porter-checkout{border:1px solid #EADFCE;border-radius:12px;padding:16px;background:#fff;margin-top:12px}
      .porter-w .porter-err{color:#b42318;font-size:13px;margin-top:8px}
      .porter-w .porter-success{color:${theme.primary};font-weight:600;margin-top:12px}
      .porter-w .porter-row{display:flex;justify-content:space-between;gap:8px;font-size:14px;margin:4px 0}
    `;
  }

  async function fetchJson(path, opts) {
    const res = await fetch(baseUrl + path, opts);
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error?.message || "Porter API error");
    return json.data;
  }

  function renderProductCard(p, theme, onAdd) {
    const card = el("div", "porter-card");
    card.appendChild(el("div", null, p.name));
    card.appendChild(el("div", "porter-price", "₹" + Math.round(Number(p.price))));
    const sq = p.stock_quantity ?? 0;
    card.appendChild(el("div", "porter-muted", sq > 0 ? sq + " in stock" : "Sold out"));
    if (sq > 0 && onAdd) {
      const btn = el("button", "porter-btn porter-btn-sm", "Add");
      btn.style.background = theme.primary;
      btn.onclick = function () {
        onAdd(p);
      };
      card.appendChild(btn);
    }
    return card;
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

    const products = await fetchJson("/api/widget/" + encodeURIComponent(storeSlug) + "/products?limit=48");

    if (mode === "cart") {
      const cart = {};
      const grid = el("div", "porter-grid");
      const cartBar = el("div", "porter-cart-bar");
      const cartLabel = el("div", null, "Cart: 0 items · ₹0");
      const checkoutBtn = el("button", "porter-btn", "Checkout");
      checkoutBtn.style.padding = "8px 16px";
      checkoutBtn.style.fontSize = "13px";
      checkoutBtn.disabled = true;
      cartBar.appendChild(cartLabel);
      cartBar.appendChild(checkoutBtn);

      const checkoutPanel = el("div", "porter-checkout");
      checkoutPanel.style.display = "none";
      const nameInput = el("input");
      nameInput.placeholder = "Your name";
      const phoneInput = el("input");
      phoneInput.placeholder = "Phone (10 digits)";
      const areaInput = el("input");
      areaInput.placeholder = "Area / locality (optional)";
      const addrInput = el("textarea");
      addrInput.placeholder = "Delivery address (optional)";
      addrInput.rows = 2;
      const errEl = el("div", "porter-err");
      const placeBtn = el("button", "porter-btn", "Place order");
      placeBtn.style.width = "100%";
      placeBtn.style.marginTop = "8px";

      checkoutPanel.appendChild(el("div", null, "Checkout"));
      checkoutPanel.appendChild(nameInput);
      checkoutPanel.appendChild(phoneInput);
      if (config.deliveryEnabled !== false) {
        checkoutPanel.appendChild(areaInput);
        checkoutPanel.appendChild(addrInput);
      }
      checkoutPanel.appendChild(placeBtn);
      checkoutPanel.appendChild(errEl);

      const successEl = el("div", "porter-success");
      successEl.style.display = "none";

      function cartSummary() {
        let count = 0;
        let total = 0;
        Object.keys(cart).forEach(function (id) {
          const line = cart[id];
          count += line.qty;
          total += line.qty * Number(line.product.price);
        });
        return { count: count, total: total };
      }

      function refreshCartUi() {
        const s = cartSummary();
        cartLabel.textContent = "Cart: " + s.count + " items · ₹" + Math.round(s.total);
        checkoutBtn.disabled = s.count === 0;
        placeBtn.disabled = s.count === 0;
      }

      function addToCart(p) {
        if (!cart[p.id]) cart[p.id] = { product: p, qty: 0 };
        const max = p.stock_quantity ?? 99;
        if (cart[p.id].qty < max) cart[p.id].qty += 1;
        refreshCartUi();
      }

      products.forEach(function (p) {
        grid.appendChild(renderProductCard(p, theme, addToCart));
      });

      checkoutBtn.onclick = function () {
        const open = checkoutPanel.style.display !== "none";
        checkoutPanel.style.display = open ? "none" : "block";
        checkoutBtn.textContent = open ? "Checkout" : "Hide checkout";
      };

      placeBtn.onclick = async function () {
        errEl.textContent = "";
        const s = cartSummary();
        if (s.count === 0) return;
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        if (!name || !phone) {
          errEl.textContent = "Name and phone are required.";
          return;
        }
        placeBtn.disabled = true;
        placeBtn.textContent = "Placing…";
        try {
          const items = Object.keys(cart).map(function (id) {
            return { productId: id, quantity: cart[id].qty };
          });
          const result = await fetchJson("/api/public/stores/" + encodeURIComponent(storeSlug) + "/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerName: name,
              customerPhone: phone,
              fulfillmentType: config.pickupEnabled && !config.deliveryEnabled ? "pickup" : "delivery",
              deliveryArea: areaInput.value.trim() || undefined,
              deliveryAddress: addrInput.value.trim() || undefined,
              paymentMethod: config.codEnabled ? "cod" : "razorpay",
              items: items,
              orderSource: "widget",
            }),
          });
          Object.keys(cart).forEach(function (k) {
            delete cart[k];
          });
          refreshCartUi();
          checkoutPanel.style.display = "none";
          grid.style.display = "none";
          cartBar.style.display = "none";
          successEl.style.display = "block";
          successEl.textContent = "Order placed! ";
          if (result.trackUrl) {
            const link = el("a", null, "Track order");
            link.href = result.trackUrl;
            link.target = "_blank";
            link.style.color = theme.primary;
            successEl.appendChild(link);
          }
        } catch (e) {
          errEl.textContent = e.message || "Order failed";
        }
        placeBtn.disabled = false;
        placeBtn.textContent = "Place order";
      };

      root.appendChild(grid);
      root.appendChild(cartBar);
      root.appendChild(checkoutPanel);
      root.appendChild(successEl);
      mount.appendChild(root);
      return;
    }

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
        draw(
          products.filter(function (p) {
            return !q || (p.name && p.name.toLowerCase().indexOf(q) >= 0);
          }),
        );
      });
      mount.appendChild(root);
      return;
    }

    const grid = el("div", "porter-grid");
    const list = mode === "featured" ? products.slice(0, 6) : products;
    list.forEach(function (p) {
      grid.appendChild(renderProductCard(p, theme, null));
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
