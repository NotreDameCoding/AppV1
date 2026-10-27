(function () {
  const h = NDC.h, G = NDC.game;

  function wardrobe(state, stats) {
    const own = G.owned(stats);
    const eq = G.equippedFor(state, stats);
    const preview = h("div", { class: "acct-knight px" });
    const slots = h("div", { class: "slots" });
    function draw() {
      const cur = NDC.store.equipped();
      NDC.clear(preview); preview.append(NDC.knight.node(cur));
      NDC.clear(slots);
      G.SLOTS.forEach((slot) => {
        const row = h("div", { class: "gear-row" });
        G.gear[slot.id].forEach((g) => {
          const has = (own[slot.id] || []).includes(g.id);
          const on = cur[slot.id] === g.id;
          const need = g.req.n || 1, have = Math.min(need, g.req.have(stats));
          const b = h("button", { class: "gear px" + (has ? "" : " locked"), type: "button", "aria-pressed": String(on), "aria-disabled": has ? null : "true", title: has ? g.name : g.req.text,
            onclick: () => { if (!has) { NDC.toast(g.name + " is locked", g.req.text); return; } NDC.store.update((s) => { s.equipped = Object.assign({}, s.equipped, { [slot.id]: g.id }); }); draw(); } },
            slot.id === "armor" ? h("span", { style: { width: "54px", height: "54px", display: "block" } }, NDC.knight.icon("armor", g.id)) : NDC.knight.icon(slot.id, g.id),
            h("b", null, g.name),
            has ? (on ? h("span", { class: "req" }, "Equipped") : h("span", { class: "req" }, "Owned")) : h("span", { class: "req" }, g.req.text),
            !has && need > 1 ? h("span", { class: "prog" }, h("i", { style: { width: Math.round((have / need) * 100) + "%" } })) : null);
          row.append(b);
        });
        slots.append(h("div", null, h("div", { class: "slot-title" }, h("span", null, slot.label)), row));
      });
    }
    draw();
    return h("div", { class: "row", style: { alignItems: "flex-start", gap: "1.6rem", flexWrap: "wrap" } },
      h("div", { style: { flex: "0 0 210px" } }, preview),
      h("div", { style: { flex: "1 1 420px", minWidth: 0 } }, slots));
  }

  function nextUnlocks(stats) {
    const list = G.nextUnlocks(stats).slice(0, 3);
    if (!list.length) return h("p", { class: "muted" }, "You own everything. Nicely done.");
    return h("div", { class: "grid", style: { gap: "0.9rem" } }, list.map((u) => h("div", { class: "row", style: { flexWrap: "nowrap", gap: "0.9rem" } },
      h("div", { style: { width: "52px", flex: "none" } }, NDC.knight.icon(u.slot, u.gear.id)),
      h("div", { style: { flex: 1 } }, h("b", null, u.gear.name), h("p", { class: "muted", style: { fontSize: "0.9rem", lineHeight: 1.3 } }, u.gear.req.text + (u.need > 1 ? ` (${u.have}/${u.need})` : "")),
        h("div", { class: "bar px", style: { marginTop: "0.4rem", height: "10px" } }, h("i", { style: { width: Math.max(4, Math.round(u.ratio * 100)) + "%", top: "2px", bottom: "2px" } }))))));
  }


  NDC.pages.knight = function () {
    const state = NDC.store.get();
    const stats = NDC.store.stats();
    const card = (cls, title, content) => h("section", { class: "card px " + cls }, h("h2", null, title), content);
    return h("div", { class: "page" }, h("div", { class: "wrap" },
      h("div", { class: "page-head" }, h("h1", null, "Knight"),
        h("p", null, `Level ${stats.level} ${G.title(stats.level)} \u00b7 ${stats.streak} day streak`)),
      h("div", { class: "acct-grid" },
        card("c12", "Wardrobe", wardrobe(state, stats)),
        card("c12", "Next unlocks", nextUnlocks(stats)))));
  };
})();
