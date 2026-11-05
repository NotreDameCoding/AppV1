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

  // pixel embers rising off the knight (purely decorative)
  function embers() {
    const el = h("div", { class: "embers", "aria-hidden": "true" });
    for (let i = 0; i < 22; i++) {
      const x = 8 + ((i * 37) % 84);           // spread across the knight's width
      const size = [3, 4, 5, 4, 6][i % 5];
      el.append(h("i", { class: i % 4 === 0 ? "dim" : "", style: {
        left: x + "%", width: size + "px", height: size + "px",
        animationDuration: (3.2 + (i % 6) * 0.55) + "s", animationDelay: -((i * 0.73) % 5) + "s",
        "--sway": ((i % 2 ? 1 : -1) * (6 + (i % 3) * 5)) + "px",
      } }));
    }
    return el;
  }

  function projectCard(p) {
    return h("a", { class: "mini-proj px", href: "#/projects" },
      h("h3", null, p.title),
      h("p", { class: "by" }, (p.authors || []).join(", ")),
      p.blurb ? h("p", { class: "blurb" }, p.blurb) : null,
      h("div", { class: "tags" }, (p.languages || []).map((l) => {
        const c = NDC.courseById(l);
        return c ? h("span", { class: "tag-l", style: { "--cc": c.color } }, c.name) : null;
      })));
  }

  // stacking sections: each one pins once its bottom is on screen, so the next slides over it
  function stack(root) {
    const set = () => {
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 68;
      root.querySelectorAll(".stack").forEach((el) => el.style.setProperty("--stick", Math.min(navH, window.innerHeight - el.offsetHeight) + "px"));
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }

  NDC.pages.home = function () {
    const st = NDC.store.get();
    const stats = NDC.store.stats();
    const knightBtn = h("div", { class: "knight-wrap" }, NDC.knight.node(NDC.store.equipped()));
    const totalLessons = NDC.courses.reduce((n, c) => n + NDC.allLessons(c).length, 0);

    // where to pick up
    const started = NDC.courses.map((c) => ({ c, last: Math.max(0, ...NDC.allLessons(c).map((l) => (st.done[l.id] || {}).at || 0)) })).filter((x) => x.last > 0).sort((a, b) => b.last - a.last);
    const resumeCourse = started.length ? started[0].c : null;
    const resumeLesson = resumeCourse ? NDC.store.nextLesson(resumeCourse) : null;

    const hero = h("section", { class: "hero stack" }, h("div", { class: "wrap" },
      h("div", { class: "hero-copy" },
        h("p", { class: "eyebrow pixel" }, "Learn \u00b7 Build \u00b7 Play"),
        h("h1", null, "Notre Dame High School Coding Club"),
        h("p", { class: "lede" }, `We meet to learn and build with Python, Java, JavaScript, HTML, CSS and Arduino. ${NDC.config.meetingInfo}.`),
        h("div", { class: "cta" },
          resumeLesson
            ? h("a", { class: "btn primary", href: "#/learn/" + resumeCourse.id }, `Continue ${resumeCourse.name}`)
            : h("a", { class: "btn primary", href: "#/learn" }, "Start learning"),
          h("a", { class: "btn", href: "#/dungeon" }, "Enter the dungeon")),
        h("dl", { class: "hero-stats" },
          h("div", null, h("dt", null, "Languages"), h("dd", { class: "pixel" }, NDC.courses.length)),
          h("div", null, h("dt", null, "Lessons"), h("dd", { class: "pixel" }, totalLessons)),
          h("div", null, h("dt", null, "Projects"), h("dd", { class: "pixel" }, NDC.projects.length)))),
      h("div", { class: "stage" },
        h("div", { class: "knight-box" }, embers(), knightBtn),
        h("div", { class: "platform px" }),
        h("p", { class: "hint" }, `Level ${stats.level} ${G.title(stats.level)} · ${stats.streak} day streak`))));

    const recent = NDC.projects.slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))).slice(0, 3);

    const root = h("div", { class: "home" },
      hero,
      h("section", { class: "page paths stack" }, h("div", { class: "wrap" },
        h("div", { class: "sec-row" }, h("h2", { class: "sec" }, "Pick a path"), h("a", { class: "more", href: "#/learn" }, "All lessons →")),
        h("div", { class: "shelf" }, NDC.courses.map((c) => pathTile(c, st))))),
      h("section", { class: "page projects stack" }, h("div", { class: "wrap" },
        h("div", { class: "sec-row" },
          h("div", null, h("h2", { class: "sec" }, "Club projects"),
            h("p", { class: "muted" }, NDC.projects.length ? `${NDC.projects.length} project${NDC.projects.length === 1 ? "" : "s"} shared so far.` : "No projects yet.")),
          h("a", { class: "btn", href: "#/projects" }, "Open the project board")),
        recent.length ? h("div", { class: "mini-projs" }, recent.map(projectCard)) : null)));

    let unstack = null;
    requestAnimationFrame(() => { unstack = stack(root); });
    return { el: root, destroy() { if (unstack) unstack(); } };
  };
})();
