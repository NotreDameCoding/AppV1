/* Pixel biomes for the Learn path: one terrain per language, painted onto a low-res canvas. */
(function () {
  const PX = 4;
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const hash = (x, y, s) => { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  /* ---------- little sprites for the lesson stops (12 wide) ---------- */
  const SPR = {
    flower: { pal: { p: "#ffb3d1", P: "#e86fa0", y: "#ffe45e", Y: "#d9a520", g: "#3d9b3a", G: "#5cc454" }, rows: [
      "...pp..pp...", "..pPPppPPp..", ".pPPPPPPPPp.", ".pPPyyyyPPp.", ".pPPyYYyPPp.", ".pPPyyyyPPp.", ".pPPPPPPPPp.", "..pPPppPPp..", "...pp.gg.pp.", ".....gg.....", "..GG.gg.GG..", ".GGG.gg.GGG." ] },
    pumpkin: { pal: { o: "#ff9a2e", O: "#c8591a", s: "#5a8a2c", S: "#3d6a1c", h: "#ffc46a" }, rows: [
      "......ss....", "......sS....", "..OOOOOOOO..", ".OooOooOooO.", "OooOhoOooooO", "OohOooOoooOO", "OoOoooOooOoO", "OoOoooOooOoO", "OooOooOoooOO", ".OooOooOooO.", "..OOOOOOOO..", "............" ] },
    castle: { pal: { t: "#f2d38a", T: "#c9a257", d: "#6b4a22", r: "#ff5d4a", w: "#fff0c0" }, rows: [
      "......r.....", "......Tr....", ".t.t..T.t.t.", ".ttt.ttt.ttt", ".tTt.tTt.tTt", ".ttttttttttt", ".tttttddtttt", ".twttttddttt", "TTTTTTddTTTT", "............", "............", "............" ] },
    snowman: { pal: { w: "#f6fbff", W: "#b9d0e6", k: "#2a2f45", c: "#ff8a3a", b: "#5d3b22", r: "#e0473f" }, rows: [
      "....kkkk....", "....kkkk....", "...kkkkkk...", "....wwww....", "...wkwwkw...", "...wwccww...", "....rrrr....", "...wwwwww...", "..wwWwwwWw..", "..wwwwwwww..", "..wwWwwwww..", "...wwwwww..." ] },
    crystal: { pal: { c: "#4ee8e0", C: "#bffcf8", d: "#1c8c98", m: "#e060ff", M: "#f5a8ff", n: "#8a2fb0" }, rows: [
      ".....C......", "....cCc.....", "....cCc.....", "...cCcdc....", "...cCcdc..m.", ".m.cCcdc.mM.", "mMmcCccdcmMm", "mMmcCccdcmMm", ".MnccCcdddM.", "..dddddddd..", "............", "............" ] },
    chip: { pal: { k: "#1a1f2e", K: "#2d3550", s: "#c9d3e6", o: "#ffe45e", g: "#3dff9a" }, rows: [
      "............", "..s.s.s.s...", ".kkkkkkkkkk.", ".kKKKKKKKKk.", "skKooKKKKKks", ".kKooKKggKk.", "skKKKKKggKks", ".kKKKKKKKKk.", ".kkkkkkkkkk.", "..s.s.s.s...", "............", "............" ] },
  };
  function sprite(id, scale) {
    const s = SPR[id], out = {};
    s.rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== ".") (out[s.pal[ch]] = out[s.pal[ch]] || []).push(`M${x} ${y}h1v1h-1z`); }));
    const w = s.rows[0].length, hh = s.rows.length;
    return `<svg viewBox="0 0 ${w} ${hh}" width="${w * scale}" height="${hh * scale}" shape-rendering="crispEdges" aria-hidden="true">${Object.entries(out).map(([c, d]) => `<path fill="${c}" d="${d.join("")}"/>`).join("")}</svg>`;
  }

  /* ---------- biomes ---------- */
  const BIOMES = {
    spring: { name: "Spring meadow", sprite: "flower", accent: "#7ddf6a", fx: "petal",
      ground: ["#5fae4c", "#6bbd57", "#52a041", "#78c862"], path: ["#dcbf8d", "#b4915e", "#ebd3a8"], done: ["#ffe48a", "#caa23c", "#fff3b8"],
      deco: [["pinkTree", 3, 9], ["greenTree", 3, 9], ["flowers", 6, 3], ["tuft", 6, 2], ["pond", 0.5, 12], ["rock", 1, 4]] },
    autumn: { name: "Autumn forest", sprite: "pumpkin", accent: "#ff9a3c", fx: "leaf",
      ground: ["#a08840", "#b09a4c", "#8e7733", "#bba458"], path: ["#7a5535", "#54391f", "#92694a"], done: ["#ffd070", "#c98a28", "#ffe9a8"],
      deco: [["orangeTree", 3, 9], ["redTree", 3, 9], ["yellowTree", 2, 9], ["leafPile", 4, 5], ["mushroom", 2, 3], ["pumpkinDeco", 2, 4], ["log", 1, 6], ["tuft", 3, 2]] },
    summer: { name: "Sunny shore", sprite: "castle", accent: "#ffd23c", fx: "twinkle",
      ground: ["#f0d78a", "#f7e29d", "#e6c874", "#fcebb0"], path: ["#c98a54", "#9a6638", "#e0a870"], done: ["#ffe266", "#d19a1e", "#fff5b0"],
      deco: [["palm", 3, 8], ["sunflower", 3, 3], ["umbrella", 1, 7], ["shell", 4, 2], ["pond", 1.2, 12], ["tuft", 2, 2], ["rock", 1, 4]] },
    winter: { name: "Frozen tundra", sprite: "snowman", accent: "#9fd8ff", fx: "snow",
      ground: ["#e9f2fa", "#f7fbff", "#d6e6f3", "#ffffff"], path: ["#a9bdd2", "#7389a4", "#c4d4e4"], done: ["#ffe9a0", "#d1a13a", "#fff6cf"],
      deco: [["pineSnow", 6, 8], ["iceRock", 2, 4], ["pond", 1, 12], ["snowman", 1, 6], ["tuft", 1, 2]] },
    crystal: { name: "Crystal grove", sprite: "crystal", accent: "#c08bff", fx: "rise",
      ground: ["#3a2a66", "#45337c", "#2f2253", "#503d8a"], path: ["#8a7bc8", "#5a4a98", "#a99be0"], done: ["#ffe58a", "#d19a3a", "#fff3c0"],
      deco: [["crystals", 5, 6], ["purpleTree", 2, 9], ["glowShroom", 3, 3], ["rock", 1, 4], ["spark", 4, 2]] },
    circuit: { name: "Circuit board", sprite: "chip", accent: "#3dff9a", fx: "blink",
      ground: ["#0f5a3b", "#126a44", "#0c4a32", "#14764b"], path: ["#d1a85a", "#8a6a2a", "#ecc880"], done: ["#9dffcf", "#2fcf86", "#d6ffe9"],
      deco: [["chipDeco", 3, 8], ["capacitor", 3, 4], ["led", 4, 3], ["resistor", 3, 5], ["via", 6, 2]] },
  };
  const BY_COURSE = { py: "spring", jv: "autumn", js: "summer", ht: "winter", cs: "crystal", ar: "circuit" };

  /* ---------- the painter ---------- */
  function paint(canvas, o) {
    const W = Math.max(8, Math.ceil(o.width / PX)), H = Math.max(8, Math.ceil(o.height / PX));
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const B = BIOMES[o.biome], R = rng(o.seed || 1);
    const img = ctx.createImageData(W, H), d = img.data;
    const hex = (c) => { if (c.length === 4) c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; };
    const put = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const [r, g, b] = hex(c), i = (y * W + x) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255; };
    const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c); };
    const disc = (cx, cy, r, c) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + 0.5) put(cx + i, cy + j, c); };
    const ell = (cx, cy, rx, ry, c) => { for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) if ((i * i) / (rx * rx + 0.5) + (j * j) / (ry * ry + 0.5) <= 1) put(cx + i, cy + j, c); };
    const shade = (c, k) => { const [r, g, b] = hex(c); const f = (v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0"); return "#" + f(r) + f(g) + f(b); };

    /* ground: blocky value noise dithered between 4 tones */
    const G = B.ground;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const n = hash(x >> 3, y >> 3, 5) * 0.55 + hash(x >> 1, y >> 1, 9) * 0.45;
      const dith = hash(x, y, 3) < 0.35;
      put(x, y, n < 0.28 ? (dith ? G[0] : G[2]) : n < 0.7 ? (dith ? G[1] : G[0]) : (dith ? G[3] : G[1]));
    }
    if (o.biome === "circuit") { /* printed traces across the board */
      const tr = "#1c9a63";
      for (let k = 0; k < Math.floor(W / 7); k++) {
        let x = (R() * W) | 0, y = (R() * H) | 0, dir = R() < 0.5 ? 0 : 1;
        for (let s = 0; s < 6; s++) { const len = 8 + ((R() * 22) | 0); for (let t = 0; t < len; t++) { put(dir ? x : x + t, dir ? y + t : y, tr); } if (dir) y += len; else x += len; dir ^= 1; if (R() < 0.5) put(x, y, "#3dd68f"); }
      }
    }

    /* occupancy + path */
    const occ = new Uint8Array(W * H);
    const mark = (cx, cy, r) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const x = (cx + i) | 0, y = (cy + j) | 0; if (i * i + j * j <= r * r && x >= 0 && y >= 0 && x < W && y < H) occ[y * W + x] = 1; } };
    const free = (cx, cy, r) => { for (const [a, b] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]]) { const x = (cx + a) | 0, y = (cy + b) | 0; if (x < 2 || y < 4 || x >= W - 2 || y >= H - 2 || occ[y * W + x]) return false; } return true; };
    (o.blocked || []).forEach((r) => { for (let y = Math.floor(r.top / PX); y < Math.ceil(r.bottom / PX); y++) for (let x = Math.floor(r.left / PX); x < Math.ceil(r.right / PX); x++) if (x >= 0 && y >= 0 && x < W && y < H) occ[y * W + x] = 1; });
    const RD = 7;
    const pts = o.points.map((p) => [p[0] / PX, p[1] / PX, p[2]]);
    const samples = [];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], my = (a[1] + b[1]) / 2;
      for (let s = 0; s <= 48; s++) { const t = s / 48, u = 1 - t; const x = u * u * u * a[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * b[0]; const y = u * u * u * a[1] + 3 * u * u * t * my + 3 * u * t * t * my + t * t * t * b[1]; samples.push([x, y, a[2]]); }
    }
    samples.forEach(([x, y]) => mark(x, y, RD + 4));
    /* edge fringe first, then body */
    samples.forEach(([x, y, done]) => { const pal = done ? B.done : B.path; disc(x, y, RD + 1, pal[1]); });
    samples.forEach(([x, y, done]) => {
      const pal = done ? B.done : B.path;
      for (let j = -RD; j <= RD; j++) for (let i = -RD; i <= RD; i++) { const dd = i * i + j * j; if (dd > (RD - 1) * (RD - 1)) continue; const px = (x + i) | 0, py = (y + j) | 0; const r = hash(px, py, 11); put(px, py, r < 0.12 ? pal[1] : r > 0.86 ? pal[2] : pal[0]); }
    });
    if (o.biome === "circuit") samples.forEach(([x, y], i) => { if (i % 16 === 0) { put(x - 4, y, "#2a1d08"); put(x + 4, y, "#2a1d08"); } });

    /* decorations */
    const T = {
      greenTree: (x, y) => tree(x, y, ["#3f9f3c", "#2d7f2b", "#69cc5c", "#1e5c1d"]),
      pinkTree: (x, y) => tree(x, y, ["#f4a2c4", "#d9709a", "#ffd2e4", "#a84a74"]),
      orangeTree: (x, y) => tree(x, y, ["#e8801f", "#b9591a", "#ffb04a", "#7a3410"]),
      redTree: (x, y) => tree(x, y, ["#d1432b", "#9c2a1c", "#ff7a58", "#5e160e"]),
      yellowTree: (x, y) => tree(x, y, ["#e8c533", "#b89420", "#fff07a", "#7a6210"]),
      purpleTree: (x, y) => tree(x, y, ["#8b4fd0", "#5c2f9c", "#c08cff", "#34195f"], "#2a1a40"),
      pineSnow: (x, y) => pine(x, y, true),
      pine: (x, y) => pine(x, y, false),
      palm: (x, y) => { for (let i = 0; i < 12; i++) put(x + (i > 6 ? 1 : 0) + ((i / 5) | 0), y - i, i % 3 ? "#8a5a2a" : "#6b4220"); const tx = x + 3, ty = y - 12; [[-5, 1], [-4, -2], [-1, -4], [3, -3], [5, 0], [4, 3], [-4, 3]].forEach(([dx, dy]) => { for (let s = 0; s <= 4; s++) { const px = tx + ((dx * s) / 4) | 0, py = ty + ((dy * s) / 4) + (s > 2 ? 1 : 0) | 0; put(px, py, "#2f9e3c"); put(px, py + 1, "#1f7a2a"); } }); disc(tx, ty + 1, 1, "#6b4220"); },
      flowers: (x, y) => { const cols = ["#ff7fb0", "#ffe45e", "#ffffff", "#b58cff", "#ff9a5a"]; for (let k = 0; k < 3 + ((R() * 3) | 0); k++) { const fx = x + ((R() * 8) | 0) - 4, fy = y + ((R() * 5) | 0) - 2, c = cols[(R() * cols.length) | 0]; put(fx, fy, "#2f7f2b"); put(fx, fy - 1, c); put(fx - 1, fy - 1, shade(c, 0.85)); put(fx + 1, fy - 1, shade(c, 0.85)); put(fx, fy - 2, c); } },
      sunflower: (x, y) => { rect(x, y - 5, 1, 5, "#2f7f2b"); put(x - 1, y - 2, "#3f9f3c"); disc(x, y - 7, 2, "#ffd23c"); put(x, y - 7, "#6b3f12"); put(x - 1, y - 7, "#8a5a1a"); put(x + 1, y - 7, "#8a5a1a"); },
      tuft: (x, y) => { const c = o.biome === "winter" ? "#c9dbea" : o.biome === "autumn" ? "#7d6a24" : o.biome === "summer" ? "#c9a84a" : o.biome === "crystal" ? "#6a55b0" : "#3f8f38"; put(x, y, c); put(x - 1, y - 1, c); put(x + 1, y - 1, c); put(x, y - 1, c); put(x, y - 2, c); },
      rock: (x, y) => { ell(x, y, 3, 2, "#6f7683"); ell(x - 1, y - 1, 2, 1, "#9aa2b0"); },
      iceRock: (x, y) => { ell(x, y, 3, 2, "#8fb2d6"); ell(x - 1, y - 1, 2, 1, "#d6ecff"); },
      pond: (x, y) => { const w = o.biome === "winter" ? ["#a8d8f5", "#d9f0ff", "#7fb4d8"] : o.biome === "crystal" ? ["#5f4cc0", "#8f7cf0", "#3a2d88"] : ["#4aa3e8", "#8fd0ff", "#2f7fc0"]; ell(x, y, 9, 5, w[2]); ell(x, y, 8, 4, w[0]); put(x - 3, y - 1, w[1]); put(x - 2, y - 1, w[1]); put(x + 3, y + 1, w[1]); },
      leafPile: (x, y) => { ell(x, y, 4, 2, "#c9501f"); ell(x - 1, y - 1, 3, 1, "#e8801f"); put(x + 2, y - 1, "#f2c14a"); put(x - 2, y, "#a83a14"); },
      mushroom: (x, y) => { rect(x, y - 2, 1, 2, "#f2ead8"); ell(x, y - 3, 2, 1, "#d1432b"); put(x - 1, y - 3, "#fff"); put(x + 1, y - 4, "#fff"); },
      glowShroom: (x, y) => { rect(x, y - 2, 1, 2, "#e8d8ff"); ell(x, y - 3, 2, 1, "#33e0d6"); put(x - 1, y - 3, "#c9fffb"); put(x + 1, y - 4, "#c9fffb"); },
      pumpkinDeco: (x, y) => { ell(x, y, 3, 2, "#e8801f"); ell(x - 1, y - 1, 1, 1, "#ffb04a"); put(x, y - 3, "#5a8a2c"); put(x - 3, y, "#b9591a"); put(x + 3, y, "#b9591a"); },
      log: (x, y) => { rect(x - 4, y - 2, 9, 3, "#6b4220"); rect(x - 4, y - 2, 9, 1, "#8a5a2a"); rect(x - 5, y - 2, 1, 3, "#c9a064"); },
      umbrella: (x, y) => { rect(x, y - 7, 1, 8, "#e8e8e8"); ell(x, y - 8, 5, 2, "#ff5d4a"); rect(x - 5, y - 8, 3, 1, "#fff"); rect(x + 1, y - 8, 3, 1, "#fff"); put(x, y - 10, "#ff5d4a"); },
      shell: (x, y) => { put(x, y, "#ffd0c0"); put(x + 1, y, "#ffb8a3"); put(x, y - 1, "#fff0e8"); },
      snowman: (x, y) => { disc(x, y - 2, 3, "#f6fbff"); disc(x, y - 7, 2, "#f6fbff"); put(x - 1, y - 8, "#222"); put(x + 1, y - 8, "#222"); put(x, y - 7, "#ff8a3a"); rect(x - 2, y - 10, 5, 1, "#2a2f45"); put(x, y - 11, "#2a2f45"); },
      crystals: (x, y) => { [[0, 0, 9, "#4ee8e0", "#bffcf8"], [-4, 2, 6, "#e060ff", "#f5a8ff"], [4, 2, 5, "#7aa0ff", "#cfe0ff"]].forEach(([dx, dy, hgt, c, l]) => { for (let j = 0; j < hgt; j++) { const w = j < 3 ? j : 3; for (let i = -w; i <= w; i++) put(x + dx + i, y + dy - hgt + j + 1, i < 0 ? l : i === w ? shade(c, 0.6) : c); } }); },
      spark: (x, y) => { put(x, y, "#fff"); put(x - 1, y, "#cbb8ff"); put(x + 1, y, "#cbb8ff"); put(x, y - 1, "#cbb8ff"); put(x, y + 1, "#cbb8ff"); },
      chipDeco: (x, y) => { const w = 10 + ((R() * 6) | 0), h2 = 7 + ((R() * 4) | 0); for (let i = 1; i < w; i += 2) { put(x + i, y - 1, "#c9d3e6"); put(x + i, y + h2, "#c9d3e6"); } rect(x, y, w + 1, h2, "#1a1f2e"); rect(x + 1, y + 1, w - 1, h2 - 2, "#262d44"); put(x + 2, y + 2, "#9aa6c6"); put(x + w - 2, y + h2 - 2, "#3dff9a"); },
      capacitor: (x, y) => { rect(x, y - 5, 4, 5, "#2f5fd0"); rect(x, y - 5, 1, 5, "#5f8fff"); rect(x + 3, y - 5, 1, 5, "#1f3f90"); rect(x, y - 6, 4, 1, "#c9d3e6"); rect(x + 3, y - 4, 1, 3, "#ddd"); },
      led: (x, y) => { const c = [["#ff4a4a", "#ffb0b0"], ["#3dff9a", "#c0ffe0"], ["#ffd23c", "#fff2b0"]][(R() * 3) | 0]; disc(x, y, 2, shade(c[0], 0.5)); disc(x, y, 1, c[0]); put(x - 1, y - 1, c[1]); },
      resistor: (x, y) => { rect(x - 2, y, 2, 1, "#c9d3e6"); rect(x + 6, y, 2, 1, "#c9d3e6"); rect(x, y - 1, 6, 3, "#d9b48a"); put(x + 1, y - 1, "#b83a2a"); put(x + 1, y, "#b83a2a"); put(x + 1, y + 1, "#b83a2a"); put(x + 3, y - 1, "#3a2a1a"); put(x + 3, y, "#3a2a1a"); put(x + 3, y + 1, "#3a2a1a"); put(x + 5, y - 1, "#d9a520"); put(x + 5, y, "#d9a520"); put(x + 5, y + 1, "#d9a520"); },
      via: (x, y) => { disc(x, y, 1, "#ecc880"); put(x, y, "#0c4a32"); },
    };
    function tree(x, y, c, trunk) { rect(x - 1, y - 4, 3, 5, trunk || "#6b4220"); put(x - 1, y - 4, shade(trunk || "#6b4220", 1.3)); const cy = y - 11, r = 7;
      for (let j = -r; j <= r; j++) for (let i = -r - 1; i <= r + 1; i++) { const dd = i * i + j * j; if (dd > r * r) continue; let col = c[0]; if (dd > (r - 1.3) * (r - 1.3)) col = c[3]; else if ((i + 2) * (i + 2) + (j + 2) * (j + 2) < 11) col = c[2]; else if (i + j > 5) col = c[1]; put(x + i, cy + j, col); }
      put(x - 3, cy - 2, c[2]); put(x + 2, cy + 1, c[1]); put(x - 1, cy + 3, c[1]); }
    function pine(x, y, snow) { rect(x, y - 3, 2, 4, "#5a3a20"); const g = snow ? ["#2f6b4a", "#1f4f36"] : ["#2f7f3a", "#1f5f2a"]; for (let k = 0; k < 4; k++) { const top = y - 17 + k * 4, w = 2 + k * 2; for (let j = 0; j < 5; j++) { const ww = Math.min(w + j, w + 3); for (let i = -ww; i <= ww; i++) put(x + 1 + i, top + j, i > ww - 2 ? g[1] : g[0]); } if (snow) { for (let i = -w; i <= w; i++) put(x + 1 + i, top, "#fff"); put(x + 1 - w - 1, top + 1, "#fff"); put(x + 1 + w + 1, top + 1, "#fff"); } } }

    const bag = []; const area = W * H;
    const total = B.deco.reduce((s, d2) => s + d2[1], 0);
    for (let n = 0; n < area / 38; n++) {
      let pick = R() * total, ch = B.deco[0];
      for (const d2 of B.deco) { pick -= d2[1]; if (pick <= 0) { ch = d2; break; } }
      const x = (R() * W) | 0, y = (R() * H) | 0, c = ch[2];
      if (!free(x, y - (c > 6 ? 5 : 1), c)) continue;
      mark(x, y - (c > 6 ? 5 : 1), c);
      bag.push([y, T[ch[0]], x]);
    }
    bag.sort((a, b) => a[0] - b[0]).forEach(([y, fn, x]) => fn(x, y));
    ctx.putImageData(img, 0, 0);
  }

  NDC.biome = { paint, sprite, BIOMES, BY_COURSE, PX };
})();
