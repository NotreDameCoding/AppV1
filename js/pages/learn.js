(function () {
  const h = NDC.h, G = NDC.game;
  const DX = [0, 52, 84, 52, 0, -52, -84, -52];
  const LAST = "ndc.hub.lastCourse";

  function lastCourseId() {
    try { return localStorage.getItem(LAST); } catch (e) { return null; }
  }

  function openLesson(course, unit, lesson, idx, state) {
    const unlocked = NDC.store.isUnlocked(course, lesson.id);
    const done = state.done[lesson.id];
    const scrim = h("div", { class: "scrim", onclick: (e) => { if (e.target === scrim) close(); } });
    const close = () => { scrim.remove(); document.removeEventListener("keydown", esc); };
    const esc = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    const go = () => { close(); location.hash = "#/lesson/" + lesson.id; };
    const actions = h("div", { class: "actions" });
    if (unlocked) actions.append(h("button", { class: "btn primary block", type: "button", onclick: go }, done ? "Practice again" : "Start lesson"));
    else {
      actions.append(
        h("p", { class: "muted" }, "Finish the lessons before this one to unlock it. Already know this stuff?"),
        h("button", { class: "btn block", type: "button", onclick: () => { NDC.store.skipTo(course, lesson.id); close(); go(); } }, "Skip ahead to here"),
        h("p", { class: "muted", style: { fontSize: "0.88rem" } }, "Skipped lessons unlock the path but earn no XP and don't count toward your rank."));
    }
    actions.append(h("button", { class: "btn ghost block", type: "button", onclick: close }, "Close"));
    scrim.append(h("div", { class: "modal px", role: "dialog", "aria-modal": "true", "aria-label": lesson.title, style: { "--cc": course.hex } },
      h("p", { class: "muted" }, `${course.name} · ${unit.title}`),
      h("h3", null, lesson.title),
      h("p", { class: "muted", style: { marginTop: "0.4rem" } }, lesson.blurb),
      h("div", { class: "meta" }, h("span", null, `${lesson.ex.length} questions`),
        h("span", null, done ? `Best: ${Math.round(done.acc * 100)}% · ${done.xp} XP earned` : "Up to 30 XP")),
      actions));
    document.body.append(scrim);
  }

  function pathFor(course, state) {
    const path = h("div", { class: "path" });
    const all = NDC.allLessons(course);
    const nextId = (NDC.store.nextLesson(course) || {}).id;
    let n = 0;
    course.units.forEach((unit, ui) => {
      const doneIn = unit.lessons.filter((l) => state.done[l.id]).length;
      path.append(h("div", { class: "unit-banner px", style: { "--cc": course.hex } },
        h("div", null, h("p", { class: "u pixel" }, `Unit ${ui + 1}`), h("h3", null, unit.title), h("p", null, unit.blurb)),
        h("span", { class: "chip px", style: { color: course.hex } }, `${doneIn}/${unit.lessons.length}`)));
      unit.lessons.forEach((lesson) => {
        const isDone = !!state.done[lesson.id], isSkipped = !isDone && !!state.skipped[lesson.id];
        const unlocked = NDC.store.isUnlocked(course, lesson.id);
        const isCurrent = lesson.id === nextId;
        const cls = "node px" + (isDone ? " done" : isSkipped ? " skipped" : !unlocked ? " locked" : "") + (isCurrent ? " current" : "");
        const idx = n++;
        const glyph = isDone ? NDC.svg('<svg viewBox="0 0 9 7" shape-rendering="crispEdges" width="34" height="27"><path fill="#0b0e1a" d="M7 0h2v2H8v1H7v1H6v1H5v1H4v1H2V6H1V5H0V3h2v1h1v1h1V4h1V3h1V2h1z"/></svg>') : isSkipped ? ">>" : unlocked ? String(all.indexOf(lesson) + 1) : "#";
        const btn = h("button", { class: cls, type: "button", "aria-label": `${lesson.title}${isDone ? ", completed" : !unlocked ? ", locked" : ""}`, onclick: () => openLesson(course, unit, lesson, idx, state) },
          h("span", { class: "ic" }, glyph));
        path.append(h("div", { class: "node-slot" + (unlocked || isDone ? "" : " locked-slot"), style: { "--dx": DX[idx % DX.length] + "px", "--cc": course.hex } },
          isCurrent ? h("span", { class: "start-flag px", style: { "--fill": "var(--gold)", "--edge": "var(--gold)" } }, "Start") : null,
          btn, h("span", { class: "node-label" }, lesson.title)));
      });
    });
    return path;
  }

  NDC.pages.learn = function (courseId) {
    const state = NDC.store.get();
    const stats = NDC.store.stats();
    let course = NDC.courseById(courseId) || NDC.courseById(lastCourseId()) || NDC.courses[0];
    try { localStorage.setItem(LAST, course.id); } catch (e) {}

    const nav = h("nav", { class: "course-nav", "aria-label": "Languages" }, NDC.courses.map((c) => {
      const cs = G.courseStats(state, c);
      return h("a", { class: "course-btn px", href: "#/learn/" + c.id, "aria-current": c.id === course.id ? "true" : null, style: { "--cc": c.hex } },
        NDC.ring(cs.pct, c.hex, c.glyph), h("span", null, h("span", { class: "nm" }, c.name), h("br"), h("span", { class: "sub" }, cs.done ? cs.rank : `${cs.total} lessons`)));
    }));

        const today = (state.days[NDC.dayKey()] || {}).lessons || 0;
    const side = h("aside", { class: "side-card" },
      h("div", { class: "card px", style: { textAlign: "center" } },
        h("div", { class: "knight-mini" }, NDC.knight.node(NDC.store.equipped())),
        h("p", { class: "pixel", style: { fontSize: "1.2rem", marginTop: "0.5rem" } }, `Level ${stats.level} ${G.title(stats.level)}`),
        h("div", { class: "bar px", style: { margin: "0.6rem 0 0.3rem" } }, h("i", { style: { width: Math.round(stats.levelPct * 100) + "%" } })),
        h("p", { class: "muted", style: { fontSize: "0.88rem" } }, `${stats.levelSpan - stats.levelInto} XP to level ${stats.level + 1}`)),
      h("div", { class: "card px" },
        h("div", { class: "statline" }, h("span", null, "Total XP"), h("b", { class: "pixel" }, stats.xp)),
        h("div", { class: "statline" }, h("span", null, "Day streak"), h("b", { class: "pixel" }, stats.streak)),
        h("div", { class: "statline" }, h("span", null, "Lessons today"), h("b", { class: "pixel" }, today)),
        h("div", { class: "statline" }, h("span", null, "Accuracy"), h("b", { class: "pixel" }, stats.answers.total ? Math.round((100 * stats.answers.correct) / stats.answers.total) + "%" : "-"))),
      h("div", { class: "card px" },
        h("div", { class: "statline" }, h("span", null, "Coins"), h("b", { class: "pixel" }, stats.coins)),
        h("a", { class: "link-btn", href: "#/knight", style: { marginTop: "0.4rem", display: "inline-block" } }, "Spend them on the Knight page")));

    const cs = G.courseStats(state, course);
    const head = h("div", { style: { marginBottom: "1.8rem" } },
      h("h1", { style: { fontFamily: "var(--f-display)", fontSize: "clamp(2.4rem,5vw,3.6rem)", lineHeight: 1 } }, course.name),
      h("p", { class: "muted", style: { marginTop: "0.5rem" } }, course.tagline),
      h("p", { class: "muted", style: { marginTop: "0.3rem", fontSize: "0.95rem" } }, `${cs.done} of ${cs.total} lessons · ${cs.rank}` + (course.runnable ? "" : " · No code editor for this one. You'll read, predict, and order real code.")));

    return h("div", { class: "page" }, h("div", { class: "wrap learn-layout" }, nav, h("div", null, head, pathFor(course, state)), side));
  };
})();
