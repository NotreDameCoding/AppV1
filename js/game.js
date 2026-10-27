/* Levels, ranks, badges and knight gear.
   Everything here is DERIVED from the saved progress, so it can never drift out of sync. */
(function () {
  const G = (NDC.game = {});

  /* ---- levels ---- */
  G.xpForLevel = (L) => 25 * (L - 1) * L; // L1 = 0, L2 = 50, L3 = 150, L4 = 300 ...
  G.levelFromXp = (xp) => { let L = 1; while (xp >= G.xpForLevel(L + 1)) L++; return L; };
  G.levelProgress = (xp) => {
    const L = G.levelFromXp(xp), a = G.xpForLevel(L), b = G.xpForLevel(L + 1);
    return { level: L, into: xp - a, span: b - a, pct: (xp - a) / (b - a) };
  };
  const TITLES = ["Page", "Page", "Squire", "Squire", "Knight", "Knight", "Banneret", "Champion", "Champion", "Paladin"];
  G.title = (L) => TITLES[Math.min(L, TITLES.length) - 1] || "Paladin";

  /* ---- proficiency per language ---- */
  G.RANKS = [
    { min: 0, name: "Unranked" },
    { min: 0.01, name: "Novice" },
    { min: 0.34, name: "Apprentice" },
    { min: 0.67, name: "Adept" },
    { min: 1, name: "Master" },
  ];
  G.courseStats = function (state, course) {
    const lessons = NDC.allLessons(course);
    const done = lessons.filter((l) => state.done[l.id]);
    const skipped = lessons.filter((l) => !state.done[l.id] && state.skipped[l.id]);
    const pct = lessons.length ? done.length / lessons.length : 0;
    const acc = done.length ? done.reduce((s, l) => s + (state.done[l.id].acc || 0), 0) / done.length : 0;
    // mastery blends how much you finished with how cleanly you did it
    const mastery = pct * (0.6 + 0.4 * acc);
    let rank = "Unranked";
    if (pct === 0) rank = skipped.length ? "Self-taught" : "Unranked";
    else if (pct < 0.34) rank = "Novice";
    else if (pct < 0.67) rank = "Apprentice";
    else if (pct < 1) rank = "Adept";
    else rank = "Master";
    return { total: lessons.length, done: done.length, skipped: skipped.length, pct, acc, mastery, rank };
  };

  /* ---- streaks (derived from the days you were active) ---- */
  G.streaks = function (days) {
    const keys = Object.keys(days).sort();
    if (!keys.length) return { current: 0, best: 0 };
    const set = new Set(keys);
    let best = 0, run = 0, prev = null;
    for (const k of keys) {
      if (prev && NDC.dayKey(NDC.addDays(NDC.parseDay(prev), 1)) === k) run++; else run = 1;
      if (run > best) best = run;
      prev = k;
    }
    // current streak counts if you were active today or yesterday
    const today = new Date();
    let cur = 0, d = set.has(NDC.dayKey(today)) ? today : NDC.addDays(today, -1);
    while (set.has(NDC.dayKey(d))) { cur++; d = NDC.addDays(d, -1); }
    return { current: cur, best };
  };

  /* ---- one place that turns saved progress into numbers ---- */
  G.stats = function (state) {
    const done = Object.values(state.done);
    const xp = done.reduce((s, d) => s + (d.xp || 0), 0);
    const lv = G.levelProgress(xp);
    const st = G.streaks(state.days);
    const coursesDone = NDC.courses.filter((c) => { const s = G.courseStats(state, c); return s.total && s.done === s.total; }).map((c) => c.id);
    const coursesStarted = NDC.courses.filter((c) => G.courseStats(state, c).done > 0).length;
    const base = {
      xp, level: lv.level, levelPct: lv.pct, levelInto: lv.into, levelSpan: lv.span,
      lessons: done.length, perfect: done.filter((d) => d.acc >= 1).length,
      streak: st.current, bestStreak: st.best, coursesDone, coursesStarted,
      activeDays: Object.keys(state.days).length,
      answers: state.answers || { total: 0, correct: 0 },
    };
    base.coinsEarned = G.coinsEarned(state, base.level);
    base.coinsSpent = Object.keys(state.bought || {}).reduce((s, k) => s + (G.findGear(k).price || 0), 0);
    base.coins = Math.max(0, base.coinsEarned - base.coinsSpent);
    base.badges = G.badges.filter((b) => b.test(base)).map((b) => b.id);
    return base;
  };

  /* ---- badges ---- */
  G.badges = [
    { id: "first", glyph: "1", name: "First steps", desc: "Finish your first lesson", test: (s) => s.lessons >= 1 },
    { id: "five", glyph: "5", name: "On a roll", desc: "Finish 5 lessons", test: (s) => s.lessons >= 5 },
    { id: "twenty", glyph: "20", name: "Dedicated", desc: "Finish 20 lessons", test: (s) => s.lessons >= 20 },
    { id: "perfect", glyph: "*", name: "Flawless", desc: "Get a lesson with no mistakes", test: (s) => s.perfect >= 1 },
    { id: "perfect5", glyph: "**", name: "Sharpshooter", desc: "5 flawless lessons", test: (s) => s.perfect >= 5 },
    { id: "streak3", glyph: "3d", name: "Three days running", desc: "A 3-day streak", test: (s) => s.bestStreak >= 3 },
    { id: "streak7", glyph: "7d", name: "A full week", desc: "A 7-day streak", test: (s) => s.bestStreak >= 7 },
    { id: "poly", glyph: "3L", name: "Polyglot", desc: "Start 3 different languages", test: (s) => s.coursesStarted >= 3 },
    { id: "master1", glyph: "M", name: "Path complete", desc: "Finish every lesson in one language", test: (s) => s.coursesDone.length >= 1 },
    { id: "master3", glyph: "MMM", name: "Triple crown", desc: "Finish 3 languages", test: (s) => s.coursesDone.length >= 3 },
    { id: "level5", glyph: "L5", name: "Knighted", desc: "Reach level 5", test: (s) => s.level >= 5 },
    { id: "all", glyph: "ALL", name: "Grand master", desc: "Finish all six languages", test: (s) => s.coursesDone.length >= NDC.courses.length && NDC.courses.length > 0 },
  ];

  /* ---- coins ----
     Coins are derived too: a small drop for each lesson, a bigger payout for each level reached, minus what you spent.
     Game XP from the Dungeon never touches any of this. */
  G.lessonCoins = (acc) => 3 + (acc >= 0.8 ? 2 : 0) + (acc >= 1 ? 5 : 0);
  G.levelCoins = (L) => (L >= 2 ? 30 + 15 * L : 0);
  G.coinsEarned = (state, level) => {
    let c = Object.values(state.done).reduce((s, d) => s + G.lessonCoins(d.acc || 0), 0);
    for (let L = 2; L <= level; L++) c += G.levelCoins(L);
    return c;
  };

  /* ---- gear ----
     price: coins to buy. feel: a short word for how it plays in the Dungeon.
     Weapons: dmg, swing (ms per swing), reach (tiles). Shields: block (share of damage stopped), cost (stamina per blocked hit),
     arc (degrees covered), parry (ms of perfect-block window). Armor: def. Helm: hp. */
  const P = (price, feel, stats) => ({ price, feel, stats });
  G.gear = {
    helm: [
      { id: "squire", name: "Squire's cap", ...P(0, "Plain", { hp: 0 }) },
      { id: "iron", name: "Iron helm", ...P(50, "Sturdy", { hp: 10 }) },
      { id: "plumed", name: "Plumed helm", ...P(100, "Sturdy", { hp: 20 }) },
      { id: "horned", name: "Horned helm", ...P(160, "Tough", { hp: 30 }) },
      { id: "crowned", name: "Gold crest", ...P(250, "Mighty", { hp: 45 }) },
      { id: "dread", name: "Dread helm", ...P(320, "Fearsome", { hp: 55 }) },
    ],
    shield: [
      { id: "oak", name: "Oak shield", ...P(0, "Basic", { block: 0.5, cost: 20, arc: 100, parry: 0 }) },
      { id: "cobalt", name: "Cobalt shield", ...P(60, "Sturdy", { block: 0.7, cost: 26, arc: 100, parry: 0 }) },
      { id: "crimson", name: "Crimson shield", ...P(120, "Wide", { block: 0.55, cost: 16, arc: 180, parry: 0 }) },
      { id: "starlight", name: "Starlight shield", ...P(200, "Parry", { block: 0.8, cost: 22, arc: 110, parry: 180 }) },
    ],
    weapon: [
      { id: "wood", name: "Practice sword", ...P(0, "Balanced", { dmg: 1, swing: 380, reach: 1.0 }) },
      { id: "steel", name: "Steel sword", ...P(70, "Fast", { dmg: 2, swing: 260, reach: 1.1 }) },
      { id: "flame", name: "Flame blade", ...P(140, "Heavy", { dmg: 5, swing: 560, reach: 1.2 }) },
      { id: "spark", name: "Spark staff", ...P(220, "Wide", { dmg: 3, swing: 420, reach: 1.9 }) },
    ],
    cape: [
      { id: "none", name: "No cape", ...P(0, "Plain", { speed: 0 }) },
      { id: "red", name: "Red cape", ...P(40, "Swift", { speed: 0.04 }) },
      { id: "royal", name: "Royal cape", ...P(100, "Swift", { speed: 0.08 }) },
      { id: "gold", name: "Gold cape", ...P(200, "Swift", { speed: 0.12 }) },
      { id: "white", name: "White cape", ...P(220, "Swift", { speed: 0.12 }) },
    ],
    armor: [
      { id: "steel", name: "Steel", ...P(0, "Plain", { def: 0 }) },
      { id: "cobalt", name: "Cobalt", ...P(50, "Light", { def: 0.05 }) },
      { id: "emerald", name: "Emerald", ...P(90, "Light", { def: 0.1 }) },
      { id: "crimson", name: "Crimson", ...P(140, "Solid", { def: 0.15 }) },
      { id: "obsidian", name: "Obsidian", ...P(200, "Solid", { def: 0.2 }) },
      { id: "gold", name: "Gold", ...P(280, "Heavy", { def: 0.25 }) },
      { id: "ivory", name: "Ivory & gold", ...P(340, "Heavy", { def: 0.28 }) },
    ],
  };
  G.SLOTS = [
    { id: "helm", label: "Helmet" }, { id: "shield", label: "Shield" }, { id: "weapon", label: "Weapon" },
    { id: "cape", label: "Cape" }, { id: "armor", label: "Armor" },
  ];
  G.findGear = (key) => { const [slot, id] = key.split(":"); return { slot, ...G.gear[slot].find((g) => g.id === id) }; };
  /* officers own every piece of gear (and can enter every floor) without spending coins */
  G.isOfficer = () => !!(NDC.auth && NDC.auth.officer);
  G.owned = function (state) {
    const bought = state.bought || {}, o = {}, all = G.isOfficer();
    for (const slot of Object.keys(G.gear)) G.gear[slot].forEach((g) => { if (all || g.price === 0 || bought[slot + ":" + g.id]) (o[slot] = o[slot] || []).push(g.id); });
    return o;
  };
  G.defaults = { helm: "squire", shield: "oak", weapon: "wood", cape: "none", armor: "steel" };
  G.equippedFor = function (state) {
    const own = G.owned(state), eq = {};
    for (const slot of Object.keys(G.defaults)) {
      const want = state.equipped && state.equipped[slot];
      eq[slot] = want && own[slot] && own[slot].includes(want) ? want : G.defaults[slot];
    }
    return eq;
  };
  /* what the equipped set adds up to in the Dungeon */
  G.loadout = function (state) {
    const eq = G.equippedFor(state), f = (slot) => G.gear[slot].find((g) => g.id === eq[slot]).stats;
    return { eq, weapon: f("weapon"), shield: f("shield"), hp: f("helm").hp, def: f("armor").def, speed: f("cape").speed };
  };
  /* unowned gear, cheapest first */
  G.nextGoals = function (state) {
    const own = G.owned(state), out = [];
    for (const slot of Object.keys(G.gear)) G.gear[slot].forEach((g) => { if (!(own[slot] || []).includes(g.id)) out.push({ slot, gear: g }); });
    return out.sort((a, b) => a.gear.price - b.gear.price);
  };
  /* ---- Dungeon (game) levels. Fully separate from lessons: they never touch coins or looks. ---- */
  G.FLOORS = 5;
  G.gameXpFor = (L) => 20 * (L - 1) * L; // L2 = 40, L3 = 120, L4 = 240, L5 = 400 ...
  G.gameStats = function (state) {
    const gm = state.game || {}, xp = gm.xp || 0;
    let L = 1; while (xp >= G.gameXpFor(L + 1)) L++;
    const a = G.gameXpFor(L), b = G.gameXpFor(L + 1);
    return { xp, level: L, into: xp - a, span: b - a, pct: (xp - a) / (b - a), best: gm.best || 0, kills: gm.kills || 0,
      hpBonus: (L - 1) * 10, staminaBonus: (L - 1) * 8, floorOpen: (f) => L >= f || G.isOfficer() };
  };
  NDC.courseById = (id) => NDC.courses.find((c) => c.id === id);

  /* ---- XP for a lesson ---- */
  G.lessonXp = (acc, firstTime) => (firstTime ? 15 + Math.round(acc * 10) + (acc >= 1 ? 5 : 0) : 0);
})();
