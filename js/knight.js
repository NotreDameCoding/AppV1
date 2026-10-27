/* The pixel knight: a 28x32 sprite built from shaded layers (a tin-can helm, wide pauldrons, a tower shield),
   so every piece of gear can be swapped. Each layer is a shape; light comes from the top left. */
(function () {
  const W = 28, H = 32;

  const ARMOR = {
    steel:  { a: "#9fb0d0", h: "#d3def5", b: "#6a7899" },
    cobalt: { a: "#4f7cf0", h: "#9db9ff", b: "#2e4ab0" },
    gold:   { a: "#e5b04a", h: "#ffe19a", b: "#a9761f" },
    crimson:{ a: "#d65a5f", h: "#ff9ea0", b: "#942e3a" },
    emerald:{ a: "#3fbf8f", h: "#8cf0c4", b: "#1f7d5e" },
    obsidian:{ a: "#4b5070", h: "#8088b0", b: "#2a2e48" },
  };
  const SHIELDS = {
    oak:      { m: "#9a6a37", n: "#f4b942" },
    cobalt:   { m: "#3f66d8", n: "#f4f1e6" },
    crimson:  { m: "#c9454f", n: "#f4b942" },
    starlight:{ m: "#1b2146", n: "#f4b942" },
  };
  const WEAPONS = {
    wood:  { shape: "sword", w: "#b88646", d: "#6a4630" },
    steel: { shape: "sword", w: "#dfe6f7", d: "#6a4630" },
    flame: { shape: "sword", w: "#ff8a3d", d: "#6a4630" },
    spark: { shape: "sword", w: "#6ef0e0", d: "#6a4630", big: true },
  };
  const CAPES = {
    none:  null,
    red:   { c: "#c9454f", C: "#8f2c36" },
    royal: { c: "#2a2a36", C: "#14141c" },
    gold:  { c: "#f4b942", C: "#b67f1d" },
  };
  const OUT = "#0a0c16", GOLD = "#f4b942", DARK = "#16182b", SKIN = "#f1c9a1", BROWN = "#5a4636";

  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16));
  const hexOf = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const tint = (hex, f) => { const c = rgb(hex); return f >= 0 ? hexOf(c[0] + (255 - c[0]) * f, c[1] + (255 - c[1]) * f, c[2] + (255 - c[2]) * f) : hexOf(c[0] * (1 + f), c[1] * (1 + f), c[2] * (1 + f)); };

  /* a layer is a set of cells plus a colour; shapes are added with rect() and ell(), mirrored left to right when asked */
  function Layer(c, o) { this.m = new Set(); this.c = c; this.hi = (o && o.hi) || null; this.sh = (o && o.sh) || null; this.flat = !!(o && o.flat); }
  const key = (x, y) => y * 64 + x;
  function add(L, x, y, mir) { if (x >= 0 && x < W && y >= 0 && y < H) L.m.add(key(x, y)); if (mir && W - 1 - x >= 0 && W - 1 - x < W && y >= 0 && y < H) L.m.add(key(W - 1 - x, y)); }
  function rect(L, x, y, w, h, mir) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) add(L, i, j, mir); return L; }
  function ell(L, cx, cy, rx, ry, mir) { for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const dx = (i + 0.5 - cx) / rx, dy = (j + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) add(L, i, j, mir); } return L; }
  const pts = (L, list) => { list.forEach(([x, y]) => add(L, x, y)); return L; };

  function build(eq) {
    eq = eq || {};
    const A = ARMOR[eq.armor || "steel"] || ARMOR.steel;
    const layers = [];
    const L = (c, o) => { const l = new Layer(c, o); layers.push(l); return l; };
    const armor = (c) => L(c || A.a, { hi: A.h, sh: A.b });

    // cape hangs behind the whole body
    const cape = CAPES[eq.cape || "none"];
    if (cape) {
      const c = L(cape.c, { hi: tint(cape.c, 0.25), sh: cape.C });
      // wide, flared cape that ends in a row of sharp triangles
      rect(c, 5, 15, 18, 12);
      for (const cx of [7.25, 11.75, 16.25, 20.75]) {
        for (let y = 27; y < 32; y++) {
          const hw = 2.25 * (1 - (y - 27) / 5);
          for (let x = 5; x < 23; x++) if (Math.abs(x + 0.5 - cx) <= hw + 0.3) add(c, x, y);
        }
      }
    }

    // legs and boots
    rect(armor(), 9, 24, 4, 6, true);
    rect(L("#6a4a2a"), 8, 29, 5, 2, true);
    // torso, belt and pauldrons
    ell(armor(), 13.5, 20, 9.5, 5.5);
    rect(L(GOLD, { flat: true }), 6, 23, 16, 1);
    ell(armor(tint(A.a, 0.08)), 5.5, 18, 3.8, 3.6); ell(armor(tint(A.a, 0.08)), 22.5, 18, 3.8, 3.6);
    rect(L(tint(A.a, -0.1)), 12, 17, 4, 2);

    // head, by helm (the simple original faces and helms, on the wide body)
    const helm = eq.helm || "squire";
    const hm = (c) => (c ? L(c, { hi: tint(c, 0.35), sh: tint(c, -0.35) }) : armor());
    if (helm === "squire") {
      ell(L(SKIN), 13.5, 11, 5.6, 5.6);
      rect(L("#6a4630", { flat: true }), 9, 6, 10, 2);
      rect(L("#4f7cf0"), 8, 4, 12, 3); rect(L("#4f7cf0"), 8, 7, 2, 2); rect(L("#4f7cf0"), 18, 7, 2, 2);
      pts(L(DARK, { flat: true }), [[11, 11], [11, 12], [16, 11], [16, 12]]);
      rect(L("#d6a47e", { flat: true }), 12, 15, 4, 1);
    } else {
      const base = A.a, hi = A.h, sh = A.b;
      const hl = L(base, { hi, sh });
      rect(hl, 7, 4, 14, 12); rect(hl, 8, 3, 12, 1);
      rect(L(DARK, { flat: true }), 8, 9, 12, 2);
      if (helm === "iron") rect(L(sh, { flat: true }), 8, 13, 12, 1);
      if (helm === "plumed") { ell(L("#e5484d", { hi: "#ff9ea0", sh: "#942e3a" }), 13.5, 3, 3.4, 3); rect(layers[layers.length - 1], 12, 4, 4, 3); }
      if (helm === "horned") {
        const hn = L("#efe6cc", { hi: "#fffaf0", sh: "#b8ad92" });
        rect(hn, 5, 3, 2, 6); rect(hn, 6, 2, 2, 3); rect(hn, 21, 3, 2, 6); rect(hn, 20, 2, 2, 3); rect(hn, 4, 1, 2, 3); rect(hn, 22, 1, 2, 3);
      }
      if (helm === "crowned") {
        const gd = L(GOLD, { hi: "#ffe19a", sh: "#a9761f" });
        rect(gd, 7, 2, 14, 2); rect(gd, 7, 0, 2, 2); rect(gd, 13, 0, 2, 2); rect(gd, 19, 0, 2, 2);
      }
    }

    // shield on the left arm, sword or staff on the right
    if (eq.shield !== "none") {
      const s = SHIELDS[eq.shield || "oak"] || SHIELDS.oak;
      // wide, thick kite shield: coloured body with a light rim
      const rows = [[1, 13], [0, 14], [0, 14], [0, 14], [0, 14], [0, 14], [0, 14], [0, 14], [0, 14], [1, 13], [2, 12], [3, 11], [4, 10], [5, 9], [6, 8]];
      const rim = L(s.n, { hi: tint(s.n, 0.35), sh: tint(s.n, -0.3) }), body = L(s.m);
      rows.forEach(([a, b], i) => {
        const y = 14 + i;
        for (let x = a; x <= b; x++) add(rim, x, y);
        if (i > 0 && i < rows.length - 1) for (let x = a + 1; x <= b - 1; x++) add(body, x, y);
      });
    }
    if (eq.weapon !== "none") {
      const w = WEAPONS[eq.weapon || "wood"] || WEAPONS.wood;
      rect(armor(tint(A.a, 0.05)), 21, 21, 4, 4);
      const id = eq.weapon || "wood", DK = "#6a4630";
      if (id === "spark") {
        // storm blade: broad cyan blade with a lightning bolt and a winged guard
        rect(L(w.w), 23, 3, 4, 18); pts(L(w.w), [[24, 2], [25, 2], [24, 1]]);
        const bolt = L("#ffffff", { flat: true });
        pts(bolt, [[25, 5], [24, 7], [25, 8], [24, 10], [25, 11], [24, 13], [25, 14], [24, 16]]);
        pts(L("#1b8f86", { flat: true }), [[26, 4], [26, 6], [26, 9], [26, 12], [26, 15], [26, 18]]);
        const g = L(GOLD); rect(g, 20, 20, 8, 2); pts(g, [[20, 19], [27, 19], [19, 19], [20, 18]]);
        pts(L("#2ee6c2", { flat: true }), [[24, 21], [25, 21]]);
        rect(L(DK, { flat: true }), 24, 22, 2, 3); rect(L(GOLD, { flat: true }), 24, 25, 2, 2);
      } else if (id === "flame") {
        // flame blade: orange blade with a rippling edge, a bright core and a tongue of fire at the tip
        rect(L(w.w), 24, 6, 3, 15);
        const fl = L("#ff5a2a");
        pts(fl, [[23, 8], [27, 10], [23, 12], [27, 14], [23, 16], [27, 18], [24, 5], [26, 5], [25, 4], [25, 3], [26, 4]]);
        rect(L("#ffe27a", { flat: true }), 25, 8, 1, 11);
        const g = L("#c9454f"); rect(g, 21, 21, 7, 1); pts(g, [[21, 20], [27, 20]]);
        pts(L(GOLD, { flat: true }), [[24, 21], [25, 21], [26, 21]]);
        rect(L(DK, { flat: true }), 25, 22, 1, 3); rect(L("#c9454f", { flat: true }), 24, 25, 3, 1);
      } else if (id === "steel") {
        // steel sword: long blade with a fuller, a tapered point, a gold guard and a gem
        rect(L(w.w), 24, 5, 3, 16); pts(L(w.w), [[25, 4], [25, 3]]);
        rect(L("#9aa8c6", { flat: true }), 25, 7, 1, 12);
        const g = L(GOLD); rect(g, 22, 21, 7, 1); pts(g, [[22, 20], [28, 20]]);
        pts(L("#4f7cf0", { flat: true }), [[25, 21]]);
        rect(L(DK, { flat: true }), 25, 22, 1, 3); rect(L(GOLD, { flat: true }), 24, 25, 3, 1);
      } else {
        // practice sword: plain wood, simple guard
        rect(L(w.w), 24, 8, 2, 13); pts(L(w.w), [[24, 7]]);
        rect(L("#8a5a2f", { flat: true }), 22, 21, 6, 1);
        rect(L(DK, { flat: true }), 24, 22, 2, 3); rect(L("#8a5a2f", { flat: true }), 24, 25, 2, 1);
      }
    }
    return layers;
  }

  function compose(eq) {
    const grid = Array.from({ length: H }, () => Array(W).fill(null));
    for (const l of build(eq)) {
      const base = l.c, hi = l.hi || tint(base, 0.32), sh = l.sh || tint(base, -0.34), has = (x, y) => l.m.has(key(x, y));
      for (const k of l.m) {
        const x = k % 64, y = (k - x) / 64;
        let c = base;
        if (!l.flat) {
          if (!has(x - 1, y) || !has(x, y - 1)) c = hi;
          if (!has(x + 1, y) || !has(x, y + 1)) c = sh;
          if (!has(x, y - 1) && !has(x, y + 1)) c = base;
        }
        grid[y][x] = c;
      }
    }
    const filled = (x, y) => x >= 0 && y >= 0 && x < W && y < H && grid[y][x];
    const edge = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!grid[y][x] && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1))) edge.push([x, y]);
    edge.forEach(([x, y]) => { grid[y][x] = OUT; });
    return grid;
  }

  function toSvg(grid, opts) {
    opts = opts || {};
    const crop = opts.crop || [0, 0, W, H];
    let rects = "";
    for (let y = 0; y < H; y++) {
      let x = 0;
      while (x < W) {
        const c = grid[y][x];
        if (!c) { x++; continue; }
        let x2 = x + 1;
        while (x2 < W && grid[y][x2] === c) x2++;
        rects += `<rect x="${x}" y="${y}" width="${x2 - x}" height="1" fill="${c}"/>`;
        x = x2;
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${crop.join(" ")}" shape-rendering="crispEdges" role="img" aria-label="${opts.label || "Pixel knight"}">${rects}</svg>`;
  }

  NDC.knight = {
    W, H, ARMOR, SHIELDS, WEAPONS, CAPES,
    svg(eq, opts) { return toSvg(compose(eq), opts); },
    node(eq, opts) { return NDC.svg(this.svg(eq, opts)); },
    head(eq) { return NDC.svg(toSvg(compose(eq), { crop: [5, 0, 18, 17], label: "Knight" })); },
    /* gear icons: the piece alone on a small canvas */
    icon(slot, k) {
      if (slot === "helm") return NDC.svg(toSvg(compose({ helm: k, armor: "steel", shield: "none", weapon: "none", cape: "none" }), { crop: [4, 0, 20, 18], label: k }));
      if (slot === "shield") return NDC.svg(toSvg(compose({ shield: k, helm: "squire", weapon: "none" }), { crop: [0, 13, 15, 17], label: k }));
      if (slot === "weapon") return NDC.svg(toSvg(compose({ weapon: k, shield: "none" }), { crop: [20, 2, 8, 26], label: k }));
      if (slot === "cape") return NDC.svg(toSvg(compose({ cape: k, shield: "none", weapon: "none" }), { crop: [2, 13, 24, 19], label: k }));
      return NDC.svg(toSvg(compose({ armor: k, shield: "none", weapon: "none", helm: "squire" }), { crop: [1, 12, 26, 19], label: k }));
    },
    swatch(k) { return ARMOR[k].a; },
  };
})();
