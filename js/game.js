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

  /* ---- gear ---- */
  // req: how to unlock. Checked against G.stats().
  const REQ = {
    level: (n) => ({ kind: "level", n, test: (s) => s.level >= n, have: (s) => s.level, text: `Reach level ${n}` }),
    lessons: (n) => ({ kind: "lessons", n, test: (s) => s.lessons >= n, have: (s) => s.lessons, text: `Finish ${n} lessons` }),
    perfect: (n) => ({ kind: "perfect", n, test: (s) => s.perfect >= n, have: (s) => s.perfect, text: `${n} flawless lessons` }),
    streak: (n) => ({ kind: "streak", n, test: (s) => s.bestStreak >= n, have: (s) => s.bestStreak, text: `${n}-day streak` }),
    course: (id, label) => ({ kind: "course", id, test: (s) => s.coursesDone.includes(id), have: (s) => (s.coursesDone.includes(id) ? 1 : 0), n: 1, text: `Finish the ${label} path` }),
    anyCourse: () => ({ kind: "any", n: 1, test: (s) => s.coursesDone.length >= 1, have: (s) => Math.min(1, s.coursesDone.length), text: "Finish any language path" }),
    badges: (n) => ({ kind: "badges", n, test: (s) => s.badges.length >= n, have: (s) => s.badges.length, text: `Earn ${n} badges` }),
    none: () => ({ kind: "none", n: 0, test: () => true, have: () => 0, text: "Starter gear" }),
  };

  G.gear = {
    helm: [
      { id: "squire", name: "Squire's cap", req: REQ.none() },
      { id: "iron", name: "Iron helm", req: REQ.level(2) },
      { id: "plumed", name: "Plumed helm", req: REQ.lessons(8) },
      { id: "horned", name: "Horned helm", req: REQ.streak(7) },
      { id: "crowned", name: "Gold crest", req: REQ.anyCourse() },
    ],
    shield: [
      { id: "oak", name: "Oak shield", req: REQ.none() },
      { id: "cobalt", name: "Cobalt shield", req: REQ.lessons(4) },
      { id: "crimson", name: "Crimson shield", req: REQ.perfect(3) },
      { id: "starlight", name: "Starlight shield", req: REQ.badges(6) },
    ],
    weapon: [
      { id: "wood", name: "Practice sword", req: REQ.none() },
      { id: "steel", name: "Steel sword", req: REQ.level(3) },
      { id: "flame", name: "Flame blade", req: REQ.course("py", "Python") },
      { id: "spark", name: "Spark staff", req: REQ.course("ar", "Arduino") },
    ],
    cape: [
      { id: "none", name: "No cape", req: REQ.none() },
      { id: "red", name: "Red cape", req: REQ.lessons(6) },
      { id: "royal", name: "Royal cape", req: REQ.level(5) },
      { id: "gold", name: "Gold cape", req: REQ.streak(14) },
    ],
    armor: [
      { id: "steel", name: "Steel", req: REQ.none() },
      { id: "cobalt", name: "Cobalt", req: REQ.level(2) },
      { id: "emerald", name: "Emerald", req: REQ.lessons(12) },
      { id: "crimson", name: "Crimson", req: REQ.level(4) },
      { id: "obsidian", name: "Obsidian", req: REQ.perfect(8) },
      { id: "gold", name: "Gold", req: REQ.level(6) },
    ],
  };
  G.SLOTS = [
    { id: "helm", label: "Helmet" }, { id: "shield", label: "Shield" }, { id: "weapon", label: "Weapon" },
    { id: "cape", label: "Cape" }, { id: "armor", label: "Armor" },
  ];
  G.owned = function (stats) {
    const o = {};
    for (const slot of Object.keys(G.gear)) G.gear[slot].forEach((g) => { if (g.req.test(stats)) (o[slot] = o[slot] || []).push(g.id); });
    return o;
  };
  G.defaults = { helm: "squire", shield: "oak", weapon: "wood", cape: "none", armor: "steel" };
  G.equippedFor = function (state, stats) {
    const own = G.owned(stats), eq = {};
    for (const slot of Object.keys(G.defaults)) {
      const want = state.equipped && state.equipped[slot];
      eq[slot] = want && own[slot] && own[slot].includes(want) ? want : G.defaults[slot];
    }
    return eq;
  };
  // ids of everything unlocked, as "slot:id", for spotting new unlocks
  G.ownedKeys = (stats) => { const o = G.owned(stats); return Object.entries(o).flatMap(([s, ids]) => ids.map((i) => `${s}:${i}`)); };
  G.findGear = (key) => { const [slot, id] = key.split(":"); return { slot, ...G.gear[slot].find((g) => g.id === id) }; };


  /* locked gear, closest to unlocking first */
  G.nextUnlocks = function (stats) {
    const out = [];
    for (const slot of Object.keys(G.gear)) G.gear[slot].forEach((g) => {
      if (g.req.test(stats)) return;
      const have = g.req.have(stats), need = g.req.n || 1;
      out.push({ slot, gear: g, have, need, ratio: Math.min(1, have / need) });
    });
    return out.sort((a, b) => b.ratio - a.ratio || a.need - b.need);
  };
  NDC.courseById = (id) => NDC.courses.find((c) => c.id === id);

  /* ---- XP for a lesson ---- */
  G.lessonXp = (acc, firstTime) => (firstTime ? 15 + Math.round(acc * 10) + (acc >= 1 ? 5 : 0) : 0);
})();
