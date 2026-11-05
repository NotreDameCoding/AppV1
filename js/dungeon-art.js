/* The Dungeon's rooms: ten halls of the castle, drawn once per floor into an offscreen canvas.
   Dark mode is the castle at night (torchlight, moonlit windows). Light mode is the same rooms by day
   (sunlit stone, blue sky through the windows). The fights live in pages/dungeon.js. */
(function () {
  const W = 480, H = 300, LEFT = 28, RIGHT = 452, TOP = 62, BOT = 284, TAU = Math.PI * 2;
  function seeded(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.substr(i, 2), 16));
  const toHex = (a) => "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };

  const NAMES = ["Slime Cellar", "Mossy Halls", "Goblin Camp", "Deep Warrens", "The Goblin King",
    "Bone Crypt", "Catacombs", "Glob Sewers", "Ember Forge", "Dragon's Roost"];
  /* night palette per floor: a/b floor stone, wall/wallHi wall stone, glow = torches and magic */
  const BASE = [null,
    { a: "#1d2a33", b: "#19252d", wall: "#2a3a48", wallHi: "#3c5266", glow: "#5fe0c8", deco: "slime", torch: [90, 200, 280, 390], banner: "#2d3a8a" },
    { a: "#1e2b26", b: "#1a2621", wall: "#2c3d36", wallHi: "#3f5a4c", glow: "#9bff7a", deco: "moss", torch: [70, 170, 310, 410], banner: "#2d6a3a" },
    { a: "#2a231c", b: "#251f18", wall: "#3d3026", wallHi: "#574536", glow: "#ff9a3d", deco: "camp", torch: [100, 190, 290, 380], banner: "#8a2f1e" },
    { a: "#231d31", b: "#1e192b", wall: "#322a48", wallHi: "#483d68", glow: "#c07dff", deco: "crystal", torch: [80, 160, 320, 400], banner: "#4a2a8a" },
    { a: "#2a1d1f", b: "#241a1b", wall: "#43292d", wallHi: "#603a40", glow: "#ffcf5a", deco: "throne", torch: [90, 170, 310, 390], banner: "#8a1f2a" },
    { a: "#24252a", b: "#202126", wall: "#36373f", wallHi: "#4d4f5a", glow: "#9fd8ff", deco: "crypt", torch: [90, 190, 290, 390], banner: "#2a3348" },
    { a: "#262220", b: "#211e1c", wall: "#3a332e", wallHi: "#554a42", glow: "#b6ffe0", deco: "catacomb", torch: [70, 170, 310, 410], banner: "#3a2f28" },
    { a: "#1c2826", b: "#182321", wall: "#2a3a36", wallHi: "#3d5550", glow: "#b4ff5a", deco: "sewer", torch: [100, 200, 280, 380], banner: "#2a4a2a" },
    { a: "#2a1c18", b: "#241814", wall: "#3e2620", wallHi: "#5c362c", glow: "#ff6a2a", deco: "forge", torch: [80, 180, 300, 400], banner: "#7a2414" },
    { a: "#2b2320", b: "#261e1b", wall: "#463028", wallHi: "#66463a", glow: "#ffb03a", deco: "roost", torch: [70, 150, 330, 410], banner: "#8a1f1a" },
  ];
  /* the same rooms by day: stone bleached toward warm sandstone, magic colors deepened so they read on light stone */
  function theme(floor, day) {
    const b = BASE[floor];
    if (!day) return Object.assign({ name: NAMES[floor - 1], day: false, crack: mix(b.b, "#000000", 0.5) }, b);
    const sand = "#e6dcc6";
    return Object.assign({}, b, {
      name: NAMES[floor - 1], day: true,
      a: mix(b.a, sand, 0.72), b: mix(b.b, sand, 0.66), crack: mix(b.b, sand, 0.45),
      wall: mix(b.wall, "#cfc4ac", 0.7), wallHi: mix(b.wallHi, "#f3ead6", 0.7),
      glow: mix(b.glow, "#3a2a10", 0.25), banner: mix(b.banner, "#ffffff", 0.08),
    });
  }

  function build(floor, day) {
    const th = theme(floor, day), rng = seeded(floor * 31 + (day ? 7 : 3)), rr = (a, b) => a + rng() * (b - a);
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    const R = (col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
    const blob = (x, y, rw, rh, col, a) => { c.fillStyle = col; c.globalAlpha = a; c.beginPath(); c.ellipse(x, y, rw, rh, 0, 0, TAU); c.fill(); c.globalAlpha = 1; };
    const ink = day ? "#5a5242" : "#0a0c14", deep = day ? mix(th.wall, "#3a3326", 0.5) : "#10131f";
    const grout = day ? mix(th.b, "#6a604c", 0.45) : mix(th.b, "#000000", 0.55);

    /* ---- floor: irregular flagstones ---- */
    R(grout, LEFT, TOP, RIGHT - LEFT, BOT - TOP);
    for (let y = TOP; y < BOT; y += 14) {
      let x = LEFT - ((y / 14) % 2) * 9;
      while (x < RIGHT) {
        const w = Math.round(rr(18, 38)), base = rng() > 0.5 ? th.a : th.b;
        const tint = mix(base, rng() > 0.5 ? "#ffffff" : "#000000", rr(0, day ? 0.06 : 0.08));
        R(tint, x + 1, y + 1, w - 1, 13);
        R(day ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.045)", x + 1, y + 1, w - 1, 1);
        R(day ? "rgba(90,80,60,0.18)" : "rgba(0,0,0,0.25)", x + 1, y + 13, w - 1, 1);
        for (let i = 0; i < 3; i++) R(day ? "rgba(90,80,60,0.12)" : "rgba(0,0,0,0.18)", x + rr(2, w - 3), y + rr(3, 12), 1 + (rng() * 2 | 0), 1);
        x += w;
      }
    }
    for (let i = 0; i < 8; i++) { let x = rr(LEFT + 20, RIGHT - 20), y = rr(TOP + 10, BOT - 20); for (let k = 0; k < 7; k++) { R(th.crack, x, y, 2, 1); x += rng() > 0.5 ? 2 : -2; y += rng() > 0.4 ? 1 : 0; } }

    /* ---- what's lying on the floor of each room ---- */
    const bone = (x, y) => { const col = day ? "#f4efe0" : "#d8d0b8"; R(col, x, y, 6, 1); R(col, x, y - 1, 1, 3); R(col, x + 5, y - 1, 1, 3); };
    const skull = (x, y) => { const col = day ? "#f4efe0" : "#d8d0b8"; R(ink, x - 1, y - 1, 7, 7); R(col, x, y, 5, 5); R(ink, x + 1, y + 2, 1, 1); R(ink, x + 3, y + 2, 1, 1); R(col, x + 1, y + 5, 3, 1); };
    switch (th.deco) {
      case "slime": for (let i = 0; i < 6; i++) { const x = rr(60, 420), y = rr(80, 270); blob(x, y, rr(8, 18), rr(4, 8), "#4fc47e", day ? 0.3 : 0.22); blob(x - 2, y - 1, 4, 2, "#a8ffd0", 0.25); } break;
      case "moss":
        for (let i = 0; i < 14; i++) blob(rr(40, 440), rr(70, 274), rr(6, 16), rr(3, 7), day ? "#6aa04a" : "#4f8a3a", day ? 0.4 : 0.35);
        for (let i = 0; i < 7; i++) { const x = rr(40, 440), y = rr(80, 270); R(day ? "#f4efe0" : "#e8d9ff", x, y - 3, 1, 3); R(day ? "#e5484d" : "#7affd0", x - 1, y - 5, 3, 2); }
        break;
      case "camp":
        blob(240, 192, 46, 18, day ? "#8a6a3c" : "#1a120a", day ? 0.45 : 0.7);
        for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; R(day ? "#8a8070" : "#c8c0a8", 240 + Math.cos(a) * 34 + rr(-3, 3), 192 + Math.sin(a) * 12, 4, 2); }
        for (let i = 0; i < 9; i++) { const x = rr(50, 430), y = rr(80, 270); R("#c9a85a", x, y, 8, 1); R("#e0c070", x + 2, y - 1, 5, 1); }
        break;
      case "crystal": for (let i = 0; i < 5; i++) { const x = rr(50, 430), y = rr(90, 270); blob(x, y, 22, 8, "#c07dff", day ? 0.14 : 0.08); R("#8a4fe0", x - 1, y - 7, 3, 7); R("#c9a0ff", x, y - 7, 1, 7); R("#8a4fe0", x + 3, y - 4, 2, 4); } break;
      case "throne":
        R("#6a1a24", 216, TOP, 48, BOT - TOP); R("#8a2a36", 220, TOP, 40, BOT - TOP); R("#f4cf5a", 216, TOP, 2, BOT - TOP); R("#f4cf5a", 262, TOP, 2, BOT - TOP);
        for (let y = TOP + 6; y < BOT; y += 12) R("#a03a46", 226, y, 28, 1);
        break;
      case "crypt":
        for (let i = 0; i < 5; i++) { const x = rr(50, 400), y = rr(90, 250); R(ink, x - 1, y - 1, 28, 14); R(mix(th.a, day ? "#ffffff" : "#000000", 0.15), x, y, 26, 12); R(th.crack, x + 12, y + 2, 2, 8); R(th.crack, x + 8, y + 5, 10, 2); }
        for (let i = 0; i < 10; i++) bone(rr(50, 420), rr(80, 272));
        for (let i = 0; i < 3; i++) skull(rr(60, 410), rr(90, 260));
        break;
      case "catacomb":
        for (let i = 0; i < 4; i++) { const x = rr(60, 400), y = rr(90, 255); for (let k = 0; k < 4; k++) skull(x + (k % 2) * 6, y - (k > 1 ? 5 : 0)); }
        for (let i = 0; i < 8; i++) { const x = rr(50, 430), y = rr(80, 270); R("#efe6c8", x, y - 5, 2, 5); R(th.glow, x, y - 7, 2, 2); }
        for (let i = 0; i < 8; i++) bone(rr(50, 420), rr(80, 272));
        break;
      case "sewer":
        R(day ? "#7aa69a" : "#0f2a24", LEFT, 168, RIGHT - LEFT, 20); R(day ? "#9ccabc" : "#1a4038", LEFT, 168, RIGHT - LEFT, 2); R(day ? "#5a8a7e" : "#081a16", LEFT, 186, RIGHT - LEFT, 2);
        for (let x = LEFT; x < RIGHT; x += 6) R(day ? "rgba(255,255,255,0.25)" : "rgba(180,255,90,0.12)", x + rr(0, 4), 172 + rr(0, 10), 3, 1);
        for (const gx of [110, 240, 370]) { R(ink, gx - 9, 165, 18, 26); for (let k = 0; k < 4; k++) R(day ? "#8a8270" : "#3a4844", gx - 8 + k * 4, 166, 2, 24); }
        for (let i = 0; i < 9; i++) blob(rr(50, 430), rr(80, 270), rr(6, 14), rr(3, 6), "#7ac43a", day ? 0.3 : 0.25);
        break;
      case "forge":
        for (let i = 0; i < 6; i++) { let x = rr(60, 420), y = rr(90, 260); for (let k = 0; k < 10; k++) { R("#ff6a2a", x, y, 2, 1); R("#ffd06a", x, y, 1, 1); x += rng() > 0.5 ? 2 : -2; y += rng() > 0.4 ? 1 : 0; } }
        for (const ax of [70, 410]) { R(ink, ax - 11, 240, 22, 14); R("#5a5a66", ax - 10, 241, 20, 5); R("#8a8a96", ax - 10, 241, 20, 1); R("#4a4a56", ax - 4, 246, 8, 7); R("#5a5a66", ax - 8, 252, 16, 2); }
        for (let i = 0; i < 6; i++) R("#3a2a22", rr(50, 430), rr(80, 270), 3, 2);
        break;
      case "roost":
        for (let i = 0; i < 5; i++) blob(rr(60, 420), rr(90, 260), rr(14, 26), rr(6, 10), "#000000", day ? 0.12 : 0.3);
        for (const [gx, gy] of [[56, 268], [424, 268], [56, 84], [424, 84]]) { for (let k = 0; k < 26; k++) { const x = gx + rr(-16, 16), y = gy + rr(-6, 6); R("#a87a10", x, y, 3, 2); R("#ffd25a", x, y, 2, 1); } }
        for (let i = 0; i < 4; i++) { const x = rr(100, 380), y = rr(110, 240); for (let k = 0; k < 3; k++) R(th.crack, x + k * 4, y + k, 2, 10); }
        break;
    }

    /* ---- back wall: big cut stone, tall arched windows, banners ---- */
    R(deep, 0, 0, W, TOP);
    for (let y = 0; y < TOP - 8; y += 12) for (let x = -((y / 12) % 2) * 14; x < W; x += 28) {
      R(mix(th.wall, rng() > 0.5 ? "#ffffff" : "#000000", rr(0, 0.07)), x + 1, y + 1, 26, 10); R(th.wallHi, x + 1, y + 1, 26, 1); R(day ? "rgba(80,70,50,0.25)" : "rgba(0,0,0,0.3)", x + 1, y + 10, 26, 1);
    }
    const sky = (wx, wy, ww, wh) => {
      if (day) {
        const g = c.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, "#7cc4f2"); g.addColorStop(1, "#d8f0ff"); c.fillStyle = g; c.fillRect(wx, wy, ww, wh);
        R("#ffffff", wx + 3, wy + wh * 0.35, 8, 3); R("#ffffff", wx + 5, wy + wh * 0.35 - 2, 4, 2);
        R(mix("#7aa0c0", "#ffffff", 0.4), wx, wy + wh - 6, ww, 6); // distant hills
      } else {
        R("#0b1430", wx, wy, ww, wh);
        for (let k = 0; k < 5; k++) R(rng() > 0.6 ? "#ffffff" : "#8a9ad0", wx + rr(1, ww - 2), wy + rr(1, wh - 6), 1, 1);
        R("#1a2440", wx, wy + wh - 5, ww, 5);
      }
    };
    const arch = (x, w, hgt) => { // gothic window: pointed top built from shrinking rows
      const top = 6, bot = top + hgt;
      R(ink, x - 2, top - 2, w + 4, hgt + 4);
      sky(x, top, w, hgt);
      // shape the point: cover the corners with wall
      for (let i = 0; i < w / 2; i++) { const cover = Math.max(0, Math.round((w / 2 - i) * 0.8) - 2); R(th.wall, x + i, top, 1, cover); R(th.wall, x + w - 1 - i, top, 1, cover); }
      R(th.wallHi, x + w / 2 - 1, top + 2, 2, hgt - 2); R(th.wallHi, x, top + hgt * 0.55, w, 2); // mullion and transom
      R(th.wallHi, x - 3, bot, w + 6, 3); R(day ? "rgba(80,70,50,0.3)" : "rgba(0,0,0,0.4)", x - 3, bot + 3, w + 6, 1);
    };
    const winX = th.deco === "throne" ? [120, 344] : th.deco === "roost" ? [] : [130, 232, 334];
    winX.forEach((x) => arch(x, 18, 40));
    if (!day && winX.length) { const mx = winX[winX.length - 1] + 9; R("#fff6d0", mx - 3, 13, 6, 6); R("#d8d0b0", mx - 1, 14, 2, 2); }
    if (th.deco === "roost") { // the dragon smashed a hole through the wall
      const hx = 240, hw = 120;
      R(ink, hx - hw / 2 - 2, 2, hw + 4, TOP - 8);
      sky(hx - hw / 2, 4, hw, TOP - 12);
      for (let x = 0; x < hw; x += 4) { const peak = 10 + Math.abs(Math.sin(x * 0.07)) * 12; R(day ? "#9aa6cc" : "#1a2440", hx - hw / 2 + x, TOP - 8 - peak, 4, peak); R(day ? "#ffffff" : "#c8d0e8", hx - hw / 2 + x, TOP - 8 - peak, 4, 2); }
      for (let x = -hw / 2 - 6; x < hw / 2 + 6; x += 6) R(th.wall, hx + x, 2 + rr(0, 8), 6, rr(4, 9));
    }
    if (th.deco === "throne") {
      R("#2a1218", 196, 4, 88, 56); R("#3a1a22", 200, 8, 80, 52); R("#f4cf5a", 196, 4, 88, 2); R("#f4cf5a", 196, 4, 2, 56); R("#f4cf5a", 282, 4, 2, 56);
      R("#7a2a36", 218, 20, 44, 40); R("#a03a46", 222, 24, 36, 36); R("#f4cf5a", 218, 18, 44, 3); R("#f4cf5a", 230, 8, 20, 10); R("#fff2b0", 236, 11, 8, 4);
    }
    if (th.deco === "catacomb" || th.deco === "crypt") for (const nx of [60, 182, 298, 420]) { R(ink, nx - 9, 14, 18, 22); R(deep, nx - 8, 15, 16, 20); skull(nx - 3, 24); }
    if (th.deco === "moss" || (day && floor <= 2)) for (let i = 0; i < 20; i++) { const x = rr(0, W), l = rr(6, 26); R(day ? "#5a9a44" : "#3f7a34", x, TOP - 8 - l, 2, l); R(day ? "#8ac86a" : "#5ca04a", x, TOP - 8 - l, 2, 2); }
    if (th.deco === "slime") for (let i = 0; i < 10; i++) { const x = rr(10, W - 10); R("#4fc47e", x, 20, 2, rr(8, 30)); R("#a8ffd0", x, 20, 1, 6); }
    if (th.deco === "crystal") for (let i = 0; i < 7; i++) { const x = 30 + i * 65 + rr(-10, 10), y = TOP - 8; R("#8a4fe0", x, y - 16, 5, 16); R("#c9a0ff", x + 1, y - 16, 2, 16); }
    if (th.deco === "forge") for (const fx of [184, 296]) { R(ink, fx - 13, 26, 26, 30); R("#3a2420", fx - 12, 27, 24, 28); R("#ff6a2a", fx - 8, 38, 16, 16); R("#ffd06a", fx - 4, 44, 8, 8); }
    // banners hung near the corners
    for (const bx of [36, 426]) { R(ink, bx - 1, 6, 20, 34); R(th.banner, bx, 6, 18, 31); R(mix(th.banner, "#ffffff", 0.15), bx, 6, 18, 2); R(th.glow, bx + 7, 13, 4, 14); R(th.glow, bx + 4, 18, 10, 3); R(ink, bx, 37, 6, 3); R(ink, bx + 12, 37, 6, 3); }
    // wall base
    R(th.wallHi, 0, TOP - 8, W, 2); R(deep, 0, TOP - 6, W, 6); R(day ? "rgba(80,70,50,0.25)" : "rgba(0,0,0,0.5)", 0, TOP, W, 5); R(day ? "rgba(80,70,50,0.1)" : "rgba(0,0,0,0.25)", 0, TOP + 5, W, 4);
    // torch sconces
    for (const tx of th.torch) { R(deep, tx - 3, 24, 6, 14); R("#5a4636", tx - 2, 26, 4, 10); R("#7a5a40", tx - 3, 22, 6, 3); }

    /* ---- side and front walls ---- */
    for (let y = 0; y < H; y += 12) {
      const o = (y / 12) % 2 ? 0 : 6;
      R(th.wall, 0, y + 1, LEFT - 6, 10); R(th.wallHi, 0, y + 1, LEFT - 6, 1); R(deep, o, y + 1, 1, 10);
      R(th.wall, RIGHT + 6, y + 1, W - RIGHT - 6, 10); R(th.wallHi, RIGHT + 6, y + 1, W - RIGHT - 6, 1); R(deep, RIGHT + 12 + o, y + 1, 1, 10);
    }
    R(deep, LEFT - 6, 0, 6, H); R(deep, RIGHT, 0, 6, H);
    R(day ? "rgba(80,70,50,0.2)" : "rgba(0,0,0,0.45)", LEFT, TOP, 7, BOT - TOP); R(day ? "rgba(80,70,50,0.2)" : "rgba(0,0,0,0.45)", RIGHT - 7, TOP, 7, BOT - TOP);
    if (day && floor <= 2) for (const vx of [4, W - 20]) for (let i = 0; i < 9; i++) blob(vx + rr(0, 16), rr(TOP, H), rr(3, 6), rr(3, 6), "#5a9a44", 0.8);
    R(deep, 0, BOT, W, H - BOT);
    for (let x = 0; x < W; x += 24) { R(th.wall, x + 1, BOT + 2, 22, 13); R(th.wallHi, x + 1, BOT + 2, 22, 1); }
    R(day ? "rgba(80,70,50,0.25)" : "rgba(0,0,0,0.5)", LEFT, BOT - 5, RIGHT - LEFT, 5);
    return cv;
  }

  /* where the windows are, for daylight sunbeams */
  const windows = (floor) => (BASE[floor].deco === "throne" ? [129, 353] : BASE[floor].deco === "roost" ? [240] : [139, 241, 343]);

  NDC.dungeonArt = { NAMES, theme, build, windows, mix };
})();
