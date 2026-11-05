(function () {
  const h = NDC.h, G = NDC.game;
  const pad2 = (n) => String(n).padStart(2, "0");
  const arrow = () => NDC.svg('<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>');

  function langRow(course, i, state) {
    const cs = G.courseStats(state, course);
    return h("li", null, h("a", { class: "lang-row", href: "#/learn/" + course.id, style: { "--cc": course.color } },
      h("span", { class: "idx pixel" }, pad2(i + 1)),
      h("span", { class: "nm" }, course.name),
      h("span", { class: "tg" }, course.tagline),
      h("span", { class: "pg pixel" }, cs.done ? `${cs.done}/${cs.total}` : `${cs.total}`),
      h("span", { class: "go" }, arrow())));
  }

  const DEMO = [
    ["for n in range(1, 4):", 0],
    ["    print(n)", 1],
  ];

  function demoWindow() {
    return h("div", { class: "win", "aria-label": "A sample lesson" },
      h("div", { class: "win-bar" }, h("i"), h("i"), h("i"), h("span", { class: "pixel" }, "main.py")),
      h("p", { class: "win-q" }, "Print the numbers 1 to 3, one per line."),
      h("pre", { class: "win-code" }, DEMO.map(([t], i) => h("span", { class: "dl", "data-line": String(i) }, t + "\n"))),
      h("ul", { class: "win-checks" }, ["Prints 1", "Prints 2", "Prints 3"].map((t, i) => h("li", { "data-check": String(i) }, h("b", { "aria-hidden": "true" }, "✓"), t))));
  }

  NDC.pages.home = function () {
    const st = NDC.store.get();
    const lessonCount = NDC.courses.reduce((n, c) => n + NDC.allLessons(c).length, 0);
    const questionCount = NDC.courses.reduce((n, c) => n + NDC.allLessons(c).reduce((m, l) => m + (l.ex ? l.ex.length : 0), 0), 0);

    const started = NDC.courses.map((c) => ({ c, last: Math.max(0, ...NDC.allLessons(c).map((l) => (st.done[l.id] || {}).at || 0)) })).filter((x) => x.last > 0).sort((a, b) => b.last - a.last);
    const resumeCourse = started.length ? started[0].c : null;

    const glyphs = ["{ }", "</>", "def", "=>", "[ ]", "++"].map((t, i) => h("span", { class: "gl g" + (i + 1), "aria-hidden": "true" }, t));
    const hero = h("section", { class: "hero" }, h("div", { class: "wrap hero-grid" },
      h("div", { class: "hero-copy" },
        h("p", { class: "hero-school", "data-reveal": "" }, "Notre Dame High School"),
        h("h1", { "data-split": "" }, "Coding Club"),
        h("p", { class: "hero-meet", "data-reveal": "" }, NDC.config.meetingInfo + "."),
        h("div", { class: "cta", "data-reveal": "" },
          h("a", { class: "btn primary lg", href: "#/learn" + (resumeCourse ? "/" + resumeCourse.id : "") }, resumeCourse ? `Continue ${resumeCourse.name}` : "Start learning"),
          h("a", { class: "btn lg", href: "#/dungeon" }, "Enter the dungeon"))),
      h("div", { class: "hero-stage", "data-reveal": "" },
        h("div", { class: "halo", "aria-hidden": "true" }),
        h("div", { class: "halo h2", "aria-hidden": "true" }),
        glyphs,
        h("div", { class: "knight-wrap", "data-parallax": "-6" }, NDC.knight.node(NDC.store.equipped())))));

    const stat = (n, label) => h("li", null, h("b", { class: "pixel", "data-count": String(n) }, String(n)), h("span", null, label));
    const stats = h("section", { class: "stats" }, h("div", { class: "wrap" },
      h("ul", { "data-stagger": "" }, stat(NDC.courses.length, "languages"), stat(lessonCount, "lessons"), stat(questionCount, "questions to answer with code"), stat(G.FLOORS, "dungeon floors"))));

    const words = NDC.courses.map((c) => c.name);
    const marquee = h("div", { class: "marquee", "aria-hidden": "true" },
      h("div", { class: "marquee-track" }, [0, 1].map(() => h("div", { class: "marquee-set" }, words.concat(words).map((w) => h("span", null, w, h("i")))))));

    const langs = h("section", { class: "sect", id: "languages" }, h("div", { class: "wrap" },
      h("h2", { class: "sec-title", "data-reveal": "" }, "Pick a language"),
      h("ol", { class: "lang-index", "data-stagger": "" }, NDC.courses.map((c, i) => langRow(c, i, st)))));

    const demo = h("section", { class: "demo", id: "how" }, h("div", { class: "wrap demo-grid" },
      h("div", { class: "demo-copy" },
        h("h2", { class: "sec-title" }, "Every lesson is code you write"),
        h("ol", { class: "demo-steps" },
          h("li", { "data-step": "0" }, h("span", { class: "pixel" }, "01"), "Read the question"),
          h("li", { "data-step": "1" }, h("span", { class: "pixel" }, "02"), "Write the code"),
          h("li", { "data-step": "2" }, h("span", { class: "pixel" }, "03"), "Pass the checks")),
        h("a", { class: "btn primary", href: "#/learn" }, "Try one")),
      demoWindow()));

    const floors = h("ol", { class: "floors", "data-stagger": "" }, G.FLOOR_NAMES.map((n, i) =>
      h("li", { style: { "--glow": G.FLOOR_GLOW[i] } }, h("span", { class: "fn pixel" }, String(i + 1)), h("span", { class: "ft" }, n))));
    const kit = [G.KIT.helm, G.KIT.shield, G.KIT.weapon, G.KIT.cape, G.KIT.armor];
    const dungeon = h("section", { class: "sect dg-sec", id: "dungeon" }, h("div", { class: "wrap" },
      h("h2", { class: "sec-title", "data-reveal": "" }, "Five floors. One knight."),
      h("div", { class: "dg-layout" }, floors,
        h("aside", { class: "kit-card px", "data-reveal": "" },
          h("div", { class: "kit-knight" }, NDC.knight.node(NDC.store.equipped())),
          h("ul", { class: "kit" }, kit.map((k) => h("li", null, k.name))),
          h("a", { class: "btn primary block", href: "#/dungeon" }, "Enter the dungeon")))));

    const shown = NDC.projects.slice(0, 3);
    const projects = h("section", { class: "sect", id: "built" }, h("div", { class: "wrap" },
      h("h2", { class: "sec-title", "data-reveal": "" }, "Built by members"),
      shown.length
        ? h("div", { class: "home-proj", "data-stagger": "" }, shown.map((p) => h("a", { class: "px hp", href: p.live || p.link || "#/projects", target: p.live || p.link ? "_blank" : null, rel: "noopener" },
          h("h3", null, p.title), h("p", { class: "muted" }, (p.authors || []).join(", ")),
          h("div", { class: "tags" }, (p.languages || []).map((id) => { const c = NDC.courseById(id); return c ? h("span", { class: "tag-l", style: { "--cc": c.color } }, c.name) : null; })))))
        : h("p", { class: "muted", "data-reveal": "" }, "No projects yet."),
      h("div", { class: "row", style: { marginTop: "1.6rem" }, "data-reveal": "" }, h("a", { class: "btn", href: "#/projects" }, "Project board"))));

    const join = h("section", { class: "join" }, h("div", { class: "wrap" },
      h("p", { class: "join-line", "data-split": "" }, NDC.config.meetingInfo),
      h("div", { class: "row", "data-reveal": "" },
        h("a", { class: "btn primary lg", href: "#/learn" }, "Start learning"),
        h("span", { class: "join-mail" }, NDC.config.contactEmail))));

    return h("div", { class: "home" }, hero, stats, marquee, langs, demo, dungeon, projects, join);
  };
})();
