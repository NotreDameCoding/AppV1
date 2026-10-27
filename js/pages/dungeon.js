/* The Dungeon: a top-down fighting game for the knight, drawn at a low resolution in an angled overhead view.
   Move: WASD / arrows. Swing: J or Space (or left click). Block: hold K or Shift (or right click). Dash: L or E.
   Game XP lives in state.game and is fully separate from lessons, coins and looks. */
(function () {
  const h = NDC.h, G = NDC.game;
  const W = 480, H = 300, LEFT = 28, RIGHT = 452, TOP = 62, BOT = 284;
  const TAU = Math.PI * 2;
  const KEYS = {
    left: ["a", "arrowleft"], right: ["d", "arrowright"], up: ["w", "arrowup"], down: ["s", "arrowdown"],
    swing: [" ", "j"], block: ["shift", "k"], dash: ["l", "e"],
  };

  /* ---------- floors ---------- */
  const THEMES = [null,
    { name: "Slime Cellar", a: "#1b2a30", b: "#17242a", crack: "#0d161a", wall: "#243842", wallHi: "#34505c", glow: "#5fe0c8", deco: "slime", torch: [90, 200, 280, 390] },
    { name: "Mossy Halls", a: "#1d2b22", b: "#18261d", crack: "#0e1912", wall: "#2a3d2e", wallHi: "#3d5a44", glow: "#9bff7a", deco: "moss", torch: [70, 170, 310, 410] },
    { name: "Goblin Camp", a: "#2b2118", b: "#251c14", crack: "#150f0a", wall: "#3d2c1e", wallHi: "#58412c", glow: "#ff9a3d", deco: "camp", torch: [100, 190, 290, 380] },
    { name: "Deep Warrens", a: "#221a33", b: "#1d162c", crack: "#0f0a1a", wall: "#30244a", wallHi: "#46346b", glow: "#c07dff", deco: "crystal", torch: [80, 160, 320, 400] },
    { name: "The Goblin King", a: "#2a1a1a", b: "#241616", crack: "#140a0a", wall: "#42262a", wallHi: "#603840", glow: "#ffcf5a", deco: "throne", torch: [90, 170, 310, 390] },
  ];
  const FLOORS = [null,
    { waves: [["s", "s", "s"], ["s", "s", "g"], ["S", "g", "g"]], pillars: [[130, 150], [350, 150]] },
    { waves: [["g", "g", "s", "s", "s"], ["a", "a", "g"], ["S", "S", "a", "g", "g"]], pillars: [[120, 140], [360, 140], [240, 210]] },
    { waves: [["g", "g", "g", "a"], ["b", "b", "b", "g", "g"], ["a", "a", "g", "g", "g", "S"]], pillars: [[240, 190]], fire: true },
    { waves: [["b", "b", "b", "b", "a", "a"], ["B", "g", "g", "g"], ["B", "a", "a", "b", "b", "b", "g", "g"]], pillars: [[110, 150], [370, 150]] },
    { waves: [["g", "g", "g", "a", "a"], ["B", "b", "b", "b", "b"], ["K"]], pillars: [[100, 160], [380, 160]] },
  ];
  const BASE = {
    s: { hp: 2, r: 6, xp: 3, name: "slime" }, S: { hp: 5, r: 9, xp: 6, name: "bigslime" }, g: { hp: 6, r: 7, xp: 10, name: "goblin" },
    a: { hp: 4, r: 6, xp: 12, name: "archer" }, b: { hp: 2, r: 5, xp: 6, name: "bat" }, B: { hp: 20, r: 11, xp: 28, name: "brute" }, K: { hp: 120, r: 15, xp: 120, name: "king" },
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return Math.abs(d); };
  const turn = (from, to, k) => { let d = (to - from) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return from + d * k; };
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeInOut = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  function seeded(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

  /* ---------- sound (tiny synth, off until the player turns it on) ---------- */
  let ac = null, soundOn = false;
  function tone(f0, f1, dur, type, vol) {
    if (!soundOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = type || "square"; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(vol || 0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  const SFX = {
    swing: () => tone(420, 140, 0.09, "sawtooth", 0.03), hit: () => tone(160, 50, 0.12, "square", 0.06), kill: () => tone(300, 80, 0.16, "square", 0.05),
    block: () => tone(700, 380, 0.09, "triangle", 0.06), parry: () => { tone(1100, 1500, 0.14, "sine", 0.06); tone(500, 900, 0.1, "triangle", 0.04); },
    hurt: () => tone(180, 60, 0.22, "sawtooth", 0.07), dash: () => tone(260, 520, 0.1, "triangle", 0.03), arrow: () => tone(700, 300, 0.08, "square", 0.025),
    slam: () => tone(90, 30, 0.3, "square", 0.08), heal: () => tone(500, 900, 0.15, "sine", 0.05),
  };

  /* ---------- background art (drawn once per floor) ---------- */
  function buildBg(floor) {
    const th = THEMES[floor], def = FLOORS[floor], rng = seeded(floor * 17 + 3);
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    const R = (col, x, y, w, hh) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, hh); };
    // floor tiles
    for (let ty = TOP; ty < BOT; ty += 16) for (let tx = LEFT; tx < RIGHT; tx += 16) {
      const alt = ((tx - LEFT) / 16 + (ty - TOP) / 16) % 2;
      R(alt ? th.a : th.b, tx, ty, 16, 16);
      for (let i = 0; i < 6; i++) R(rng() > 0.5 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.12)", tx + rng() * 15, ty + rng() * 15, 1 + (rng() * 2 | 0), 1);
      R("rgba(0,0,0,0.28)", tx, ty + 15, 16, 1); R("rgba(0,0,0,0.28)", tx + 15, ty, 1, 16); R("rgba(255,255,255,0.04)", tx, ty, 16, 1);
    }
    // cracks
    for (let i = 0; i < 9; i++) {
      let x = LEFT + 20 + rng() * (RIGHT - LEFT - 40), y = TOP + 10 + rng() * (BOT - TOP - 24);
      for (let k = 0; k < 7; k++) { R(th.crack, x, y, 2, 1); x += rng() > 0.5 ? 2 : -2; y += rng() > 0.4 ? 1 : 0; }
    }
    // theme decoration on the floor
    const blob = (x, y, rw, rh, col, a) => { c.fillStyle = col; c.globalAlpha = a; c.beginPath(); c.ellipse(x, y, rw, rh, 0, 0, TAU); c.fill(); c.globalAlpha = 1; };
    if (th.deco === "slime") { for (let i = 0; i < 6; i++) { const x = rnd(60, 420), y = rnd(80, 270); blob(x, y, rnd(8, 18), rnd(4, 8), "#4fc47e", 0.22); blob(x - 2, y - 1, 4, 2, "#a8ffd0", 0.2); } }
    if (th.deco === "moss") { for (let i = 0; i < 12; i++) { const x = rnd(40, 440), y = rnd(70, 274); blob(x, y, rnd(6, 16), rnd(3, 7), "#4f8a3a", 0.35); } for (let i = 0; i < 7; i++) { const x = rnd(40, 440), y = rnd(80, 270); R("#e8d9ff", x, y - 3, 1, 3); R("#7affd0", x - 1, y - 5, 3, 2); } }
    if (th.deco === "camp") { blob(240, 192, 46, 18, "#1a120a", 0.7); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; R("#c8c0a8", 240 + Math.cos(a) * 34 + rnd(-3, 3), 192 + Math.sin(a) * 12, 4, 2); } }
    if (th.deco === "crystal") { for (let i = 0; i < 5; i++) { const x = rnd(50, 430), y = rnd(90, 270); blob(x, y, 22, 8, "#c07dff", 0.08); } }
    if (th.deco === "throne") {
      R("#6a1a24", 216, TOP, 48, BOT - TOP); R("#8a2a36", 220, TOP, 40, BOT - TOP); R(th.glow, 216, TOP, 2, BOT - TOP); R(th.glow, 262, TOP, 2, BOT - TOP);
      for (let y = TOP + 6; y < BOT; y += 12) R("#a03a46", 226, y, 28, 1);
    }
    // bones and rubble
    for (let i = 0; i < 7; i++) { const x = rnd(50, 430), y = rnd(80, 272); R("#d8d0b8", x, y, 5, 1); R("#d8d0b8", x + 1, y - 1, 1, 3); R("#d8d0b8", x + 4, y - 1, 1, 3); }
    for (let i = 0; i < 10; i++) { const x = rnd(40, 440), y = rnd(72, 278); R("#3a4256", x, y, 3, 2); R("#5a6480", x, y, 3, 1); }

    // top wall (the face of the wall you look at)
    R("#0a0c14", 0, 0, W, TOP);
    for (let y = 0; y < TOP - 8; y += 10) for (let x = -((y / 10) % 2) * 12; x < W; x += 24) {
      R(th.wall, x + 1, y + 1, 22, 8); R(th.wallHi, x + 1, y + 1, 22, 1); R("rgba(0,0,0,0.3)", x + 1, y + 8, 22, 1);
      for (let k = 0; k < 2; k++) R("rgba(255,255,255,0.04)", x + 3 + rng() * 16, y + 3 + rng() * 4, 2, 1);
    }
    R(th.wallHi, 0, TOP - 8, W, 2); R("#10131f", 0, TOP - 6, W, 6); R("rgba(0,0,0,0.5)", 0, TOP, W, 5); R("rgba(0,0,0,0.25)", 0, TOP + 5, W, 4);
    if (th.deco === "moss") for (let i = 0; i < 18; i++) { const x = rnd(0, W), l = rnd(6, 24); R("#3f7a34", x, TOP - 8 - l * 0.2, 2, l * 0.5); R("#5ca04a", x, TOP - 8 - l * 0.2, 2, 2); }
    if (th.deco === "slime") for (let i = 0; i < 10; i++) { const x = rnd(10, W - 10); R("#4fc47e", x, 20, 2, rnd(8, 30)); R("#a8ffd0", x, 20, 1, 6); }
    if (th.deco === "crystal") for (let i = 0; i < 7; i++) { const x = 30 + i * 65 + rnd(-10, 10), y = TOP - 8; R("#8a4fe0", x, y - 16, 5, 16); R("#c9a0ff", x + 1, y - 16, 2, 16); R("#8a4fe0", x - 3, y - 9, 4, 9); R("#c9a0ff", x - 2, y - 9, 1, 9); }
    if (th.deco === "throne") {
      R("#2a1218", 196, 4, 88, 56); R("#3a1a22", 200, 8, 80, 52); R("#f4cf5a", 196, 4, 88, 2); R("#f4cf5a", 196, 4, 2, 56); R("#f4cf5a", 282, 4, 2, 56);
      R("#7a2a36", 218, 20, 44, 40); R("#a03a46", 222, 24, 36, 36); R("#f4cf5a", 218, 18, 44, 3); R("#f4cf5a", 230, 8, 20, 10); R("#fff2b0", 236, 11, 8, 4);
    }
    // banners
    if (th.deco !== "throne") for (const bx of [140, 340]) { R("#101424", bx - 1, 8, 20, 30); R(th.deco === "camp" ? "#8a2f1e" : "#2d3a8a", bx, 8, 18, 28); R(th.glow, bx + 7, 14, 4, 12); R(th.glow, bx + 4, 18, 10, 3); R("#101424", bx, 36, 6, 3); R("#101424", bx + 12, 36, 6, 3); }
    // side and bottom walls
    for (let y = 0; y < H; y += 10) { R(th.wall, 0, y, LEFT - 6, 9); R(th.wallHi, 0, y, LEFT - 6, 1); R(th.wall, RIGHT + 6, y, W - RIGHT - 6, 9); R(th.wallHi, RIGHT + 6, y, W - RIGHT - 6, 1); }
    R("#10131f", LEFT - 6, 0, 6, H); R("#10131f", RIGHT, 0, 6, H); R("rgba(0,0,0,0.45)", LEFT, TOP, 7, BOT - TOP); R("rgba(0,0,0,0.45)", RIGHT - 7, TOP, 7, BOT - TOP);
    R("#0a0c14", 0, BOT, W, H - BOT); for (let x = 0; x < W; x += 20) { R(th.wall, x + 1, BOT + 2, 18, 12); R(th.wallHi, x + 1, BOT + 2, 18, 1); }
    R("rgba(0,0,0,0.5)", LEFT, BOT - 5, RIGHT - LEFT, 5);
    // torch brackets
    for (const tx of th.torch) { R("#10131f", tx - 3, 24, 6, 14); R("#5a4636", tx - 2, 26, 4, 10); R("#7a5a40", tx - 3, 22, 6, 3); }
    return cv;
  }
  const vignette = (() => {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d"), g = c.createRadialGradient(W / 2, H / 2 + 10, 90, W / 2, H / 2 + 10, 300);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.65)"); c.fillStyle = g; c.fillRect(0, 0, W, H); return cv;
  })();

  /* ====================================================================== */
  NDC.pages.dungeon = function () {
    let gs = G.gameStats(NDC.store.get());
    let sprite = null, raf = 0, last = 0, alive = true;
    const keys = new Set();
    let run = null, phase = "menu", pendingXp = 0, pendingKills = 0, bg = null, lightCv = null, mouse = { x: 0, y: 0, seen: 0 };

    const canvas = h("canvas", { width: W, height: H, class: "dg-canvas", tabindex: "0", "aria-label": "Dungeon game" });
    const ctx = canvas.getContext("2d");
    const menuEl = h("div", { class: "dg-menu" }), boardEl = h("div"), statEl = h("div", { class: "dg-stat" });
    lightCv = document.createElement("canvas"); lightCv.width = W; lightCv.height = H;
    const lctx = lightCv.getContext("2d");

    const loadout = () => G.loadout(NDC.store.get());
    function makeSprite() {
      const eq = Object.assign({}, NDC.store.equipped(), { shield: "none", weapon: "none" });
      const img = new Image();
      img.onload = () => { sprite = img; };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(NDC.knight.svg(eq, { crop: [0, 0, 30, 32] }));
    }

    /* ---------- starting ---------- */
    function start(floor) {
      gs = G.gameStats(NDC.store.get());
      const L = loadout();
      const maxHp = 100 + gs.hpBonus + L.hp, maxSt = 100 + gs.staminaBonus;
      const p = {
        x: W / 2, y: BOT - 36, vx: 0, vy: 0, kx: 0, ky: 0, r: 7, dir: -Math.PI / 2, hp: maxHp, maxHp, st: maxSt, maxSt, stWait: 0,
        speed: 100 * (1 + L.speed), swing: null, combo: 0, comboT: 0, queued: false, block: 0, blocking: false, blockT: 0, shieldKick: 0,
        dash: 0, dashCd: 0, dashDir: 0, stun: 0, inv: 0, flash: 0, walk: 0, L,
      };
      run = {
        floor, p, theme: THEMES[floor], def: FLOORS[floor], enemies: [], spawns: [], arrows: [], waves: [], fx: [], pickups: [], t: 0,
        waveIdx: 0, waveWait: 0.8, gained: 0, kills: 0, banner: THEMES[floor].name, bannerT: 2.4, freeze: 0, shake: 0, slow: 0, over: false, endT: 0,
        pillars: FLOORS[floor].pillars.map(([x, y]) => ({ x, y, r: 9 })), best: 0, hitFlash: 0,
      };
      if (FLOORS[floor].fire) run.pillars.push({ x: 240, y: 192, r: 10, fire: true });
      bg = buildBg(floor);
      phase = "play"; makeSprite(); menuEl.hidden = true; canvas.focus({ preventScroll: true });
    }

    function spawnWave() {
      const w = run.def.waves[run.waveIdx], scale = 1 + 0.18 * (run.floor - 1);
      run.waveIdx++;
      run.banner = run.def.waves.length > 1 ? `Wave ${run.waveIdx} of ${run.def.waves.length}` : "Final wave"; run.bannerT = 1.6;
      if (w.includes("K")) { run.banner = "The Goblin King"; run.bannerT = 2.4; }
      w.forEach((k, i) => {
        let x, y, tries = 0;
        do { x = rnd(LEFT + 30, RIGHT - 30); y = rnd(TOP + 14, BOT - 40); tries++; } while (tries < 20 && (Math.hypot(x - run.p.x, y - run.p.y) < 110 || run.pillars.some((q) => Math.hypot(x - q.x, y - q.y) < 22)));
        if (k === "K") { x = W / 2; y = TOP + 40; }
        run.spawns.push({ k, x, y, t: 0.55 + i * 0.12, scale });
      });
    }
    function makeEnemy(k, x, y, scale, small) {
      const b = BASE[k];
      const e = { k, kind: b.name, x, y, vx: 0, vy: 0, kx: 0, ky: 0, r: b.r, hp: b.hp * scale, max: b.hp * scale, xp: b.xp, flash: 0, stun: 0, st: "move", t: Math.random() * 2, cd: rnd(0.4, 1.4), face: 1, hit: false, anim: Math.random() * 6, spawnT: 0.25, scale };
      if (k === "b") { e.fly = true; e.orbit = Math.random() * TAU; }
      if (k === "K") { e.cd = 1.5; e.phase = 0; e.sum = 0; e.atk = 0; }
      if (small) { e.fromSplit = true; }
      return e;
    }

    /* ---------- finishing ---------- */
    function commit() {
      if (!pendingXp && !pendingKills) return;
      const xp = pendingXp, kills = pendingKills; pendingXp = 0; pendingKills = 0;
      NDC.store.update((s) => { const g = s.game || {}; s.game = { xp: (g.xp || 0) + xp, best: g.best || 0, kills: (g.kills || 0) + kills }; });
    }
    function setBest(f) { NDC.store.update((s) => { const g = s.game || { xp: 0, best: 0, kills: 0 }; s.game = { xp: g.xp, kills: g.kills, best: Math.max(g.best || 0, f) }; }); }
    function finish(win) {
      if (run.over) return;
      run.over = true; run.endT = win ? 1.6 : 1.1;
      const before = G.gameStats(NDC.store.get()).level;
      if (win) { pendingXp += 15 * run.floor; run.gained += 15 * run.floor; setBest(run.floor); }
      commit();
      const after = G.gameStats(NDC.store.get());
      run.levelUp = after.level > before ? after.level : 0; run.totalXp = run.gained; run.win = win;
      gs = after; drawStat(); loadBoard();
      NDC.auth.postScore(NDC.store.get()).catch(() => {});
      if (win) { run.banner = "Floor cleared!"; run.bannerT = 2; run.slow = 0.6; } else { run.banner = "Knocked out"; run.bannerT = 2; run.slow = 0.8; }
    }

    /* ---------- helpers ---------- */
    function down(n) { return KEYS[n].some((k) => keys.has(k)); }
    function addFx(o) { run.fx.push(o); }
    function sparks(x, y, col, n, spd) { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), s = rnd(0.4, 1) * (spd || 90); addFx({ k: "spark", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, t: rnd(0.2, 0.45), c: col }); } }
    function puff(x, y, col, n) { for (let i = 0; i < n; i++) addFx({ k: "puff", x: x + rnd(-4, 4), y: y + rnd(-3, 3), vx: rnd(-20, 20), vy: rnd(-30, -5), t: rnd(0.3, 0.6), c: col, s: rnd(2, 4) }); }
    function pushOut(e) {
      for (const q of run.pillars) {
        const dx = e.x - q.x, dy = e.y - q.y, d = Math.hypot(dx, dy) || 1, m = q.r + e.r * 0.8;
        if (d < m) { e.x = q.x + (dx / d) * m; e.y = q.y + (dy / d) * m; }
      }
      e.x = clamp(e.x, LEFT + e.r, RIGHT - e.r); e.y = clamp(e.y, TOP + 4 + e.r * 0.4, BOT - e.r);
    }

    /* ---------- player taking damage ---------- */
    function hurtPlayer(sx, sy, raw, opt) {
      const p = run.p; opt = opt || {};
      if (p.inv > 0 || p.dash > 0 || run.over) return false;
      const ang = Math.atan2(sy - p.y, sx - p.x);
      let dmg = raw * (1 - p.L.def);
      if (p.blocking && p.block > 0.6 && !opt.unblockable && angDiff(p.dir, ang) <= (p.L.shield.arc * Math.PI) / 360) {
        const sh = p.L.shield;
        if (sh.parry && p.blockT < sh.parry) {
          if (opt.src) { opt.src.stun = 1.1; opt.src.st = "move"; opt.src.t = 0; opt.src.cd = 1.2; opt.src.kx += Math.cos(ang + Math.PI) * 120; opt.src.ky += Math.sin(ang + Math.PI) * 120; }
          const fx = p.x + Math.cos(p.dir) * 14, fy = p.y + Math.sin(p.dir) * 14;
          addFx({ k: "ring", x: fx, y: fy, t: 0.35, d: 0.35, c: "#ffe9a0", s: 22 }); sparks(fx, fy, "#ffe9a0", 14, 140);
          p.inv = 0.3; p.shieldKick = 1; run.freeze = 0.09; run.shake = 4; SFX.parry();
          p.st = Math.min(p.maxSt, p.st + 15);
          return true;
        }
        dmg *= 1 - sh.block; p.st -= sh.cost; p.stWait = 0.9; p.shieldKick = 1;
        const fx = p.x + Math.cos(p.dir) * 12, fy = p.y + Math.sin(p.dir) * 12;
        sparks(fx, fy, "#dfe6f7", 8, 110); addFx({ k: "ring", x: fx, y: fy, t: 0.2, d: 0.2, c: "#dfe6f7", s: 14 });
        p.kx += Math.cos(ang + Math.PI) * 70; p.ky += Math.sin(ang + Math.PI) * 70; run.shake = 2.5; run.freeze = 0.04; SFX.block();
        if (p.st <= 0) { p.st = 0; p.stun = 0.9; p.blocking = false; p.block = 0; addFx({ k: "text", x: p.x, y: p.y - 22, t: 0.8, v: "Guard broken", c: "#ffb04a" }); }
      } else { p.kx += Math.cos(ang + Math.PI) * 110; p.ky += Math.sin(ang + Math.PI) * 110; run.shake = 5; run.freeze = 0.06; SFX.hurt(); run.hitFlash = 0.25; }
      p.hp -= dmg; p.inv = 0.55; p.flash = 0.25;
      addFx({ k: "text", x: p.x, y: p.y - 18, t: 0.7, v: Math.round(dmg), c: "#ff5d73" });
      if (p.hp <= 0) { p.hp = 0; finish(false); }
      return false;
    }

    /* ---------- player attack ---------- */
    function startSwing() {
      const p = run.p, w = p.L.weapon;
      const combo = p.comboT > 0 ? (p.combo % 3) + 1 : 1;
      const cost = combo === 3 ? 15 : 9;
      if (p.st < cost) return false;
      p.st -= cost; p.stWait = 0.5; p.combo = combo; p.comboT = 0;
      // gentle aim assist toward the nearest enemy when using the keyboard
      if (!(mouse.seen > 0)) {
        let best = null, bd = 1e9;
        for (const e of run.enemies) { const d = dist(p, e); const a = Math.atan2(e.y - p.y, e.x - p.x); if (d < 70 && angDiff(a, p.dir) < 1.3 && d < bd) { bd = d; best = a; } }
        if (best !== null) p.dir = best;
      }
      const dur = (w.swing / 1000) * (combo === 3 ? 1.4 : combo === 2 ? 0.92 : 1);
      p.swing = { t: 0, dur, combo, side: combo === 2 ? -1 : 1, dir: p.dir, hit: false, hits: new Set() };
      SFX.swing();
      return true;
    }
    function swingAngle(sw, half) {
      const u = sw.t / sw.dur, s = sw.side, a0 = sw.dir - s * half, a1 = sw.dir + s * half;
      const back = a0 - s * 0.45, over = a1 + s * 0.18;
      if (u < 0.24) return lerp(sw.dir + s * -0.0, back, easeInOut(u / 0.24)) * 0 + lerp(a0, back, easeInOut(u / 0.24));
      if (u < 0.52) return lerp(back, over, easeOut((u - 0.24) / 0.28));
      return lerp(over, sw.dir + s * 0.25, easeInOut((u - 0.52) / 0.48));
    }
    function swingHalf(sw) { const w = run.p.L.weapon; const base = w.reach > 1.5 ? 1.55 : 1.1; return sw.combo === 3 ? Math.PI * 0.95 : base; }
    function doHit(sw) {
      const p = run.p, w = p.L.weapon, half = swingHalf(sw), fin = sw.combo === 3;
      const range = 26 * w.reach * (fin ? 1.15 : 1);
      let any = false;
      for (const e of run.enemies) {
        if (e.spawnT > 0 || sw.hits.has(e)) continue;
        const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
        if (d > range + e.r) continue;
        if (!fin && angDiff(sw.dir, Math.atan2(dy, dx)) > half) continue;
        sw.hits.add(e); any = true;
        const dmg = w.dmg * (fin ? 1.6 : 1) * (sw.combo === 2 ? 1.1 : 1);
        e.hp -= dmg; e.flash = 0.12; e.stun = Math.max(e.stun, e.k === "K" || e.k === "B" ? 0 : 0.18);
        const kb = (e.k === "K" ? 35 : e.k === "B" ? 70 : 150) * (0.7 + w.dmg * 0.12) * (fin ? 1.6 : 1);
        e.kx += (dx / (d || 1)) * kb; e.ky += (dy / (d || 1)) * kb;
        if (e.st === "wind" && w.dmg >= 3) { e.st = "move"; e.t = 0; e.cd = 0.8; }
        sparks(e.x, e.y, "#fff", fin ? 10 : 6, 120);
        addFx({ k: "text", x: e.x, y: e.y - e.r - 8, t: 0.6, v: Math.round(dmg * 10) / 10, c: "#fff" });
        SFX.hit();
      }
      if (any) { run.freeze = Math.max(run.freeze, fin ? 0.1 : 0.05); run.shake = Math.max(run.shake, fin ? 5 : 2); }
      const dead = run.enemies.filter((e) => e.hp <= 0);
      dead.forEach(kill);
      run.enemies = run.enemies.filter((e) => e.hp > 0);
      if (fin) { addFx({ k: "ring", x: p.x, y: p.y, t: 0.3, d: 0.3, c: "#fff", s: range }); }
    }
    function kill(e) {
      pendingXp += e.xp; run.gained += e.xp; pendingKills++; run.kills++;
      const col = { slime: "#4fc47e", bigslime: "#4fc47e", goblin: "#9bd05a", archer: "#6ab04a", bat: "#8a6fb0", brute: "#7a9a4a", king: "#f4cf5a" }[e.kind];
      sparks(e.x, e.y, col, e.k === "K" ? 40 : 14, 130); puff(e.x, e.y, col, 6); SFX.kill();
      if (e.k === "S") { for (let i = 0; i < 2; i++) { const m = makeEnemy("s", e.x + (i ? 8 : -8), e.y, e.scale); m.kx = (i ? 1 : -1) * 90; m.ky = -40; m.spawnT = 0; m.xp = 3; run.enemies.push(m); } }
      if (Math.random() < (e.k === "K" ? 0 : 0.13) && e.k !== "s") run.pickups.push({ x: e.x, y: e.y, t: 0, k: "heart" });
      if (e.k === "K") { run.shake = 9; run.slow = 0.7; for (const o of run.enemies) o.hp = Math.min(o.hp, 0); }
    }

    /* ---------- update ---------- */
    function update(dt) {
      if (!run) return;
      const p = run.p;
      run.t += dt;
      if (run.bannerT > 0) run.bannerT -= dt;
      for (const f of run.fx) { f.t -= dt; if (f.k === "spark" || f.k === "puff") { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.k === "spark" ? 220 : -10) * dt; } }
      run.fx = run.fx.filter((f) => f.t > 0);
      run.shake = Math.max(0, run.shake - dt * 22); run.hitFlash = Math.max(0, run.hitFlash - dt);
      if (run.freeze > 0) { run.freeze -= dt; return; }
      if (run.slow > 0) { run.slow -= dt; dt *= 0.35; }

      if (run.over) {
        run.endT -= dt * (run.slow > 0 ? 3 : 1);
        if (run.endT <= 0 && phase === "play") { phase = run.win ? "clear" : "dead"; drawMenu(); }
      }
      if (!run.over) {
        p.inv = Math.max(0, p.inv - dt); p.stun = Math.max(0, p.stun - dt); p.stWait = Math.max(0, p.stWait - dt); p.flash = Math.max(0, p.flash - dt);
        p.dashCd = Math.max(0, p.dashCd - dt); p.comboT = Math.max(0, p.comboT - dt); p.shieldKick = Math.max(0, p.shieldKick - dt * 5);
        let ix = (down("right") ? 1 : 0) - (down("left") ? 1 : 0), iy = (down("down") ? 1 : 0) - (down("up") ? 1 : 0);
        if (ix || iy) { const m = Math.hypot(ix, iy); ix /= m; iy /= m; }
        if (mouse.seen > 0) { mouse.seen -= dt; if (!p.swing || p.swing.t > p.swing.dur * 0.6) p.dir = turn(p.dir, Math.atan2(mouse.y - p.y, mouse.x - p.x), Math.min(1, 18 * dt)); }

        // block (raises smoothly; the shield comes up from the side)
        const want = down("block") && p.stun <= 0 && !p.swing && p.dash <= 0 && p.st > 0;
        if (want && !p.blocking) p.blockT = 0;
        p.blocking = want;
        p.block = clamp(p.block + (want ? 9 : -8) * dt, 0, 1);
        if (p.blocking) { p.blockT += dt * 1000; p.st -= 5 * dt; p.stWait = 0.4; if (p.st <= 0) { p.st = 0; p.blocking = false; } }

        // dash
        if (p.dash <= 0 && down("dash") && p.dashCd <= 0 && p.stun <= 0 && p.st >= 20 && !p.swing) {
          p.dash = 0.17; p.dashCd = 0.45; p.st -= 20; p.stWait = 0.5; p.dashDir = (ix || iy) ? Math.atan2(iy, ix) : p.dir; p.inv = 0.22; SFX.dash();
          for (let i = 0; i < 4; i++) puff(p.x, p.y + 4, "#9fb0d0", 1);
        }
        if (p.dash > 0) { p.dash -= dt; p.x += Math.cos(p.dashDir) * 250 * dt; p.y += Math.sin(p.dashDir) * 250 * dt; if (Math.random() < 0.7) addFx({ k: "ghost", x: p.x, y: p.y, t: 0.18, f: Math.cos(p.dir) < 0 }); }
        else {
          // walk with a little acceleration so it feels weighty but responsive
          let sp = p.speed * (p.blocking ? 0.55 : 1) * (p.stun > 0 ? 0.25 : 1) * (p.swing ? 0.45 : 1);
          const tx = ix * sp, ty = iy * sp, k = Math.min(1, 16 * dt);
          p.vx = lerp(p.vx, tx, k); p.vy = lerp(p.vy, ty, k);
          if (p.swing) { const u = p.swing.t / p.swing.dur; if (u > 0.2 && u < 0.5) { p.vx += Math.cos(p.swing.dir) * 140 * dt * 8; p.vy += Math.sin(p.swing.dir) * 140 * dt * 8; } }
          p.x += (p.vx + p.kx) * dt; p.y += (p.vy + p.ky) * dt;
          if ((ix || iy) && mouse.seen <= 0 && !p.swing && !p.stun) p.dir = turn(p.dir, Math.atan2(iy, ix), Math.min(1, 16 * dt));
          if (ix || iy) p.walk += dt * 11;
        }
        p.kx *= Math.max(0, 1 - 9 * dt); p.ky *= Math.max(0, 1 - 9 * dt);
        pushOut(p);

        // swing
        if (p.swing) {
          const sw = p.swing, before = sw.t / sw.dur;
          sw.t += dt;
          if (!sw.hit && before < 0.34 && sw.t / sw.dur >= 0.34) { sw.hit = true; doHit(sw); }
          if (sw.t / sw.dur > 0.55 && p.queued) { p.queued = false; p.swing = null; p.comboT = 0.3; if (!startSwing()) p.comboT = 0; }
          else if (sw.t >= sw.dur) { p.comboT = 0.35; p.swing = null; p.queued = false; }
        } else if (down("swing") && !p.blocking && p.stun <= 0 && p.dash <= 0) {
          startSwing();
        }
        if (p.swing && down("swing") && p.swing.t / p.swing.dur > 0.2) p.queued = true;
        p.swingHeld = down("swing");
        if (p.stWait <= 0 && !p.blocking) p.st = Math.min(p.maxSt, p.st + 32 * dt);
      }

      // pickups
      for (const q of run.pickups) { q.t += dt; if (Math.hypot(q.x - p.x, q.y - p.y) < 12 && !run.over) { q.got = true; p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.22); addFx({ k: "text", x: p.x, y: p.y - 18, t: 0.8, v: "+Health", c: "#7dffa8" }); SFX.heal(); sparks(q.x, q.y, "#ff7d8a", 8, 60); } }
      run.pickups = run.pickups.filter((q) => !q.got && q.t < 14);

      // waves
      for (const s of run.spawns) { s.t -= dt; if (s.t <= 0) { run.enemies.push(makeEnemy(s.k, s.x, s.y, s.scale)); puff(s.x, s.y, run.theme.glow, 8); s.done = true; } }
      run.spawns = run.spawns.filter((s) => !s.done);
      if (!run.over && !run.enemies.length && !run.spawns.length) {
        run.waveWait -= dt;
        if (run.waveWait <= 0) {
          if (run.waveIdx < run.def.waves.length) { spawnWave(); run.waveWait = 0.9; } else finish(true);
        }
      } else if (!run.over) run.waveWait = 0.9;

      // enemies
      for (const e of run.enemies) updateEnemy(e, dt, p);
      for (let i = 0; i < run.enemies.length; i++) for (let j = i + 1; j < run.enemies.length; j++) {
        const a = run.enemies[i], b = run.enemies[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy) || 1, m = (a.r + b.r) * 0.85;
        if (d < m && !a.fly && !b.fly) { const o = (m - d) / 2; a.x += (dx / d) * o; a.y += (dy / d) * o; b.x -= (dx / d) * o; b.y -= (dy / d) * o; }
      }
      // arrows
      for (const a of run.arrows) {
        a.x += a.vx * dt; a.y += a.vy * dt; a.life -= dt;
        if (!run.over && Math.hypot(a.x - p.x, a.y - p.y) < p.r + 3) { a.life = 0; hurtPlayer(a.x - a.vx * 0.05, a.y - a.vy * 0.05, a.dmg, {}); }
        if (run.pillars.some((q) => Math.hypot(a.x - q.x, a.y - q.y) < q.r) || a.x < LEFT || a.x > RIGHT || a.y < TOP - 4 || a.y > BOT) { if (a.life > 0) sparks(a.x, a.y, "#c8b080", 3, 50); a.life = 0; }
      }
      run.arrows = run.arrows.filter((a) => a.life > 0);
      for (const w of run.waves || []) { w.r += w.speed * dt; if (!w.hit && !run.over && Math.abs(Math.hypot(p.x - w.x, p.y - w.y) - w.r) < 7 && p.dash <= 0) { w.hit = true; hurtPlayer(w.x, w.y, w.dmg, { unblockable: true }); } }
      run.waves = (run.waves || []).filter((w) => w.r < w.max);
    }

    function updateEnemy(e, dt, p) {
      e.flash = Math.max(0, e.flash - dt); e.stun = Math.max(0, e.stun - dt); e.cd -= dt; e.anim += dt * 6;
      if (e.spawnT > 0) { e.spawnT -= dt; return; }
      e.x += e.kx * dt; e.y += e.ky * dt; e.kx *= Math.max(0, 1 - 8 * dt); e.ky *= Math.max(0, 1 - 8 * dt);
      const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, ang = Math.atan2(dy, dx);
      e.face = dx < 0 ? -1 : 1;
      if (e.stun > 0 || run.over) { pushOut(e); return; }
      const mv = (sp, a) => { e.x += Math.cos(a === undefined ? ang : a) * sp * dt; e.y += Math.sin(a === undefined ? ang : a) * sp * dt; };
      const touch = (dmg, range) => { if (d < e.r + p.r + (range || 2) && e.cd <= 0) { e.cd = 1.1; hurtPlayer(e.x, e.y, dmg, { src: e }); } };
      const sc = 1 + 0.1 * (run.floor - 1);
      switch (e.k) {
        case "s": case "S": {
          e.t += dt;
          const period = e.k === "S" ? 1.3 : 0.95;
          const u = (e.t % period) / period;
          e.squash = u < 0.45 ? u / 0.45 : 0;
          if (u > 0.55 && u < 0.9) mv((e.k === "S" ? 70 : 85) * (1 - (u - 0.55) / 0.35 * 0.5));
          if (u > 0.5 && u < 0.95) touch((e.k === "S" ? 9 : 5) * sc, 3);
          break;
        }
        case "g": {
          if (e.st === "move") {
            e.t += dt;
            if (d > 44) mv(54 + run.floor * 3, ang + Math.sin(e.t * 2) * 0.5); else if (d < 30) mv(-30);
            if (d < 52 && e.cd <= 0) { e.st = "wind"; e.t = 0; e.lock = ang; }
          } else if (e.st === "wind") {
            e.t += dt; e.lock = turn(e.lock, ang, 0.1);
            if (e.t > 0.5) { e.st = "lunge"; e.t = 0; e.hit = false; }
          } else if (e.st === "lunge") {
            e.t += dt; mv(230, e.lock);
            if (!e.hit && d < e.r + p.r + 8) { e.hit = true; hurtPlayer(e.x, e.y, 14 * sc, { src: e }); }
            if (e.t > 0.2) { e.st = "move"; e.t = 0; e.cd = 1.2; e.stun = 0.35; }
          }
          break;
        }
        case "a": {
          if (e.st === "move") {
            e.t += dt;
            if (d < 100) mv(-50); else if (d > 170) mv(46); else mv(22, ang + Math.PI / 2 * (Math.sin(e.t) > 0 ? 1 : -1));
            if (e.cd <= 0 && d < 230) { e.st = "wind"; e.t = 0; }
          } else if (e.st === "wind") {
            e.t += dt; e.lock = ang;
            if (e.t > 0.75) { e.st = "move"; e.t = 0; e.cd = 1.9; SFX.arrow(); run.arrows.push({ x: e.x, y: e.y - 4, vx: Math.cos(ang) * 150, vy: Math.sin(ang) * 150, life: 3, dmg: 10 * sc }); }
          }
          break;
        }
        case "b": {
          e.orbit += dt * 1.6;
          if (e.st === "move") {
            const tx = p.x + Math.cos(e.orbit) * 70, ty = p.y + Math.sin(e.orbit) * 46;
            const a = Math.atan2(ty - e.y, tx - e.x); mv(70, a);
            if (e.cd <= 0) { e.st = "wind"; e.t = 0; }
          } else if (e.st === "wind") { e.t += dt; if (e.t > 0.35) { e.st = "lunge"; e.t = 0; e.lock = ang; e.hit = false; } }
          else if (e.st === "lunge") {
            e.t += dt; mv(190, e.lock);
            if (!e.hit && d < e.r + p.r + 3) { e.hit = true; hurtPlayer(e.x, e.y, 7 * sc, { src: e }); }
            if (e.t > 0.45) { e.st = "move"; e.cd = 1.4; }
          }
          break;
        }
        case "B": {
          if (e.st === "move") {
            e.t += dt; if (d > 30) mv(34);
            if (d < 62 && e.cd <= 0) { e.st = "wind"; e.t = 0; }
          } else if (e.st === "wind") {
            e.t += dt;
            if (e.t > 0.85) { e.st = "move"; e.t = 0; e.cd = 1.8; SFX.slam(); run.shake = 6; addFx({ k: "ring", x: e.x, y: e.y, t: 0.35, d: 0.35, c: "#ffb04a", s: 50 }); if (Math.hypot(p.x - e.x, p.y - e.y) < 50 + p.r) hurtPlayer(e.x, e.y, 26 * sc, { src: e }); }
          }
          break;
        }
        case "K": {
          if (e.hp < e.max * 0.66 && e.sum < 1) { e.sum = 1; summon(e, ["g", "g"]); }
          if (e.hp < e.max * 0.33 && e.sum < 2) { e.sum = 2; summon(e, ["a", "a", "b"]); }
          if (e.st === "move") {
            e.t += dt; if (d > 40) mv(46);
            touch(22, 6);
            if (e.cd <= 0) { e.atk++; e.st = e.atk % 2 ? "windC" : "windS"; e.t = 0; e.lock = ang; }
          } else if (e.st === "windC") {
            e.t += dt; e.lock = turn(e.lock, ang, 0.05); if (e.t > 0.8) { e.st = "charge"; e.t = 0; e.hit = false; SFX.dash(); }
          } else if (e.st === "charge") {
            e.t += dt; mv(240, e.lock);
            if (!e.hit && d < e.r + p.r + 4) { e.hit = true; hurtPlayer(e.x, e.y, 26, { src: e }); }
            if (e.t > 0.6 || e.x < LEFT + 20 || e.x > RIGHT - 20 || e.y < TOP + 14 || e.y > BOT - 20) { e.st = "move"; e.t = 0; e.cd = 1.2; e.stun = 0.7; run.shake = 4; }
          } else if (e.st === "windS") {
            e.t += dt; if (e.t > 0.9) { e.st = "move"; e.t = 0; e.cd = 1.6; SFX.slam(); run.shake = 8; run.waves.push({ x: e.x, y: e.y, r: 8, max: 130, speed: 160, dmg: 22, hit: false }); addFx({ k: "ring", x: e.x, y: e.y, t: 0.3, d: 0.3, c: "#ffcf5a", s: 30 }); }
          }
          break;
        }
      }
      pushOut(e);
    }
    function summon(e, list) {
      run.banner = "The king calls for help!"; run.bannerT = 1.6;
      list.forEach((k, i) => run.spawns.push({ k, x: clamp(e.x + (i - 1) * 50, LEFT + 20, RIGHT - 20), y: clamp(e.y + 40, TOP + 20, BOT - 20), t: 0.5 + i * 0.15, scale: 1 + 0.18 * 4 }));
    }

    /* ====================================================================== */
    /* drawing                                                                */
    /* ====================================================================== */
    const R = (c, x, y, w, hh) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, hh); };
    function shadow(x, y, rw) { ctx.fillStyle = "rgba(0,0,0,0.38)"; ctx.beginPath(); ctx.ellipse(Math.round(x), Math.round(y), rw, rw * 0.38, 0, 0, TAU); ctx.fill(); }

    function drawSlime(e) {
      const big = e.k === "S", sq = e.squash || 0, s = big ? 1.45 : 1;
      const w = (14 + sq * 3) * s, hh = (10 - sq * 3) * s, x = e.x - w / 2, y = e.y - hh + 3;
      const body = e.flash > 0 ? "#fff" : "#4fc47e", dk = "#2f8f56";
      shadow(e.x, e.y + 3, w / 2);
      R("#0a0c16", x - 1, y - 1, w + 2, hh + 2); R(body, x, y, w, hh); R(body, x + 2 * s, y - 2 * s, w - 4 * s, 2 * s);
      R(dk, x, y + hh - 3, w, 3); R("#9bffc4", x + 2 * s, y + 1, 4 * s, 2);
      R("#0a0c16", x + w * 0.28, y + hh * 0.35, 2, 3 * s * 0.8); R("#0a0c16", x + w * 0.62, y + hh * 0.35, 2, 3 * s * 0.8);
    }
    function drawGoblin(e, big) {
      const s = big ? 1.5 : 1, bob = Math.abs(Math.sin(e.anim)) * 1.4, f = e.face;
      const x = e.x, y = e.y - bob;
      const skin = e.flash > 0 ? "#fff" : big ? "#6fae3a" : "#8bc34a", dk = big ? "#3f6a1d" : "#5a8a2a";
      shadow(x, e.y + 2, 7 * s);
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w) * s, y + oy * s, w * s, hh * s);
      rr("#0a0c16", -6, -17, 12, 19); // outline block
      rr(big ? "#7a3d1a" : "#8a5a2f", -4, -8, 8, 7); rr(dk, -4, -2, 3, 3); rr(dk, 1, -2, 3, 3);
      rr(skin, -5, -16, 10, 8); rr(skin, -8, -14, 3, 3); rr(skin, 5, -14, 3, 3);
      rr("#fff6d0", -3, -12, 2, 2); rr("#fff6d0", 1, -12, 2, 2); rr("#0a0c16", -2, -12, 1, 2); rr("#0a0c16", 2, -12, 1, 2);
      if (big) { rr("#f4b942", -5, -19, 10, 3); rr("#f4b942", -5, -22, 2, 3); rr("#f4b942", -1, -22, 2, 3); rr("#f4b942", 3, -22, 2, 3); }
      // club, raised during the wind-up
      const up = e.st === "wind" || e.st === "windC" ? 1 : 0;
      rr("#6a4630", 5, up ? -22 : -8, 3, up ? 14 : 10); rr("#8a5a2f", 4, up ? -24 : -10, 5, 4);
      if (up) { ctx.fillStyle = "rgba(255,93,115," + (0.25 + 0.2 * Math.sin(run.t * 30)) + ")"; ctx.beginPath(); ctx.ellipse(e.x, e.y + 2, 16 * s, 6 * s, 0, 0, TAU); ctx.fill(); R("#ff5d73", e.x - 1, y - 28 * s, 3, 6); R("#ff5d73", e.x - 1, y - 20 * s, 3, 3); }
    }
    function drawArcher(e) {
      const f = e.face, x = e.x, y = e.y - Math.abs(Math.sin(e.anim)) * 1;
      shadow(x, e.y + 2, 6);
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
      rr("#0a0c16", -5, -16, 10, 18);
      rr("#3b6a2a", -4, -9, 8, 9); rr("#2a4a1e", -4, -2, 3, 2); rr("#2a4a1e", 1, -2, 3, 2);
      rr(e.flash > 0 ? "#fff" : "#4f8a3a", -4, -15, 8, 7); rr("#2a4a1e", -5, -16, 10, 3);
      rr("#ffe9a0", -2, -11, 2, 2); rr("#ffe9a0", 1, -11, 2, 2);
      rr("#8a5a2f", 5, -12, 1, 12); rr("#dfe6f7", 5, -12, 1, 1);
      if (e.st === "wind") { ctx.strokeStyle = "rgba(255,93,115," + (0.3 + e.t * 0.8) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + Math.cos(e.lock) * 260, y - 6 + Math.sin(e.lock) * 260); ctx.stroke(); }
    }
    function drawBat(e) {
      const flap = Math.sin(e.anim * 2.4) * 4, y = e.y - 12;
      shadow(e.x, e.y + 2, 5);
      R("#0a0c16", e.x - 9, y - 4 - Math.abs(flap), 18, 10 + Math.abs(flap));
      R(e.flash > 0 ? "#fff" : "#6a4f9a", e.x - 8, y - flap, 6, 4); R(e.flash > 0 ? "#fff" : "#6a4f9a", e.x + 2, y - flap, 6, 4);
      R(e.flash > 0 ? "#fff" : "#4a3570", e.x - 3, y - 2, 6, 7); R("#ff7d8a", e.x - 2, y, 1, 1); R("#ff7d8a", e.x + 1, y, 1, 1);
      if (e.st === "wind") R("#ff5d73", e.x - 1, y - 14, 3, 6);
    }
    function drawBrute(e) {
      const f = e.face, x = e.x, y = e.y - Math.abs(Math.sin(e.anim * 0.7)) * 1.2, wind = e.st === "wind";
      shadow(x, e.y + 3, 13);
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
      rr("#0a0c16", -12, -27, 24, 30);
      rr("#4a5a3a", -9, -12, 18, 13); rr("#6a7a5a", -10, -18, 20, 7); rr("#8a9a7a", -10, -18, 20, 2);
      rr(e.flash > 0 ? "#fff" : "#7a9a4a", -6, -26, 12, 10); rr("#ffe9a0", -4, -22, 2, 2); rr("#ffe9a0", 2, -22, 2, 2); rr("#e8e0c8", -3, -17, 2, 3); rr("#e8e0c8", 1, -17, 2, 3);
      rr("#3a3a48", -8, -2, 6, 4); rr("#3a3a48", 2, -2, 6, 4);
      rr("#6a4630", 9, wind ? -38 : -14, 4, wind ? 28 : 18); rr("#7a7a8a", 7, wind ? -42 : -18, 8, 6);
      if (wind) { ctx.fillStyle = "rgba(255,93,115," + (0.18 + 0.2 * (e.t / 0.85)) + ")"; ctx.beginPath(); ctx.ellipse(e.x, e.y, 50, 22, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = "#ff5d73"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(e.x, e.y, 50, 22, 0, 0, TAU); ctx.stroke(); }
    }
    function drawKing(e) {
      const f = e.face, x = e.x, y = e.y - Math.abs(Math.sin(e.anim * 0.6)) * 1.5;
      shadow(x, e.y + 4, 18);
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
      rr("#0a0c16", -17, -38, 34, 42);
      rr("#8a1f2a", -16, -26, 32, 28); rr("#a8323e", -14, -26, 28, 6); // cape
      rr("#6a7a5a", -10, -18, 20, 14); rr("#8a9a7a", -10, -18, 20, 2); rr("#f4cf5a", -10, -8, 20, 2);
      rr(e.flash > 0 ? "#fff" : "#7ab03a", -8, -36, 16, 14); rr("#ffe9a0", -5, -31, 3, 3); rr("#ffe9a0", 2, -31, 3, 3); rr("#0a0c16", -4, -30, 1, 2); rr("#0a0c16", 3, -30, 1, 2);
      rr("#e8e0c8", -5, -24, 3, 4); rr("#e8e0c8", 2, -24, 3, 4);
      rr("#f4cf5a", -9, -42, 18, 6); rr("#f4cf5a", -9, -46, 4, 4); rr("#f4cf5a", -2, -48, 4, 6); rr("#f4cf5a", 5, -46, 4, 4); rr("#e5484d", -1, -44, 2, 2);
      const up = e.st === "windS" ? 1 : 0;
      rr("#6a4630", 14, up ? -50 : -22, 5, up ? 36 : 28); rr("#9a9aaa", 11, up ? -56 : -28, 11, 9);
      if (e.st === "windC") { ctx.strokeStyle = "rgba(255,93,115,0.6)"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(e.lock) * 220, e.y + Math.sin(e.lock) * 220); ctx.stroke(); }
      if (e.st === "windS") { ctx.fillStyle = "rgba(255,207,90," + (0.12 + 0.2 * e.t) + ")"; ctx.beginPath(); ctx.ellipse(e.x, e.y, 120 * e.t / 0.9, 50 * e.t / 0.9, 0, 0, TAU); ctx.fill(); }
    }
    function drawEnemy(e) {
      if (e.spawnT > 0) { ctx.fillStyle = run.theme.glow; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.ellipse(e.x, e.y, 9, 4, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; return; }
      if (e.stun > 0 && e.k !== "b") { R("#f4cf5a", e.x - 6, e.y - e.r * 2 - 12 + Math.sin(run.t * 12) * 1.5, 3, 3); R("#f4cf5a", e.x + 3, e.y - e.r * 2 - 12 - Math.sin(run.t * 12) * 1.5, 3, 3); }
      if (e.k === "s" || e.k === "S") drawSlime(e); else if (e.k === "g") drawGoblin(e, false); else if (e.k === "a") drawArcher(e);
      else if (e.k === "b") drawBat(e); else if (e.k === "B") drawBrute(e); else if (e.k === "K") drawKing(e);
      if (e.hp < e.max && e.k !== "K") { const w = Math.max(10, e.r * 2); R("#0a0c16", e.x - w / 2 - 1, e.y - e.r * 2 - 8, w + 2, 4); R("#e5484d", e.x - w / 2, e.y - e.r * 2 - 7, w * clamp(e.hp / e.max, 0, 1), 2); }
    }
    function drawPillar(q) {
      shadow(q.x, q.y + 6, 12);
      if (q.fire) {
        R("#1a120a", q.x - 9, q.y - 2, 18, 8); R("#5a4636", q.x - 7, q.y - 4, 14, 4);
        const fl = Math.sin(run.t * 14) * 1.5;
        R("#ff6a1a", q.x - 5, q.y - 14 + fl, 10, 10); R("#ffb04a", q.x - 3, q.y - 18 + fl, 6, 10); R("#fff0a0", q.x - 1, q.y - 15 + fl, 2, 5);
        return;
      }
      R("#10131f", q.x - 10, q.y - 34, 20, 40); R(run.theme.wall, q.x - 8, q.y - 32, 16, 36); R(run.theme.wallHi, q.x - 8, q.y - 32, 3, 36); R("rgba(0,0,0,0.3)", q.x + 4, q.y - 32, 4, 36);
      R(run.theme.wallHi, q.x - 11, q.y - 36, 22, 5); R("#10131f", q.x - 11, q.y - 31, 22, 1); R(run.theme.wallHi, q.x - 11, q.y + 1, 22, 5);
    }
    function drawPlayer() {
      const p = run.p;
      if (p.inv > 0 && !p.flash && Math.floor(run.t * 30) % 2 && p.dash <= 0) { shadow(p.x, p.y + 3, 8); return; }
      const bob = Math.abs(Math.sin(p.walk)) * 1.5 * Math.min(1, Math.hypot(p.vx, p.vy) / 60);
      const flip = Math.cos(p.dir) < -0.25, y = p.y - bob;
      shadow(p.x, p.y + 3, 8);
      // weapon behind body when facing up
      const behind = Math.sin(p.dir) < -0.3;
      if (behind) drawWeapon(); if (behind) drawShield();
      ctx.save(); ctx.translate(Math.round(p.x), Math.round(y));
      if (flip) ctx.scale(-1, 1);
      if (p.flash > 0 && Math.floor(run.t * 40) % 2) ctx.filter = "brightness(2.2)";
      if (sprite) ctx.drawImage(sprite, -12, -22, 23.6, 25); else R("#9fb0d0", -6, -14, 12, 16);
      ctx.restore(); ctx.filter = "none";
      if (!behind) { drawShield(); drawWeapon(); }
      if (p.stun > 0) { R("#f4cf5a", p.x - 7, p.y - 28 + Math.sin(run.t * 14) * 1.5, 3, 3); R("#f4cf5a", p.x + 4, p.y - 28 - Math.sin(run.t * 14) * 1.5, 3, 3); }
    }
    function drawShield() {
      const p = run.p; if (p.block <= 0.02) { drawShieldIdle(); return; }
      const sh = NDC.knight.SHIELDS[p.L.eq.shield] || NDC.knight.SHIELDS.oak, arc = p.L.shield.arc / 100;
      const up = easeOut(p.block), a = p.dir + (1 - up) * -0.9 * (Math.cos(p.dir) < 0 ? -1 : 1);
      const dd = 7 + up * 6 - p.shieldKick * 3;
      const sx = p.x + Math.cos(a) * dd, sy = p.y - 8 + Math.sin(a) * dd * 0.8;
      ctx.save(); ctx.translate(Math.round(sx), Math.round(sy)); ctx.rotate(a);
      const hgt = 8 + arc * 8;
      ctx.fillStyle = "#0a0c16"; ctx.fillRect(-3, -hgt / 2 - 1, 8, hgt + 2);
      ctx.fillStyle = sh.m; ctx.fillRect(-2, -hgt / 2, 6, hgt);
      ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(-2, -hgt / 2, 2, hgt);
      ctx.fillStyle = sh.n; ctx.fillRect(0, -2, 2, 4);
      if (p.shieldKick > 0) { ctx.fillStyle = "rgba(255,255,255," + p.shieldKick * 0.7 + ")"; ctx.fillRect(-3, -hgt / 2 - 1, 8, hgt + 2); }
      ctx.restore();
    }
    function drawShieldIdle() { // carried on the arm when not blocking
      const p = run.p, sh = NDC.knight.SHIELDS[p.L.eq.shield] || NDC.knight.SHIELDS.oak, f = Math.cos(p.dir) < -0.25 ? 1 : -1;
      const x = p.x + f * 9, y = p.y - 9;
      R("#0a0c16", x - 4, y - 5, 8, 12); R(sh.m, x - 3, y - 4, 6, 10); R("rgba(255,255,255,0.22)", x - 3, y - 4, 2, 10); R(sh.n, x - 1, y - 1, 2, 3);
    }
    function drawWeapon() {
      const p = run.p, w = p.L.weapon, wp = NDC.knight.WEAPONS[p.L.eq.weapon] || NDC.knight.WEAPONS.wood;
      const len = 14 * w.reach + 8, col = wp.w || wp.n, staff = false;
      let a, hx = p.x, hy = p.y - 8, ext = 1;
      if (p.swing) {
        const sw = p.swing; a = swingAngle(sw, swingHalf(sw)); const u = sw.t / sw.dur;
        ext = u < 0.24 ? 0.8 : u < 0.52 ? 1.12 : 1;
        // slash trail
        if (u > 0.24 && u < 0.82) {
          const trailA = clamp((0.82 - u) / 0.4, 0, 1), range = 26 * w.reach * (sw.combo === 3 ? 1.15 : 1);
          const from = a - sw.side * clamp((u - 0.24) * 5, 0, 1) * swingHalf(sw) * 1.5;
          ctx.save(); ctx.strokeStyle = sw.combo === 3 ? "rgba(255,226,140," + trailA * 0.9 + ")" : "rgba(235,245,255," + trailA * 0.8 + ")"; ctx.lineCap = "butt";
          for (let k = 0; k < 3; k++) { ctx.lineWidth = 6 - k * 2; ctx.beginPath(); ctx.arc(p.x, p.y - 8, range * (0.62 + k * 0.12), Math.min(from, a), Math.max(from, a)); ctx.stroke(); }
          ctx.restore();
        }
      } else {
        const f = Math.cos(p.dir) < -0.25 ? -1 : 1;
        a = f > 0 ? -0.5 : Math.PI + 0.5; hx = p.x + f * 9; ext = 0.75 + Math.sin(run.t * 3) * 0.02;
      }
      const cx = Math.cos(a), cy = Math.sin(a), L = len * ext;
      ctx.save(); ctx.translate(Math.round(hx), Math.round(hy)); ctx.rotate(a);
      ctx.fillStyle = "#0a0c16"; ctx.fillRect(2, -3, L + 2, 6);
      if (staff) { ctx.fillStyle = "#8a5a2f"; ctx.fillRect(3, -1, L - 4, 2); ctx.fillStyle = wp.n; ctx.fillRect(L - 3, -3, 5, 6); ctx.fillStyle = "#fff"; ctx.fillRect(L - 1, -1, 2, 2); }
      else { ctx.fillStyle = col; ctx.fillRect(5, -2, L - 3, 4); ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fillRect(5, -2, L - 3, 1); ctx.fillStyle = "#f4b942"; ctx.fillRect(3, -4, 3, 8); ctx.fillStyle = "#6a4630"; ctx.fillRect(-1, -1, 4, 3); }
      ctx.restore();
      if (p.swing && p.swing.t / p.swing.dur > 0.24 && p.swing.t / p.swing.dur < 0.5 && Math.random() < 0.6) addFx({ k: "spark", x: hx + cx * L, y: hy + cy * L, vx: rnd(-20, 20), vy: rnd(-20, 10), t: 0.25, c: p.L.eq.weapon === "spark" ? "#6ef0e0" : (p.L.eq.weapon === "flame" ? "#ffb04a" : "#fff") });
    }

    function drawLighting() {
      lctx.globalCompositeOperation = "source-over"; lctx.clearRect(0, 0, W, H);
      lctx.fillStyle = "rgba(5,7,16,0.66)"; lctx.fillRect(0, 0, W, H);
      lctx.globalCompositeOperation = "destination-out";
      const hole = (x, y, r, a) => { const g = lctx.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, "rgba(0,0,0," + a + ")"); g.addColorStop(1, "rgba(0,0,0,0)"); lctx.fillStyle = g; lctx.fillRect(x - r, y - r, r * 2, r * 2); };
      const fl = (i) => 1 + Math.sin(run.t * 9 + i * 2.1) * 0.06 + Math.sin(run.t * 23 + i) * 0.03;
      run.theme.torch.forEach((tx, i) => hole(tx, 40, 120 * fl(i), 0.95));
      hole(run.p.x, run.p.y - 6, 78, 0.8);
      run.pillars.forEach((q) => { if (q.fire) hole(q.x, q.y - 10, 130 * fl(9), 1); });
      if (run.theme.deco === "throne") hole(240, 40, 100, 0.8);
      for (const e of run.enemies) if (e.k === "b") hole(e.x, e.y, 22, 0.4);
      for (const f of run.fx) if (f.k === "ring" || f.k === "spark") hole(f.x, f.y, f.k === "ring" ? 40 : 14, 0.35);
      ctx.drawImage(lightCv, 0, 0);
      ctx.globalCompositeOperation = "lighter";
      const glow = (x, y, r, c, a) => { const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, c.replace("A", a)); g.addColorStop(1, c.replace("A", 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
      const hex = run.theme.glow, rgb = [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16)).join(",");
      run.theme.torch.forEach((tx, i) => glow(tx, 36, 70 * fl(i), "rgba(" + rgb + ",A)", 0.22));
      run.pillars.forEach((q) => { if (q.fire) glow(q.x, q.y - 10, 90, "rgba(255,140,40,A)", 0.3); });
      ctx.globalCompositeOperation = "source-over";
    }
    function drawTorches() {
      run.theme.torch.forEach((tx, i) => {
        const fl = Math.sin(run.t * 13 + i * 1.7) * 1.2, rgb = run.theme.glow;
        R("#0a0c16", tx - 4, 12 + fl, 8, 12); R(rgb, tx - 3, 14 + fl, 6, 9); R("#fff6d0", tx - 1, 17 + fl, 2, 6);
        if (Math.random() < 0.12) addFx({ k: "spark", x: tx + rnd(-2, 2), y: 16, vx: rnd(-8, 8), vy: rnd(-30, -10), t: rnd(0.4, 0.8), c: rgb });
      });
    }

    function drawHud() {
      const p = run.p;
      ctx.font = "10px 'Pixelify Sans', monospace"; ctx.textBaseline = "alphabetic";
      const bar = (x, y, w, hh, pct, c1, c2, label) => {
        R("#0a0c16", x - 2, y - 2, w + 4, hh + 4); R("#1f2540", x, y, w, hh); R(c1, x, y, Math.round(w * clamp(pct, 0, 1)), hh); R(c2, x, y, Math.round(w * clamp(pct, 0, 1)), 2);
        ctx.fillStyle = "#f4f1e6"; ctx.textAlign = "left"; ctx.fillText(label, x + w + 7, y + hh - 1);
      };
      R("rgba(5,7,16,0.6)", 30, 2, 190, 28);
      bar(36, 6, 120, 8, p.hp / p.maxHp, "#e5484d", "#ff8a8a", `${Math.ceil(p.hp)}/${p.maxHp}`);
      bar(36, 20, 120, 5, p.st / p.maxSt, p.stun > 0 ? "#6a7899" : p.st < 20 ? "#e5a04a" : "#4f9cf0", "#9ccbff", "Stamina");
      R("rgba(5,7,16,0.6)", W - 150, 2, 118, 28);
      ctx.textAlign = "right"; ctx.fillStyle = "#f4f1e6";
      ctx.fillText(run.theme.name, W - 36, 14); ctx.fillStyle = "#8a93b5"; ctx.fillText(`Floor ${run.floor}  ·  ${run.enemies.length + run.spawns.length} left`, W - 36, 26);
      if (p.combo > 1 && p.comboT > 0) { ctx.textAlign = "center"; ctx.fillStyle = p.combo === 3 ? "#ffe08a" : "#fff"; ctx.fillText(p.combo === 3 ? "FINISHER!" : `Combo x${p.combo}`, p.x, p.y - 34); }
      const k = run.enemies.find((e) => e.k === "K");
      if (k) { const w = 240; bar(120, H - 20, w, 6, k.hp / k.max, "#c4a030", "#ffe08a", ""); ctx.textAlign = "center"; ctx.fillStyle = "#f4f1e6"; ctx.fillText("The Goblin King", W / 2, H - 26); }
      if (run.bannerT > 0) { const a = clamp(run.bannerT, 0, 1); ctx.textAlign = "center"; ctx.font = "20px 'Pixelify Sans', monospace"; ctx.fillStyle = "rgba(0,0,0," + a * 0.6 + ")"; ctx.fillText(run.banner, W / 2 + 1, 121); ctx.fillStyle = "rgba(244,185,66," + a + ")"; ctx.fillText(run.banner, W / 2, 120); }
    }

    function draw() {
      ctx.imageSmoothingEnabled = false;
      ctx.save();
      if (!run) { ctx.fillStyle = "#070912"; ctx.fillRect(0, 0, W, H); const b = bg || (bg = buildBg(1)); ctx.drawImage(b, 0, 0); ctx.fillStyle = "rgba(4,6,12,0.55)"; ctx.fillRect(0, 0, W, H); ctx.restore(); return; }
      if (run.shake > 0) ctx.translate(Math.round(rnd(-1, 1) * run.shake * 0.5), Math.round(rnd(-1, 1) * run.shake * 0.5));
      ctx.drawImage(bg, 0, 0);
      // floor-level effects
      for (const s of run.spawns) { const u = 1 - s.t / 0.7; ctx.strokeStyle = run.theme.glow; ctx.globalAlpha = 0.7; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(s.x, s.y, 4 + 8 * (1 - clamp(s.t, 0, 1)), 2 + 4 * (1 - clamp(s.t, 0, 1)), 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
      for (const w of run.waves) { ctx.strokeStyle = "rgba(255,207,90," + (1 - w.r / w.max) + ")"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r, w.r * 0.55, 0, 0, TAU); ctx.stroke(); }
      for (const q of run.pickups) { const by = Math.sin(q.t * 5) * 1.5; shadow(q.x, q.y + 2, 4); R("#0a0c16", q.x - 5, q.y - 8 + by, 10, 9); R("#ff4d6a", q.x - 4, q.y - 7 + by, 3, 3); R("#ff4d6a", q.x + 1, q.y - 7 + by, 3, 3); R("#ff4d6a", q.x - 4, q.y - 5 + by, 8, 3); R("#ff4d6a", q.x - 2, q.y - 2 + by, 4, 2); R("#ffb0bb", q.x - 3, q.y - 6 + by, 1, 1); }
      for (const f of run.fx) if (f.k === "ring") { const u = 1 - f.t / f.d; ctx.strokeStyle = f.c; ctx.globalAlpha = 1 - u; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(f.x, f.y, 4 + u * f.s, (4 + u * f.s) * 0.7, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
      if (run.theme.deco === "throne" || true) { // rune circle
        const pulse = 0.5 + 0.5 * Math.sin(run.t * 2); ctx.strokeStyle = run.theme.glow; ctx.globalAlpha = 0.12 + pulse * 0.1; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(240, 178, 70, 30, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(240, 178, 54, 23, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
      }
      // depth-sorted things
      const list = [];
      list.push({ y: run.p.y, f: drawPlayer });
      run.enemies.forEach((e) => list.push({ y: e.y, f: () => drawEnemy(e) }));
      run.pillars.forEach((q) => list.push({ y: q.y, f: () => drawPillar(q) }));
      for (const g of run.fx) if (g.k === "ghost") list.push({ y: g.y - 1, f: () => { ctx.globalAlpha = g.t * 3; ctx.save(); ctx.translate(Math.round(g.x), Math.round(g.y)); if (g.f) ctx.scale(-1, 1); if (sprite) ctx.drawImage(sprite, -12, -22, 23.6, 25); ctx.restore(); ctx.globalAlpha = 1; } });
      list.sort((a, b) => a.y - b.y).forEach((o) => o.f());
      for (const a of run.arrows) { ctx.save(); ctx.translate(Math.round(a.x), Math.round(a.y)); ctx.rotate(Math.atan2(a.vy, a.vx)); R("#0a0c16", -6, -2, 14, 4); R("#c8b080", -5, -1, 10, 2); R("#dfe6f7", 4, -2, 3, 4); R("#e5484d", -6, -2, 2, 4); ctx.restore(); }
      drawTorches();
      for (const f of run.fx) {
        if (f.k === "spark") R(f.c, f.x, f.y, 2, 2);
        else if (f.k === "puff") { ctx.globalAlpha = clamp(f.t * 2, 0, 1); R(f.c, f.x, f.y, f.s, f.s); ctx.globalAlpha = 1; }
        else if (f.k === "text") { ctx.font = "10px 'Pixelify Sans', monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#0a0c16"; ctx.fillText(String(f.v), f.x + 1, f.y - (0.7 - f.t) * 24 + 1); ctx.fillStyle = f.c; ctx.fillText(String(f.v), f.x, f.y - (0.7 - f.t) * 24); }
      }
      drawLighting();
      ctx.drawImage(vignette, 0, 0);
      if (run.hitFlash > 0) { ctx.fillStyle = "rgba(255,40,60," + run.hitFlash * 0.5 + ")"; ctx.fillRect(0, 0, W, H); }
      if (run.p.hp < run.p.maxHp * 0.3 && !run.over) { ctx.fillStyle = "rgba(255,0,30," + (0.06 + 0.05 * Math.sin(run.t * 7)) + ")"; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
      drawHud();
    }

    function loop(t) {
      if (!alive) return;
      const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
      if (phase === "play" || phase === "clear" || phase === "dead") update(phase === "play" ? dt : dt * 0.2);
      draw();
      raf = requestAnimationFrame(loop);
    }

    /* ---------- menus ---------- */
    function floorBtn(f) {
      const open = gs.floorOpen(f);
      return h("button", { class: "btn" + (open ? "" : " locked"), type: "button", disabled: !open, onclick: () => start(f) },
        open ? `Floor ${f}: ${THEMES[f].name}` : `Floor ${f}: reach game level ${f}`);
    }
    function drawMenu() {
      NDC.clear(menuEl); menuEl.hidden = false;
      const L = loadout();
      if (phase === "clear" || phase === "dead") {
        const win = phase === "clear", nextF = run.floor + 1, hasNext = win && nextF <= G.FLOORS && gs.floorOpen(nextF);
        menuEl.append(h("h2", null, win ? `Floor ${run.floor} cleared` : "You were knocked out"),
          h("p", { class: "muted" }, `+${run.totalXp} game XP · ${run.kills} defeated` + (run.levelUp ? ` · Game level ${run.levelUp}!` : "")),
          h("div", { class: "row", style: { gap: "0.7rem", justifyContent: "center", marginTop: "1rem" } },
            hasNext ? h("button", { class: "btn primary", type: "button", onclick: () => start(nextF) }, `Go to floor ${nextF}`) : null,
            h("button", { class: "btn" + (hasNext ? "" : " primary"), type: "button", onclick: () => start(run.floor) }, win ? "Replay this floor" : "Try again"),
            h("button", { class: "btn", type: "button", onclick: () => { phase = "menu"; run = null; drawMenu(); } }, "Floor list")));
        if (win && nextF <= G.FLOORS && !gs.floorOpen(nextF)) menuEl.append(h("p", { class: "muted", style: { marginTop: "0.8rem" } }, `Floor ${nextF} opens at game level ${nextF}.`));
        if (win && nextF > G.FLOORS) menuEl.append(h("p", { class: "muted", style: { marginTop: "0.8rem" } }, "You beat the Goblin King. Nobody's deeper than you."));
        return;
      }
      menuEl.append(h("h2", null, "Choose a floor"),
        h("div", { class: "dg-floors" }, THEMES.slice(1).map((_, i) => floorBtn(i + 1))),
        h("p", { class: "muted", style: { marginTop: "0.9rem", fontSize: "0.92rem" } }, `${L.weapon.dmg} damage · swing ${L.weapon.swing} ms · shield blocks ${Math.round(L.shield.block * 100)}%`));
    }
    function drawStat() {
      NDC.clear(statEl);
      const g = gs, L = loadout();
      statEl.append(
        h("div", { class: "dg-pill px" }, h("span", null, "Game level"), h("b", { class: "pixel" }, g.level)),
        h("div", { class: "dg-pill px" }, h("span", null, "Best floor"), h("b", { class: "pixel" }, g.best || "-")),
        h("div", { class: "dg-pill px wide" }, h("span", null, `${g.into} / ${g.span} XP to level ${g.level + 1}`), h("div", { class: "bar px", style: { margin: "0.3rem 0 0" } }, h("i", { style: { width: Math.round(g.pct * 100) + "%" } }))),
        h("div", { class: "dg-pill px" }, h("span", null, "Health"), h("b", { class: "pixel" }, 100 + g.hpBonus + L.hp)),
        h("div", { class: "dg-pill px" }, h("span", null, "Stamina"), h("b", { class: "pixel" }, 100 + g.staminaBonus)));
    }
    async function loadBoard() {
      NDC.clear(boardEl); boardEl.append(h("h2", null, "Deepest floors"));
      let rows = null;
      try { rows = (await NDC.auth.leaderboard()).rows; } catch (e) { boardEl.append(h("p", { class: "muted" }, "The leaderboard couldn't load right now.")); return; }
      if (!alive) return;
      if (rows === null) { const me = G.gameStats(NDC.store.get()); boardEl.append(h("p", { class: "muted" }, "Sign in to put your name on the leaderboard."), h("p", null, `You: floor ${me.best || 0}, game level ${me.level}`)); return; }
      if (!rows.length) { boardEl.append(h("p", { class: "muted" }, "Nobody has cleared a floor yet.")); return; }
      boardEl.append(h("ol", { class: "dg-board" }, rows.map((r, i) => h("li", null, h("span", { class: "rk pixel" }, i + 1), h("span", { class: "nm" }, r.name), h("span", { class: "muted" }, `Level ${r.game_level}`), h("b", { class: "pixel" }, `Floor ${r.best_floor}`)))));
    }

    /* ---------- input ---------- */
    const onDown = (e) => {
      const tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (phase === "play" && Object.values(KEYS).some((a) => a.includes(k))) e.preventDefault();
      keys.add(k);
    };
    const onUp = (e) => keys.delete(e.key.toLowerCase());
    const clearKeys = () => keys.clear();
    document.addEventListener("keydown", onDown); document.addEventListener("keyup", onUp); window.addEventListener("blur", clearKeys);
    const toWorld = (e) => { const r = canvas.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
    canvas.addEventListener("mousemove", (e) => { const m = toWorld(e); mouse.x = m.x; mouse.y = m.y; mouse.seen = 3; });
    canvas.addEventListener("mousedown", (e) => { const m = toWorld(e); mouse.x = m.x; mouse.y = m.y; mouse.seen = 3; keys.add(e.button === 2 ? "k" : "j"); canvas.focus({ preventScroll: true }); e.preventDefault(); });
    window.addEventListener("mouseup", (e) => { keys.delete(e.button === 2 ? "k" : "j"); });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    const holdBtn = (label, key, cls) => {
      const b = h("button", { class: "btn dg-touch " + (cls || ""), type: "button" }, label);
      const on = (e) => { e.preventDefault(); keys.add(key); }, off = (e) => { e.preventDefault(); keys.delete(key); };
      b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
      return b;
    };
    const pad = h("div", { class: "dg-pad" },
      h("div", { class: "dg-dpad" }, holdBtn("▲", "arrowup", "u"), holdBtn("◀", "arrowleft", "l"), holdBtn("▶", "arrowright", "r"), holdBtn("▼", "arrowdown", "d")),
      h("div", { class: "dg-acts" }, holdBtn("Dash", "l"), holdBtn("Block", "k"), holdBtn("Swing", "j", "primary")));
    const soundBtn = h("button", { class: "link-btn", type: "button", onclick: () => { soundOn = !soundOn; soundBtn.textContent = soundOn ? "Sound: on" : "Sound: off"; if (soundOn) SFX.parry(); } }, "Sound: off");

    NDC._dg = { get run() { return run; }, get phase() { return phase; }, keys };
    makeSprite(); drawStat(); drawMenu(); loadBoard();
    raf = requestAnimationFrame(loop);

    const root = h("div", { class: "page" }, h("div", { class: "wrap", style: { maxWidth: "1040px" } },
      h("div", { class: "page-head" }, h("h1", null, "Dungeon"),
        h("p", null, "Move: WASD or arrows. Swing: J or Space (chain three for a finisher). Block: hold K or Shift. Dash: L or E. Or use the mouse: aim, click to swing, right-click to block.")),
      statEl,
      h("div", { class: "dg-stage px" }, canvas, menuEl),
      h("div", { class: "row", style: { justifyContent: "flex-end", marginTop: "0.4rem" } }, soundBtn),
      pad,
      h("section", { class: "card px", style: { marginTop: "1.4rem" } }, boardEl),
      h("p", { class: "muted", style: { marginTop: "1rem", fontSize: "0.92rem" } }, "Game XP is separate from lessons. It raises your health and stamina and opens deeper floors, and it never changes your coins or your knight's look. Gear you buy on the Knight page changes how you fight.")));

    return {
      el: root,
      destroy() {
        alive = false; cancelAnimationFrame(raf);
        document.removeEventListener("keydown", onDown); document.removeEventListener("keyup", onUp); window.removeEventListener("blur", clearKeys);
        commit();
      },
    };
  };
})();
