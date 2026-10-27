(function () {
  const h = NDC.h;
  const ARMORS = ["steel", "cobalt", "emerald", "crimson", "obsidian"];
  const CAPES = ["none", "red", "royal", "none"];
  const SHIELDS = ["oak", "cobalt", "crimson", "starlight"];
  const WEAPONS = ["wood", "steel", "wood", "spark"];

  /* members get a stable look from their name. It has nothing to do with progress. */
  function looksFor(m) {
    const n = NDC.hash(m.name);
    if (m.role === "President") return { helm: "crowned", armor: "gold", cape: "royal", shield: "starlight", weapon: "steel" };
    if (m.role !== "Member") return { helm: "plumed", armor: ARMORS[n % ARMORS.length], cape: "red", shield: SHIELDS[n % SHIELDS.length], weapon: "steel" };
    return { helm: n % 3 === 0 ? "iron" : "squire", armor: ARMORS[n % ARMORS.length], cape: CAPES[(n >> 3) % CAPES.length], shield: SHIELDS[(n >> 5) % SHIELDS.length], weapon: WEAPONS[(n >> 7) % WEAPONS.length] };
  }

  /* ---------- members ---------- */
  NDC.pages.members = function () {
    const officers = NDC.members.filter((m) => m.role !== "Member");
    const regulars = NDC.members.filter((m) => m.role === "Member");
    const list = h("ul", { class: "roster" });
    const count = h("p", { class: "muted" });
    function draw(q) {
      NDC.clear(list);
      const f = regulars.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));
      f.forEach((m) => list.append(h("li", { class: "px" }, h("span", { class: "sprite" }, NDC.knight.head(looksFor(m))), h("span", { class: "nm" }, m.name))));
      count.textContent = q ? `${f.length} of ${regulars.length} members` : `${regulars.length} members`;
      if (!f.length) list.append(h("li", { style: { gridColumn: "1 / -1" } }, h("span", { class: "muted" }, `No one named “${q}” yet. Check the spelling, or add yourself with a pull request.`)));
    }
    const search = h("input", { class: "search", type: "search", placeholder: "Find a member", "aria-label": "Find a member", oninput: () => draw(search.value.trim()) });
    draw("");
    return h("div", { class: "page" }, h("div", { class: "wrap" },
      h("div", { class: "page-head" }, h("h1", null, "Members"), h("p", null, `${NDC.members.length} people write code together here. Every knight is just for fun and has nothing to do with progress.`)),
      h("div", { class: "officers" }, officers.map((m) => h("div", { class: "officer px" },
        h("div", { class: "sprite" }, NDC.knight.node(looksFor(m))),
        h("h3", null, m.name), h("p", { class: "role" }, m.role), h("p", null, m.note)))),
      h("div", { class: "members-tools" }, h("h2", { class: "sec", style: { margin: 0 } }, "Everyone else"), search, count),
      list,
      h("p", { class: "muted", style: { marginTop: "2rem" } }, "Not listed? Add a line to ", h("code", { class: "inline" }, "js/data-members.js"), " and open a pull request.")));
  };

  /* ---------- meetings ---------- */
  NDC.pages.meetings = function () {
    const today = NDC.dayKey();
    const sorted = NDC.meetings.slice().sort((a, b) => a.date.localeCompare(b.date));
    const nextDate = (sorted.find((m) => m.date >= today) || {}).date;
    const items = sorted.map((m) => {
      const past = m.date < today, isNext = m.date === nextDate;
      const learn = m.practice ? NDC.findLesson(m.practice) : null;
      return h("article", { class: "meet px " + (past ? "past" : isNext ? "next" : "") },
        h("div", { class: "meet-top" },
          h("h3", null, m.title, isNext ? h("span", { class: "tag" }, "Next up") : null),
          h("span", { class: "when" }, NDC.fmtDate(m.date))),
        h("p", { class: "note" }, m.note),
        past && m.learned ? h("details", null, h("summary", null, "What we learned: " + m.concept), h("p", null, NDC.rich(m.learned))) : null,
        past && learn ? h("div", { class: "practice" }, h("a", { class: "btn small", href: "#/learn/" + learn.course.id }, "Practice in " + learn.course.name)) : null);
    });
    return h("div", { class: "page" }, h("div", { class: "wrap", style: { maxWidth: "900px" } },
      h("div", { class: "page-head" }, h("h1", null, "Meetings"), h("p", null, "A short lesson, then time to build. Come to as many as you can, and use the Learn tab to catch up on any you miss.")),
      h("div", { class: "info-strip px" },
        h("span", null, h("b", null, "Where and when: "), NDC.config.meetingInfo),
        h("span", null, h("b", null, "Length: "), "About 30 minutes"),
        h("span", null, h("b", null, "Questions: "), h("a", { href: "mailto:" + NDC.config.contactEmail }, NDC.config.contactEmail))),
      h("div", { class: "timeline" }, items)));
  };

  /* ---------- projects ---------- */
  NDC.pages.projects = function () {
    let filter = "all";
    const grid = h("div");
    const chips = h("div", { class: "row", style: { gap: "0.5rem", marginBottom: "1.4rem" } });
    function draw() {
      NDC.clear(grid); NDC.clear(chips);
      [["all", "All"], ...NDC.courses.map((c) => [c.id, c.name])].forEach(([id, label]) => chips.append(h("button", { class: "btn small" + (filter === id ? " primary" : ""), type: "button", "aria-pressed": String(filter === id), onclick: () => { filter = id; draw(); } }, label)));
      const list = NDC.projects.filter((p) => filter === "all" || (p.languages || []).includes(filter));
      if (!NDC.projects.length) {
        grid.append(h("div", { class: "empty px" },
          h("div", { class: "knight-sad" }, NDC.knight.node({ helm: "squire", cape: "none" })),
          h("h2", null, "No projects submitted yet"),
          h("p", null, "This board is for things club members have built: games, sites, scripts, anything. Finish one, add it below, and yours will be the first on the wall."),
          h("a", { class: "btn primary", href: "#howto" }, "How to submit a project")));
      } else if (!list.length) {
        grid.append(h("div", { class: "empty px" }, h("h2", null, "Nothing here yet"), h("p", null, "No projects use that language yet. Maybe you'll be the first.")));
      } else {
        grid.append(h("div", { class: "proj-grid" }, list.map((p) => h("article", { class: "proj px" },
          h("h3", null, p.title),
          h("p", { class: "muted" }, (p.authors || []).join(", ")),
          h("p", null, p.blurb),
          h("div", { class: "tags" }, (p.languages || []).map((id) => { const c = NDC.courseById(id); return c ? h("span", { class: "tag-l", style: { "--cc": c.hex } }, c.name) : null; })),
          h("div", { class: "row", style: { gap: "0.6rem" } },
            p.live ? h("a", { class: "btn small primary", href: p.live, target: "_blank", rel: "noopener" }, "Open") : null,
            p.link ? h("a", { class: "btn small", href: p.link, target: "_blank", rel: "noopener" }, "Code") : null)))));
      }
    }
    draw();
    const howto = h("section", { class: "howto", id: "howto" },
      h("h2", { class: "sec", style: { marginBottom: 0 } }, "How to submit a project"),
      h("ol", { class: "steps" },
        h("li", null, h("span", null, "Put your project on GitHub, and turn on GitHub Pages if it's a website so people can try it.")),
        h("li", null, h("span", null, "Open ", h("code", { class: "inline" }, "js/data-projects.js"), " in the club repo and copy the example at the top.")),
        h("li", null, h("span", null, "Fill in the title, your name, the link, the languages and a sentence about it. Then open a pull request.")),
        h("li", null, h("span", null, "An officer reviews it, and your project shows up here."))));
    return h("div", { class: "page" }, h("div", { class: "wrap" },
      h("div", { class: "page-head" }, h("h1", null, "Projects"), h("p", null, "Things club members have built. Finished is better than perfect.")),
      NDC.projects.length ? chips : null, grid, howto));
  };
})();
