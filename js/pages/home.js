(function () {
  const h = NDC.h, G = NDC.game;

  function pathTile(course, state) {
    const cs = G.courseStats(state, course);
    return h("a", { class: "lang-tile px", href: "#/learn/" + course.id, style: { "--cc": course.color } },
      NDC.ring(cs.pct, course.color, course.glyph),
      h("div", null,
        h("h3", null, course.name),
        h("p", null, course.tagline),
        h("p", { class: "rank" }, cs.done ? `${cs.done} of ${cs.total} lessons · ${cs.rank}` : `${cs.total} lessons`)));
  }

  NDC.pages.home = function () {
    const st = NDC.store.get();
    const stats = NDC.store.stats();
    const knightBtn = h("div", { class: "knight-wrap" }, NDC.knight.node(NDC.store.equipped()));

    // where to pick up
    const started = NDC.courses.map((c) => ({ c, last: Math.max(0, ...NDC.allLessons(c).map((l) => (st.done[l.id] || {}).at || 0)) })).filter((x) => x.last > 0).sort((a, b) => b.last - a.last);
    const resumeCourse = started.length ? started[0].c : null;
    const resumeLesson = resumeCourse ? NDC.store.nextLesson(resumeCourse) : null;

    const hero = h("section", { class: "hero" }, h("div", { class: "wrap" },
      h("div", null,
        h("h1", null, "Notre Dame High School Coding Club"),
        h("p", { class: "lede" }, `We meet to learn and build with Python, Java, JavaScript, HTML, CSS and Arduino. ${NDC.config.meetingInfo}.`),
        h("div", { class: "cta" },
          resumeLesson
            ? h("a", { class: "btn primary", href: "#/learn/" + resumeCourse.id }, `Continue ${resumeCourse.name}`)
            : h("a", { class: "btn primary", href: "#/learn" }, "Start learning"),
          h("a", { class: "btn", href: "#/dungeon" }, "Enter the dungeon"))),
      h("div", { class: "stage" },
        knightBtn,
        h("div", { class: "platform px" }),
        h("p", { class: "hint" }, `Level ${stats.level} ${G.title(stats.level)} \u00b7 ${stats.streak} day streak`))));

    const projects = NDC.projects.length
      ? h("p", { class: "muted" }, `${NDC.projects.length} project${NDC.projects.length === 1 ? "" : "s"} shared so far.`)
      : h("p", { class: "muted" }, "No projects yet.");

    return h("div", { class: "home" },
      hero,
      h("section", { class: "page paths" }, h("div", { class: "wrap" },
        h("h2", { class: "sec" }, "Pick a path"),
        h("div", { class: "shelf" }, NDC.courses.map((c) => pathTile(c, st))))),
      h("section", { class: "band" }, h("div", { class: "wrap home-meet" },
        h("h2", { class: "sec", style: { marginBottom: "0.6rem" } }, "When we meet"), h("p", { class: "muted" }, NDC.config.meetingInfo + "."))),
      h("section", { class: "page projects" }, h("div", { class: "wrap row", style: { justifyContent: "space-between", gap: "1.5rem" } },
        h("div", null, h("h2", { class: "sec", style: { marginBottom: "0.5rem" } }, "Club projects"), projects),
        h("a", { class: "btn", href: "#/projects" }, "Open the project board"))));
  };
})();
