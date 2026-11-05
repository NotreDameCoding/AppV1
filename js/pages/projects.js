(function () {
  const h = NDC.h;

  /* ---------- projects ---------- */
  NDC.pages.projects = function () {
    let filter = "all";
    const grid = h("div");
    const chips = h("div", { class: "seg", role: "group", "aria-label": "Filter by language" });
    function draw() {
      NDC.clear(grid); NDC.clear(chips);
      [["all", "All"], ...NDC.courses.map((c) => [c.id, c.name])].forEach(([id, label]) => chips.append(h("button", { class: "seg-btn", type: "button", "aria-pressed": String(filter === id), onclick: () => { filter = id; draw(); } }, label)));
      const list = NDC.projects.filter((p) => filter === "all" || (p.languages || []).includes(filter));
      if (!NDC.projects.length) {
        grid.append(h("div", { class: "empty px" },
          h("div", { class: "knight-sad" }, NDC.knight.node({ helm: "squire", cape: "none" })),
          h("h2", null, "No projects submitted yet"),
          h("p", null, "Projects members build will show up here."),
          h("button", { class: "btn primary", type: "button", onclick: () => { const el = document.getElementById("howto"); if (el) el.scrollIntoView({ behavior: "smooth" }); } }, "How to submit a project")));
      } else if (!list.length) {
        grid.append(h("div", { class: "empty px" }, h("h2", null, "Nothing here yet"), h("p", null, "No projects use that language yet. Maybe you'll be the first.")));
      } else {
        grid.append(h("div", { class: "proj-grid" }, list.map((p) => h("article", { class: "proj px" },
          h("h3", null, p.title),
          h("p", { class: "muted" }, (p.authors || []).join(", ")),
          h("p", null, p.blurb),
          h("div", { class: "tags" }, (p.languages || []).map((id) => { const c = NDC.courseById(id); return c ? h("span", { class: "tag-l", style: { "--cc": c.color } }, c.name) : null; })),
          h("div", { class: "row", style: { gap: "0.6rem" } },
            p.live ? h("a", { class: "btn small", href: p.live, target: "_blank", rel: "noopener" }, "Open") : null,
            p.code ? h("button", { class: "btn small", type: "button", onclick: () => NDC.viewProject(p) }, "View project") : null,
            p.link ? h("a", { class: "btn small", href: p.link, target: "_blank", rel: "noopener" }, "View project") : null)))));
      }
    }
    draw();
    const howto = h("section", { class: "howto", id: "howto" },
      h("h2", { class: "sec", style: { marginBottom: 0 } }, "How to submit a project"),
      h("ol", { class: "steps" },
        h("li", null, h("span", null, "Put your project on GitHub, and turn on GitHub Pages if it's a website so people can try it.")),
        h("li", null, h("span", null, "Open ", h("code", { class: "inline" }, "js/data-projects.js"), " in the club repo and copy the example at the top.")),
        h("li", null, h("span", null, "Fill in the title, your name, the languages and a sentence about it. For a website add the link. For a program, paste your code into ", h("code", { class: "inline" }, "code"), " and set ", h("code", { class: "inline" }, "lang"), " (py, js, ht or cs) and visitors can run it right here. Then open a pull request.")),
        h("li", null, h("span", null, "An officer reviews it, and your project shows up here."))));
    return h("div", { class: "page" }, h("div", { class: "wrap" },
      h("div", { class: "page-head" }, h("h1", null, "Projects")),
      NDC.projects.length ? chips : null, grid, howto));
  };
})();
