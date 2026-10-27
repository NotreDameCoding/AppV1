(function () {
  const h = NDC.h, G = NDC.game;

  function confirmBuy(slot, g, stats, done) {
    const scrim = h("div", { class: "scrim", onclick: (e) => { if (e.target === scrim) scrim.remove(); } },
      h("div", { class: "modal px", role: "dialog", "aria-modal": "true" },
        h("h3", null, g.name),
        h("p", { class: "muted", style: { margin: "0.7rem 0 1.4rem" } }, `${g.feel}. Costs ${g.price} coins. You have ${stats.coins}.`),
        h("div", { class: "actions" },
          h("button", { class: "btn primary block", type: "button", onclick: () => { scrim.remove(); if (NDC.store.buy(slot, g.id)) done(); } }, `Buy for ${g.price}`),
          h("button", { class: "btn block", type: "button", onclick: () => scrim.remove() }, "Cancel"))));
    document.body.append(scrim);
  }

  function statLine(slot, g) {
    const s = g.stats;
    if (slot === "weapon") return `${s.dmg} damage`;
    if (slot === "shield") return `Blocks ${Math.round(s.block * 100)}%`;
    if (slot === "helm") return s.hp ? `+${s.hp} health` : "";
    if (slot === "armor") return s.def ? `${Math.round(s.def * 100)}% less damage` : "";
    if (slot === "cape") return s.speed ? `+${Math.round(s.speed * 100)}% speed` : "";
    return "";
  }

  function wardrobe(wrap) {
    const preview = h("div", { class: "acct-knight px" });
    const slots = h("div", { class: "slots" });
    function draw() {
      const state = NDC.store.get(), stats = NDC.store.stats();
      const own = G.owned(state), cur = NDC.store.equipped();
      NDC.clear(preview); preview.append(NDC.knight.node(cur));
      NDC.clear(slots);
      G.SLOTS.forEach((slot) => {
        const row = h("div", { class: "gear-row" });
        G.gear[slot.id].forEach((g) => {
          const has = (own[slot.id] || []).includes(g.id);
          const on = cur[slot.id] === g.id;
          const can = stats.coins >= g.price;
          const b = h("button", { class: "gear px" + (has ? "" : " locked"), type: "button", "aria-pressed": String(on), title: g.name,
            onclick: () => {
              if (has) { NDC.store.update((s) => { s.equipped = Object.assign({}, s.equipped, { [slot.id]: g.id }); }); draw(); return; }
              if (!can) { NDC.toast("Not enough coins", `${g.name} costs ${g.price}. You have ${stats.coins}.`); return; }
              confirmBuy(slot.id, g, stats, () => { draw(); NDC.bus.emit("progress", NDC.store.stats()); });
            } },
            slot.id === "armor" ? h("span", { style: { width: "54px", height: "54px", display: "block" } }, NDC.knight.icon("armor", g.id)) : NDC.knight.icon(slot.id, g.id),
            h("b", null, g.name),
            h("span", { class: "req" }, has ? (on ? "Equipped" : "Owned") : `${g.price} coins`),
            h("span", { class: "req" }, [g.feel, statLine(slot.id, g)].filter(Boolean).join(" \u00b7 ")));
          row.append(b);
        });
        slots.append(h("div", null, h("div", { class: "slot-title" }, h("span", null, slot.label)), row));
      });
    }
    draw();
    wrap.append(h("div", { style: { flex: "0 0 210px" } }, preview), h("div", { style: { flex: "1 1 420px", minWidth: 0 } }, slots));
  }

  function earnCard(stats) {
    const row = (l, v) => h("div", { class: "statline" }, h("span", null, l), h("b", { class: "pixel" }, v));
    return h("div", null,
      G.isOfficer() ? h("p", { style: { color: "var(--gold)", marginBottom: "0.6rem" } }, "Officer account: every piece of gear is unlocked.") : null,
      row("Coins", stats.coins),
      row("Next level in", `${stats.levelSpan - stats.levelInto} XP`),
      h("p", { class: "muted", style: { marginTop: "0.8rem", fontSize: "0.92rem", lineHeight: 1.45 } },
        `Reaching level ${stats.level + 1} pays ${G.levelCoins(stats.level + 1)} coins. Every lesson you finish drops a few more, and flawless ones drop the most.`));
  }

  NDC.pages.knight = function () {
    const stats = NDC.store.stats();
    const wrap = h("div", { class: "row", style: { alignItems: "flex-start", gap: "1.6rem", flexWrap: "wrap" } });
    wardrobe(wrap);
    const card = (cls, title, content) => h("section", { class: "card px " + cls }, h("h2", null, title), content);
    return h("div", { class: "page" }, h("div", { class: "wrap" },
      h("div", { class: "page-head" }, h("h1", null, "Knight"),
        h("p", null, `Level ${stats.level} ${G.title(stats.level)} \u00b7 ${stats.streak} day streak \u00b7 ${stats.coins} coins`)),
      h("div", { class: "acct-grid" },
        card("c12", "Wardrobe", wrap),
        card("c12", "Earning coins", earnCard(stats)))));
  };
})();
