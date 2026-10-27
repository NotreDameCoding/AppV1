/* The pixel knight. A 16x20 sprite built from layers, so gear can be swapped. */
(function () {
  const W = 16, H = 20;

  // Letters map to palette roles. "." is transparent. Rows are built from parts so widths stay exact.
  const d = (n) => ".".repeat(n);
  const BASE = [
    d(16),
    d(4) + "oooooooo" + d(4),
    d(3) + "o" + "dddddddd" + "o" + d(3),
    d(3) + "o" + "dssssssd" + "o" + d(3),
    d(3) + "o" + "sskssk" + "ss" + "o" + d(3),
    d(3) + "o" + "ssssssss" + "o" + d(3),
    d(4) + "o" + "ssssss" + "o" + d(4),
    d(4) + "o" + "aaaaaa" + "o" + d(4),
    d(2) + "ooo" + "aaaaaa" + "ooo" + d(2),
    d(1) + "o" + "ahaaaaaaaaba" + "o" + d(1),
    d(1) + "o" + "aaaaaaaaaaaa" + "o" + d(1),
    d(1) + "o" + "aaaggggggaaa" + "o" + d(1),
    d(2) + "o" + "aaaaaaaaaa" + "o" + d(2),
    d(2) + "o" + "aaabbbbaaa" + "o" + d(2),
    d(3) + "o" + "aaaaaaaa" + "o" + d(3),
    d(3) + "o" + "aaa" + "oo" + "aaa" + "o" + d(3),
    d(3) + "o" + "aaa" + "oo" + "aaa" + "o" + d(3),
    d(2) + "o" + "bbbb" + "oo" + "bbbb" + "o" + d(2),
    d(2) + "o".repeat(12) + d(2),
    d(16),
  ];

  const OVER = {
    // helmets replace rows 0-6 (the head)
    squire: [null, d(4) + "oooooooo" + d(4), d(3) + "occcccccc" + "o" + d(3), d(3) + "occcccccc" + "o" + d(3), null, null, null],
    iron: [null, d(4) + "oooooooo" + d(4), d(3) + "o" + "hhhaaaaa" + "o" + d(3), d(3) + "o" + "aaaaaaaa" + "o" + d(3),
      d(3) + "o" + "akkkkkka" + "o" + d(3), d(3) + "o" + "aaaaaaaa" + "o" + d(3), d(4) + "o" + "aaaaaa" + "o" + d(4)],
    plumed: [d(6) + "pppp" + d(6), d(4) + "oo" + "pppp" + "oo" + d(4), d(3) + "o" + "hhhaaaaa" + "o" + d(3), d(3) + "o" + "aaaaaaaa" + "o" + d(3),
      d(3) + "o" + "akkkkkka" + "o" + d(3), d(3) + "o" + "aaaaaaaa" + "o" + d(3), d(4) + "o" + "aaaaaa" + "o" + d(4)],
    horned: [d(2) + "xx" + d(8) + "xx" + d(2), d(2) + "x" + "." + "oooooooo" + "." + "x" + d(2), d(3) + "o" + "hhhaaaaa" + "o" + d(3), d(3) + "o" + "aaaaaaaa" + "o" + d(3),
      d(3) + "o" + "akkkkkka" + "o" + d(3), d(3) + "o" + "aaaaaaaa" + "o" + d(3), d(4) + "o" + "aaaaaa" + "o" + d(4)],
    crowned: [d(4) + "g.gggg.g" + d(4), d(4) + "gggggggg" + d(4), d(3) + "o" + "hhhaaaaa" + "o" + d(3), d(3) + "o" + "aaaaaaaa" + "o" + d(3),
      d(3) + "o" + "akkkkkka" + "o" + d(3), d(3) + "o" + "aaaaaaaa" + "o" + d(3), d(4) + "o" + "aaaaaa" + "o" + d(4)],
  };

  const SHIELD = [
    null, null, null, null, null, null, null, null, null,
    d(1) + "ooooo" + d(10),
    "o" + "mmmmm" + "o" + d(9),
    "o" + "mmnnm" + "o" + d(9),
    "o" + "mmnnm" + "o" + d(9),
    d(1) + "o" + "mmm" + "o" + d(10),
    d(2) + "omo" + d(11),
    d(3) + "o" + d(12),
  ];
  const SWORD = [
    null, null, d(14) + "w" + d(1),
    ...Array(8).fill(d(13) + "owo"),
    d(12) + "gggg", d(14) + "dd", d(14) + "dd", d(14) + "gg",
  ];
  const STAFF = [
    d(14) + "nn", d(14) + "nn", null,
    ...Array(13).fill(d(14) + "d" + d(1)),
  ];
  const CAPE = [
    ...Array(12).fill(null),
    "oc" + d(12) + "co", "oc" + d(12) + "co", "oC" + d(12) + "Co",
    "occ" + d(10) + "cco", "occ" + d(10) + "cco", "oCC" + d(10) + "CCo".slice(0, 3), "oC" + d(12) + "Co",
  ];

  const ARMOR = {
    steel:  { a: "#9fb0d0", h: "#d3def5", b: "#6a7899" },
    cobalt: { a: "#4f7cf0", h: "#9db9ff", b: "#2e4ab0" },
    gold:   { a: "#e5b04a", h: "#ffe19a", b: "#a9761f" },
    crimson:{ a: "#d65a5f", h: "#ff9ea0", b: "#942e3a" },
    emerald:{ a: "#3fbf8f", h: "#8cf0c4", b: "#1f7d5e" },
    obsidian:{ a: "#4b5070", h: "#8088b0", b: "#2a2e48" },
  };
  const BASE_PAL = { o: "#0a0c16", s: "#f1c9a1", d: "#6a4630", k: "#16182b", g: "#f4b942", x: "#efe6cc", t: "#a8793c" };

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
  const HELM = {
    squire:  { c: "#4f7cf0", p: "#fff", a: null },
    iron:    {},
    plumed:  { p: "#e5484d" },
    horned:  {},
    crowned: { a: "gold" },
  };

  function paint(grid, rows, pal) {
    rows.forEach((row, y) => {
      if (!row) return;
      for (let x = 0; x < W; x++) {
        const ch = row[x];
        if (ch && ch !== "." && ch !== " ") grid[y][x] = pal[ch] || null;
      }
    });
  }

  function compose(eq) {
    eq = eq || {};
    const armorKey = eq.armor || "steel";
    const armor = ARMOR[armorKey] || ARMOR.steel;
    const grid = Array.from({ length: H }, () => Array(W).fill(null));
    const pal = Object.assign({}, BASE_PAL, armor);

    // cape sits behind the body
    const cape = CAPES[eq.cape || "none"];
    if (cape) paint(grid, CAPE, Object.assign({}, pal, cape));

    // body
    paint(grid, BASE, pal);

    // helmet
    const helmKey = eq.helm || "squire";
    const helmOver = OVER[helmKey] || OVER.squire;
    const hp = Object.assign({}, pal, HELM[helmKey] || {});
    if (HELM[helmKey] && HELM[helmKey].a === "gold") Object.assign(hp, ARMOR.gold, { g: "#ffe19a" });
    // helmet rows start at row 0 for tall helms, row 1 for flat ones (squire)
    // a full helm replaces the whole head, so clear it first
    if (helmKey !== "squire") for (let y = 0; y <= 6; y++) for (let x = 0; x < W; x++) grid[y][x] = null;
    paint(grid, helmOver, hp);

    // shield (left hand) and weapon (right hand)
    const sh = SHIELDS[eq.shield || "oak"] || SHIELDS.oak;
    paint(grid, SHIELD, Object.assign({}, pal, sh));
    const wp = WEAPONS[eq.weapon || "wood"] || WEAPONS.wood;
    paint(grid, wp.shape === "staff" ? STAFF : SWORD, Object.assign({}, pal, wp));

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
    head(eq) { return NDC.svg(toSvg(compose(eq), { crop: [2, 0, 12, 9], label: "Knight" })); },
    /* gear icons: the piece alone on a small canvas */
    icon(slot, key) {
      const eq = {};
      if (slot === "helm") { eq.helm = key; return NDC.svg(toSvg(compose({ helm: key, armor: "steel", shield: "oak", weapon: "wood", cape: "none" }), { crop: [1, 0, 14, 8], label: key })); }
      if (slot === "shield") return NDC.svg(toSvg(compose({ shield: key, helm: "squire" }), { crop: [0, 8, 8, 9], label: key }));
      if (slot === "weapon") return NDC.svg(toSvg(compose({ weapon: key }), { crop: [8, 0, 8, 16], label: key }));
      if (slot === "cape") return NDC.svg(toSvg(compose({ cape: key }), { crop: [0, 9, 16, 11], label: key }));
      return NDC.svg(toSvg(compose({ armor: key }), { crop: [0, 6, 16, 12], label: key }));
    },
    swatch(key) { return ARMOR[key].a; },
  };
})();
