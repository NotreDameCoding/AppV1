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
    spark: { shape: "staff", n: "#2ee6c2", d: "#8a5a2f" },
  };
  const CAPES = {
    none:  null,
    red:   { c: "#c9454f", C: "#8f2c36" },
    royal: { c: "#6f55d8", C: "#4a36a3" },
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
      rect(c, 6, 15, 16, 14); rect(c, 4, 18, 20, 12);
      for (let x = 4; x < 24; x += 3) rect(c, x, 30, 2, 1);
    }

    // legs and boots
    rect(armor(), 10, 24, 4, 5, true);
    rect(L("#6a4a2a"), 9, 28, 5, 2, true);
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
      const base = helm === "crowned" ? ARMOR.gold.a : A.a, hi = helm === "crowned" ? ARMOR.gold.h : A.h, sh = helm === "crowned" ? ARMOR.gold.b : A.b;
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
      ell(L(s.m), 5, 22, 5, 6.5);
      ell(L(s.n, { flat: true }), 5, 22, 2, 2);
    }
    if (eq.weapon !== "none") {
      const w = WEAPONS[eq.weapon || "wood"] || WEAPONS.wood;
      rect(armor(tint(A.a, 0.05)), 21, 21, 4, 4);
      if (w.shape === "staff") {
        rect(L(w.d, { flat: true }), 24, 7, 2, 24);
        ell(L(w.n), 25, 5, 2.6, 2.6); pts(L("#fff", { flat: true }), [[24, 4], [25, 4]]);
      } else {
        rect(L(w.w), 24, 7, 2, 14);
        rect(L(GOLD), 22, 21, 6, 1);
        rect(L("#6a4630", { flat: true }), 24, 22, 2, 3); rect(L(GOLD, { flat: true }), 24, 25, 2, 1);
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
      if (slot === "shield") return NDC.svg(toSvg(compose({ shield: k, helm: "squire", weapon: "none" }), { crop: [0, 11, 9, 20], label: k }));
      if (slot === "weapon") return NDC.svg(toSvg(compose({ weapon: k, shield: "none" }), { crop: [20, 2, 8, 26], label: k }));
      if (slot === "cape") return NDC.svg(toSvg(compose({ cape: k, shield: "none", weapon: "none" }), { crop: [2, 13, 24, 19], label: k }));
      return NDC.svg(toSvg(compose({ armor: k, shield: "none", weapon: "none", helm: "squire" }), { crop: [1, 12, 26, 19], label: k }));
    },
    swatch(k) { return ARMOR[k].a; },
  };
})();
