/* The Dungeon in light mode: the same five fights, but outside. A grassy Valhalla meets Zelda arena: wooden palisade
   hung with round shields, pine forest, snowy peaks, rune stones. Everything here is drawing; the fights are in dungeon.js. */
(function () {
  const W = 480, H = 300, LEFT = 28, RIGHT = 452, TOP = 62, BOT = 284, TAU = Math.PI * 2;
  function seeded(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

  const NAMES = ["Slime Meadow", "Mossy Woods", "Goblin Camp", "Stonefall Ridge", "The Goblin King"];
  const THEMES = [null,
    { a: "#6fbf4a", b: "#66b744", dark: "#3f8a32", lite: "#9ae06a", sky: ["#7cc4f2", "#d6f0ff"], far: "#a9bdd8", near: "#7fb07a", glow: "#fff27a", deco: "meadow", flowers: ["#ffffff", "#ffe66d", "#ff9ec4"], forest: "#2f7a3a" },
    { a: "#4fa045", b: "#489840", dark: "#2d6a30", lite: "#7ccb62", sky: ["#8fcdea", "#d9efe2"], far: "#8fb0b8", near: "#5f9a62", glow: "#b9ff7a", deco: "woods", flowers: ["#e5484d", "#ffd36a", "#d9c2ff"], forest: "#1f5f34" },
    { a: "#8fae52", b: "#86a64b", dark: "#5a7a34", lite: "#b8d070", sky: ["#8cc8ee", "#f2f0d6"], far: "#b3b6c4", near: "#8aa66a", glow: "#ffb04a", deco: "camp", flowers: ["#ffd36a", "#ffffff"], forest: "#3b7435" },
    { a: "#7aa070", b: "#729868", dark: "#4a7058", lite: "#a6c898", sky: ["#8db6ec", "#e3e0f6"], far: "#9aa6cc", near: "#7a96a8", glow: "#c9a8ff", deco: "ridge", flowers: ["#c9a8ff", "#ffffff", "#9ec6ff"], forest: "#2a5a52" },
    { a: "#b9c56a", b: "#b0bd62", dark: "#8a9a42", lite: "#e2e88c", sky: ["#ffc98a", "#fff1cf"], far: "#d6b4a8", near: "#a8a870", glow: "#ffd25a", deco: "hall", flowers: ["#ffd25a", "#ffffff", "#ff8a6a"], forest: "#6a7a2f" },
  ];
  THEMES.forEach((t, i) => { if (t) { t.name = NAMES[i - 1]; t.wall = "#9aa3b5"; t.wallHi = "#c9d0de"; t.torch = []; t.day = true; } });

  function build(floor) {
    const th = THEMES[floor], rng = seeded(floor * 31 + 7), rr = (a, b) => a + rng() * (b - a);
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    const R = (col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
    const blob = (x, y, rw, rh, col, a) => { c.fillStyle = col; c.globalAlpha = a; c.beginPath(); c.ellipse(x, y, rw, rh, 0, 0, TAU); c.fill(); c.globalAlpha = 1; };
    const tri = (x, yBase, w, h, col) => { for (let i = 0; i < h; i++) { const ww = Math.max(1, Math.round(w * (i + 1) / h)); R(col, x - ww / 2, yBase - h + i, ww, 1); } };
    const pine = (x, yBase, h, dark, mid, lite) => {
      R("#5a3d26", x - 1, yBase - 4, 3, 4);
      const w = Math.round(h * 0.62);
      tri(x, yBase - 3, w, Math.round(h * 0.45), dark); tri(x, yBase - 3 - Math.round(h * 0.25), w * 0.8, Math.round(h * 0.42), mid); tri(x, yBase - 3 - Math.round(h * 0.5), w * 0.55, Math.round(h * 0.42), lite);
    };

    // sky, sun and clouds
    const sg = c.createLinearGradient(0, 0, 0, TOP); sg.addColorStop(0, th.sky[0]); sg.addColorStop(1, th.sky[1]); c.fillStyle = sg; c.fillRect(0, 0, W, TOP + 4);
    blob(404, 20, 34, 18, "#ffffff", 0.35); blob(404, 20, 18, 10, "#fffbe0", 0.8);
    for (let i = 0; i < 5; i++) { const x = rr(20, 460), y = rr(6, 26); R("#ffffff", x, y, 26, 5); R("#ffffff", x + 5, y - 4, 14, 5); R("#e9f3ff", x + 2, y + 4, 22, 1); }
    // far mountains with snow, then rolling near hills
    const ridge = (col, base, amp, f1, f2, snow) => {
      for (let x = 0; x < W; x += 2) {
        const y = base - amp * (0.55 + 0.45 * Math.sin(x * f1 + floor)) - amp * 0.35 * Math.abs(Math.sin(x * f2 + 1.3 + floor));
        R(col, x, y, 2, TOP + 2 - y);
        if (snow && y < base - amp * 0.62) { R("#ffffff", x, y, 2, 3); R("#dfe9f7", x, y + 3, 2, 1); }
      }
    };
    ridge(th.far, 40, 30, 0.021, 0.047, true);
    ridge(th.near, 50, 14, 0.035, 0.09, false);
    // treeline
    for (let x = 4; x < W; x += 9) pine(x + rr(-2, 2), TOP - 3, rr(18, 26), th.forest, "#2f8a45", "#4fae5a");
    // ground
    R(th.a, 0, TOP - 2, W, H - TOP + 2);
    for (let ty = TOP; ty < BOT; ty += 16) for (let tx = LEFT; tx < RIGHT; tx += 16) {
      R(((tx - LEFT) / 16 + (ty - TOP) / 16) % 2 ? th.a : th.b, tx, ty, 16, 16);
    }
    for (let i = 0; i < 900; i++) { const x = rr(LEFT, RIGHT), y = rr(TOP, BOT); R(rng() > 0.5 ? th.dark : th.lite, x, y, 1, rng() > 0.7 ? 2 : 1); }
    for (let i = 0; i < 70; i++) { const x = rr(LEFT + 4, RIGHT - 6), y = rr(TOP + 6, BOT - 3); R(th.dark, x, y, 1, 3); R(th.dark, x + 2, y + 1, 1, 2); R(th.lite, x + 1, y - 1, 1, 3); }

    // theme ground detail
    if (th.deco === "meadow" || th.deco === "hall" || th.deco === "ridge") for (let i = 0; i < 46; i++) {
      const x = rr(LEFT + 6, RIGHT - 8), y = rr(TOP + 8, BOT - 6), col = th.flowers[(rng() * th.flowers.length) | 0];
      R("#2f7a3a", x + 1, y + 2, 1, 3); R(col, x, y, 3, 1); R(col, x + 1, y - 1, 1, 3); R("#ffe66d", x + 1, y, 1, 1);
    }
    if (th.deco === "woods") {
      for (let i = 0; i < 16; i++) { const x = rr(LEFT + 8, RIGHT - 10), y = rr(TOP + 10, BOT - 6); blob(x, y, rr(6, 14), rr(3, 6), "#2d6a30", 0.35); }
      for (let i = 0; i < 12; i++) { const x = rr(LEFT + 8, RIGHT - 10), y = rr(TOP + 10, BOT - 6); R("#f4efe0", x, y + 2, 2, 3); R("#e5484d", x - 1, y, 4, 3); R("#ffffff", x, y, 1, 1); }
      for (let i = 0; i < 3; i++) { const x = rr(LEFT + 30, RIGHT - 60), y = rr(TOP + 24, BOT - 20); R("#6a4a2e", x, y, 28, 6); R("#8a6a46", x, y, 28, 1); R("#4a3220", x, y + 5, 28, 1); R("#c9a070", x + 27, y + 1, 2, 4); }
    }
    if (th.deco === "camp") {
      for (let i = 0; i < 10; i++) blob(rr(LEFT + 20, RIGHT - 20), rr(TOP + 16, BOT - 10), rr(10, 22), rr(4, 9), "#8a6a3c", 0.45);
      blob(240, 192, 46, 18, "#6a4c2a", 0.55);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; R("#c8c0a8", 240 + Math.cos(a) * 34 + rr(-3, 3), 192 + Math.sin(a) * 12, 4, 2); }
      for (let i = 0; i < 6; i++) { const x = rr(LEFT + 20, RIGHT - 30), y = rr(TOP + 16, BOT - 10); R("#efe8d0", x, y, 5, 1); R("#efe8d0", x + 1, y - 1, 1, 3); R("#efe8d0", x + 4, y - 1, 1, 3); }
    }
    if (th.deco === "ridge") {
      for (let i = 0; i < 14; i++) { const x = rr(LEFT + 6, RIGHT - 22), y = rr(TOP + 8, BOT - 10), w = rr(10, 22); R("#8a93a4", x, y + 2, w, 5); R("#b9c2d2", x, y, w, 3); R("#6a7384", x, y + 6, w, 1); }
      for (let i = 0; i < 6; i++) { const x = rr(LEFT + 20, RIGHT - 20), y = rr(TOP + 20, BOT - 14); R("#7aa6ff", x, y - 7, 3, 7); R("#c9dcff", x + 1, y - 7, 1, 7); R("#7aa6ff", x - 2, y - 4, 2, 4); }
    }
    if (th.deco === "hall") {
      // golden stone plaza and a red carpet to the gate
      for (let ty = TOP + 4; ty < BOT - 4; ty += 12) for (let tx = 180; tx < 300; tx += 24) { const o = ((ty - TOP) / 12) % 2 ? 12 : 0; R("#d8c88a", tx + o, ty, 22, 10); R("#efe2a8", tx + o, ty, 22, 1); R("#a89858", tx + o, ty + 9, 22, 1); }
      R("#8a1f2c", 222, TOP, 36, BOT - TOP); R("#b03040", 225, TOP, 30, BOT - TOP); R("#f4cf5a", 222, TOP, 2, BOT - TOP); R("#f4cf5a", 256, TOP, 2, BOT - TOP);
      for (let y = TOP + 6; y < BOT; y += 12) R("#d9a62a", 232, y, 16, 1);
    }

    // wooden palisade hung with shields along the back, and a carved gate
    R("#6a4a2e", 0, TOP - 12, W, 12);
    for (let x = 0; x < W; x += 8) { R("#8a6a46", x, TOP - 18, 6, 18); R("#a98457", x, TOP - 18, 2, 18); R("#4a3220", x + 5, TOP - 18, 1, 18); tri(x + 3, TOP - 18, 6, 4, "#8a6a46"); }
    R("#4a3220", 0, TOP - 3, W, 3);
    const SH = ["#c9454f", "#f4f6fb", "#2d4ec8", "#f4b942"];
    for (let i = 0, x = 24; x < W - 20; x += 44, i++) { if (Math.abs(x - 240) < 36) continue; const col = SH[i % SH.length]; R("#2a1a0e", x - 8, TOP - 17, 16, 15); R(col, x - 7, TOP - 16, 14, 13); R("rgba(255,255,255,0.3)", x - 7, TOP - 16, 14, 2); R("#f4cf5a", x - 2, TOP - 12, 4, 4); R("#2a1a0e", x - 1, TOP - 11, 2, 2); }
    // gate: two tall posts topped with dragon-head finials and a gold shield
    for (const gx of [212, 262]) { R("#2a1a0e", gx - 1, 8, 10, TOP - 8); R("#6a4a2e", gx, 10, 8, TOP - 10); R("#a98457", gx, 10, 2, TOP - 10); R("#f4cf5a", gx, 24, 8, 2); R("#f4cf5a", gx, 38, 8, 2); R("#2a1a0e", gx - 2, 2, 12, 8); R("#8a6a46", gx - 1, 3, 10, 6); R("#f4cf5a", gx + 6, 4, 2, 2); }
    R("#2a1a0e", 210, 14, 60, 6); R("#6a4a2e", 212, 15, 56, 4); R("#f4cf5a", 212, 15, 56, 1);
    blob(240, 30, 11, 11, "#2a1a0e", 1); blob(240, 30, 9, 9, floor === 5 ? "#f4cf5a" : "#c9454f", 1); blob(240, 30, 5, 5, "#f4f6fb", 1); blob(240, 30, 2, 2, "#f4cf5a", 1);

    // side fences and forest; low bushes and a rail along the bottom
    const forest = th.forest;
    R(forest, 0, TOP - 2, LEFT - 6, H); R(forest, RIGHT + 6, TOP - 2, W - RIGHT - 6, H);
    for (let y = TOP + 6; y < H + 24; y += 15) for (const xs of [[10, 4], [LEFT - 16, 3]]) { pine(xs[0] + rr(-2, 2), y + rr(-2, 2), rr(26, 34), forest, "#2f8a45", "#4fae5a"); }
    for (let y = TOP + 6; y < H + 24; y += 15) for (const xs of [[W - 10, 4], [RIGHT + 16, 3]]) { pine(xs[0] + rr(-2, 2), y + rr(-2, 2), rr(26, 34), forest, "#2f8a45", "#4fae5a"); }
    for (const fx of [LEFT - 6, RIGHT]) { R("#2a1a0e", fx, TOP - 2, 6, H); R("#8a6a46", fx + 1, TOP - 2, 4, H); R("#a98457", fx + 1, TOP - 2, 1, H); for (let y = TOP + 6; y < H; y += 20) { R("#6a4a2e", fx - 1, y, 8, 4); R("#4a3220", fx - 1, y + 3, 8, 1); } }
    R("#2a1a0e", 0, BOT, W, H - BOT); R(forest, 0, BOT + 2, W, H - BOT - 2);
    for (let x = 0; x < W; x += 14) { blob(x + rr(0, 6), BOT + 10, 9, 6, th.dark, 1); blob(x + rr(0, 6), BOT + 8, 7, 4, th.lite, 0.5); }
    R("#2a1a0e", LEFT - 6, BOT - 2, RIGHT - LEFT + 12, 4); R("#8a6a46", LEFT - 5, BOT - 1, RIGHT - LEFT + 10, 2); R("#a98457", LEFT - 5, BOT - 1, RIGHT - LEFT + 10, 1);
    for (let x = LEFT; x < RIGHT; x += 22) { R("#2a1a0e", x - 1, BOT - 7, 6, 10); R("#8a6a46", x, BOT - 6, 4, 9); R("#a98457", x, BOT - 6, 1, 9); }

    // standing rune stones in the corners of the yard
    const rune = (x, y, col) => {
      R("#5a6070", x - 8, y - 22, 16, 26); R("#9aa3b5", x - 7, y - 22, 14, 24); R("#c9d0de", x - 7, y - 22, 3, 24); R("#6a7384", x + 3, y - 22, 4, 24);
      R("#9aa3b5", x - 5, y - 25, 10, 3); R(col, x - 3, y - 18, 1, 8); R(col, x - 3, y - 18, 4, 1); R(col, x - 3, y - 13, 4, 1); R(col, x + 2, y - 18, 1, 4); R(col, x - 1, y - 8, 4, 1);
      blob(x, y + 4, 11, 3, "#000", 0.2);
    };
    rune(52, TOP + 18, th.glow); rune(RIGHT - 24, TOP + 18, th.glow);
    return cv;
  }

  /* things that stand in the yard and block you */
  function drawTree(R, q, floor, t) {
    const sway = Math.round(Math.sin(t * 1.3 + q.x) * 1);
    const g = floor === 5 ? ["#a8851e", "#d9b43a", "#ffe68a"] : floor === 2 ? ["#1f5f34", "#2f8a45", "#4fae5a"] : ["#2f7a3a", "#3f9a48", "#6cc864"];
    R("rgba(0,0,0,0.22)", q.x - 14, q.y + 2, 28, 5);
    R("#2a1a0e", q.x - 5, q.y - 16, 10, 22); R("#6a4a2e", q.x - 4, q.y - 16, 8, 21); R("#8a6a46", q.x - 4, q.y - 16, 2, 21);
    // a round canopy built from three stacked puffs, each a row-by-row disc with a dark rim and a lit top
    const puff = (cx, cy, rx, ry, col, hi) => {
      for (let j = -ry; j <= ry; j++) {
        const w = Math.round(rx * Math.sqrt(1 - (j * j) / (ry * ry + 0.01)));
        R("#10281a", cx - w - 1 + sway, cy + j, w * 2 + 2, 1); R(col, cx - w + sway, cy + j, w * 2, 1);
        if (j < -ry * 0.3) R(hi, cx - Math.round(w * 0.6) + sway, cy + j, Math.round(w * 0.9), 1);
      }
    };
    puff(q.x, q.y - 24, 17, 11, g[0], g[1]); puff(q.x - 1, q.y - 35, 14, 10, g[1], g[2]); puff(q.x, q.y - 45, 9, 7, g[2], "#ffffff");
  }
  function drawStone(R, q, th, t) {
    const pulse = 0.55 + 0.45 * Math.sin(t * 2 + q.x);
    R("rgba(0,0,0,0.22)", q.x - 12, q.y + 2, 24, 5);
    R("#4a5060", q.x - 9, q.y - 40, 18, 46); R("#9aa3b5", q.x - 8, q.y - 40, 16, 44); R("#c9d0de", q.x - 8, q.y - 40, 4, 44); R("#6a7384", q.x + 4, q.y - 40, 4, 44);
    R("#9aa3b5", q.x - 6, q.y - 44, 12, 4); R("#c9d0de", q.x - 6, q.y - 44, 12, 1);
    ctx_glow(R, q.x, q.y - 22, th.glow, pulse);
  }
  function ctx_glow(R, x, y, col, a) {
    R(col, x - 3, y - 12, 1, 12); R(col, x - 3, y - 12, 5, 1); R(col, x - 3, y - 6, 5, 1); R(col, x + 2, y - 12, 1, 4); R(col, x - 1, y - 2, 5, 1); R(col, x + 3, y - 8, 1, 6);
    R("rgba(255,255,255," + (0.18 * a) + ")", x - 8, y - 18, 16, 28);
  }

  NDC.dungeonDay = { THEMES, NAMES, build, drawTree, drawStone };
})();
