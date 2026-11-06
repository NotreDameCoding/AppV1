/* The Dungeon: a top-down fighting game for the knight, drawn at a low resolution in an angled overhead view.
   Move: WASD / arrows. Swing: J or Space (or left click). Dash: L, E or Shift. Sword Beam (floor 3+): I or R. Whirlwind (floor 6+): K or Q. Thunder (floor 9+): O or F.
   Ten floors: the castle (1-5, ending at the Goblin King) and under the castle (6-10, ending at Cinderwing the dragon).
   Floors open one at a time: clearing a floor opens the next, and the deepest floor cleared is saved. Clearing a floor lets you pick an enchant that lasts for the rest of the run. A new ability unlocks on floors 3, 6 and 9. Saved: best floor, kills, stars and
   best time per floor, and how many of each monster you've beaten (the bestiary). Room art is in dungeon-art.js. */
(function () {
  const h = NDC.h, G = NDC.game, ART = NDC.dungeonArt;
  const W = 480, H = 300, LEFT = 28, RIGHT = 452, TOP = 62, BOT = 284;
  const TAU = Math.PI * 2;
  const KEYS = {
    left: ["a", "arrowleft"], right: ["d", "arrowright"], up: ["w", "arrowup"], down: ["s", "arrowdown"],
    swing: [" ", "j"], dash: ["l", "e", "shift"], beam: ["i", "r"], spin: ["k", "q"], thunder: ["o", "f"],
  };
  /* a new ability every three floors */
  const ABILITIES = [
    { id: "beam", floor: 3, cost: 24, cd: 1.3, name: "Sword Beam", key: "I", keys: "I or R", c: "#ffe08a", how: "fire a slash that flies through monsters" },
    { id: "spin", floor: 6, cost: 55, cd: 3.6, name: "Whirlwind", key: "K", keys: "K or Q", c: "#6ef0e0", how: "spin and hit everything around you" },
    { id: "thunder", floor: 9, cost: 60, cd: 8, name: "Thunder", key: "O", keys: "O or F", c: "#9fd8ff", how: "call lightning down on up to four monsters" },
  ];
  const ABIL = Object.fromEntries(ABILITIES.map((a) => [a.id, a]));
  const SPIN_FLOOR = ABIL.spin.floor, SPIN_COST = ABIL.spin.cost, SPIN_CD = ABIL.spin.cd;

  /* ---------- floors ---------- */
  const day = () => NDC.isLight();
  const themeOf = (f) => ART.theme(f, day());
  const FLOORS = [null,
    { waves: [["s", "s", "s"], ["s", "s", "g"], ["S", "g", "g"]], pillars: [[130, 150], [350, 150]] },
    { waves: [["g", "g", "s", "s", "s"], ["a", "a", "g"], ["S", "S", "a", "g", "g"]], pillars: [[120, 140], [360, 140], [240, 210]] },
    { waves: [["g", "g", "g", "a"], ["b", "b", "b", "g", "n"], ["a", "a", "g", "g", "g", "S"]], pillars: [[240, 190]], fire: true },
    { waves: [["b", "b", "b", "b", "a", "a"], ["B", "g", "g", "g"], ["B", "a", "n", "b", "b", "b", "g", "n"]], pillars: [[110, 150], [370, 150]] },
    { waves: [["g", "g", "n", "a", "a"], ["B", "b", "b", "b", "n"], ["K"]], pillars: [[100, 160], [380, 160]] },
    { waves: [["z", "z", "z"], ["z", "z", "x", "x"], ["Z", "z", "z", "x"]], pillars: [[120, 150], [360, 150]] },
    { waves: [["z", "z", "x", "m"], ["Z", "Z", "x", "x"], ["m", "m", "Z", "z", "z", "x"]], pillars: [[110, 140], [370, 140], [240, 222]] },
    { waves: [["o", "o", "o", "o"], ["O", "p", "p", "o"], ["O", "O", "p", "z", "z"]], pillars: [[120, 128], [360, 128]] },
    { waves: [["i", "i", "i", "o"], ["Z", "i", "i", "m", "x"], ["w", "w", "i", "i", "Z", "p"]], pillars: [[240, 190]], fire: true },
    { waves: [["w", "w", "i", "i"], ["D"]], pillars: [[90, 132], [390, 132]] },
  ];
  /* seconds to beat for the time star */
  const PAR = [0, 45, 55, 60, 70, 95, 55, 70, 70, 85, 170];
  const BASE = {
    s: { hp: 2, r: 6, xp: 3, name: "slime" }, S: { hp: 5, r: 9, xp: 6, name: "bigslime" }, g: { hp: 6, r: 7, xp: 10, name: "goblin" },
    a: { hp: 4, r: 6, xp: 12, name: "archer" }, n: { hp: 5, r: 7, xp: 14, name: "bomber" }, b: { hp: 2, r: 5, xp: 6, name: "bat" }, B: { hp: 20, r: 11, xp: 28, name: "brute" }, K: { hp: 120, r: 15, xp: 120, name: "king" },
    z: { hp: 7, r: 7, xp: 12, name: "skeleton" }, x: { hp: 5, r: 6, xp: 12, name: "bonethrower" }, Z: { hp: 22, r: 9, xp: 30, name: "knight" },
    m: { hp: 6, r: 6, xp: 18, name: "mage" }, o: { hp: 4, r: 7, xp: 6, name: "glob" }, O: { hp: 14, r: 12, xp: 20, name: "megaglob" },
    p: { hp: 7, r: 8, xp: 14, name: "spitter" }, i: { hp: 4, r: 5, xp: 10, name: "imp" }, w: { hp: 10, r: 8, xp: 16, name: "whelp" },
    D: { hp: 430, r: 20, xp: 400, name: "dragon" },
  };
  const BOSS = { K: "The Goblin King", D: "Cinderwing" };
  /* the bestiary, in the order you meet them */
  const BEASTS = [
    ["slime", "s", "Slime", "Hops at you. Two hits and it pops."],
    ["bigslime", "S", "Big slime", "Splits in two when it pops."],
    ["goblin", "g", "Goblin", "Raises its club before it lunges. Dash sideways."],
    ["archer", "a", "Goblin archer", "A red line shows where the arrow will fly."],
    ["bomber", "n", "Goblin bomber", "Lobs bombs at you. Get out of the red circle before the fuse runs out."],
    ["bat", "b", "Bat", "Circles, then dives. Swing as it comes in."],
    ["brute", "B", "Goblin brute", "Slow, but the slam covers the red circle."],
    ["king", "K", "The Goblin King", "Charges in a line and slams a shockwave. Dash through the ring."],
    ["skeleton", "z", "Skeleton", "Pulls itself back together. Smash the bone pile before it stands."],
    ["bonethrower", "x", "Bone thrower", "Throws spinning bones from across the room."],
    ["knight", "Z", "Skeleton knight", "Its shield stops hits from the front. Hit it from behind, right after its slam, or with Whirlwind."],
    ["mage", "m", "Skeleton mage", "Its orbs follow you. When it flickers it's about to teleport. Hit it to stop it."],
    ["glob", "o", "Glob", "Leaves hot orange goo where it lands. Don't stand in it."],
    ["megaglob", "O", "Mega glob", "Bursts into three globs."],
    ["spitter", "p", "Spitter glob", "Lobs goo at where you're standing. Watch for the circle."],
    ["imp", "i", "Fire imp", "Fast and small. Throws fireballs."],
    ["whelp", "w", "Dragon whelp", "A baby dragon. Dives like a bat, hits like a brute."],
    ["dragon", "D", "Cinderwing", "Breathes fire in a cone, takes to the sky, and comes down hard."],
  ];

  /* ---------- enchants (pick one after each floor; they last for the rest of the run) ---------- */
  const PERKS = [
    { id: "edge", name: "Sharpened Edge", desc: "+20% sword damage", c: "#ff6a6a", r: "common" },
    { id: "quick", name: "Quick Hands", desc: "Swing 15% faster", c: "#ffd25a", r: "common" },
    { id: "heart", name: "Stout Heart", desc: "+30 max health, and heal 30 now", c: "#ff5d73", r: "common" },
    { id: "wind", name: "Second Wind", desc: "Stamina refills 35% faster", c: "#6aaeff", r: "common" },
    { id: "reach", name: "Long Reach", desc: "+15% sword reach", c: "#9fd8ff", r: "common" },
    { id: "boots", name: "Swift Boots", desc: "Move 12% faster", c: "#6ad48a", r: "common" },
    { id: "leech", name: "Vampire Blade", desc: "Heal 1 health every hit", c: "#e5304a", r: "rare", once: true },
    { id: "shadow", name: "Shadow Step", desc: "Dashing costs half the stamina", c: "#a99ad8", r: "rare", once: true },
    { id: "lucky", name: "Four-Leaf Luck", desc: "Hearts drop twice as often", c: "#4fd06a", r: "rare", once: true },
    { id: "thorns", name: "Thorn Mail", desc: "Monsters that hit you take 8 damage", c: "#8ad04a", r: "rare" },
    { id: "crit", name: "Hawk Eye", desc: "+12% chance to land a double-damage hit", c: "#ffb04a", r: "rare" },
    { id: "exec", name: "Executioner", desc: "Your combo finisher does +50% damage", c: "#ff8a3d", r: "epic" },
    { id: "burn", name: "Ember Edge", desc: "Every hit sets monsters on fire", c: "#ff7a1a", r: "epic", once: true },
    { id: "storm", name: "Storm Spin", desc: "Whirlwind recharges 35% faster and hits harder", c: "#6ef0e0", r: "epic", spin: true },
  ];
  const RARITY = { common: { label: "Common", c: "#b9c4dc", w: 1 }, rare: { label: "Rare", c: "#c08aff", w: 0.7 }, epic: { label: "Epic", c: "#ffcf5a", w: 0.4 } };
  /* 12x12 pixel icons: k outline, a main color, b lighter, c highlight, d darker, s steel, g gold, w wood */
  const ICONS = {"edge": ["..........kk",
    ".........ksk",
    "........kssk",
    ".......kssk.",
    "......kssk..",
    ".....kssk...",
    ".kk.kssk....",
    ".kgkssk.....",
    "..kgsk......",
    ".kwkgk......",
    "kwk.kk......",
    "kk.........."],
    "quick": ["......kkkk..",
    ".....kaaak..",
    "....kaaak...",
    "...kabak....",
    "..kaaakkkk..",
    ".kaaaaaaak..",
    ".kkkkaaak...",
    "....kaak....",
    "...kaak.....",
    "..kaak......",
    "..kak.......",
    "..kk........"],
    "heart": ["............",
    ".kkkk..kkkk.",
    "kaaaakkaaaak",
    "kacaaaaaaaak",
    "kacaaaaaaaak",
    "kaaaaaaaaaak",
    ".kaaaaaaaak.",
    "..kaaaaaak..",
    "...kaaaak...",
    "....kaak....",
    ".....kk.....",
    "............"],
    "wind": ["............",
    "...kkkkkk...",
    "..kaaaaaak..",
    ".kak.kkkkak.",
    ".kak....kak.",
    ".kak.kk.kak.",
    ".kak.kak.ak.",
    ".kak..kaak..",
    ".kaak..kk...",
    "..kaaakkkk..",
    "...kkaaaak..",
    ".....kkkk..."],
    "leech": [".....kk.....",
    "....kaak....",
    "....kaak....",
    "...kaaaak...",
    "...kaaaak...",
    "..kaacaaak..",
    "..kacaaaak..",
    ".kacaaaaaak.",
    ".kaaaaaaaak.",
    ".kdaaaaaadk.",
    "..kddaaddk..",
    "...kkkkkk..."],
    "reach": ["..........kk",
    ".........kck",
    "........kaak",
    "........kak.",
    ".......kwk..",
    "......kwk...",
    ".....kwk....",
    "....kwk.....",
    "...kwk......",
    "..kwk.......",
    ".kwk........",
    ".kk........."],
    "boots": ["............",
    "...kkkkk....",
    "...kaaak....",
    "...kabak....",
    "...kaaak....",
    "...kaaak....",
    "...kaaakkk..",
    "..kaaaaaaak.",
    "..kaaaaaaaak",
    ".kddddddddk.",
    "..kkkkkkkk..",
    "............"],
    "shadow": ["....kkkk....",
    "...kaaaak...",
    "..kaaaaaak..",
    "..kacaacak..",
    "..kaaaaaak..",
    "..kaaaaaak..",
    ".kaaaaaaaak.",
    ".kaaaaaaaak.",
    ".kaaaaaaaak.",
    ".kaakaakaak.",
    ".kk.kk.kk.k.",
    "............"],
    "lucky": ["............",
    "..kk....kk..",
    ".kaak..kaak.",
    ".kaaakkaaak.",
    "..kaaaaaak..",
    "...kaaaak...",
    "..kaaaaaak..",
    ".kaaakkaaak.",
    ".kaak.kkaak.",
    "..kk.kd.kk..",
    ".....kd.....",
    ".....kk....."],
    "thorns": [".....k......",
    "..k..k..k...",
    "...kkakk....",
    ".kkaaaaakk..",
    "...kaaaak...",
    "kkkaaaaaakkk",
    "...kaaaak...",
    ".kkaaaaakk..",
    "...kkakk....",
    "..k..k..k...",
    ".....k......",
    "............"],
    "exec": ["....kkkk....",
    "...kssssk...",
    "..ksssssk...",
    "..kssssskk..",
    "..ksssskwk..",
    "...kkkkwk...",
    ".....kwk....",
    ".....kwk....",
    "....kwk.....",
    "....kwk.....",
    "...kwk......",
    "...kk......."],
    "burn": ["......k.....",
    ".....kak....",
    "....kaak.k..",
    "...kaabakak.",
    "..kaabbaaak.",
    "..kabbcbaak.",
    ".kaabccbaak.",
    ".kabccccbak.",
    ".kabccccbak.",
    "..kabccbak..",
    "...kaaaak...",
    "....kkkk...."],
    "crit": ["............",
    "....kkkk....",
    "..kkcccckk..",
    ".kccaaaacck.",
    "kccakkkaacck",
    "kcaakkkkaack",
    "kcaakkkkaack",
    "kccaakkaacck",
    ".kccaaaacck.",
    "..kkcccckk..",
    "....kkkk....",
    "............"],
    "storm": ["kkkkkkkkkkk.",
    "kaaaaaaaaak.",
    ".kkkkkkkkk..",
    "..kaaaaaak..",
    "...kkkkkk...",
    "...kaaaak...",
    "....kkkk....",
    "....kaak....",
    "...kaak.....",
    "...kak......",
    "....kk......",
    "............"],
    "trophy": ["kkkkkkkkkkkk",
    "kgcgggggggdk",
    "kgcggggggdk.",
    "kkgcgggggdkk",
    "k.kgggggdk.k",
    "kkkgggggdkkk",
    "...kgggdk...",
    "....kgdk....",
    "....kgdk....",
    "...kggggk...",
    "..kgggggdk..",
    "..kkkkkkkk.."]};
  Object.assign(ICONS, {
    "ab_beam": ["............", "......kkk...", "....kkbbak..", "...kbaak.k..", "..kbak......", "..kak.......", "..kak.......", "..kbak......", "...kbaak.k..", "....kkbbak..", "......kkk...", "............"],
    "ab_spin": ["....kkkk....", "..kkaaaakk..", ".kaak..kaak.", ".kak....kkk.", "kak.....kak.", "kak......k..", "..k......kak", ".kak.....kak", ".kkk....kak.", ".kaak..kaak.", "..kkaaaakk..", "....kkkk...."],
    "ab_thunder": ["...kkkk.....", "..kccccck...", ".kccccccckk.", "kcccccccccck", "kddddddddddk", ".kkkkakkkkk.", "....kak.....", "...kaak.....", "...kakkk....", "..kaaaak....", "....kak.....", "....kk......"]
  });
  const iconCache = {};
  function iconCanvas(id, scale, color) {
    const key = id + scale + (color || ""); if (iconCache[key]) return iconCache[key];
    const rows = ICONS[id] || ICONS.edge, q = PERKS.find((x) => x.id === id), base = color || (q ? q.c : "#f4b942");
    const mix = NDC.dungeonArt.mix, pal = { k: "#14101c", a: base, b: mix(base, "#ffffff", 0.35), c: mix(base, "#ffffff", 0.8), d: mix(base, "#000000", 0.4), s: "#e8eef8", g: "#f4b942", w: "#8a5a2f" };
    const cv = document.createElement("canvas"); cv.width = cv.height = 12 * scale; const c = cv.getContext("2d");
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch]) { c.fillStyle = pal[ch]; c.fillRect(x * scale, y * scale, scale, scale); } }));
    return (iconCache[key] = cv);
  }
  const iconURL = (id, scale, color) => iconCanvas(id, scale, color).toDataURL();
  const perkById = (id) => PERKS.find((q) => q.id === id);
  function mods(perks) {
    const m = { dmg: 1, swing: 1, hp: 0, regen: 1, leech: 0, reach: 1, speed: 1, dash: 1, heart: 1, thorns: 0, fin: 1, burn: 0, crit: 0.06, spinCd: 1, spinDmg: 1 };
    for (const id of perks) {
      if (id === "edge") m.dmg *= 1.2; if (id === "quick") m.swing *= 0.85; if (id === "heart") m.hp += 30; if (id === "wind") m.regen *= 1.35;
      if (id === "leech") m.leech = 1; if (id === "reach") m.reach *= 1.15; if (id === "boots") m.speed *= 1.12; if (id === "shadow") m.dash = 0.5;
      if (id === "lucky") m.heart = 2; if (id === "thorns") m.thorns += 8; if (id === "exec") m.fin *= 1.5; if (id === "burn") m.burn = 1;
      if (id === "crit") m.crit += 0.12; if (id === "storm") { m.spinCd *= 0.65; m.spinDmg *= 1.35; }
    }
    return m;
  }
  function offerPerks(have, nextFloor) { // three different enchants; rarer ones turn up less often
    const pool = PERKS.filter((q) => !(q.once && have.includes(q.id)) && !(q.spin && nextFloor < SPIN_FLOOR)), out = [];
    while (out.length < 3 && pool.length) {
      let roll = Math.random() * pool.reduce((n, q) => n + RARITY[q.r].w, 0), i = 0;
      while (roll > RARITY[pool[i].r].w) { roll -= RARITY[pool[i].r].w; i++; }
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return Math.abs(d); };
  const turn = (from, to, k) => { let d = (to - from) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return from + d * k; };
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeInOut = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  const hpScale = (f) => (f <= 5 ? 1 + 0.18 * (f - 1) : 1.45 + 0.12 * (f - 6));
  const dmgScale = (f) => (f <= 5 ? 1 + 0.1 * (f - 1) : 1.3 + 0.07 * (f - 6));
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

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
    crit: () => { tone(900, 300, 0.12, "square", 0.05); tone(200, 60, 0.15, "square", 0.05); }, clang: () => tone(1200, 700, 0.1, "triangle", 0.05),
    hurt: () => tone(180, 60, 0.22, "sawtooth", 0.07), dash: () => tone(260, 520, 0.1, "triangle", 0.03), arrow: () => tone(700, 300, 0.08, "square", 0.025),
    slam: () => tone(90, 30, 0.3, "square", 0.08), heal: () => tone(500, 900, 0.15, "sine", 0.05), spin: () => { tone(300, 900, 0.25, "sawtooth", 0.04); tone(600, 200, 0.3, "triangle", 0.03); },
    roar: () => { tone(140, 50, 0.7, "sawtooth", 0.08); tone(90, 40, 0.8, "square", 0.05); }, fire: () => tone(220, 90, 0.2, "sawtooth", 0.03),
    chest: () => { tone(300, 600, 0.12, "square", 0.05); setTimeout(() => tone(600, 1200, 0.25, "triangle", 0.05), 110); },
    perk: () => { tone(600, 1200, 0.18, "sine", 0.05); tone(900, 1500, 0.22, "triangle", 0.03); },
    beam: () => { tone(900, 1800, 0.12, "sawtooth", 0.03); tone(400, 800, 0.1, "triangle", 0.03); },
    thunder: () => { tone(80, 30, 0.6, "sawtooth", 0.08); tone(1600, 200, 0.3, "square", 0.03); },
    win: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, f * 1.01, 0.25, "square", 0.05), i * 130)); },
  };

  const vignette = (() => {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d"), g = c.createRadialGradient(W / 2, H / 2 + 10, 90, W / 2, H / 2 + 10, 300);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.65)"); c.fillStyle = g; c.fillRect(0, 0, W, H); return cv;
  })();
  const dayVignette = (() => {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d"), g = c.createRadialGradient(W / 2, H / 2 + 10, 130, W / 2, H / 2 + 10, 320);
    g.addColorStop(0, "rgba(60,45,20,0)"); g.addColorStop(1, "rgba(60,45,20,0.2)"); c.fillStyle = g; c.fillRect(0, 0, W, H); return cv;
  })();

  /* save helper: every write keeps all the dungeon fields */
  function saveGame(fn) {
    NDC.store.update((s) => {
      const g = Object.assign({ xp: 0, best: 0, kills: 0 }, s.game || {});
      g.stars = Object.assign({}, g.stars); g.times = Object.assign({}, g.times); g.slain = Object.assign({}, g.slain);
      fn(g); g.xp = 0; s.game = g;
    });
  }

  /* ====================================================================== */
  NDC.pages.dungeon = function () {
    let gs = G.gameStats(NDC.store.get());
    let sprite = null, raf = 0, last = 0, alive = true;
    const keys = new Set();
    let run = null, phase = "menu", pendingKills = 0, pendingSlain = {}, bg = null, mouse = { x: 0, y: 0, seen: 0 };
    let offer = null, carryNext = null;

    const canvas = h("canvas", { width: W, height: H, class: "dg-canvas", tabindex: "0", "aria-label": "Dungeon game" });
    let ctx = canvas.getContext("2d");
    /* text and the HUD go on a sharper layer on top, so words stay crisp while the art stays chunky */
    const HS = 3, hudCv = h("canvas", { width: W * HS, height: H * HS, class: "dg-hud", "aria-hidden": "true" }), hctx = hudCv.getContext("2d");
    const mainCtx = ctx;
    const menuEl = h("div", { class: "dg-menu" }), statEl = h("div", { class: "dg-stat" }), beastEl = h("div", { class: "dg-beasts" });
    const lightCv = document.createElement("canvas"); lightCv.width = W; lightCv.height = H;
    const lctx = lightCv.getContext("2d");
    const now = () => (run ? run.t : performance.now() / 1000);

    const loadout = () => G.loadout(NDC.store.get());
    let spriteBack = null;
    function makeSprite() { // front view, and a back view (no eye slit) for when he walks away from you
      const eq = Object.assign({}, NDC.store.equipped(), { shield: "none", weapon: "none", light: day() });
      const img = new Image(), back = new Image();
      img.onload = () => { sprite = img; }; back.onload = () => { spriteBack = back; };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(NDC.knight.svg(eq, { crop: [0, 0, 28, 32] }));
      back.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(NDC.knight.svg(Object.assign({}, eq, { back: true }), { crop: [0, 0, 28, 32] }));
    }

    /* ---------- starting ---------- */
    function start(floor, carry) {
      if (floor > (G.gameStats(NDC.store.get()).best || 0) + 1) return; // locked: clear the floor before it first
      gs = G.gameStats(NDC.store.get());
      carry = carry || { perks: [] };
      const L = loadout(), m = mods(carry.perks);
      const weapon = Object.assign({}, L.weapon, { dmg: L.weapon.dmg * m.dmg, swing: L.weapon.swing * m.swing, reach: L.weapon.reach * m.reach });
      const maxHp = G.BASE_HP + L.hp + m.hp, maxSt = G.BASE_STAMINA;
      const hp = carry.hp ? Math.min(maxHp, carry.hp) : maxHp;
      const p = {
        x: W / 2, y: BOT - 36, vx: 0, vy: 0, kx: 0, ky: 0, r: 7, dir: -Math.PI / 2, hp, maxHp, st: maxSt, maxSt, stWait: 0,
        speed: 100 * (1 + L.speed) * m.speed, swing: null, combo: 0, comboT: 0, queued: false, spin: null, spinCd: 0, cd: { beam: 0, thunder: 0 },
        dash: 0, dashCd: 0, dashDir: 0, stun: 0, inv: 0, flash: 0, walk: 0, L: Object.assign({}, L, { weapon }), m,
      };
      run = {
        floor, p, carry, perks: carry.perks.slice(), day: day(), theme: themeOf(floor), def: FLOORS[floor], enemies: [], spawns: [], shots: [], lobs: [], pools: [], waves: [], fx: [], pickups: [], t: 0,
        waveIdx: 0, waveWait: 0.8, kills: 0, banner: themeOf(floor).name, bannerT: 2.4, freeze: 0, shake: 0, slow: 0, over: false, endT: 0,
        pillars: FLOORS[floor].pillars.map(([x, y]) => ({ x, y, r: 9 })), hitFlash: 0, hpLost: 0, chain: 0, chainT: 0, bestChain: 0,
        spinOn: floor >= SPIN_FLOOR, ab: Object.fromEntries(ABILITIES.map((a) => [a.id, floor >= a.floor])), pshots: [], bolts: [], boltFlash: 0, party: 0,
        tip: 0, tipAb: null, props: [], lastHit: null,
      };
      if (FLOORS[floor].fire) run.pillars.push({ x: 240, y: 192, r: 10, fire: true });
      for (let i = 0, tries = 0; i < 5 && tries < 60; tries++) { // things to smash; sometimes a heart inside
        const x = rnd(LEFT + 24, RIGHT - 24), y = rnd(TOP + 20, BOT - 24);
        if (Math.hypot(x - 240, y - 178) < 70 || Math.hypot(x - p.x, y - p.y) < 50 || run.pillars.some((q) => Math.hypot(x - q.x, y - q.y) < 26) || run.props.some((q) => Math.hypot(x - q.x, y - q.y) < 30)) continue;
        run.props.push({ x, y, k: floor <= 5 ? "barrel" : "pot" }); i++;
      }
      bg = ART.build(floor, day());
      phase = "play"; offer = null; makeSprite(); menuEl.hidden = true; canvas.focus({ preventScroll: true });
    }

    function spawnWave() {
      const w = run.def.waves[run.waveIdx], scale = hpScale(run.floor);
      run.waveIdx++;
      run.banner = run.def.waves.length > 1 ? `Wave ${run.waveIdx} of ${run.def.waves.length}` : "Final wave"; run.bannerT = 1.6;
      const boss = w.find((k) => BOSS[k]);
      if (boss) { run.banner = BOSS[boss]; run.bannerT = 2.6; if (boss === "D") SFX.roar(); }
      w.forEach((k, i) => {
        let x, y, tries = 0;
        do { x = rnd(LEFT + 30, RIGHT - 30); y = rnd(TOP + 14, BOT - 40); tries++; } while (tries < 20 && (Math.hypot(x - run.p.x, y - run.p.y) < 110 || run.pillars.some((q) => Math.hypot(x - q.x, y - q.y) < 22)));
        if (BOSS[k]) { x = W / 2; y = TOP + 44; }
        run.spawns.push({ k, x, y, t: 0.55 + i * 0.12, scale, elite: !BOSS[k] && run.floor >= 2 && Math.random() < 0.12 });
      });
    }
    function makeEnemy(k, x, y, scale) {
      const b = BASE[k], hpm = k === "D" ? 1 : scale;
      const e = { k, kind: b.name, x, y, vx: 0, vy: 0, kx: 0, ky: 0, r: b.r, hp: b.hp * hpm, max: b.hp * hpm, xp: b.xp, flash: 0, stun: 0, st: "move", t: Math.random() * 2, cd: rnd(0.4, 1.4), face: 1, hit: false, anim: Math.random() * 6, spawnT: 0.25, scale, burn: 0, z: 0 };
      if (k === "b" || k === "w") { e.fly = true; e.orbit = Math.random() * TAU; }
      if (k === "K") { e.cd = 1.5; e.atk = 0; e.sum = 0; }
      if (k === "Z") { e.faceA = Math.PI / 2; }
      if (k === "m") { e.blink = 0; }
      if (k === "D") { e.cd = 2; e.atk = 0; e.ph = 1; e.lifts = 0; }
      return e;
    }

    /* ---------- finishing ---------- */
    function commit() {
      if (!pendingKills) return;
      const kills = pendingKills, slain = pendingSlain; pendingKills = 0; pendingSlain = {};
      saveGame((g) => { g.kills = (g.kills || 0) + kills; for (const [k, n] of Object.entries(slain)) g.slain[k] = (g.slain[k] || 0) + n; });
    }
    function finish(win) {
      if (run.over || run.won) return;
      run.time = run.t; run.win = win;
      if (win) { run.won = true; run.shots = []; run.lobs = []; run.pools = []; run.waves = []; run.chest = { x: 240, y: 176, t: 0, open: false, ot: 0 }; }
      else { run.over = true; run.endT = 1.1; }
      if (win) {
        const f = run.floor, prev = gs.stars[f] || 0, prevT = gs.times[f] || 0;
        run.stars = 1 + (run.time <= PAR[f] ? 1 : 0) + (run.hpLost <= run.p.maxHp * 0.35 ? 1 : 0);
        run.newBest = !prevT || run.time < prevT; run.newStars = run.stars > prev;
        saveGame((g) => { g.best = Math.max(g.best || 0, f); g.stars[f] = Math.max(g.stars[f] || 0, run.stars); g.times[f] = g.times[f] ? Math.min(g.times[f], run.time) : run.time; });
        run.banner = run.floor === 5 || run.floor === G.FLOORS ? "VICTORY!" : "Floor cleared!"; run.bannerT = 2.2; run.slow = 0.6;
      } else { run.banner = "Knocked out"; run.bannerT = 2; run.slow = 0.8; }
      commit();
      gs = G.gameStats(NDC.store.get()); drawStat(); drawBeasts();
    }

    /* ---------- helpers ---------- */
    function down(n) { return KEYS[n].some((k) => keys.has(k)); }
    function addFx(o) { run.fx.push(o); }
    function sparks(x, y, col, n, spd) { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), s = rnd(0.4, 1) * (spd || 90); addFx({ k: "spark", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, t: rnd(0.2, 0.45), c: col }); } }
    function puff(x, y, col, n) { for (let i = 0; i < n; i++) addFx({ k: "puff", x: x + rnd(-4, 4), y: y + rnd(-3, 3), vx: rnd(-20, 20), vy: rnd(-30, -5), t: rnd(0.3, 0.6), c: col, s: rnd(2, 4) }); }
    function text(x, y, v, c, big) { addFx({ k: "text", x, y, t: big ? 0.9 : 0.7, v, c, big }); }
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
      const ang = Math.atan2(sy - p.y, sx - p.x), dmg = raw * (1 - p.L.def);
      if (opt.soft) run.hitFlash = 0.12;
      else { p.kx += Math.cos(ang + Math.PI) * 110; p.ky += Math.sin(ang + Math.PI) * 110; run.shake = 5; run.freeze = 0.06; run.hitFlash = 0.25; }
      SFX.hurt();
      p.hp -= dmg; run.hpLost += dmg; p.inv = 0.55; p.flash = 0.25;
      run.lastHit = opt.from || (opt.src && opt.src.kind) || run.lastHit;
      text(p.x, p.y - 18, Math.round(dmg), "#ff5d73");
      if (opt.src && p.m.thorns && !opt.src.air) { opt.src.hp -= p.m.thorns; opt.src.flash = 0.12; sparks(opt.src.x, opt.src.y, "#9bd05a", 6, 80); }
      if (p.hp <= 0) { p.hp = 0; finish(false); }
      return true;
    }

    /* ---------- player attacks ---------- */
    function startSwing() {
      const p = run.p, w = p.L.weapon;
      const combo = p.comboT > 0 ? (p.combo % 3) + 1 : 1;
      const cost = combo === 3 ? 15 : 9;
      if (p.st < cost) return false;
      p.st -= cost; p.stWait = 0.5; p.combo = combo; p.comboT = 0;
      // gentle aim assist toward the nearest enemy when using the keyboard
      if (!(mouse.seen > 0)) {
        let best = null, bd = 1e9;
        for (const e of run.enemies) { if (e.air) continue; const d = dist(p, e); const a = Math.atan2(e.y - p.y, e.x - p.x); if (d < 70 && angDiff(a, p.dir) < 1.3 && d < bd) { bd = d; best = a; } }
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
      if (u < 0.24) return lerp(a0, back, easeInOut(u / 0.24));
      if (u < 0.52) return lerp(back, over, easeOut((u - 0.24) / 0.28));
      return lerp(over, sw.dir + s * 0.25, easeInOut((u - 0.52) / 0.48));
    }
    function swingHalf(sw) { const w = run.p.L.weapon; const base = w.reach > 1.5 ? 1.55 : 1.1; return sw.combo === 3 ? Math.PI * 0.95 : base; }
    /* one hit on one monster, shared by swings and the whirlwind */
    function strike(e, base, opt) {
      const p = run.p, dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
      let dmg = base;
      // skeleton knights block hits from the front, except the whirlwind and finishers
      if (e.k === "Z" && e.st !== "rest" && !opt.spin && !opt.fin && angDiff(e.faceA, Math.atan2(-dy, -dx)) < 1.15) {
        dmg *= 0.3; SFX.clang(); sparks(e.x - dx / d * 8, e.y - dy / d * 8, "#dfe6f7", 8, 110);
        text(e.x, e.y - e.r - 14, "Blocked", "#dfe6f7"); p.kx -= dx / d * 60; p.ky -= dy / d * 60;
      }
      const crit = Math.random() < p.m.crit;
      if (crit) dmg *= 2;
      e.hp -= dmg; e.flash = 0.12;
      if (!["K", "B", "D", "Z", "O"].includes(e.k)) e.stun = Math.max(e.stun, 0.18);
      const kb = (e.k === "D" ? 8 : e.k === "K" ? 35 : e.k === "B" || e.k === "Z" || e.k === "O" ? 70 : 150) * (0.7 + base * 0.1) * (opt.fin || opt.spin ? 1.6 : 1);
      e.kx += (dx / d) * kb; e.ky += (dy / d) * kb;
      if (e.st === "wind" && base >= 3 && e.k !== "D" && e.k !== "Z") { e.st = "move"; e.t = 0; e.cd = 0.8; }
      if (e.st === "fade") { e.st = "move"; e.t = 0; e.blink = 1.5; }
      if (p.m.burn) e.burn = 2.2;
      if (p.m.leech && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + p.m.leech);
      sparks(e.x, e.y, crit ? "#ffe08a" : "#fff", crit ? 12 : opt.fin ? 10 : 6, crit ? 160 : 120);
      text(e.x, e.y - e.r - 8, crit ? `${Math.round(dmg)}!` : Math.round(dmg * 10) / 10, crit ? "#ffe08a" : "#fff", crit);
      crit ? SFX.crit() : SFX.hit();
      return crit;
    }
    function doHit(sw) {
      const p = run.p, w = p.L.weapon, half = swingHalf(sw), fin = sw.combo === 3;
      const range = 26 * w.reach * (fin ? 1.15 : 1);
      let any = false, crit = false;
      for (const e of run.enemies) {
        if (e.spawnT > 0 || e.air || sw.hits.has(e)) continue;
        const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
        if (d > range + e.r) continue;
        if (!fin && angDiff(sw.dir, Math.atan2(dy, dx)) > half) continue;
        sw.hits.add(e); any = true;
        const dmg = w.dmg * (fin ? 1.6 * p.m.fin : 1) * (sw.combo === 2 ? 1.1 : 1);
        crit = strike(e, dmg, { fin }) || crit;
      }
      if (any) { run.freeze = Math.max(run.freeze, crit || fin ? 0.1 : 0.05); run.shake = Math.max(run.shake, crit || fin ? 5 : 2); }
      smash((q) => { const dx = q.x - p.x, dy = q.y - p.y; return Math.hypot(dx, dy) < range + 6 && (fin || angDiff(sw.dir, Math.atan2(dy, dx)) < half + 0.3); });
      reap();
      if (fin) addFx({ k: "ring", x: p.x, y: p.y, t: 0.3, d: 0.3, c: "#fff", s: range });
    }
    function startBeam() {
      const p = run.p, a = ABIL.beam;
      if (!run.ab.beam || p.cd.beam > 0 || p.st < a.cost || p.dash > 0 || p.stun > 0 || p.spin) return;
      p.st -= a.cost; p.stWait = 0.5; p.cd.beam = a.cd; run.tip = 0;
      const dir = p.dir, w = p.L.weapon;
      run.pshots.push({ x: p.x + Math.cos(dir) * 10, y: p.y - 8 + Math.sin(dir) * 8, vx: Math.cos(dir) * 290, vy: Math.sin(dir) * 290, a: dir, life: 0.6, dmg: w.dmg * 0.9, hits: new Set() });
      SFX.beam(); sparks(p.x + Math.cos(dir) * 12, p.y - 8, "#ffe08a", 6, 90);
    }
    function startThunder() {
      const p = run.p, a = ABIL.thunder;
      if (!run.ab.thunder || p.cd.thunder > 0 || p.st < a.cost || p.stun > 0) return;
      const targets = run.enemies.filter((e) => !e.air && e.spawnT <= 0 && e.k !== "bones" && dist(p, e) < 240).sort((x, y) => dist(p, x) - dist(p, y)).slice(0, 4);
      if (!targets.length) return;
      p.st -= a.cost; p.stWait = 0.6; p.cd.thunder = a.cd; run.tip = 0; SFX.thunder();
      targets.forEach((e, i) => run.bolts.push({ e, t: 0.1 + i * 0.12 }));
    }
    function startSpin() {
      const p = run.p;
      if (!run.ab.spin || p.spin || p.spinCd > 0 || p.st < SPIN_COST || p.dash > 0 || p.stun > 0) return;
      p.swing = null; p.queued = false;
      p.st -= SPIN_COST; p.stWait = 0.6; p.spin = { t: 0, dur: 0.5, done: 0 }; p.spinCd = SPIN_CD * p.m.spinCd; p.inv = Math.max(p.inv, 0.18);
      SFX.spin(); run.tip = 0;
    }
    function spinHit() {
      const p = run.p, range = 40 * p.L.weapon.reach;
      let any = false;
      for (const e of run.enemies) {
        if (e.spawnT > 0 || e.air) continue;
        if (dist(p, e) > range + e.r) continue;
        any = true; strike(e, p.L.weapon.dmg * 1.25 * p.m.spinDmg, { spin: true });
      }
      addFx({ k: "ring", x: p.x, y: p.y, t: 0.3, d: 0.3, c: "#6ef0e0", s: range }); sparks(p.x, p.y - 6, "#6ef0e0", 10, 140);
      smash((q) => Math.hypot(q.x - p.x, q.y - p.y) < range + 6);
      if (any) { run.freeze = Math.max(run.freeze, 0.06); run.shake = Math.max(run.shake, 4); }
      reap();
    }
    function smash(test) { // break any pot or barrel the test says was hit
      for (const q of run.props) if (!q.broke && test(q)) {
        q.broke = true; SFX.hit(); sparks(q.x, q.y - 6, q.k === "pot" ? "#c8784a" : "#a8743e", 12, 120); puff(q.x, q.y - 4, q.k === "pot" ? "#8a4a2a" : "#6a4a2a", 6);
        if (Math.random() < 0.3 * run.p.m.heart) run.pickups.push({ x: q.x, y: q.y, t: 0, k: "heart" });
      }
      run.props = run.props.filter((q) => !q.broke);
    }
    function reap() {
      const dead = run.enemies.filter((e) => e.hp <= 0 && !e.gone);
      dead.forEach(kill);
      run.enemies = run.enemies.filter((e) => e.hp > 0 && !e.gone);
    }
    const KILL_COL = { slime: "#4fc47e", bigslime: "#4fc47e", goblin: "#9bd05a", archer: "#6ab04a", bat: "#8a6fb0", brute: "#7a9a4a", king: "#f4cf5a", skeleton: "#e8e0c8", bones: "#e8e0c8", bonethrower: "#e8e0c8", knight: "#b9c2d2", mage: "#b06aff", glob: "#ff9a3d", megaglob: "#ff9a3d", spitter: "#f08a2a", bomber: "#9bd05a", imp: "#ff6a2a", whelp: "#ff8a3d", dragon: "#ffb03a" };
    function kill(e) {
      const col = KILL_COL[e.kind] || "#fff";
      // first death of a skeleton leaves a bone pile that stands back up unless you smash it
      if (e.k === "z" && !e.revived) {
        sparks(e.x, e.y, col, 10, 110); SFX.kill();
        run.enemies.push({ k: "bones", kind: "bones", x: e.x, y: e.y, r: 6, hp: 3 * e.scale, max: 3 * e.scale, xp: 0, revT: 3.2, flash: 0, stun: 0, kx: 0, ky: 0, spawnT: 0, scale: e.scale, burn: 0, anim: 0, cd: 0, st: "pile", t: 0 });
        return;
      }
      const kind = e.k === "bones" ? "skeleton" : e.kind;
      pendingKills++; run.kills++; pendingSlain[kind] = (pendingSlain[kind] || 0) + 1;
      run.chain = run.chainT > 0 ? run.chain + 1 : 1; run.chainT = 2.4; run.bestChain = Math.max(run.bestChain, run.chain);
      if (run.chain >= 3) text(run.p.x, run.p.y - 40, `${run.chain} chain!`, "#ffe08a", true);
      sparks(e.x, e.y, col, BOSS[e.k] ? 50 : 14, 130); puff(e.x, e.y, col, 6); SFX.kill();
      if (e.k === "S") for (let i = 0; i < 2; i++) { const m = makeEnemy("s", e.x + (i ? 8 : -8), e.y, e.scale); m.kx = (i ? 1 : -1) * 90; m.ky = -40; m.spawnT = 0; m.xp = 3; run.enemies.push(m); }
      if (e.k === "O") for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; const m = makeEnemy("o", e.x + Math.cos(a) * 8, e.y + Math.sin(a) * 6, e.scale); m.kx = Math.cos(a) * 110; m.ky = Math.sin(a) * 70; m.spawnT = 0; run.enemies.push(m); }
      const drop = e.elite ? 1 : (BOSS[e.k] || e.k === "s" || e.k === "o" || e.k === "bones") ? 0 : 0.13 * run.p.m.heart;
      if (e.elite) { text(e.x, e.y - 20, "Elite down!", "#ffe08a", true); sparks(e.x, e.y, "#ffe08a", 20, 150); }
      if (Math.random() < drop) run.pickups.push({ x: e.x, y: e.y, t: 0, k: "heart" });
      if (BOSS[e.k]) { run.party = 2.2; run.shake = 10; run.slow = 0.8; for (const o of run.enemies) if (o !== e) { o.gone = true; puff(o.x, o.y, KILL_COL[o.kind] || "#fff", 6); } run.spawns = []; run.shots = []; run.lobs = []; }
    }

    /* ---------- update ---------- */
    function update(dt) {
      if (!run) return;
      const p = run.p;
      run.t += dt;
      if (run.bannerT > 0) run.bannerT -= dt;
      if (run.tip > 0 && run.bannerT <= 0) run.tip -= dt;
      run.chainT = Math.max(0, run.chainT - dt);
      if (run.party > 0) { // fireworks after a boss falls
        run.party -= dt;
        if (Math.random() < 0.25) { const x = rnd(80, 400), y = rnd(80, 200), c = ["#f4b942", "#ff5d73", "#6ef0e0", "#c08aff", "#6ad48a"][Math.floor(rnd(0, 5))]; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; addFx({ k: "spark", x, y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110 - 30, t: rnd(0.5, 0.8), c }); } }
      }
      for (const f of run.fx) { f.t -= dt; if (f.k === "spark" || f.k === "puff" || f.k === "flame") { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.k === "spark" ? 220 : -10) * dt; } }
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
        p.dashCd = Math.max(0, p.dashCd - dt); p.comboT = Math.max(0, p.comboT - dt); p.spinCd = Math.max(0, p.spinCd - dt);
        let ix = (down("right") ? 1 : 0) - (down("left") ? 1 : 0), iy = (down("down") ? 1 : 0) - (down("up") ? 1 : 0);
        if (ix || iy) { const m = Math.hypot(ix, iy); ix /= m; iy /= m; }
        if (mouse.seen > 0) { mouse.seen -= dt; if (!p.swing || p.swing.t > p.swing.dur * 0.6) p.dir = turn(p.dir, Math.atan2(mouse.y - p.y, mouse.x - p.x), Math.min(1, 18 * dt)); }

        p.cd.beam = Math.max(0, p.cd.beam - dt); p.cd.thunder = Math.max(0, p.cd.thunder - dt);
        if (down("spin")) startSpin();
        if (down("beam")) startBeam();
        if (down("thunder")) startThunder();
        // dash
        const dashCost = 20 * p.m.dash;
        if (p.dash <= 0 && down("dash") && p.dashCd <= 0 && p.stun <= 0 && p.st >= dashCost && !p.swing && !p.spin) {
          p.dash = 0.17; p.dashCd = 0.45; p.st -= dashCost; p.stWait = 0.5; p.dashDir = (ix || iy) ? Math.atan2(iy, ix) : p.dir; p.inv = 0.22; SFX.dash();
          for (let i = 0; i < 4; i++) puff(p.x, p.y + 4, "#9fb0d0", 1);
        }
        if (p.dash > 0) { smash((q) => Math.hypot(q.x - p.x, q.y - p.y) < 14); p.dash -= dt; p.x += Math.cos(p.dashDir) * 250 * dt; p.y += Math.sin(p.dashDir) * 250 * dt; if (Math.random() < 0.7) addFx({ k: "ghost", x: p.x, y: p.y, t: 0.18, f: Math.cos(p.dir) < 0 }); }
        else {
          // walk with a little acceleration so it feels weighty but responsive
          const sp = p.speed * (p.stun > 0 ? 0.25 : 1) * (p.swing ? 0.45 : 1) * (p.spin ? 0.6 : 1);
          const tx = ix * sp, ty = iy * sp, k = Math.min(1, 16 * dt);
          p.vx = lerp(p.vx, tx, k); p.vy = lerp(p.vy, ty, k);
          if (p.swing) { const u = p.swing.t / p.swing.dur; if (u > 0.2 && u < 0.5) { p.vx += Math.cos(p.swing.dir) * 140 * dt * 8; p.vy += Math.sin(p.swing.dir) * 140 * dt * 8; } }
          p.x += (p.vx + p.kx) * dt; p.y += (p.vy + p.ky) * dt;
          if ((ix || iy) && mouse.seen <= 0 && !p.swing && !p.stun) p.dir = turn(p.dir, Math.atan2(iy, ix), Math.min(1, 16 * dt));
          if (ix || iy) p.walk += dt * 11;
        }
        p.kx *= Math.max(0, 1 - 9 * dt); p.ky *= Math.max(0, 1 - 9 * dt);
        pushOut(p);

        // whirlwind: two hits as the sword goes round
        if (p.spin) {
          p.spin.t += dt; const u = p.spin.t / p.spin.dur;
          if (p.spin.done < 1 && u >= 0.3) { p.spin.done = 1; spinHit(); }
          if (p.spin.done < 2 && u >= 0.75) { p.spin.done = 2; spinHit(); }
          if (Math.random() < 0.8) addFx({ k: "spark", x: p.x + Math.cos(u * TAU * 1.5) * 30, y: p.y - 6 + Math.sin(u * TAU * 1.5) * 20, vx: 0, vy: -10, t: 0.25, c: "#6ef0e0" });
          if (u >= 1) p.spin = null;
        } else if (p.swing) {
          const sw = p.swing, before = sw.t / sw.dur;
          sw.t += dt;
          if (!sw.hit && before < 0.34 && sw.t / sw.dur >= 0.34) { sw.hit = true; doHit(sw); }
          if (sw.t / sw.dur > 0.55 && p.queued) { p.queued = false; p.swing = null; p.comboT = 0.3; if (!startSwing()) p.comboT = 0; }
          else if (sw.t >= sw.dur) { p.comboT = 0.35; p.swing = null; p.queued = false; }
        } else if (down("swing") && p.stun <= 0 && p.dash <= 0) {
          startSwing();
        }
        if (p.swing && down("swing") && p.swing.t / p.swing.dur > 0.2) p.queued = true;
        if (p.stWait <= 0) p.st = Math.min(p.maxSt, p.st + G.STAMINA_REGEN * p.m.regen * dt);
      }

      // sword beams fly through monsters; thunder lands one bolt at a time
      for (const b of run.pshots) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
        if (Math.random() < 0.7) addFx({ k: "spark", x: b.x + rnd(-3, 3), y: b.y + rnd(-3, 3), vx: 0, vy: -10, t: 0.2, c: "#ffe08a" });
        for (const e of run.enemies) if (!e.air && e.spawnT <= 0 && !b.hits.has(e) && Math.hypot(e.x - b.x, e.y - 6 - b.y) < e.r + 9) { b.hits.add(e); strike(e, b.dmg, {}); run.freeze = Math.max(run.freeze, 0.03); }
        smash((q) => Math.hypot(q.x - b.x, q.y - 6 - b.y) < 12);
        if (b.x < LEFT || b.x > RIGHT || b.y < TOP - 6 || b.y > BOT || run.pillars.some((q) => Math.hypot(b.x - q.x, b.y - q.y) < q.r)) b.life = 0;
      }
      run.pshots = run.pshots.filter((b) => b.life > 0);
      for (const bo of run.bolts) {
        bo.t -= dt;
        if (bo.t <= 0 && !bo.done) {
          bo.done = true; const e = bo.e;
          if (!e.gone && e.hp > 0) { strike(e, p.L.weapon.dmg * 2.4, { spin: true }); if (!BOSS[e.k]) e.stun = Math.max(e.stun, 1.1); }
          addFx({ k: "bolt", x: e.x, y: e.y, t: 0.28, d: 0.28, seed: Math.random() * 99 }); addFx({ k: "ring", x: e.x, y: e.y, t: 0.3, d: 0.3, c: "#9fd8ff", s: 24 });
          sparks(e.x, e.y, "#cfe8ff", 14, 140); run.boltFlash = 0.12; run.shake = Math.max(run.shake, 5);
        }
      }
      run.bolts = run.bolts.filter((bo) => !bo.done);
      run.boltFlash = Math.max(0, run.boltFlash - dt);
      reap();

      // pickups
      for (const q of run.pickups) { q.t += dt; if (Math.hypot(q.x - p.x, q.y - p.y) < 12 && !run.over) { q.got = true; p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.22); text(p.x, p.y - 18, "+Health", "#7dffa8"); SFX.heal(); sparks(q.x, q.y, "#ff7d8a", 8, 60); } }
      run.pickups = run.pickups.filter((q) => !q.got && q.t < 14);

      // waves
      for (const s of run.spawns) { s.t -= dt; if (s.t <= 0) { const ne = makeEnemy(s.k, s.x, s.y, s.scale); if (s.elite) { ne.elite = true; ne.hp *= 2.2; ne.max *= 2.2; ne.xp *= 2; } run.enemies.push(ne); puff(s.x, s.y, run.theme.glow, 8); s.done = true; } }
      run.spawns = run.spawns.filter((s) => !s.done);
      if (!run.over && !run.won && !run.enemies.length && !run.spawns.length) {
        run.waveWait -= dt;
        if (run.waveWait <= 0) {
          if (run.waveIdx < run.def.waves.length) { spawnWave(); run.waveWait = 0.9; } else finish(true);
        }
      } else if (!run.over && !run.won) run.waveWait = 0.9;
      // the reward chest: walk up to it and it opens
      const ch = run.chest;
      if (ch) {
        ch.t += dt;
        if (!ch.open && ch.t > 0.5 && Math.hypot(p.x - ch.x, (p.y - ch.y) * 1.3) < 22) { ch.open = true; SFX.chest(); run.shake = 3; sparks(ch.x, ch.y - 10, "#ffe08a", 24, 140); }
        if (ch.open) { ch.ot += dt; if (Math.random() < 0.5) addFx({ k: "spark", x: ch.x + rnd(-8, 8), y: ch.y - 14, vx: rnd(-30, 30), vy: rnd(-90, -40), t: 0.6, c: Math.random() < 0.5 ? "#ffe08a" : "#ffffff" }); }
        if (ch.open && ch.ot > 1.1 && phase === "play") { phase = "clear"; drawMenu(); }
      }

      // enemies
      for (const e of run.enemies) updateEnemy(e, dt, p);
      reap();
      for (let i = 0; i < run.enemies.length; i++) for (let j = i + 1; j < run.enemies.length; j++) {
        const a = run.enemies[i], b = run.enemies[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy) || 1, m = (a.r + b.r) * 0.85;
        if (d < m && !a.fly && !b.fly && !a.air && !b.air && a.k !== "bones" && b.k !== "bones") { const o = (m - d) / 2; a.x += (dx / d) * o; a.y += (dy / d) * o; b.x -= (dx / d) * o; b.y -= (dy / d) * o; }
      }
      // projectiles that fly straight (arrows, bones, fireballs) or home in (mage orbs)
      for (const a of run.shots) {
        if (a.k === "orb" && a.home > 0) { a.home -= dt; const want = Math.atan2(p.y - a.y, p.x - a.x), cur = Math.atan2(a.vy, a.vx), sp = Math.hypot(a.vx, a.vy), na = turn(cur, want, Math.min(1, 1.6 * dt)); a.vx = Math.cos(na) * sp; a.vy = Math.sin(na) * sp; }
        a.x += a.vx * dt; a.y += a.vy * dt; a.life -= dt; a.spin = (a.spin || 0) + dt * 14;
        if (a.k === "fire" && Math.random() < 0.5) addFx({ k: "spark", x: a.x, y: a.y, vx: rnd(-10, 10), vy: rnd(-20, 0), t: 0.2, c: "#ffb04a" });
        if (!run.over && Math.hypot(a.x - p.x, a.y - p.y) < p.r + (a.k === "orb" ? 4 : 3)) { a.life = 0; hurtPlayer(a.x - a.vx * 0.05, a.y - a.vy * 0.05, a.dmg, { from: a.from }); }
        if (run.pillars.some((q) => Math.hypot(a.x - q.x, a.y - q.y) < q.r) || a.x < LEFT || a.x > RIGHT || a.y < TOP - 4 || a.y > BOT) { if (a.life > 0) sparks(a.x, a.y, a.k === "fire" ? "#ffb04a" : a.k === "orb" ? "#c9a0ff" : "#c8b080", 3, 50); a.life = 0; }
      }
      run.shots = run.shots.filter((a) => a.life > 0);
      // lobbed acid and falling meteors: telegraphed circle, then a splash
      for (const l of run.lobs) {
        l.t += dt;
        if (l.t >= l.dur) {
          l.done = true;
          const hit = Math.hypot(p.x - l.tx, (p.y - l.ty) * 1.6) < l.r + p.r;
          if (hit && !run.over) hurtPlayer(l.tx, l.ty, l.dmg, { from: l.from });
          if (l.k === "bomb") { sparks(l.tx, l.ty, "#ffb04a", 18, 150); puff(l.tx, l.ty, "#5a5a66", 8); addFx({ k: "ring", x: l.tx, y: l.ty, t: 0.3, d: 0.3, c: "#ffb04a", s: l.r }); run.shake = Math.max(run.shake, 4); SFX.slam(); }
          else if (l.k === "acid") { run.pools.push({ k: "acid", x: l.tx, y: l.ty, r: l.r, t: 3, dmg: l.pool, from: l.from }); sparks(l.tx, l.ty, "#ff9a3d", 10, 90); }
          else { run.pools.push({ k: "fire", x: l.tx, y: l.ty, r: l.r * 0.8, t: 1.6, dmg: l.pool, from: l.from }); sparks(l.tx, l.ty, "#ffb04a", 14, 130); run.shake = Math.max(run.shake, 3); }
        }
      }
      run.lobs = run.lobs.filter((l) => !l.done);
      for (const q of run.pools) {
        q.t -= dt;
        if (!run.over && p.dash <= 0 && Math.hypot(p.x - q.x, (p.y - q.y) * 1.8) < q.r) hurtPlayer(q.x, q.y, q.dmg, { soft: true, from: q.from });
        if (q.k === "fire" && Math.random() < 0.4) addFx({ k: "flame", x: q.x + rnd(-q.r, q.r) * 0.8, y: q.y + rnd(-q.r, q.r) * 0.4, vx: 0, vy: -24, t: 0.4, c: Math.random() < 0.5 ? "#ff6a2a" : "#ffd06a" });
      }
      run.pools = run.pools.filter((q) => q.t > 0);
      for (const w of run.waves) { w.r += w.speed * dt; if (!w.hit && !run.over && Math.abs(Math.hypot(p.x - w.x, p.y - w.y) - w.r) < 7 && p.dash <= 0) { w.hit = true; hurtPlayer(w.x, w.y, w.dmg, { from: w.from }); } }
      run.waves = run.waves.filter((w) => w.r < w.max);
    }

    function updateEnemy(e, dt, p) {
      e.flash = Math.max(0, e.flash - dt); e.stun = Math.max(0, e.stun - dt); e.cd -= dt; e.anim += dt * 6;
      if (e.burn > 0) { e.burn -= dt; e.hp -= 2.5 * dt; if (Math.random() < 0.3) addFx({ k: "flame", x: e.x + rnd(-4, 4), y: e.y - rnd(2, 10), vx: 0, vy: -26, t: 0.35, c: Math.random() < 0.5 ? "#ff6a2a" : "#ffd06a" }); }
      if (e.spawnT > 0) { e.spawnT -= dt; return; }
      e.x += e.kx * dt; e.y += e.ky * dt; e.kx *= Math.max(0, 1 - 8 * dt); e.ky *= Math.max(0, 1 - 8 * dt);
      if (e.k === "bones") {
        e.revT -= dt;
        if (e.revT <= 0) { const z = makeEnemy("z", e.x, e.y, e.scale); z.hp = z.max * 0.6; z.revived = true; z.spawnT = 0.2; run.enemies.push(z); e.gone = true; puff(e.x, e.y, "#e8e0c8", 8); }
        pushOut(e); return;
      }
      const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, ang = Math.atan2(dy, dx);
      e.face = dx < 0 ? -1 : 1;
      if (e.k === "Z" && e.st !== "rest") e.faceA = turn(e.faceA, ang, Math.min(1, (e.st === "wind" ? 0.5 : 1.3) * dt));
      if (e.stun > 0 || run.over) { pushOut(e); return; }
      const mv = (sp, a) => { e.x += Math.cos(a === undefined ? ang : a) * sp * dt; e.y += Math.sin(a === undefined ? ang : a) * sp * dt; };
      const touch = (dmg, range) => { if (d < e.r + p.r + (range || 2) && e.cd <= 0) { e.cd = 1.1; hurtPlayer(e.x, e.y, dmg, { src: e }); } };
      const sc = dmgScale(run.floor) * (e.elite ? 1.25 : 1);
      const shoot = (k, a, sp, dmg, extra) => run.shots.push(Object.assign({ k, from: e.kind, x: e.x, y: e.y - 5, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 3.2, dmg }, extra || {}));
      switch (e.k) {
        case "s": case "S": case "o": case "O": {
          e.t += dt;
          const big = e.k === "S" || e.k === "O", period = e.k === "O" ? 1.5 : big ? 1.3 : e.k === "o" ? 1.05 : 0.95;
          const u = (e.t % period) / period;
          e.squash = u < 0.45 ? u / 0.45 : 0;
          if (u > 0.55 && u < 0.9) mv((big ? 66 : 85) * (1 - (u - 0.55) / 0.35 * 0.5));
          if ((e.k === "o" || e.k === "O") && e.lastU < 0.9 && u >= 0.9) run.pools.push({ k: "acid", from: e.kind, x: e.x, y: e.y + 2, r: e.k === "O" ? 13 : 9, t: 2.2, dmg: 4 * sc });
          e.lastU = u;
          if (u > 0.5 && u < 0.95) touch((e.k === "O" ? 12 : big ? 9 : e.k === "o" ? 6 : 5) * sc, 3);
          break;
        }
        case "g": case "z": {
          const skel = e.k === "z";
          if (e.st === "move") {
            e.t += dt;
            if (d > 44) mv((skel ? 60 : 54) + run.floor * 3, ang + Math.sin(e.t * 2) * 0.5); else if (d < 30) mv(-30);
            if (d < 52 && e.cd <= 0) { e.st = "wind"; e.t = 0; e.lock = ang; }
          } else if (e.st === "wind") {
            e.t += dt; e.lock = turn(e.lock, ang, 0.1);
            if (e.t > (skel ? 0.42 : 0.5)) { e.st = "lunge"; e.t = 0; e.hit = false; }
          } else if (e.st === "lunge") {
            e.t += dt; mv(skel ? 245 : 230, e.lock);
            if (!e.hit && d < e.r + p.r + 8) { e.hit = true; hurtPlayer(e.x, e.y, (skel ? 13 : 14) * sc, { src: e }); }
            if (e.t > 0.2) { e.st = "move"; e.t = 0; e.cd = 1.2; e.stun = 0.35; }
          }
          break;
        }
        case "a": case "x": {
          const bone = e.k === "x";
          if (e.st === "move") {
            e.t += dt;
            if (d < 100) mv(-50); else if (d > 170) mv(46); else mv(22, ang + Math.PI / 2 * (Math.sin(e.t) > 0 ? 1 : -1));
            if (e.cd <= 0 && d < 230) { e.st = "wind"; e.t = 0; }
          } else if (e.st === "wind") {
            e.t += dt; e.lock = ang;
            if (e.t > (bone ? 0.6 : 0.75)) {
              e.st = "move"; e.t = 0; e.cd = bone ? 1.7 : 1.9; SFX.arrow();
              if (bone) { shoot("bone", ang, 135, 10 * sc); if (run.floor >= 8) shoot("bone", ang + 0.25, 135, 10 * sc); }
              else shoot("arrow", ang, 150, 10 * sc);
            }
          }
          break;
        }
        case "n": {
          if (e.st === "move") {
            e.t += dt;
            if (d < 110) mv(-48); else if (d > 180) mv(44); else mv(20, ang - Math.PI / 2 * (Math.sin(e.t * 0.8) > 0 ? 1 : -1));
            if (e.cd <= 0 && d < 240) { e.st = "wind"; e.t = 0; }
          } else if (e.st === "wind") {
            e.t += dt;
            if (e.t > 0.7) {
              e.st = "move"; e.t = 0; e.cd = 2.4; SFX.arrow();
              run.lobs.push({ k: "bomb", from: "bomber", x0: e.x, y0: e.y - 10, tx: clamp(p.x + p.vx * 0.3, LEFT + 10, RIGHT - 10), ty: clamp(p.y + p.vy * 0.3, TOP + 10, BOT - 10), t: 0, dur: 1.15, r: 24, dmg: 16 * sc });
            }
          }
          break;
        }
        case "b": case "w": {
          const whelp = e.k === "w";
          e.orbit += dt * (whelp ? 1.3 : 1.6);
          if (e.st === "move") {
            const tx = p.x + Math.cos(e.orbit) * (whelp ? 84 : 70), ty = p.y + Math.sin(e.orbit) * (whelp ? 54 : 46);
            mv(whelp ? 82 : 70, Math.atan2(ty - e.y, tx - e.x));
            if (e.cd <= 0) { e.st = "wind"; e.t = 0; }
          } else if (e.st === "wind") { e.t += dt; if (e.t > (whelp ? 0.5 : 0.35)) { e.st = "lunge"; e.t = 0; e.lock = ang; e.hit = false; if (whelp) SFX.fire(); } }
          else if (e.st === "lunge") {
            e.t += dt; mv(whelp ? 210 : 190, e.lock);
            if (whelp && Math.random() < 0.6) addFx({ k: "flame", x: e.x, y: e.y - 10, vx: rnd(-10, 10), vy: -10, t: 0.3, c: "#ff8a3d" });
            if (!e.hit && d < e.r + p.r + 3) { e.hit = true; hurtPlayer(e.x, e.y, (whelp ? 12 : 7) * sc, { src: e }); }
            if (e.t > 0.45) { e.st = "move"; e.cd = whelp ? 1.8 : 1.4; }
          }
          break;
        }
        case "B": case "Z": {
          const knight = e.k === "Z", reach = knight ? 40 : 50;
          if (e.st === "rest") { e.t += dt; if (e.t > 1) { e.st = "move"; e.t = 0; } }
          else if (e.st === "move") {
            e.t += dt; if (d > 30) mv(knight ? 30 : 34, knight ? e.faceA : ang);
            if (d < reach + 12 && e.cd <= 0) { e.st = "wind"; e.t = 0; }
          } else if (e.st === "wind") {
            e.t += dt;
            if (e.t > (knight ? 0.7 : 0.85)) {
              e.st = knight ? "rest" : "move"; e.t = 0; e.cd = knight ? 1.5 : 1.8; SFX.slam(); run.shake = 6;
              addFx({ k: "ring", x: e.x, y: e.y, t: 0.35, d: 0.35, c: knight ? "#9fd8ff" : "#ffb04a", s: reach });
              if (Math.hypot(p.x - e.x, p.y - e.y) < reach + p.r) hurtPlayer(e.x, e.y, (knight ? 20 : 26) * sc, { src: e });
            }
          }
          break;
        }
        case "m": {
          e.blink -= dt;
          if (d < 55 && e.blink <= 0 && e.st === "move") { e.st = "fade"; e.t = 0; } // starts to vanish; a hit now stops it
          if (e.st === "fade") {
            e.t += dt;
            if (e.t > 0.6) {
              puff(e.x, e.y, "#b06aff", 10);
              let x, y, tries = 0; do { x = rnd(LEFT + 30, RIGHT - 30); y = rnd(TOP + 20, BOT - 30); tries++; } while (tries < 20 && Math.hypot(x - p.x, y - p.y) < 130);
              e.x = x; e.y = y; e.blink = 4.5; e.st = "move"; e.cd = Math.max(e.cd, 1); puff(e.x, e.y, "#b06aff", 10);
            }
            break;
          }
          if (e.st === "move") {
            e.t += dt;
            if (d < 120) mv(-36); else if (d > 190) mv(36); else mv(18, ang + Math.PI / 2);
            if (e.cd <= 0) { e.st = "wind"; e.t = 0; }
          } else if (e.st === "wind") {
            e.t += dt;
            if (e.t > 0.75) { e.st = "move"; e.cd = 2.8; SFX.fire(); for (const o of [-0.35, 0, 0.35]) shoot("orb", ang + o, 66, 11 * sc, { home: 2.4, life: 4.5 }); }
          }
          break;
        }
        case "p": {
          if (e.st === "move") {
            e.t += dt; mv(16, ang + Math.PI / 2 * Math.sin(e.t * 0.7));
            if (e.cd <= 0 && d < 260) { e.st = "wind"; e.t = 0; }
          } else if (e.st === "wind") {
            e.t += dt; e.squash = e.t / 0.6;
            if (e.t > 0.6) {
              e.st = "move"; e.cd = 2.6; e.squash = 0; SFX.arrow();
              run.lobs.push({ k: "acid", from: "spitter", x0: e.x, y0: e.y - 8, tx: clamp(p.x + p.vx * 0.4, LEFT + 10, RIGHT - 10), ty: clamp(p.y + p.vy * 0.4, TOP + 10, BOT - 10), t: 0, dur: 0.95, r: 16, dmg: 10 * sc, pool: 5 * sc });
            }
          }
          break;
        }
        case "i": {
          e.t += dt;
          if (e.st === "move") {
            const want = d > 110 ? ang : d < 70 ? ang + Math.PI : ang + Math.PI / 2;
            mv(92, want + Math.sin(e.t * 5) * 0.7);
            if (e.cd <= 0 && d < 220) { e.st = "wind"; e.t = 0; }
          } else if (e.st === "wind") {
            if (e.t > 0.45) { e.st = "move"; e.t = 0; e.cd = 1.8; SFX.fire(); shoot("fire", ang, 165, 9 * sc); }
          }
          break;
        }
        case "K": updateKing(e, dt, p, d, ang, mv, touch); break;
        case "D": updateDragon(e, dt, p, d, ang, mv, touch); break;
      }
      pushOut(e);
    }
    function updateKing(e, dt, p, d, ang, mv, touch) {
      if (e.hp < e.max * 0.66 && e.sum < 1) { e.sum = 1; summon(e, ["g", "g"], "The king calls for help!"); }
      if (e.hp < e.max * 0.33 && e.sum < 2) { e.sum = 2; summon(e, ["a", "a", "b"], "The king calls for help!"); }
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
        e.t += dt; if (e.t > 0.9) { e.st = "move"; e.t = 0; e.cd = 1.6; SFX.slam(); run.shake = 8; run.waves.push({ x: e.x, y: e.y, r: 8, max: 130, speed: 160, dmg: 22, hit: false, from: "king" }); addFx({ k: "ring", x: e.x, y: e.y, t: 0.3, d: 0.3, c: "#ffcf5a", s: 30 }); }
      }
    }
    /* Cinderwing: breathes fire, sweeps its tail, spits fireballs. At 60% and 30% health it takes off, rains fire,
       then dives at you. It's open to hits for a moment after it lands. */
    function updateDragon(e, dt, p, d, ang, mv, touch) {
      const enraged = e.ph >= 3, quick = enraged ? 0.7 : 1;
      if (!e.air && e.st === "move" && ((e.lifts === 0 && e.hp < e.max * 0.6) || (e.lifts === 1 && e.hp < e.max * 0.3))) {
        e.lifts++; e.ph = e.lifts + 1; e.st = "lift"; e.t = 0; e.air = true; SFX.roar(); run.shake = 6;
        run.banner = e.lifts === 1 ? "Cinderwing takes flight!" : "Cinderwing is furious!"; run.bannerT = 1.8;
        summon(e, e.lifts === 1 ? ["w", "w"] : ["i", "i", "w"], null);
      }
      switch (e.st) {
        case "move":
          e.t += dt;
          if (d > 80) mv(40); else if (d < 50) mv(-24);
          touch(20, 6);
          if (e.cd <= 0) {
            e.atk++; e.t = 0; e.lock = ang;
            e.st = d < 64 ? "windT" : e.atk % 3 === 2 ? "windV" : "windB";
          }
          break;
        case "windB": e.t += dt; e.lock = turn(e.lock, ang, 0.08); if (e.t > 0.8 * quick) { e.st = "breath"; e.t = 0; SFX.fire(); } break;
        case "breath": {
          e.t += dt; e.lock = turn(e.lock, ang, Math.min(1, (enraged ? 1.3 : 0.6) * dt));
          const mx = e.x + Math.cos(e.lock) * 18, my = e.y - 10 + Math.sin(e.lock) * 12;
          for (let i = 0; i < 3; i++) { const a = e.lock + rnd(-0.38, 0.38), s = rnd(120, 190); addFx({ k: "flame", x: mx, y: my, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.75, t: rnd(0.5, 0.8), c: Math.random() < 0.5 ? "#ff6a2a" : "#ffd06a" }); }
          if (d < 155 && angDiff(e.lock, ang) < 0.42) hurtPlayer(mx, my, 8, { soft: true, from: "dragon" });
          if (e.t > 1.3) { e.st = "move"; e.t = 0; e.cd = 1.4 * quick; }
          break;
        }
        case "windT": e.t += dt; if (e.t > 0.55 * quick) {
          e.st = "move"; e.t = 0; e.cd = 1.2 * quick; SFX.slam(); run.shake = 7;
          addFx({ k: "ring", x: e.x, y: e.y, t: 0.35, d: 0.35, c: "#ffb03a", s: 62 });
          if (d < 62 + p.r) hurtPlayer(e.x, e.y, 26, { src: e });
        } break;
        case "windV": e.t += dt; if (e.t > 0.7 * quick) {
          e.st = "move"; e.t = 0; e.cd = 1.5 * quick; SFX.fire();
          const n = enraged ? 7 : 5;
          for (let i = 0; i < n; i++) run.shots.push({ k: "fire", from: "dragon", x: e.x, y: e.y - 10, vx: Math.cos(ang + (i - (n - 1) / 2) * 0.22) * 150, vy: Math.sin(ang + (i - (n - 1) / 2) * 0.22) * 150, life: 3, dmg: 12 });
        } break;
        case "lift": e.t += dt; e.z = easeOut(e.t / 0.8) * 70; if (e.t > 0.8) { e.st = "air"; e.t = 0; e.drop = 0; } break;
        case "air":
          e.t += dt; e.drop -= dt; mv(60, ang + Math.sin(e.t * 1.5));
          if (e.drop <= 0) { e.drop = enraged ? 0.32 : 0.45; run.lobs.push({ k: "meteor", from: "dragon", x0: e.x, y0: e.y - e.z, tx: clamp(p.x + rnd(-40, 40), LEFT + 12, RIGHT - 12), ty: clamp(p.y + rnd(-26, 26), TOP + 12, BOT - 12), t: 0, dur: 0.9, r: 18, dmg: 14, pool: 5 }); }
          if (e.t > (enraged ? 4.2 : 5)) { e.st = "aim"; e.t = 0; e.tx = p.x; e.ty = p.y; }
          break;
        case "aim":
          e.t += dt; e.tx = lerp(e.tx, p.x, Math.min(1, 2 * dt)); e.ty = lerp(e.ty, p.y, Math.min(1, 2 * dt));
          e.x = lerp(e.x, e.tx, Math.min(1, 3 * dt)); e.y = lerp(e.y, e.ty, Math.min(1, 3 * dt));
          if (e.t > 1.1) { e.st = "dive"; e.t = 0; }
          break;
        case "dive":
          e.t += dt; e.z = Math.max(0, 70 * (1 - e.t / 0.25));
          if (e.t > 0.25) {
            e.air = false; e.z = 0; e.st = "move"; e.t = 0; e.cd = 1.6; e.stun = 1.4; SFX.slam(); run.shake = 11;
            run.waves.push({ x: e.x, y: e.y, r: 10, max: 120, speed: 170, dmg: 18, hit: false, from: "dragon" });
            addFx({ k: "ring", x: e.x, y: e.y, t: 0.4, d: 0.4, c: "#ffb03a", s: 44 }); sparks(e.x, e.y, "#ffb03a", 24, 160);
            if (Math.hypot(p.x - e.x, p.y - e.y) < 42 + p.r) hurtPlayer(e.x, e.y, 30, { src: e });
          }
          break;
      }
    }
    function summon(e, list, banner) {
      if (banner) { run.banner = banner; run.bannerT = 1.6; }
      list.forEach((k, i) => run.spawns.push({ k, x: clamp(e.x + (i - 1) * 50, LEFT + 20, RIGHT - 20), y: clamp(e.y + 40, TOP + 20, BOT - 20), t: 0.5 + i * 0.15, scale: hpScale(run.floor) }));
    }

    /* ====================================================================== */
    /* drawing                                                                */
    /* ====================================================================== */
    const R = (c, x, y, w, hh) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, hh); };
    /* pixel-art circles: everything round is built from little squares so it matches the sprites */
    function pixDisc(x, y, rx, ry, col, a) {
      if (rx < 1 || ry < 1) return;
      ctx.globalAlpha = a == null ? 1 : a; ctx.fillStyle = col;
      for (let j = -Math.floor(ry); j <= ry; j += 2) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry)))); if (w > 0) ctx.fillRect(Math.round(x - w), Math.round(y + j), w * 2, 2); }
      ctx.globalAlpha = 1;
    }
    function pixArc(x, y, rx, ry, a0, a1, col, a, size, gap) {
      if (rx < 1) return;
      ctx.globalAlpha = a == null ? 1 : a; ctx.fillStyle = col; size = size || 2;
      const span = a1 - a0, n = Math.max(6, Math.round(Math.abs(span) * (rx + ry) * 0.5 / size));
      for (let i = 0; i <= n; i++) { if (gap && i % gap === gap - 1) continue; const t = a0 + span * i / n; ctx.fillRect(Math.round(x + Math.cos(t) * rx - size / 2), Math.round(y + Math.sin(t) * ry - size / 2), size, size); }
      ctx.globalAlpha = 1;
    }
    const pixRing = (x, y, rx, ry, col, a, size, gap) => pixArc(x, y, rx, ry, 0, TAU, col, a, size, gap);
    function shadow(x, y, rw) { pixDisc(Math.round(x), Math.round(y), rw, Math.max(2, rw * 0.38), "#000000", 0.32); }
    const OUT = "#0a0c16";

    function drawSlime(e) {
      const big = e.k === "S" || e.k === "O", sq = e.squash || 0, s = e.k === "O" ? 1.75 : big ? 1.45 : 1;
      const glob = e.k === "o" || e.k === "O";
      const w = (14 + sq * 3) * s, hh = (10 - sq * 3) * s, x = e.x - w / 2, y = e.y - hh + 3;
      const body = e.flash > 0 ? "#fff" : glob ? "#ff9a3d" : "#4fc47e", dk = glob ? "#c4561a" : "#2f8f56", hi = glob ? "#ffd8a0" : "#9bffc4";
      shadow(e.x, e.y + 3, w / 2);
      R(body, x, y, w, hh); R(body, x + 2 * s, y - 2 * s, w - 4 * s, 2 * s);
      R(dk, x, y + hh - 3, w, 3); R(hi, x + 2 * s, y + 1, 4 * s, 2);
      if (glob) { R(hi, x + w * 0.6, y + hh * 0.55, 2, 2); R(dk, x + w * 0.3, y + hh * 0.7, 2, 1); }
      R(OUT, x + w * 0.28, y + hh * 0.35, 2, 3 * s * 0.8); R(OUT, x + w * 0.62, y + hh * 0.35, 2, 3 * s * 0.8);
      if (glob) R(OUT, x + w * 0.4, y + hh * 0.72, w * 0.22, 1);
    }
    function drawSpitter(e) {
      const sq = e.squash || 0, w = 16 + sq * 2, hh = 14 - sq * 2, x = e.x - w / 2, y = e.y - hh + 3;
      const body = e.flash > 0 ? "#fff" : "#f08a2a";
      shadow(e.x, e.y + 3, w / 2);
      R(body, x, y, w, hh); R("#b04a10", x, y + hh - 3, w, 3); R("#ffd08a", x + 2, y + 1, 5, 2);
      R(OUT, x + 3, y + 4, 2, 3); R(OUT, x + w - 5, y + 4, 2, 3);
      R("#ffcf5a", x + w / 2 - 2, y + 9, 4, 1 + sq * 2);
      if (e.st === "wind") R("#ff5d73", e.x - 1, y - 12, 3, 6);
    }
    function drawGoblin(e, big) {
      const s = big ? 1.5 : 1, bob = Math.abs(Math.sin(e.anim)) * 1.4, f = e.face;
      const x = e.x, y = e.y - bob;
      const skin = e.flash > 0 ? "#fff" : big ? "#6fae3a" : "#8bc34a", dk = big ? "#3f6a1d" : "#5a8a2a";
      shadow(x, e.y + 2, 7 * s);
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w) * s, y + oy * s, w * s, hh * s);
            rr(big ? "#7a3d1a" : "#8a5a2f", -4, -8, 8, 7); rr(dk, -4, -2, 3, 3); rr(dk, 1, -2, 3, 3);
      rr(skin, -5, -16, 10, 8); rr(skin, -8, -14, 3, 3); rr(skin, 5, -14, 3, 3);
      rr("#fff6d0", -3, -12, 2, 2); rr("#fff6d0", 1, -12, 2, 2); rr(OUT, -2, -12, 1, 2); rr(OUT, 2, -12, 1, 2);
      const up = e.st === "wind" ? 1 : 0;
      rr("#6a4630", 5, up ? -22 : -8, 3, up ? 14 : 10); rr("#8a5a2f", 4, up ? -24 : -10, 5, 4);
      if (up) telegraph(e, s);
    }
    function telegraph(e, s) {
      pixDisc(e.x, e.y + 2, 16 * s, 6 * s, "#ff5d73", 0.25 + 0.2 * Math.sin(now() * 30));
      R("#ff5d73", e.x - 1, e.y - 32 * s, 3, 6); R("#ff5d73", e.x - 1, e.y - 24 * s, 3, 3);
    }
    function drawBomber(e) {
      const f = e.face, x = e.x, y = e.y - Math.abs(Math.sin(e.anim)) * 1.4, wind = e.st === "wind";
      shadow(x, e.y + 2, 7);
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
      rr("#6a4a2a", -4, -8, 8, 7); rr("#4a3a1e", -4, -2, 3, 3); rr("#4a3a1e", 1, -2, 3, 3);
      rr(e.flash > 0 ? "#fff" : "#8bc34a", -5, -16, 10, 8); rr("#8bc34a", -8, -14, 3, 3); rr("#8bc34a", 5, -14, 3, 3);
      rr("#3a2a1a", -5, -18, 10, 3); rr("#fff6d0", -3, -12, 2, 2); rr("#fff6d0", 1, -12, 2, 2);
      rr("#c9a85a", -7, -9, 4, 6); // satchel of bombs
      const by = wind ? -24 : -9; rr("#2a2a34", 4, by, 6, 6); rr("#5a5a66", 5, by + 1, 2, 2); rr("#8a5a2f", 7, by - 3, 1, 3);
      if (wind && Math.floor(now() * 16) % 2) rr("#ffe08a", 7, by - 5, 2, 2);
      if (wind) R("#ff5d73", e.x - 1, y - 30, 3, 6);
    }
    function drawSkeleton(e) {
      const f = e.face, x = e.x, y = e.y - Math.abs(Math.sin(e.anim)) * 1.2, wind = e.st === "wind";
      const bone = e.flash > 0 ? "#fff" : "#e8e0c8", dk = "#a8a08a";
      shadow(x, e.y + 2, 7);
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
            rr(bone, -4, -18, 8, 7); rr(OUT, -3, -15, 2, 2); rr(OUT, 1, -15, 2, 2); rr(dk, -2, -12, 4, 1); // skull
      rr(bone, -1, -11, 2, 8); rr(bone, -4, -10, 8, 1); rr(bone, -4, -8, 8, 1); rr(bone, -4, -6, 8, 1); // spine, ribs
      rr(bone, -3, -3, 2, 4); rr(bone, 1, -3, 2, 4);
      if (e.k === "x") { rr(bone, 4, wind ? -20 : -10, 2, 6); rr(bone, 3, wind ? -21 : -11, 4, 2); }
      else { rr("#9aa3b5", 5, wind ? -24 : -12, 2, wind ? 14 : 10); rr("#6a4630", 4, wind ? -11 : -3, 4, 2); }
      if (wind && e.k === "z") telegraph(e, 1);
      if (wind && e.k === "x") R("#ff5d73", e.x - 1, y - 28, 3, 6);
      if (e.revived) { R("#9fd8ff", x - 3, y - 15, 1, 1); R("#9fd8ff", x + 2, y - 15, 1, 1); }
    }
    function drawBones(e) {
      const shake = e.revT < 1 ? Math.round(Math.sin(now() * 40)) : 0, col = e.flash > 0 ? "#fff" : "#e8e0c8";
      shadow(e.x, e.y + 2, 8);
      R(col, e.x - 7 + shake, e.y - 4, 6, 2); R(col, e.x - 1 + shake, e.y - 3, 7, 2); R(col, e.x - 4 + shake, e.y - 2, 5, 2);
      R(col, e.x + 2 + shake, e.y - 8, 5, 4); R(OUT, e.x + 3 + shake, e.y - 7, 1, 1); R(OUT, e.x + 5 + shake, e.y - 7, 1, 1);
      // a ring that closes as it gets ready to stand back up
      const u = clamp(e.revT / 3.2, 0, 1); pixArc(e.x, e.y - 14, 5, 5, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - u), "#9fd8ff", 0.8, 1);
    }
    function drawKnightSk(e) {
      const x = e.x, y = e.y - Math.abs(Math.sin(e.anim * 0.7)) * 1, wind = e.st === "wind", f = Math.cos(e.faceA) < 0 ? -1 : 1;
      const iron = e.flash > 0 ? "#fff" : "#5a6070", hi = "#8a93a4";
      shadow(x, e.y + 3, 11);
      const back = Math.sin(e.faceA) < -0.3;
      const resting = e.st === "rest";
      const shieldDraw = () => {
        const sx = x + Math.cos(e.faceA) * (resting ? 6 : 10), sy = y - (resting ? 2 : 9) + Math.sin(e.faceA) * 6;
        R("#3a4256", sx - 4, sy - 7, 8, 13); R("#9fd8ff", sx - 1, sy - 4, 2, 7); R("#9fd8ff", sx - 3, sy - 2, 6, 2);
      };
      if (back) shieldDraw();
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
            rr(iron, -7, -24, 14, 10); rr(hi, -7, -24, 14, 2); rr("#9fd8ff", -4, -19, 2, 2); rr("#9fd8ff", 2, -19, 2, 2); rr(OUT, -6, -16, 12, 1);
      rr(iron, -7, -14, 14, 10); rr(hi, -7, -14, 14, 1); rr("#e8e0c8", -1, -12, 2, 6);
      rr("#3a3a48", -6, -4, 4, 5); rr("#3a3a48", 2, -4, 4, 5);
      rr("#9aa3b5", -10, wind ? -36 : -20, 3, wind ? 22 : 14); rr("#6a4630", -11, wind ? -15 : -7, 5, 2);
      if (resting && Math.floor(now() * 6) % 2) { R("#f4cf5a", x - 6, y - 32, 3, 3); R("#f4cf5a", x + 3, y - 32, 3, 3); }
      if (!back) shieldDraw();
      if (wind) { pixDisc(e.x, e.y, 40, 18, "#ff5d73", 0.18 + 0.25 * (e.t / 0.7)); pixRing(e.x, e.y, 40, 18, "#ff5d73", 0.8); }
    }
    function drawMage(e) {
      if (e.st === "fade" && Math.floor(now() * 24) % 2) { ctx.globalAlpha = 0.35; }
      const f = e.face, x = e.x, y = e.y - 2 - Math.sin(now() * 3 + e.anim) * 2, wind = e.st === "wind";
      shadow(x, e.y + 2, 6);
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
            rr(e.flash > 0 ? "#fff" : "#4a2a7a", -5, -12, 10, 13); rr("#6a3aa8", -5, -12, 10, 2); rr("#2a1a4a", -5, -1, 10, 2);
      rr("#e8e0c8", -3, -19, 6, 6); rr(OUT, -2, -17, 1, 2); rr(OUT, 1, -17, 1, 2);
      rr("#4a2a7a", -5, -21, 10, 3); rr("#4a2a7a", -2, -24, 4, 3);
      rr("#6a4630", 6, -18, 1, 18); rr(wind ? "#ffffff" : "#c9a0ff", 5, -21, 3, 3);
      if (wind) { const r = 5 + e.t * 6; pixDisc(x + f * 6, y - 20, r, r, "#c9a0ff", 0.3 + 0.3 * Math.sin(now() * 20)); }
      ctx.globalAlpha = 1;
    }
    function drawImp(e) {
      const f = e.face, x = e.x, y = e.y - 3 - Math.abs(Math.sin(e.anim * 2)) * 2;
      shadow(x, e.y + 2, 5);
      const flap = Math.sin(now() * 30) > 0 ? 2 : 0;
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
            rr("#7a1a14", -7, -12 - flap, 3, 5); rr("#7a1a14", 4, -12 - flap, 3, 5);
      rr(e.flash > 0 ? "#fff" : "#e5482a", -3, -12, 6, 9); rr("#ff8a5a", -3, -12, 6, 2); rr("#ffe08a", -2, -10, 1, 1); rr("#ffe08a", 1, -10, 1, 1);
      rr("#3a0a0a", -3, -14, 1, 2); rr("#3a0a0a", 2, -14, 1, 2);
      if (e.st === "wind") { R("#ffb04a", x + f * 5 - 2, y - 9, 4, 4); R("#fff0a0", x + f * 5 - 1, y - 8, 2, 2); }
    }
    function drawWhelp(e) {
      const f = e.face, flap = Math.sin(e.anim * 2) * 4, y = e.y - 14;
      shadow(e.x, e.y + 2, 7);
      const rr = (c, ox, oy, w, hh) => R(c, e.x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
            const body = e.flash > 0 ? "#fff" : "#e5702a";
      rr("#a8401a", -11, -2 - flap, 8, 4); rr("#a8401a", 3, -2 - flap, 8, 4); // wings
      rr(body, -5, -3, 10, 7); rr("#ffd06a", -3, 1, 6, 3); rr(body, 4, -6, 5, 5); rr("#ffe08a", 7, -5, 1, 1); rr(body, -8, 1, 4, 2);
      if (e.st === "wind") R("#ff5d73", e.x - 1, y - 16, 3, 6);
    }
    function drawBat(e) {
      const flap = Math.sin(e.anim * 2.4) * 4, y = e.y - 12;
      shadow(e.x, e.y + 2, 5);
            R(e.flash > 0 ? "#fff" : "#6a4f9a", e.x - 8, y - flap, 6, 4); R(e.flash > 0 ? "#fff" : "#6a4f9a", e.x + 2, y - flap, 6, 4);
      R(e.flash > 0 ? "#fff" : "#4a3570", e.x - 3, y - 2, 6, 7); R("#ff7d8a", e.x - 2, y, 1, 1); R("#ff7d8a", e.x + 1, y, 1, 1);
      if (e.st === "wind") R("#ff5d73", e.x - 1, y - 14, 3, 6);
    }
    function drawBrute(e) {
      const f = e.face, x = e.x, y = e.y - Math.abs(Math.sin(e.anim * 0.7)) * 1.2, wind = e.st === "wind";
      shadow(x, e.y + 3, 13);
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
            rr("#4a5a3a", -9, -12, 18, 13); rr("#6a7a5a", -10, -18, 20, 7); rr("#8a9a7a", -10, -18, 20, 2);
      rr(e.flash > 0 ? "#fff" : "#7a9a4a", -6, -26, 12, 10); rr("#ffe9a0", -4, -22, 2, 2); rr("#ffe9a0", 2, -22, 2, 2); rr("#e8e0c8", -3, -17, 2, 3); rr("#e8e0c8", 1, -17, 2, 3);
      rr("#3a3a48", -8, -2, 6, 4); rr("#3a3a48", 2, -2, 6, 4);
      rr("#6a4630", 9, wind ? -38 : -14, 4, wind ? 28 : 18); rr("#7a7a8a", 7, wind ? -42 : -18, 8, 6);
      if (wind) { pixDisc(e.x, e.y, 50, 22, "#ff5d73", 0.18 + 0.2 * (e.t / 0.85)); pixRing(e.x, e.y, 50, 22, "#ff5d73", 0.9); }
    }
    function drawKing(e) {
      const f = e.face, x = e.x, t = now(), y = e.y - Math.abs(Math.sin(e.anim * 0.6)) * 1.5;
      const charge = e.st === "windC", slam = e.st === "windS", flash = e.flash > 0;
      // charge telegraph: a lane of chevrons racing out the way he's about to run
      if (charge) {
        const u = clamp(e.t / 0.8, 0, 1), ca = Math.cos(e.lock), sa = Math.sin(e.lock);
        for (let i = 1; i <= 11; i++) {
          const d = i * 20 - ((t * 90) % 20), px = e.x + ca * d, py = e.y + sa * d * 0.85, on = (i + Math.floor(t * 12)) % 3 === 0;
          const col = on ? "#ffe08a" : u > 0.6 ? "#ff3a3a" : "#ff8a3d";
          ctx.globalAlpha = (0.35 + 0.55 * u) * (1 - i / 14);
          for (let k = -4; k <= 4; k++) { const back = Math.abs(k) * 1.6; R(col, px - ca * back - sa * k * 1.5 - 1, py - sa * back + ca * k * 1.5 - 1, 3, 3); }
        }
        ctx.globalAlpha = 1;
        if (Math.random() < 0.4) puff(e.x - ca * 10, e.y + 2, "#8a7a5a", 1);
      }
      if (slam) { const r = 120 * e.t / 0.9; pixDisc(e.x, e.y, r, r * 0.42, "#ffcf5a", 0.12 + 0.18 * e.t); pixRing(e.x, e.y, r, r * 0.42, "#ffcf5a", 0.7, 2, 3); }
      shadow(x, e.y + 4, 26);
      ctx.save(); ctx.translate(e.x, e.y); ctx.scale(1.2, 1.2); ctx.translate(-e.x, -e.y);
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
      const skin = flash ? "#fff" : "#4f7a2a", skinD = "#2f4a18", skinL = "#6f9a3a";
      // tattered cape behind
      rr("#5a0e18", -19, -34, 38, 34); rr("#7a1a24", -18, -34, 34, 6);
      for (let i = 0; i < 6; i++) rr("#5a0e18", -19 + i * 7, 0, 4, 2 + (i % 2) * 2);
      // legs and boots
      rr("#2a2a34", -11, -6, 8, 9); rr("#2a2a34", 3, -6, 8, 9); rr("#1a1a22", -12, 1, 10, 3); rr("#1a1a22", 2, 1, 10, 3);
      // armored body
      rr("#3a4048", -14, -26, 28, 22); rr("#5a6270", -14, -26, 28, 3); rr("#2a3038", -14, -8, 28, 3);
      rr("#8a1f2a", -3, -24, 6, 18); // red tabard
      rr("#c9a24a", -14, -9, 28, 3); rr("#e8e0c8", -3, -11, 6, 6); rr("#1a1a22", -2, -9, 1, 1); rr("#1a1a22", 1, -9, 1, 1); // belt and skull buckle
      // fur mantle and spiked pauldrons
      rr("#6a5a48", -17, -30, 34, 7); rr("#8a7a62", -17, -30, 34, 2);
      for (let i = 0; i < 8; i++) rr("#5a4a38", -16 + i * 4, -24, 2, 2);
      rr("#5a6270", -22, -30, 9, 8); rr("#5a6270", 13, -30, 9, 8); rr("#8a93a4", -22, -30, 9, 2); rr("#8a93a4", 13, -30, 9, 2);
      rr("#c8d0e0", -21, -35, 2, 5); rr("#c8d0e0", -17, -34, 2, 4); rr("#c8d0e0", 15, -34, 2, 4); rr("#c8d0e0", 19, -35, 2, 5);
      // head: heavy brow, glowing eyes, tusks
      rr(skin, -10, -46, 20, 16); rr(skinL, -10, -46, 20, 2); rr(skinD, -10, -33, 20, 3);
      rr(skin, -14, -42, 4, 6); rr(skin, 10, -42, 4, 6); rr(skinD, -16, -40, 2, 3); rr(skinD, 14, -40, 2, 3); // ears
      rr(skinD, -8, -41, 16, 2); // brow
      const eye = flash ? "#fff" : charge || slam ? "#ffef7a" : "#ff3a3a";
      rr(eye, -6, -39, 4, 2); rr(eye, 3, -39, 4, 2);
      if (!flash && Math.floor(t * 4) % 2) { rr("rgba(255,58,58,0.35)", -8, -40, 8, 4); rr("rgba(255,58,58,0.35)", 1, -40, 8, 4); }
      rr("#1a1a22", -5, -34, 10, 2); rr("#f4efe0", -6, -36, 2, 5); rr("#f4efe0", 4, -36, 2, 5); // mouth and tusks
      rr(skinD, 4, -44, 1, 5); // scar
      // spiked iron crown with red gems
      rr("#3a3a44", -11, -50, 22, 5); rr("#6a6a78", -11, -50, 22, 1);
      for (const sx of [-11, -6, -1, 4, 9]) { rr("#3a3a44", sx, sx === -1 ? -58 : -55, 2, sx === -1 ? 8 : 5); rr("#9aa0b0", sx, sx === -1 ? -58 : -55, 1, 2); }
      rr("#e5304a", -8, -48, 2, 2); rr("#e5304a", -1, -48, 2, 2); rr("#e5304a", 6, -48, 2, 2);
      // giant spiked club
      const up = slam ? 1 : 0, cx = 18, cy = up ? -64 : -30;
      rr("#5a3a1e", cx, cy + 8, 4, up ? 34 : 28); rr("#7a4a26", cx + 1, cy + 8, 1, up ? 34 : 28);
      rr("#4a2e16", cx - 3, cy, 10, 12); rr("#6a4626", cx - 3, cy, 10, 2);
      for (const [ox, oy] of [[-5, 2], [7, 2], [-5, 7], [7, 7], [1, -3]]) rr("#c8d0e0", cx + ox, cy + oy, 2, 2);
      rr(skin, cx - 1, up ? cy + 20 : cy + 18, 6, 5); // fist
      ctx.restore();
    }
    function drawDragon(e) {
      const f = e.face, z = e.z || 0, t = now(), x = e.x, y = e.y - z - Math.abs(Math.sin(e.anim * 0.5)) * 1.5;
      const flying = e.air || e.st === "lift" || e.st === "dive", flap = flying ? Math.round(Math.sin(t * 14) * 7) : Math.round(Math.sin(t * 2.5) * 2);
      const winding = e.st === "windB" || e.st === "windV", breathing = e.st === "breath";
      // telegraphs on the ground
      if (e.st === "windB" || breathing) for (let r = 16; r < 155; r += 6) pixArc(e.x, e.y - 6, r, r, e.lock - 0.42, e.lock + 0.42, "#ff6a2a", e.st === "windB" ? 0.08 + 0.12 * (e.t / 0.8) : 0.1, 4);
      if (e.st === "windT") { pixDisc(e.x, e.y, 62, 28, "#ff5d73", 0.15 + 0.3 * (e.t / 0.55)); pixRing(e.x, e.y, 62, 28, "#ff5d73", 0.9); }
      if (e.st === "aim") { const u = clamp(e.t / 1.1, 0, 1); pixDisc(e.x, e.y, 44 - u * 8, 18 - u * 3, "#ff5d73", 0.1 + u * 0.25); pixRing(e.x, e.y, 44 - u * 8, 18 - u * 3, "#ff5d73", 1, 3); }
      shadow(e.x, e.y + 4, Math.max(16, 40 - z * 0.15));
      ctx.save(); ctx.translate(e.x, e.y - z); ctx.scale(1.3, 1.3); ctx.translate(-e.x, -(e.y - z));
      const flash = e.flash > 0, scale = flash ? "#fff" : "#6a1014", scaleD = "#3a060a", scaleL = "#9a2026";
      const heat = 0.55 + 0.45 * Math.sin(t * 4) + (winding ? 0.6 : 0) + (breathing ? 1 : 0);
      const belly = flash ? "#fff" : heat > 1.2 ? "#ffd06a" : "#ff8a3d", bellyD = "#c4501a";
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
      // bat wings: bone fingers and dark membrane
      const wing = (side) => { // a fanned bat wing: bony leading edge, membrane, scalloped trailing edge
        const bx = side < 0 ? -8 : 6, dir = side < 0 ? -1 : 1, span = 38, root = -34, tip = -64 - flap;
        for (let i = 0; i <= span; i++) {
          const u = i / span, top = Math.round(lerp(root, tip, Math.pow(u, 0.8))), scallop = 4 * Math.abs(Math.sin(u * Math.PI * 4));
          const bottom = Math.round(lerp(-6, tip + 6, u) - scallop);
          if (bottom > top) rr(i % 9 === 0 ? "#2a0408" : "#4a0e14", bx + dir * i, top + 2, 1, bottom - top);
          rr(i > span - 3 ? "#e8e0c8" : "#c8b8a0", bx + dir * i, top, 1, 2);
        }
        for (let k = 1; k <= 3; k++) { // finger bones
          const ux = k / 4, fx = bx + dir * span * ux, fy = lerp(root, tip, Math.pow(ux, 0.8));
          for (let j = 0; j <= 10; j++) { const v = j / 10; rr("#b8a890", Math.round(lerp(fx, bx + dir * span * (ux + 0.06), v)), Math.round(lerp(fy + 2, lerp(-6, tip + 6, ux + 0.06) - 3, v)), 1, 1); }
        }
        rr("#e8e0c8", bx + dir * span, tip - 3, 2, 4);
      };
      wing(-1); wing(1);
      // tail curling back with a spiked tip
      rr(scaleD, -36, -12, 20, 7); rr(scale, -36, -12, 20, 5); rr(scaleD, -46, -17, 12, 7); rr(scale, -46, -17, 12, 5);
      rr("#e8e0c8", -52, -22, 6, 3); rr("#e8e0c8", -50, -25, 3, 3);
      // body
      rr(scaleD, -20, -32, 40, 32); rr(scale, -19, -31, 38, 28); rr(scaleL, -19, -31, 38, 3);
      for (let i = 0; i < 6; i++) rr(scaleD, -16 + i * 6, -26 + (i % 2) * 4, 3, 2);
      // molten belly plates
      rr(bellyD, -12, -22, 22, 20); rr(belly, -11, -21, 20, 18);
      for (let i = 0; i < 4; i++) rr(bellyD, -11, -17 + i * 4, 20, 1);
      if (heat > 1.1) rr("#fff2b0", -5, -15, 8, 6);
      // spikes down the back
      for (let i = 0; i < 6; i++) { rr("#e8e0c8", -16 + i * 6, -37, 3, 5); rr("#b8ad92", -16 + i * 6, -33, 3, 1); }
      // legs and claws
      rr(scaleD, -16, -4, 10, 8); rr(scaleD, 6, -4, 10, 8); rr("#e8e0c8", -17, 3, 2, 2); rr("#e8e0c8", -13, 3, 2, 2); rr("#e8e0c8", 5, 3, 2, 2); rr("#e8e0c8", 9, 3, 2, 2);
      // neck and head
      rr(scaleD, 10, -46, 13, 18); rr(scale, 11, -45, 11, 16); rr(belly, 17, -43, 4, 13);
      rr(scaleD, 12, -58, 28, 16); rr(scale, 13, -57, 26, 14); rr(scaleL, 13, -57, 26, 2);
      rr(scaleD, 30, -48, 12, 5); rr(scale, 30, -47, 11, 3); // jaw
      rr("#e8e0c8", 32, -45, 2, 3); rr("#e8e0c8", 36, -45, 2, 3); // fangs
      const eye = flash ? "#fff" : "#ffe14a"; rr(eye, 25, -53, 5, 3); rr("#1a0204", 27, -53, 1, 3);
      if (!flash) rr("rgba(255,225,74,0.35)", 23, -55, 9, 7);
      rr("#2a0408", 37, -54, 2, 2); // nostril
      // curved horns
      rr("#e8e0c8", 15, -62, 3, 6); rr("#e8e0c8", 12, -66, 3, 5); rr("#e8e0c8", 10, -68, 3, 3);
      rr("#d8c8b0", 21, -61, 3, 5); rr("#d8c8b0", 19, -64, 3, 4);
      if (winding || breathing) rr("#ffb04a", 40, -50, 4, 4);
      // smoke and embers
      if (Math.random() < 0.08) addFx({ k: "puff", x: x + (f > 0 ? 40 : -40), y: y - 54, vx: f * 10, vy: -18, t: 0.6, c: "#5a5a66", s: 3 });
      if (Math.random() < 0.25) addFx({ k: "flame", x: x + rnd(-18, 18), y: y - rnd(4, 34), vx: 0, vy: -20, t: 0.4, c: Math.random() < 0.5 ? "#ff6a2a" : "#ffd06a" });
      ctx.restore();
    }
    const DRAW = { s: drawSlime, S: drawSlime, o: drawSlime, O: drawSlime, p: drawSpitter, g: (e) => drawGoblin(e, false), a: drawArcher, n: drawBomber, b: drawBat, B: drawBrute, K: drawKing,
      z: drawSkeleton, x: drawSkeleton, Z: drawKnightSk, m: drawMage, i: drawImp, w: drawWhelp, D: drawDragon, bones: drawBones };
    function drawArcher(e) {
      const f = e.face, x = e.x, y = e.y - Math.abs(Math.sin(e.anim)) * 1;
      shadow(x, e.y + 2, 6);
      const rr = (c, ox, oy, w, hh) => R(c, x + (f > 0 ? ox : -ox - w), y + oy, w, hh);
            rr("#3b6a2a", -4, -9, 8, 9); rr("#2a4a1e", -4, -2, 3, 2); rr("#2a4a1e", 1, -2, 3, 2);
      rr(e.flash > 0 ? "#fff" : "#4f8a3a", -4, -15, 8, 7); rr("#2a4a1e", -5, -16, 10, 3);
      rr("#ffe9a0", -2, -11, 2, 2); rr("#ffe9a0", 1, -11, 2, 2);
      rr("#8a5a2f", 5, -12, 1, 12); rr("#dfe6f7", 5, -12, 1, 1);
      if (e.st === "wind" && run) { ctx.strokeStyle = "rgba(255,93,115," + (0.3 + e.t * 0.8) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + Math.cos(e.lock) * 260, y - 6 + Math.sin(e.lock) * 260); ctx.stroke(); }
    }
    function drawProp(q) {
      shadow(q.x, q.y + 1, 7);
      if (q.k === "pot") { R("#5a2a14", q.x - 6, q.y - 12, 12, 13); R("#b06a3a", q.x - 5, q.y - 11, 10, 11); R("#d08a50", q.x - 5, q.y - 11, 3, 11); R("#5a2a14", q.x - 3, q.y - 14, 6, 3); R("#8a4a2a", q.x - 2, q.y - 13, 4, 1); R("#e8c890", q.x - 5, q.y - 6, 10, 1); }
      else { R("#3a2412", q.x - 6, q.y - 13, 12, 14); R("#7a4a26", q.x - 5, q.y - 12, 10, 12); R("#9a6a3a", q.x - 3, q.y - 12, 3, 12); R("#3a3a48", q.x - 5, q.y - 10, 10, 1); R("#3a3a48", q.x - 5, q.y - 3, 10, 1); }
    }
    function drawChest(c) {
      const drop = clamp(c.t / 0.45, 0, 1), y = c.y - (1 - easeOut(drop)) * 120, x = c.x;
      if (drop >= 1 && c.t < 0.6) addFx({ k: "ring", x, y: c.y, t: 0.25, d: 0.25, c: "#ffe08a", s: 20 });
      shadow(x, c.y + 2, 12 * drop + 2);
      const lid = c.open ? Math.min(1, c.ot * 5) : 0;
      if (c.open) { // light pouring out
        ctx.globalAlpha = 0.35 + 0.15 * Math.sin(now() * 8);
        for (let i = -3; i <= 3; i++) R("#fff2b0", x - 2 + i * 4, y - 40, 3, 30 - Math.abs(i) * 5);
        ctx.globalAlpha = 1;
      }
      R("#3a2412", x - 12, y - 12, 24, 13); R("#8a5a2f", x - 11, y - 11, 22, 11); R("#a8743e", x - 11, y - 11, 22, 2); R("#5a3a1e", x - 11, y - 5, 22, 1);
      R("#f4b942", x - 11, y - 11, 2, 11); R("#f4b942", x + 9, y - 11, 2, 11); R("#f4b942", x - 2, y - 8, 4, 4); R("#3a2412", x - 1, y - 7, 2, 2);
      const ly = y - 12 - lid * 8;
      R("#3a2412", x - 12, ly - 6, 24, 7); R("#a8743e", x - 11, ly - 5, 22, 5); R("#c89050", x - 11, ly - 5, 22, 1); R("#f4b942", x - 11, ly - 5, 2, 5); R("#f4b942", x + 9, ly - 5, 2, 5);
      if (!c.open && c.t > 0.5) { const b = Math.round(Math.sin(now() * 5) * 2); R("#ffe08a", x - 3, y - 30 + b, 6, 3); R("#ffe08a", x - 2, y - 27 + b, 4, 2); R("#ffe08a", x - 1, y - 25 + b, 2, 2); }
    }
    const spawnCol = (k) => (k === "o" || k === "O" || k === "p" ? "#ff9a3d" : run.theme.glow);
    function drawEnemy(e) {
      if (e.spawnT > 0 && e.k !== "bones") { pixDisc(e.x, e.y, 9, 4, spawnCol(e.k), 0.6); return; }
      if (e.stun > 0 && !e.fly && e.k !== "bones") { const top = e.y - (e.z || 0) - e.r * 2 - 12; R("#f4cf5a", e.x - 6, top + Math.sin(run.t * 12) * 1.5, 3, 3); R("#f4cf5a", e.x + 3, top - Math.sin(run.t * 12) * 1.5, 3, 3); }
      if (e.elite) { // gold aura and a little crown
        const pulse = 0.5 + 0.5 * Math.sin(run.t * 6 + e.anim);
        pixRing(e.x, e.y + 1, e.r + 6, (e.r + 6) * 0.45, "#ffcf5a", 0.5 + 0.4 * pulse, 2, 3);
        pixDisc(e.x, e.y + 1, e.r + 3, (e.r + 3) * 0.45, "#ffcf5a", 0.12 + 0.1 * pulse);
      }
      (DRAW[e.k] || drawSlime)(e);
      if (e.elite) { const ty = e.y - (e.fly ? 12 : 0) - e.r * 2 - 15; R("#f4b942", e.x - 4, ty + 2, 9, 3); R("#f4b942", e.x - 4, ty, 2, 2); R("#f4b942", e.x, ty - 1, 1, 3); R("#f4b942", e.x + 3, ty, 2, 2); }
      if (e.burn > 0 && Math.floor(run.t * 10) % 2) R("#ff8a3d", e.x - 1, e.y - e.r * 2 - 2, 2, 2);
      if (e.hp < e.max && !BOSS[e.k] && e.k !== "bones") { const w = Math.max(10, e.r * 2), top = e.y - (e.fly ? 12 : 0) - e.r * 2 - 8; R("#e5484d", e.x - w / 2, top + 1, w * clamp(e.hp / e.max, 0, 1), 2); }
    }
    function drawPillar(q) {
      shadow(q.x, q.y + 6, 12);
      const ink = run.day ? "#5a5242" : "#10131f";
      if (q.fire) { // brazier
        R(ink, q.x - 10, q.y - 8, 20, 12); R("#5a4636", q.x - 9, q.y - 7, 18, 4); R("#3a2a22", q.x - 7, q.y - 3, 14, 6); R("#7a5a40", q.x - 9, q.y - 7, 18, 1);
        const fl = Math.sin(run.t * 14) * 1.5;
        R("#ff6a1a", q.x - 6, q.y - 20 + fl, 12, 13); R("#ffb04a", q.x - 4, q.y - 24 + fl, 8, 12); R("#fff0a0", q.x - 1, q.y - 19 + fl, 3, 6);
        return;
      }
      R(ink, q.x - 10, q.y - 34, 20, 40); R(run.theme.wall, q.x - 8, q.y - 32, 16, 36); R(run.theme.wallHi, q.x - 8, q.y - 32, 3, 36); R(run.day ? "rgba(80,70,50,0.2)" : "rgba(0,0,0,0.3)", q.x + 4, q.y - 32, 4, 36);
      R(run.theme.wallHi, q.x - 11, q.y - 36, 22, 5); R(ink, q.x - 11, q.y - 31, 22, 1); R(run.theme.wallHi, q.x - 11, q.y + 1, 22, 5);
      if (run.theme.deco === "moss" || run.theme.deco === "sewer") { R("#4f8a3a", q.x - 8, q.y - 4, 5, 6); R("#6ab04a", q.x - 8, q.y - 4, 5, 1); }
    }
    function drawPlayer() {
      const p = run.p;
      if (p.inv > 0 && !p.flash && !p.spin && Math.floor(run.t * 30) % 2 && p.dash <= 0) { shadow(p.x, p.y + 3, 8); return; }
      const bob = Math.abs(Math.sin(p.walk)) * 1.5 * Math.min(1, Math.hypot(p.vx, p.vy) / 60);
      const flip = Math.cos(p.dir) < -0.25, y = p.y - bob;
      shadow(p.x, p.y + 3, 8);
      if (p.spin) { // a cyan disc under the knight while spinning
        const u = p.spin.t / p.spin.dur; pixDisc(p.x, p.y, 40 * p.L.weapon.reach, 16 * p.L.weapon.reach, "#6ef0e0", 0.25 * (1 - u));
      }
      const behind = !p.spin && Math.sin(p.dir) < -0.3;
      if (behind) { drawWeapon(); drawShield(); }
      ctx.save(); ctx.translate(Math.round(p.x), Math.round(y));
      if (flip) ctx.scale(-1, 1);
      if (p.flash > 0 && Math.floor(run.t * 40) % 2) ctx.filter = "brightness(2.2)";
      const img = Math.sin(p.dir) < -0.3 && spriteBack ? spriteBack : sprite;
      if (img) ctx.drawImage(img, -11, -22, 22, 25); else R("#9fb0d0", -6, -14, 12, 16);
      ctx.restore(); ctx.filter = "none";
      if (!behind) { drawShield(); drawWeapon(); }
      if (p.stun > 0) { R("#f4cf5a", p.x - 7, p.y - 28 + Math.sin(run.t * 14) * 1.5, 3, 3); R("#f4cf5a", p.x + 4, p.y - 28 - Math.sin(run.t * 14) * 1.5, 3, 3); }
    }
    function drawShield() { // carried on the arm; it no longer blocks, it's part of the look
      const p = run.p, sh = day() ? NDC.knight.LIGHT_SHIELD : NDC.knight.SHIELDS[p.L.eq.shield] || NDC.knight.SHIELDS.oak, f = Math.cos(p.dir) < -0.25 ? 1 : -1;
      const x = p.x + f * 9, y = p.y - 9;
      R(OUT, x - 4, y - 5, 8, 12); R(sh.m, x - 3, y - 4, 6, 10); R("rgba(255,255,255,0.22)", x - 3, y - 4, 2, 10); R(sh.n, x - 1, y - 1, 2, 3);
    }
    function drawWeapon() {
      const p = run.p, w = p.L.weapon, wp = NDC.knight.WEAPONS[p.L.eq.weapon] || NDC.knight.WEAPONS.wood;
      const len = 14 * w.reach + 8, col = wp.w || wp.n;
      let a, hx = p.x, hy = p.y - 8, ext = 1;
      if (p.spin) {
        const u = p.spin.t / p.spin.dur; a = p.dir + easeOut(u) * TAU * 1.5; ext = 1.15;
        for (let k = 0; k < 3; k++) pixArc(p.x, p.y - 8, 34 * w.reach * (0.7 + k * 0.12), 20 * w.reach * (0.7 + k * 0.12), a - 2.4, a, k === 1 ? "#ffffff" : "#6ef0e0", 0.85 * (1 - u), 3 - (k === 1 ? 1 : 0));
      } else if (p.swing) {
        const sw = p.swing; a = swingAngle(sw, swingHalf(sw)); const u = sw.t / sw.dur;
        ext = u < 0.24 ? 0.8 : u < 0.52 ? 1.12 : 1;
        if (u > 0.24 && u < 0.82) {
          const trailA = clamp((0.82 - u) / 0.4, 0, 1), range = 26 * w.reach * (sw.combo === 3 ? 1.15 : 1);
          const from = a - sw.side * clamp((u - 0.24) * 5, 0, 1) * swingHalf(sw) * 1.5;
          const tc = sw.combo === 3 ? "#ffe28c" : "#ebf5ff";
          for (let k = 0; k < 3; k++) pixArc(p.x, p.y - 8, range * (0.62 + k * 0.12), range * (0.62 + k * 0.12), Math.min(from, a), Math.max(from, a), tc, trailA * (0.9 - k * 0.15), 3 - (k === 2 ? 1 : 0));
        }
      } else {
        const f = Math.cos(p.dir) < -0.25 ? -1 : 1;
        a = f > 0 ? -0.5 : Math.PI + 0.5; hx = p.x + f * 9; ext = 0.75 + Math.sin(run.t * 3) * 0.02;
      }
      const cx = Math.cos(a), cy = Math.sin(a), L = len * ext;
      ctx.save(); ctx.translate(Math.round(hx), Math.round(hy)); ctx.rotate(a);
      ctx.fillStyle = OUT; ctx.fillRect(2, -3, L + 2, 6);
      ctx.fillStyle = col; ctx.fillRect(5, -2, L - 3, 4); ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fillRect(5, -2, L - 3, 1); ctx.fillStyle = "#f4b942"; ctx.fillRect(3, -4, 3, 8); ctx.fillStyle = "#6a4630"; ctx.fillRect(-1, -1, 4, 3);
      if (p.m.burn) { ctx.fillStyle = "rgba(255,138,61,0.6)"; ctx.fillRect(L - 4, -2, 3, 4); }
      ctx.restore();
      if (p.swing && p.swing.t / p.swing.dur > 0.24 && p.swing.t / p.swing.dur < 0.5 && Math.random() < 0.6) addFx({ k: "spark", x: hx + cx * L, y: hy + cy * L, vx: rnd(-20, 20), vy: rnd(-20, 10), t: 0.25, c: p.m.burn ? "#ffb04a" : "#fff" });
    }

    /* light mode: sunbeams from the windows with dust drifting through them */
    function drawSunbeams() {
      const t = run.t;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (const wx of ART.windows(run.floor)) {
        const a = 0.07 + 0.02 * Math.sin(t * 0.6 + wx);
        ctx.fillStyle = "rgba(255,240,200," + a + ")";
        ctx.beginPath(); ctx.moveTo(wx - 9, TOP - 8); ctx.lineTo(wx + 9, TOP - 8); ctx.lineTo(wx + 58, BOT - 20); ctx.lineTo(wx + 22, BOT - 20); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 5; i++) { const u = ((t * 0.05 + i * 0.21 + wx * 0.01) % 1), x = wx + lerp(0, 40, u) + Math.sin(t + i) * 4, y = lerp(TOP, BOT - 30, u); R("rgba(255,250,230,0.5)", x, y, 1, 1); }
      }
      ctx.restore();
    }
    function drawLighting() {
      if (run.day) return;
      lctx.globalCompositeOperation = "source-over"; lctx.clearRect(0, 0, W, H);
      lctx.fillStyle = "rgba(5,7,16,0.66)"; lctx.fillRect(0, 0, W, H);
      lctx.globalCompositeOperation = "destination-out";
      const hole = (x, y, r, a) => { const g = lctx.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, "rgba(0,0,0," + a + ")"); g.addColorStop(1, "rgba(0,0,0,0)"); lctx.fillStyle = g; lctx.fillRect(x - r, y - r, r * 2, r * 2); };
      const fl = (i) => 1 + Math.sin(run.t * 9 + i * 2.1) * 0.06 + Math.sin(run.t * 23 + i) * 0.03;
      run.theme.torch.forEach((tx, i) => hole(tx, 40, 120 * fl(i), 0.95));
      ART.windows(run.floor).forEach((wx) => hole(wx, 30, 46, 0.35));
      hole(run.p.x, run.p.y - 6, 78, 0.8);
      run.pillars.forEach((q) => { if (q.fire) hole(q.x, q.y - 10, 130 * fl(9), 1); });
      if (run.theme.deco === "throne") hole(240, 40, 100, 0.8);
      if (run.theme.deco === "roost") hole(240, 30, 120, 0.7);
      for (const e of run.enemies) if (e.k === "b" || e.k === "i" || e.k === "m" || e.k === "w") hole(e.x, e.y, 24, 0.45); else if (e.k === "D") hole(e.x, e.y - 20, 70, 0.6);
      for (const a of run.shots) if (a.k === "fire" || a.k === "orb") hole(a.x, a.y, 20, 0.6);
      for (const b of run.pshots) hole(b.x, b.y, 26, 0.7);
      for (const f of run.fx) if (f.k === "bolt") hole(f.x, f.y, 60, 0.8);
      for (const q of run.pools) if (q.k === "fire") hole(q.x, q.y, 34, 0.6);
      for (const f of run.fx) if (f.k === "ring" || f.k === "flame") hole(f.x, f.y, f.k === "ring" ? 40 : 16, 0.3);
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
        R(OUT, tx - 4, 12 + fl, 8, 12); R(rgb, tx - 3, 14 + fl, 6, 9); R("#fff6d0", tx - 1, 17 + fl, 2, 6);
        if (Math.random() < 0.12) addFx({ k: "spark", x: tx + rnd(-2, 2), y: 16, vx: rnd(-8, 8), vy: rnd(-30, -10), t: rnd(0.4, 0.8), c: rgb });
      });
    }

    function drawHud() {
      const p = run.p;
      ctx.font = "10px 'Pixelify Sans', monospace"; ctx.textBaseline = "alphabetic";
      const bar = (x, y, w, hh, pct, c1, c2, label) => {
        R(OUT, x - 2, y - 2, w + 4, hh + 4); R("#1f2540", x, y, w, hh); R(c1, x, y, Math.round(w * clamp(pct, 0, 1)), hh); R(c2, x, y, Math.round(w * clamp(pct, 0, 1)), 2);
        if (label) { ctx.fillStyle = "#f4f1e6"; ctx.textAlign = "left"; ctx.fillText(label, x + w + 7, y + hh - 1); }
      };
      const panel = run.day ? "rgba(5,7,16,0.78)" : "rgba(5,7,16,0.6)";
      R(panel, 30, 2, 190, 28);
      bar(36, 6, 120, 8, p.hp / p.maxHp, "#e5484d", "#ff8a8a", `${Math.ceil(p.hp)}/${p.maxHp}`);
      bar(36, 20, 120, 5, p.st / p.maxSt, p.stun > 0 ? "#6a7899" : p.st < 20 ? "#e5a04a" : "#4f9cf0", "#9ccbff", "Stamina");
      const owned = ABILITIES.filter((a) => run.ab[a.id]);
      if (owned.length) { // ability slots: fill shows the cooldown, the letter is the key
        R(panel, 222, 2, 8 + owned.length * 26, 28);
        owned.forEach((a, i) => {
          const x = 228 + i * 26, left = a.id === "spin" ? p.spinCd : p.cd[a.id], full = a.id === "spin" ? SPIN_CD * p.m.spinCd : a.cd;
          const ready = left <= 0 && p.st >= a.cost, pct = 1 - left / full, dk = ART.mix(a.c, "#000000", 0.7);
          R(OUT, x - 1, 5, 22, 22); R(dk, x, 6, 20, 20); R(ready ? a.c : ART.mix(a.c, "#000000", 0.45), x, 6 + 20 * (1 - pct), 20, Math.ceil(20 * pct));
          ctx.fillStyle = ready ? OUT : "#f4f1e6"; ctx.textAlign = "center"; ctx.fillText(left > 0 ? Math.ceil(left) : a.key, x + 10, 20);
        });
      }
      R(panel, W - 150, 2, 118, 28);
      ctx.textAlign = "right"; ctx.fillStyle = "#f4f1e6";
      ctx.fillText(run.theme.name, W - 36, 14); ctx.fillStyle = "#8a93b5"; ctx.fillText(`Floor ${run.floor}  ·  ${fmtTime(run.time || run.t)}`, W - 36, 26);
      // enchants collected this run
      run.perks.forEach((id, i) => { if (perkById(id)) ctx.drawImage(iconCanvas(id, 1), 34 + i * 14, 34); });
      if (p.combo > 1 && p.comboT > 0) { ctx.textAlign = "center"; ctx.fillStyle = p.combo === 3 ? "#ffe08a" : "#fff"; ctx.fillText(p.combo === 3 ? "FINISHER!" : `Combo x${p.combo}`, p.x, p.y - 34); }
      const boss = run.enemies.find((e) => BOSS[e.k]);
      if (boss) { const w = 240; bar(120, H - 20, w, 6, boss.hp / boss.max, boss.k === "D" ? "#e5482a" : "#c4a030", boss.k === "D" ? "#ffb04a" : "#ffe08a", ""); ctx.textAlign = "center"; ctx.fillStyle = "#f4f1e6"; ctx.fillText(BOSS[boss.k], W / 2, H - 26); }
      if (run.chest && !run.chest.open && run.bannerT <= 0) { ctx.textAlign = "center"; ctx.font = "600 11px 'Pixelify Sans', monospace"; ctx.fillStyle = OUT; ctx.fillText("Walk up to the chest to open it", W / 2 + 0.7, 92.7); ctx.fillStyle = "#ffe08a"; ctx.fillText("Walk up to the chest to open it", W / 2, 92); }
      if (run.bannerT > 0) { const a = clamp(run.bannerT, 0, 1); ctx.textAlign = "center"; ctx.font = "20px 'Pixelify Sans', monospace"; ctx.fillStyle = "rgba(0,0,0," + a * 0.6 + ")"; ctx.fillText(run.banner, W / 2 + 1, 121); ctx.fillStyle = "rgba(244,185,66," + a + ")"; ctx.fillText(run.banner, W / 2, 120); }
      else if (run.tip > 0 && run.tipAb) {
        const a = clamp(run.tip, 0, 1), ab = run.tipAb; ctx.textAlign = "center";
        R("rgba(5,7,16," + 0.8 * a + ")", W / 2 - 160, 90, 320, 40); R(ab.c, W / 2 - 160, 90, 320, 2);
        ctx.globalAlpha = a; ctx.font = "13px 'Pixelify Sans', monospace"; ctx.fillStyle = ab.c; ctx.fillText(`New ability: ${ab.name}`, W / 2, 107);
        ctx.font = "10px 'Pixelify Sans', monospace"; ctx.fillStyle = "#f4f1e6"; ctx.fillText(`Press ${ab.keys} to ${ab.how}`, W / 2, 122); ctx.globalAlpha = 1;
      }
    }

    function drawPlayerShots() {
      for (const b of run.pshots) {
        const a = clamp(b.life / 0.3, 0, 1);
        const bx = b.x - Math.cos(b.a) * 6, by = b.y - Math.sin(b.a) * 6;
        pixArc(bx, by, 13, 13, b.a - 1.1, b.a + 1.1, "#ffe08a", 0.9 * a, 3); pixArc(bx, by, 11, 11, b.a - 0.9, b.a + 0.9, "#ffffff", a, 2);
      }
      for (const f of run.fx) if (f.k === "bolt") { // a jagged bolt from the top of the room
        const u = f.t / f.d; let x = f.x, y = 0; const steps = 9, seg = f.y / steps;
        ctx.strokeStyle = "rgba(207,232,255," + u + ")"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y);
        for (let i = 1; i <= steps; i++) { y = i * seg; x = f.x + (i === steps ? 0 : Math.sin(f.seed + i * 2.7) * 9); ctx.lineTo(x, y); }
        ctx.stroke(); ctx.strokeStyle = "rgba(255,255,255," + u + ")"; ctx.lineWidth = 1; ctx.stroke();
      }
    }
    function drawShots() {
      for (const a of run.shots) {
        ctx.save(); ctx.translate(Math.round(a.x), Math.round(a.y));
        if (a.k === "arrow") { ctx.rotate(Math.atan2(a.vy, a.vx)); R(OUT, -6, -2, 14, 4); R("#c8b080", -5, -1, 10, 2); R("#dfe6f7", 4, -2, 3, 4); R("#e5484d", -6, -2, 2, 4); }
        else if (a.k === "bone") { ctx.rotate(a.spin); R(OUT, -5, -2, 10, 4); R("#e8e0c8", -4, -1, 8, 2); R("#e8e0c8", -5, -2, 2, 4); R("#e8e0c8", 3, -2, 2, 4); }
        else if (a.k === "orb") { R("rgba(176,106,255,0.35)", -5, -5, 10, 10); R(OUT, -3, -3, 6, 6); R("#c9a0ff", -2, -2, 4, 4); R("#ffffff", -1, -1, 1, 1); }
        else { R("rgba(255,138,61,0.35)", -5, -5, 10, 10); R("#e5482a", -3, -3, 6, 6); R("#ffb04a", -2, -2, 4, 4); R("#fff0a0", -1, -1, 2, 2); }
        ctx.restore();
      }
      for (const l of run.lobs) {
        const u = clamp(l.t / l.dur, 0, 1), x = lerp(l.x0, l.tx, u), y = lerp(l.y0, l.ty, u) - Math.sin(u * Math.PI) * (l.k === "meteor" ? 20 : 46);
        const col = l.k === "acid" ? "#ff9a3d" : l.k === "bomb" ? "#2a2a34" : "#ff6a2a";
        const tcol = l.k === "acid" ? "#ff9a3d" : "#ff5d73";
        pixRing(l.tx, l.ty, l.r, l.r * 0.55, tcol, 0.95, 2, 3); pixDisc(l.tx, l.ty, l.r * u, l.r * 0.55 * u, tcol, l.k === "acid" ? 0.3 : 0.32);
        if (l.k === "meteor") { const my = l.ty - (1 - u) * 160; R(OUT, l.tx - 5, my - 5, 10, 10); R(col, l.tx - 4, my - 4, 8, 8); R("#fff0a0", l.tx - 2, my - 2, 4, 4); addFx({ k: "spark", x: l.tx + rnd(-3, 3), y: my, vx: 0, vy: -30, t: 0.2, c: "#ffb04a" }); }
        else if (l.k === "bomb") { R(col, x - 3, y - 3, 7, 7); R("#5a5a66", x - 2, y - 2, 2, 2); R("#8a5a2f", x + 2, y - 5, 1, 3); if (Math.floor(run.t * 16) % 2) R("#ffe08a", x + 2, y - 7, 2, 2); }
        else { R(col, x - 3, y - 3, 6, 6); R("#ffd8a0", x - 2, y - 2, 2, 2); }
      }
    }
    function drawPools() {
      for (const q of run.pools) {
        const a = clamp(q.t, 0, 1);
        if (q.k === "acid") {
          pixDisc(q.x, q.y, q.r, q.r * 0.55, "#ff8c28", 0.38 * a);
          ctx.fillStyle = "rgba(255,216,140," + 0.45 * a + ")"; R(ctx.fillStyle, q.x - q.r * 0.4 + Math.sin(run.t * 3 + q.x) * 2, q.y - 1, 2, 2); R(ctx.fillStyle, q.x + q.r * 0.3, q.y + 1 + Math.sin(run.t * 4 + q.y), 2, 2);
        } else pixDisc(q.x, q.y, q.r, q.r * 0.55, "#ff6a2a", 0.32 * a);
      }
    }

    function draw() {
      ctx.imageSmoothingEnabled = false;
      ctx.save();
      hctx.setTransform(1, 0, 0, 1, 0, 0); hctx.clearRect(0, 0, W * HS, H * HS);
      if (!run) { ctx.fillStyle = "#070912"; ctx.fillRect(0, 0, W, H); const b = bg || (bg = ART.build(gs.best >= 5 ? 6 : 1, day())); ctx.drawImage(b, 0, 0); ctx.fillStyle = day() ? "rgba(246,244,232,0.1)" : "rgba(4,6,12,0.55)"; ctx.fillRect(0, 0, W, H); ctx.restore(); return; }
      if (run.shake > 0) ctx.translate(Math.round(rnd(-1, 1) * run.shake * 0.5), Math.round(rnd(-1, 1) * run.shake * 0.5));
      ctx.drawImage(bg, 0, 0);
      drawPools();
      for (const s of run.spawns) { const u = 1 - clamp(s.t, 0, 1); pixRing(s.x, s.y, 4 + 8 * u, 2 + 4 * u, spawnCol(s.k), 0.85); }
      for (const w of run.waves) { const a = 1 - w.r / w.max; pixRing(w.x, w.y, w.r, w.r * 0.55, "#ffcf5a", a, 3); pixRing(w.x, w.y, w.r - 3, w.r * 0.55 - 2, "#fff0a0", a * 0.6, 2); }
      for (const q of run.pickups) { const by = Math.sin(q.t * 5) * 1.5; shadow(q.x, q.y + 2, 4); R("#ff4d6a", q.x - 4, q.y - 7 + by, 3, 3); R("#ff4d6a", q.x + 1, q.y - 7 + by, 3, 3); R("#ff4d6a", q.x - 4, q.y - 5 + by, 8, 3); R("#ff4d6a", q.x - 2, q.y - 2 + by, 4, 2); R("#ffb0bb", q.x - 3, q.y - 6 + by, 1, 1); }
      for (const f of run.fx) if (f.k === "ring") { const u = 1 - f.t / f.d; pixRing(f.x, f.y, 4 + u * f.s, (4 + u * f.s) * 0.7, f.c, 1 - u); }
      { // a carved rune circle in the floor of every room: dashed pixel rings with four rune marks
        const a = (run.day ? 0.22 : 0.14) + (0.5 + 0.5 * Math.sin(run.t * 2)) * 0.08, g = run.theme.glow;
        pixRing(240, 178, 70, 30, g, a, 2, 4); pixRing(240, 178, 54, 23, g, a, 2, 3);
        for (let i = 0; i < 4; i++) { const t = i * Math.PI / 2 + Math.PI / 4, x = 240 + Math.cos(t) * 62, y = 178 + Math.sin(t) * 26.5; ctx.globalAlpha = a * 1.4; R(g, x - 1, y - 3, 2, 6); R(g, x - 3, y - 1, 6, 2); ctx.globalAlpha = 1; }
      }
      // depth-sorted things
      const list = [];
      list.push({ y: run.p.y, f: drawPlayer });
      run.enemies.forEach((e) => list.push({ y: e.y + (e.air ? 200 : 0), f: () => drawEnemy(e) }));
      run.pillars.forEach((q) => list.push({ y: q.y, f: () => drawPillar(q) }));
      if (run.chest) list.push({ y: run.chest.y, f: () => drawChest(run.chest) });
      run.props.forEach((q) => list.push({ y: q.y, f: () => drawProp(q) }));
      for (const g of run.fx) if (g.k === "ghost") list.push({ y: g.y - 1, f: () => { ctx.globalAlpha = g.t * 3; ctx.save(); ctx.translate(Math.round(g.x), Math.round(g.y)); if (g.f) ctx.scale(-1, 1); if (sprite) ctx.drawImage(sprite, -11, -22, 22, 25); ctx.restore(); ctx.globalAlpha = 1; } });
      list.sort((a, b) => a.y - b.y).forEach((o) => o.f());
      drawShots();
      drawPlayerShots();
      drawTorches();
      for (const f of run.fx) {
        if (f.k === "spark") R(f.c, f.x, f.y, 2, 2);
        else if (f.k === "flame") { ctx.globalAlpha = clamp(f.t * 2.5, 0, 1); R(f.c, f.x - 1, f.y - 1, 3, 3); ctx.globalAlpha = 1; }
        else if (f.k === "puff") { ctx.globalAlpha = clamp(f.t * 2, 0, 1); R(f.c, f.x, f.y, f.s, f.s); ctx.globalAlpha = 1; }
      }
      drawLighting();
      if (run.day) { ctx.drawImage(dayVignette, 0, 0); drawSunbeams(); } else ctx.drawImage(vignette, 0, 0);
      if (run.boltFlash > 0) { ctx.fillStyle = "rgba(220,235,255," + run.boltFlash * 2 + ")"; ctx.fillRect(0, 0, W, H); }
      if (run.hitFlash > 0) { ctx.fillStyle = "rgba(255,40,60," + run.hitFlash * 0.5 + ")"; ctx.fillRect(0, 0, W, H); }
      if (run.p.hp < run.p.maxHp * 0.3 && !run.over) { ctx.fillStyle = "rgba(255,0,30," + (0.06 + 0.05 * Math.sin(run.t * 7)) + ")"; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
      // HUD and floating numbers on the sharp layer
      hctx.setTransform(HS, 0, 0, HS, 0, 0); hctx.imageSmoothingEnabled = false; ctx = hctx;
      for (const f of run.fx) if (f.k === "text") {
        ctx.font = (f.big ? "600 13px" : "600 10px") + " 'Pixelify Sans', monospace"; ctx.textAlign = "center"; const yy = f.y - ((f.big ? 0.9 : 0.7) - f.t) * 24;
        ctx.fillStyle = OUT; ctx.fillText(String(f.v), f.x + 0.7, yy + 0.7); ctx.fillStyle = f.c; ctx.fillText(String(f.v), f.x, yy);
      }
      drawHud();
      ctx = mainCtx;
    }

    function loop(t) {
      if (!alive) return;
      const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
      if (phase === "play" || phase === "clear" || phase === "dead") update(phase === "play" ? dt : dt * 0.2);
      draw();
      raf = requestAnimationFrame(loop);
    }

    /* ---------- menus ---------- */
    const floorOpen = (f) => f <= (G.gameStats(NDC.store.get()).best || 0) + 1;
    const starRow = (n, total) => h("span", { class: "dg-stars", "aria-label": `${n} of ${total || 3} stars` }, Array.from({ length: total || 3 }, (_, i) => h("i", { class: i < n ? "on" : "" })));
    function floorBtn(f) {
      // floors open one at a time: you can play any floor you've cleared, plus the next one
      const locked = !floorOpen(f), cleared = gs.best >= f, st = gs.stars[f] || 0, tm = gs.times[f];
      return h("button", { class: "btn dg-fl" + (cleared ? " cleared" : "") + (locked ? " locked" : ""), type: "button", disabled: locked ? true : null, style: { "--fg": G.FLOOR_GLOW[f - 1] }, onclick: () => { if (!locked) begin(f); } },
        h("span", { class: "fl-n" }, f), h("span", { class: "fl-t" }, themeOf(f).name),
        h("span", { class: "fl-r" }, locked ? h("span", { class: "fl-lock", title: `Clear floor ${f - 1} to open` }, "Locked") : starRow(st), tm ? h("small", null, fmtTime(tm)) : null));
    }
    function perkCard(q, i, nextF) {
      const rar = RARITY[q.r];
      return h("button", { class: "dg-ench r-" + q.r, type: "button", style: { "--pc": q.c, "--rc": rar.c, "--i": i }, onclick: () => pickPerk(q, nextF) },
        h("span", { class: "ench-rar" }, rar.label),
        h("span", { class: "ench-icon" }, h("img", { src: iconURL(q.id, 5), alt: "", width: 60, height: 60 })),
        h("b", null, q.name), h("span", { class: "ench-desc" }, q.desc), h("kbd", null, String(i + 1)));
    }
    function pickPerk(q, nextF) {
      SFX.perk();
      const perks = run.perks.concat(q.id), p = run.p, heal = p.maxHp * 0.3 + (q.id === "heart" ? 30 : 0);
      begin(nextF, { perks, hp: Math.min(p.maxHp + (q.id === "heart" ? 30 : 0), p.hp + heal) });
    }
    /* entering a floor that unlocks an ability: show what it is and which key, then start */
    const revealed = new Set();
    function begin(f, carry) {
      const ab = ABILITIES.find((a) => a.floor === f);
      if (!ab || revealed.has(ab.id)) { start(f, carry); return; }
      revealed.add(ab.id);
      phase = "reveal"; offer = null; NDC.clear(menuEl); menuEl.hidden = false; menuEl.className = "dg-menu dg-reveal";
      menuEl.style.setProperty("--ac", ab.c);
      const go = () => { document.removeEventListener("keydown", onKey, true); start(f, carry); };
      const onKey = (e) => { if (e.key === "Enter" || ab.keys.toLowerCase().split(" or ").includes(e.key.toLowerCase())) { e.preventDefault(); go(); } };
      document.addEventListener("keydown", onKey, true);
      menuEl.append(
        h("p", { class: "dg-eyebrow pixel" }, "New ability unlocked"),
        h("img", { class: "dg-ab-icon", src: iconURL("ab_" + ab.id, 6, ab.c), alt: "", width: 72, height: 72 }),
        h("h2", { class: "dg-ab-title pixel" }, ab.name),
        h("p", { class: "dg-ab-how" }, `Press ${ab.keys.split(" or ").join(" or ")} to ${ab.how}.`),
        h("div", { class: "dg-ab-keys" }, ab.keys.split(" or ").map((k) => h("kbd", null, k))),
        h("p", { class: "dg-why" }, `It uses ${ab.cost} stamina and recharges in ${ab.cd}s. The slot in the top corner shows when it's ready.`),
        h("button", { class: "btn primary", type: "button", onclick: go }, `Start floor ${f}: ${themeOf(f).name}`));
    }
    const toList = () => { phase = "menu"; run = null; offer = null; bg = null; menuEl.className = "dg-menu"; drawMenu(); };
    const resultLine = () => h("div", { class: "dg-result" }, starRow(run.stars),
      h("p", null, `${fmtTime(run.time)}${run.newBest ? " · new best time" : ""} · ${run.kills} defeated${run.bestChain >= 3 ? ` · ${run.bestChain} chain` : ""}`),
      h("p", { class: "dg-why" }, `★ Cleared   ${run.time <= PAR[run.floor] ? "★" : "☆"} Under ${fmtTime(PAR[run.floor])}   ${run.hpLost <= run.p.maxHp * 0.35 ? "★" : "☆"} Lost under a third of your health`));
    function enchantView(nextF) {
      menuEl.className = "dg-menu dg-enchanting";
      offer = offer || offerPerks(run.perks, nextF);
      menuEl.append(
        h("p", { class: "dg-eyebrow pixel" }, `Floor ${run.floor} cleared · ${fmtTime(run.time)} · `, starRow(run.stars)),
        h("h2", { class: "dg-ench-title" }, "Choose an enchant"),
        h("p", { class: "dg-ench-sub" }, `It lasts for the rest of this run. Floor ${nextF}, ${themeOf(nextF).name}, is next.`),
        h("div", { class: "dg-enchs" }, offer.map((q, i) => perkCard(q, i, nextF))));
      if (run.perks.length) menuEl.append(h("div", { class: "dg-have" }, h("span", null, "Your enchants"), run.perks.map((id) => { const q = perkById(id); return q ? h("img", { src: iconURL(id, 2), alt: q.name, title: q.name, width: 24, height: 24 }) : null; })));
      menuEl.append(h("div", { class: "row dg-row" },
        h("button", { class: "btn small", type: "button", onclick: () => start(run.floor, run.carry) }, "Replay this floor"),
        h("button", { class: "btn small", type: "button", onclick: toList }, "Floor list")));
    }
    function victoryView() {
      const f = run.floor, last = f === G.FLOORS;
      menuEl.className = "dg-menu dg-victory";
      const confetti = h("div", { class: "dg-confetti", "aria-hidden": "true" }, Array.from({ length: 28 }, (_, i) => h("i", { style: { left: (i * 37) % 100 + "%", "--d": (i % 7) * 0.35 + "s", "--t": 2.6 + (i % 5) * 0.5 + "s", background: ["#f4b942", "#ff5d73", "#6ef0e0", "#c08aff", "#6ad48a", "#ffffff"][i % 6] } })));
      menuEl.append(confetti,
        h("img", { class: "dg-trophy", src: iconURL("trophy", 6, "#f4b942"), alt: "", width: 72, height: 72 }),
        h("h2", { class: "dg-vic-title pixel" }, "Victory!"),
        h("p", { class: "dg-vic-sub" }, last ? "Cinderwing is slain. The castle is yours." : "The Goblin King has fallen. The way under the castle is open."),
        starRow(run.stars),
        h("dl", { class: "dg-vic-stats" },
          h("div", null, h("dt", null, "Time"), h("dd", { class: "pixel" }, fmtTime(run.time))),
          h("div", null, h("dt", null, "Defeated"), h("dd", { class: "pixel" }, run.kills)),
          h("div", null, h("dt", null, "Damage taken"), h("dd", { class: "pixel" }, Math.round(run.hpLost))),
          h("div", null, h("dt", null, "Enchants"), h("dd", { class: "pixel" }, run.perks.length))),
        h("div", { class: "row dg-row" },
          last ? h("button", { class: "btn primary", type: "button", onclick: () => begin(1) }, "Play again from floor 1")
            : h("button", { class: "btn primary", type: "button", onclick: () => { NDC.clear(menuEl); enchantView(f + 1); } }, "Claim your enchant"),
          h("button", { class: "btn", type: "button", onclick: toList }, "Floor list")),
      );
      if (last) menuEl.append(h("p", { class: "dg-why" }, "Your stars, best times and bestiary are kept. Go for three stars on every floor."));
      SFX.win();
    }
    function drawMenu() {
      NDC.clear(menuEl); menuEl.hidden = false; menuEl.className = "dg-menu"; menuEl.style.removeProperty("--ac");
      if (phase === "clear" || phase === "dead") {
        const win = phase === "clear", f = run.floor, nextF = f + 1, hasNext = win && nextF <= G.FLOORS;
        if (win && (f === 5 || f === G.FLOORS)) { victoryView(); return; }
        if (win && hasNext) { enchantView(nextF); return; }
        const killer = BEASTS.find(([kind]) => kind === run.lastHit);
        menuEl.className = "dg-menu dg-dead";
        menuEl.append(h("h2", null, `Knocked out on floor ${f}`));
        if (killer) menuEl.append(h("div", { class: "dg-killer" }, h("img", { src: portrait(killer[0], killer[1]), alt: "", width: 64, height: 64 }),
          h("div", null, h("small", null, "Knocked out by"), h("b", null, killer[2]), h("p", null, `Tip: ${killer[3]}`))));
        menuEl.append(h("p", { class: "muted" }, `${run.kills} defeated · ${fmtTime(run.time || run.t)}${run.bestChain >= 3 ? ` · best chain ${run.bestChain}` : ""}`));
        if (run.perks.length) menuEl.append(h("div", { class: "dg-have" }, h("span", null, "Your enchants"), run.perks.map((id) => h("img", { src: iconURL(id, 2), alt: "", width: 24, height: 24 }))));
        menuEl.append(h("div", { class: "row dg-row" },
          h("button", { class: "btn primary", type: "button", onclick: () => start(f, run.carry) }, "Try again"),
          h("button", { class: "btn", type: "button", onclick: toList }, "Floor list")));
        return;
      }
      const deep = gs.best >= 5;
      menuEl.append(h("h2", null, "Choose a floor"),
        h("div", { class: "dg-groups" },
          h("div", null, h("p", { class: "dg-gh" }, "The castle"), h("div", { class: "dg-floors" }, [1, 2, 3, 4, 5].map(floorBtn))),
          h("div", null, h("p", { class: "dg-gh" }, deep ? "Under the castle" : "Under the castle · beat the Goblin King to open"), h("div", { class: "dg-floors" }, [6, 7, 8, 9, 10].map(floorBtn)))),
        keysHelp());
    }
    function keysHelp() {
      const key = (k) => h("kbd", null, k);
      return h("ul", { class: "dg-keys", "aria-label": "Controls" },
        h("li", null, key("WASD"), "Move"), h("li", null, key("J"), "/", key("Space"), "Swing"), h("li", null, key("L"), "/", key("Shift"), "Dash"),
        h("li", null, key("I"), "Beam (3+)"), h("li", null, key("K"), "Whirlwind (6+)"), h("li", null, key("O"), "Thunder (9+)"));
    }
    function drawStat() {
      NDC.clear(statEl);
      const g = gs, seen = BEASTS.filter(([k]) => g.slain[k]).length;
      statEl.append(
        h("div", { class: "dg-pill px" }, h("span", null, "Deepest floor"), h("b", { class: "pixel" }, g.best ? `${g.best}/10` : "-")),
        h("div", { class: "dg-pill px" }, h("span", null, "Stars"), h("b", { class: "pixel" }, `${g.totalStars}/30`)),
        h("div", { class: "dg-pill px" }, h("span", null, "Monsters beaten"), h("b", { class: "pixel" }, g.kills)),
        h("button", { class: "dg-pill px", type: "button", onclick: () => beastEl.scrollIntoView({ behavior: "smooth" }) }, h("span", null, "Bestiary ↓"), h("b", { class: "pixel" }, `${seen}/${BEASTS.length}`)));
    }
    /* ---------- bestiary: a portrait of every monster you've beaten ---------- */
    const portraits = {};
    function portrait(kind, k) {
      const key = kind + (day() ? "d" : "n");
      if (portraits[key]) return portraits[key];
      const cv = document.createElement("canvas"); cv.width = 64; cv.height = 64;
      const saved = ctx; ctx = cv.getContext("2d"); ctx.imageSmoothingEnabled = false;
      const big = k === "D" ? 0.42 : k === "K" ? 0.58 : 1;
      const e = Object.assign(makeEnemyBare(k), { x: 0, y: 0, face: 1, faceA: 0.4, anim: 0, flash: 0, st: "move", t: 0, z: 0, revT: 3, squash: 0.2 });
      ctx.save(); ctx.translate(k === "D" ? 30 : 32, k === "D" ? 54 : k === "K" ? 56 : k === "w" || k === "b" ? 46 : 52); ctx.scale(2 * big, 2 * big);
      try { (DRAW[k] || drawSlime)(e); } catch (err) {}
      ctx.restore(); ctx = saved;
      return (portraits[key] = cv.toDataURL());
    }
    function makeEnemyBare(k) { const b = BASE[k]; return { k, kind: b.name, r: b.r, hp: b.hp, max: b.hp, fly: k === "b" || k === "w" }; }
    function drawBeasts() {
      NDC.clear(beastEl);
      const g = gs;
      beastEl.append(h("div", { class: "dg-beast-head" }, h("h2", null, "Bestiary"), h("p", { class: "muted" }, "Every monster you beat gets a page here, with a tip for fighting it.")));
      beastEl.append(h("div", { class: "dg-beast-grid" }, BEASTS.map(([kind, k, name, tip]) => {
        const n = g.slain[kind] || 0;
        return h("div", { class: "dg-beast px" + (n ? "" : " unknown") },
          h("img", { src: portrait(kind, k), alt: n ? name : "Unknown monster", width: 64, height: 64 }),
          h("div", null, h("b", null, n ? name : "???"), h("small", null, n ? `Beaten ${n}×` : "Not met yet"), n ? h("p", null, tip) : null));
      })));
    }

    /* ---------- input ---------- */
    const onDown = (e) => {
      const tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (phase === "reveal") return;
      if (phase === "clear" && offer && menuEl.classList.contains("dg-enchanting") && ["1", "2", "3"].includes(k) && offer[+k - 1]) { pickPerk(offer[+k - 1], run.floor + 1); return; }
      if (phase === "play" && Object.values(KEYS).some((a) => a.includes(k))) e.preventDefault();
      keys.add(k);
    };
    const onUp = (e) => keys.delete(e.key.toLowerCase());
    const clearKeys = () => keys.clear();
    document.addEventListener("keydown", onDown); document.addEventListener("keyup", onUp); window.addEventListener("blur", clearKeys);
    const toWorld = (e) => { const r = canvas.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
    canvas.addEventListener("mousemove", (e) => { const m = toWorld(e); mouse.x = m.x; mouse.y = m.y; mouse.seen = 3; });
    canvas.addEventListener("mousedown", (e) => { const m = toWorld(e); mouse.x = m.x; mouse.y = m.y; mouse.seen = 3; keys.add(e.button === 2 ? (run && !run.ab.spin && run.ab.beam ? "i" : "k") : "j"); canvas.focus({ preventScroll: true }); e.preventDefault(); });
    const onMouseUp = (e) => { if (e.button === 2) { keys.delete("k"); keys.delete("i"); } else keys.delete("j"); };
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    const holdBtn = (label, key, cls) => {
      const b = h("button", { class: "btn dg-touch " + (cls || ""), type: "button" }, label);
      const on = (e) => { e.preventDefault(); keys.add(key); }, off = (e) => { e.preventDefault(); keys.delete(key); };
      b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
      return b;
    };
    const pad = h("div", { class: "dg-pad" },
      h("div", { class: "dg-dpad" }, holdBtn("▲", "arrowup", "u"), holdBtn("◀", "arrowleft", "l"), holdBtn("▶", "arrowright", "r"), holdBtn("▼", "arrowdown", "d")),
      h("div", { class: "dg-acts" }, h("div", { class: "dg-acts-row" }, holdBtn("Beam", "i"), holdBtn("Spin", "k"), holdBtn("Bolt", "o")), h("div", { class: "dg-acts-row" }, holdBtn("Dash", "l"), holdBtn("Swing", "j", "primary"))));
    const SND_ON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
    const SND_OFF = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>';
    const soundBtn = h("button", { class: "dg-fs", type: "button", "aria-label": "Turn sound on", onclick: () => {
      soundOn = !soundOn; soundBtn.innerHTML = soundOn ? SND_ON : SND_OFF; soundBtn.setAttribute("aria-label", soundOn ? "Turn sound off" : "Turn sound on"); if (soundOn) SFX.perk(); canvas.focus({ preventScroll: true });
    } });
    soundBtn.innerHTML = SND_OFF;

    /* full screen: the real Fullscreen API where it exists, a fixed overlay where it doesn't (iPhone) */
    const FS_IN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
    const FS_OUT = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
    const stageEl = h("div", { class: "dg-stage px" }, canvas, hudCv, menuEl);
    const playEl = h("div", { class: "dg-play" }, stageEl, pad);
    const isFull = () => document.fullscreenElement === playEl || playEl.classList.contains("dg-full");
    const fsCorner = h("button", { class: "dg-fs", type: "button", "aria-label": "Full screen", onclick: () => toggleFull() });
    stageEl.append(h("div", { class: "dg-corner" }, soundBtn, fsCorner));
    function syncFull() {
      const on = isFull();
      fsCorner.innerHTML = on ? FS_OUT : FS_IN; fsCorner.setAttribute("aria-label", on ? "Exit full screen" : "Full screen");
      document.body.classList.toggle("dg-locked", playEl.classList.contains("dg-full"));
      canvas.focus({ preventScroll: true });
    }
    function toggleFull() {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (playEl.classList.contains("dg-full")) playEl.classList.remove("dg-full");
      else if (playEl.requestFullscreen && document.fullscreenEnabled) playEl.requestFullscreen().catch(() => playEl.classList.add("dg-full")).then(syncFull);
      else playEl.classList.add("dg-full");
      syncFull(); wake();
    }
    /* in full screen the sound and exit buttons (and the mouse pointer) fade out after a moment; moving or tapping brings them back */
    let idleT = 0;
    const wake = () => {
      playEl.classList.remove("dg-idle"); clearTimeout(idleT);
      if (isFull()) idleT = setTimeout(() => { if (isFull()) playEl.classList.add("dg-idle"); }, 2500);
    };
    playEl.addEventListener("pointermove", wake); playEl.addEventListener("pointerdown", wake);
    const onFsChange = () => { syncFull(); wake(); };
    document.addEventListener("fullscreenchange", onFsChange);
    const onEsc = (e) => { if (e.key === "Escape" && playEl.classList.contains("dg-full")) { playEl.classList.remove("dg-full"); syncFull(); wake(); } };
    document.addEventListener("keydown", onEsc);
    syncFull();

    NDC._dg = { get run() { return run; }, get phase() { return phase; }, get offer() { return offer; }, keys, start, pickPerk, step: (dt, n) => { for (let i = 0; i < n && run; i++) { if (phase === "play") update(dt); else break; } } }; // handles for automated playtests
    /* switching theme mid-game: redraw the room, the knight and the menus right away */
    const onTheme = () => {
      makeSprite();
      if (run) { run.day = day(); run.theme = themeOf(run.floor); bg = ART.build(run.floor, day()); } else bg = null;
      if (phase === "menu" || phase === "clear" || phase === "dead") drawMenu();
      drawBeasts();
    };
    document.addEventListener("ndc-theme", onTheme);
    makeSprite(); drawStat(); drawMenu(); drawBeasts();
    raf = requestAnimationFrame(loop);

    const root = h("div", { class: "page dg-page" }, h("div", { class: "wrap", style: { maxWidth: "1040px" } },
      h("h1", { class: "sr" }, "Dungeon"),
      statEl,
      playEl,
      beastEl));

    return {
      el: root,
      destroy() {
        alive = false; cancelAnimationFrame(raf); clearTimeout(idleT);
        document.removeEventListener("keydown", onDown); document.removeEventListener("keyup", onUp); window.removeEventListener("blur", clearKeys); window.removeEventListener("mouseup", onMouseUp); document.removeEventListener("ndc-theme", onTheme);
        document.removeEventListener("fullscreenchange", onFsChange); document.removeEventListener("keydown", onEsc);
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        document.body.classList.remove("dg-locked");
        commit();
      },
    };
  };
})();
