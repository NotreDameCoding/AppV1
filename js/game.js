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

  /* ---- the knight ----
     Everyone gets the same knight. There is no shop and nothing to level up in the Dungeon: these numbers are
     the whole kit, and Floor 5 is tuned (see tools/dungeon-sim.py) so a player who dodges, blocks and chains
     swings can beat it with exactly this. */
  G.KIT = {
    helm:   { id: "crowned",   name: "Crown",            hp: 150 },
    shield: { id: "starlight", name: "Starlight shield", block: 0.8, cost: 22, arc: 110, parry: 180 },
    weapon: { id: "steel",     name: "Steel sword",      dmg: 4, swing: 260, reach: 1.1 },
    cape:   { id: "royal",     name: "Black cape",       speed: 0.08 },
    armor:  { id: "obsidian",  name: "Obsidian armor",   def: 0.2 },
  };
  G.BASE_HP = 170; G.BASE_STAMINA = 240; G.STAMINA_REGEN = 70; // regen is per second, and only starts half a second after you last swing, block or dash
  G.LOOK = { helm: "crowned", shield: "starlight", weapon: "steel", cape: "royal", armor: "obsidian" };
  G.loadout = () => ({ eq: G.LOOK, weapon: G.KIT.weapon, shield: G.KIT.shield, hp: G.KIT.helm.hp, def: G.KIT.armor.def, speed: G.KIT.cape.speed });
  G.isOfficer = () => !!(NDC.auth && NDC.auth.officer);

  /* ---- Dungeon ---- */
  G.FLOORS = 5;
  G.FLOOR_NAMES = ["Slime Cellar", "Mossy Halls", "Goblin Camp", "Deep Warrens", "The Goblin King"];
  G.FLOOR_GLOW = ["#5fe0c8", "#9bff7a", "#ff9a3d", "#c07dff", "#ffcf5a"];
  G.gameStats = function (state) {
    const gm = state.game || {};
    return { best: gm.best || 0, kills: gm.kills || 0 };
  };
  NDC.courseById = (id) => NDC.courses.find((c) => c.id === id);

  /* ---- XP for a lesson ---- */
  G.lessonXp = (acc, firstTime) => (firstTime ? 15 + Math.round(acc * 10) + (acc >= 1 ? 5 : 0) : 0);
})();
