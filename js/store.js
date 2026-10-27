/* Progress store. One small object per person; everything else is derived from it (see game.js).
   Saved in this browser always, and synced to Supabase when real sign-in is on. */
(function () {
  const KEY = "ndc.hub.v1.";
  const mem = {}; // fallback if localStorage is blocked
  const blank = () => ({ v: 1, name: "", done: {}, skipped: {}, days: {}, equipped: {}, bought: {}, answers: { total: 0, correct: 0 }, updated: 0 });

  let identity = "guest";
  let state = blank();
  let remote = null; // { push(state) } set by auth when signed in for real
  let pushTimer = null;

  function read(id) {
    let raw = null;
    try { raw = localStorage.getItem(KEY + id); } catch (e) { raw = mem[id] || null; }
    if (!raw) return blank();
    try { return Object.assign(blank(), JSON.parse(raw)); } catch (e) { return blank(); }
  }
  function write() {
    const raw = JSON.stringify(state);
    try { localStorage.setItem(KEY + identity, raw); } catch (e) { mem[identity] = raw; }
    if (remote) { clearTimeout(pushTimer); pushTimer = setTimeout(() => remote.push(state).catch(() => {}), 700); }
  }

  /* merge two saves of the same person: keep the best of each, so nothing is ever lost */
  function merge(a, b) {
    const out = blank();
    out.name = a.name || b.name;
    for (const src of [a, b]) {
      for (const [id, d] of Object.entries(src.done || {})) {
        const cur = out.done[id];
        if (!cur || (d.acc || 0) > (cur.acc || 0) || ((d.acc || 0) === (cur.acc || 0) && (d.xp || 0) > (cur.xp || 0))) out.done[id] = d;
      }
      Object.assign(out.skipped, src.skipped || {});
      for (const [k, v] of Object.entries(src.days || {})) out.days[k] = { lessons: Math.max(v.lessons || 0, (out.days[k] || {}).lessons || 0) };
      Object.assign(out.equipped, src.equipped || {});
      Object.assign(out.bought, src.bought || {});
      out.answers = { total: Math.max(out.answers.total, (src.answers || {}).total || 0), correct: Math.max(out.answers.correct, (src.answers || {}).correct || 0) };
    }
    for (const id of Object.keys(out.done)) delete out.skipped[id];
    out.updated = Date.now();
    return out;
  }

  const S = (NDC.store = {
    get: () => state,
    identity: () => identity,
    stats: () => NDC.game.stats(state),
    equipped() { return NDC.game.equippedFor(state); },
    setRemote(r) { remote = r; },
    /* switch to another person's save. If the person is new, they inherit what they did as a guest. */
    setIdentity(id, opts) {
      opts = opts || {};
      const guest = identity === "guest" ? state : read("guest");
      identity = id;
      let next = read(id);
      if (opts.inheritGuest && Object.keys(next.done).length === 0) next = merge(next, guest);
      if (opts.remoteState) next = merge(next, opts.remoteState);
      state = next;
      write();
      NDC.bus.emit("progress", S.stats());
    },
    update(fn) {
      fn(state);
      state.updated = Date.now();
      write();
      NDC.bus.emit("progress", S.stats());
    },
    replace(next) { state = next; write(); NDC.bus.emit("progress", S.stats()); },
    merge,
    exportJSON: () => JSON.stringify(state, null, 2),
    reset() { state = blank(); write(); NDC.bus.emit("progress", S.stats()); },

    isDone: (id) => !!state.done[id],
    isUnlocked(course, lessonId) {
      const all = NDC.allLessons(course);
      const i = all.findIndex((l) => l.id === lessonId);
      if (i <= 0) return i === 0;
      const prev = all[i - 1].id;
      return !!(state.done[prev] || state.skipped[prev]);
    },
    nextLesson(course) { return NDC.allLessons(course).find((l) => !state.done[l.id] && !state.skipped[l.id]) || null; },
    skipTo(course, lessonId) {
      const all = NDC.allLessons(course);
      const i = all.findIndex((l) => l.id === lessonId);
      S.update((s) => { all.slice(0, i).forEach((l) => { if (!s.done[l.id]) s.skipped[l.id] = true; }); });
    },

    /* spend coins on a piece of gear and wear it. Returns false if it can't be bought. */
    buy(slot, id) {
      const g = NDC.game.gear[slot].find((x) => x.id === id);
      const key = slot + ":" + id;
      if (!g || state.bought[key]) return false;
      if (S.stats().coins < g.price) return false;
      S.update((s) => { s.bought[key] = true; s.equipped = Object.assign({}, s.equipped, { [slot]: id }); });
      return true;
    },

    /* called when a lesson finishes. Returns what changed so the finish screen can celebrate it. */
    completeLesson(lessonId, result) {
      const before = S.stats();
      const first = !state.done[lessonId];
      const acc = result.total ? result.firstTry / result.total : 1;
      const xp = Math.max(NDC.game.lessonXp(acc, true), (state.done[lessonId] || {}).xp || 0);
      S.update((s) => {
        const cur = s.done[lessonId];
        if (!cur || acc > cur.acc || xp > cur.xp) s.done[lessonId] = { acc: Math.max(acc, cur ? cur.acc : 0), xp, at: Date.now() };
        delete s.skipped[lessonId];
        const k = NDC.dayKey();
        s.days[k] = { lessons: ((s.days[k] || {}).lessons || 0) + 1 };
        s.answers = { total: s.answers.total + result.attempts, correct: s.answers.correct + result.firstTry };
      });
      const after = S.stats();
      return {
        first, acc, xpGained: after.xp - before.xp,
        levelUp: after.level > before.level ? after.level : 0,
        coinsGained: after.coinsEarned - before.coinsEarned,
        newBadges: after.badges.filter((b) => !before.badges.includes(b)),
        stats: after,
      };
    },
  });

  NDC.allLessons = (course) => course.units.flatMap((u) => u.lessons);
  NDC.findLesson = (id) => {
    for (const c of NDC.courses) for (const u of c.units) for (const l of u.lessons) if (l.id === id) return { course: c, unit: u, lesson: l };
    return null;
  };

  S.setIdentity("guest");
})();
