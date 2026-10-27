(function () {
  const h = NDC.h, G = NDC.game;

  /* the hero knight cycles through every piece of gear when clicked (a preview; real gear is earned) */
  const TRY = [
    { helm: "iron", shield: "cobalt", weapon: "steel", cape: "red", armor: "cobalt" },
    { helm: "plumed", shield: "crimson", weapon: "flame", cape: "royal", armor: "crimson" },
    { helm: "horned", shield: "starlight", weapon: "spark", cape: "none", armor: "obsidian" },
    { helm: "crowned", shield: "oak", weapon: "steel", cape: "gold", armor: "gold" },
    { helm: "squire", shield: "oak", weapon: "wood", cape: "none", armor: "steel" },
    { helm: "iron", shield: "cobalt", weapon: "spark", cape: "royal", armor: "emerald" },
  ];

  function pathTile(course, state) {
    const cs = G.courseStats(state, course);
    return h("a", { class: "lang-tile px", href: "#/learn/" + course.id, style: { "--cc": course.hex } },
      NDC.ring(cs.pct, course.hex, course.glyph),
      h("div", null,
        h("h3", null, course.name),
        h("p", null, course.tagline),
        h("p", { class: "rank" }, cs.done ? `${cs.done} of ${cs.total} lessons · ${cs.rank}` : `${cs.total} lessons`)));
  }

  NDC.pages.home = function () {
    const st = NDC.store.get();
    const stats = NDC.store.stats();
    let tryIdx = 0;
    const knightBtn = h("button", { class: "knight-wrap", type: "button", "aria-label": "Try on different gear" });
    const draw = (eq) => { NDC.clear(knightBtn); knightBtn.append(NDC.knight.node(eq)); };
    draw(stats.lessons ? NDC.store.equipped() : TRY[TRY.length - 1]);
    knightBtn.addEventListener("click", () => { draw(TRY[tryIdx % TRY.length]); tryIdx++; });

    // where to pick up
    const started = NDC.courses.map((c) => ({ c, last: Math.max(0, ...NDC.allLessons(c).map((l) => (st.done[l.id] || {}).at || 0)) })).filter((x) => x.last > 0).sort((a, b) => b.last - a.last);
    const resumeCourse = started.length ? started[0].c : null;
    const resumeLesson = resumeCourse ? NDC.store.nextLesson(resumeCourse) : null;

    const hero = h("section", { class: "hero" }, h("div", { class: "wrap" },
      h("div", null,
        h("h1", null, "Code your way up the ranks."),
        h("p", { class: "lede" }, "Six languages, one club. Learn a little at a time, earn gear for your knight, and build things with other members of Notre Dame Coding."),
        h("div", { class: "cta" },
          resumeLesson
            ? h("a", { class: "btn primary", href: "#/learn/" + resumeCourse.id }, `Continue ${resumeCourse.name}`)
            : h("a", { class: "btn primary", href: "#/learn" }, "Start learning"),
          h("a", { class: "btn", href: "#/meetings" }, "See meetings"))),
      h("div", { class: "stage" },
        h("span", { class: "float-chip px a" }, "+25 XP"),
        h("span", { class: "float-chip px b" }, "Level up!"),
        h("span", { class: "float-chip px c" }, "7 day streak"),
        knightBtn,
        h("div", { class: "platform px" }),
        h("p", { class: "hint" }, "Click the knight to try on gear. Earn the real thing by learning."))));

    const today = NDC.dayKey();
    const next = NDC.meetings.find((m) => m.date >= today);
    const meetCard = next
      ? h("div", { class: "next-meet" },
        h("div", { class: "datebox px" }, h("div", { class: "m" }, NDC.parseDay(next.date).toLocaleDateString(undefined, { month: "short" })), h("div", { class: "d" }, String(NDC.parseDay(next.date).getDate()))),
        h("div", null, h("h3", { style: { fontFamily: "var(--f-display)", fontSize: "1.9rem", lineHeight: 1.1 } }, next.title), h("p", { class: "muted", style: { marginTop: "0.3rem" } }, next.note), h("p", { class: "muted", style: { marginTop: "0.3rem", fontSize: "0.95rem" } }, NDC.config.meetingInfo)),
        h("a", { class: "btn", href: "#/meetings" }, "All meetings"))
      : h("div", null, h("p", { class: "muted" }, "No meetings are scheduled yet. Check back soon."));

    const projects = NDC.projects.length
      ? h("p", { class: "muted" }, `${NDC.projects.length} projects shared so far.`)
      : h("p", { class: "muted" }, "Nothing has been shared yet. The first one is yours to build.");

    return h("div", null,
      hero,
      h("section", { class: "page", style: { paddingBottom: "3.5rem" } }, h("div", { class: "wrap" },
        h("h2", { class: "sec" }, "Pick a path"),
        h("div", { class: "shelf" }, NDC.courses.map((c) => pathTile(c, st))))),
      h("section", { class: "band" }, h("div", { class: "wrap", style: { padding: "2.6rem 0" } },
        h("h2", { class: "sec", style: { marginBottom: "1.2rem" } }, "Next meeting"), meetCard)),
      h("section", { class: "page", style: { paddingTop: "2.6rem" } }, h("div", { class: "wrap row", style: { justifyContent: "space-between", gap: "1.5rem" } },
        h("div", null, h("h2", { class: "sec", style: { marginBottom: "0.5rem" } }, "Club projects"), projects),
        h("a", { class: "btn", href: "#/projects" }, "Open the project board"))));
  };
})();
