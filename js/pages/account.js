(function () {
  const h = NDC.h, G = NDC.game;

  function heat(days) {
    const weeks = 16;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dow = (today.getDay() + 6) % 7; // Monday = 0
    const start = NDC.addDays(today, -(dow + 7 * (weeks - 1)));
    const wrap = h("div", { class: "heat", role: "img", "aria-label": "Activity over the last 16 weeks" });
    for (let i = 0; i < weeks * 7; i++) {
      const d = NDC.addDays(start, i), k = NDC.dayKey(d);
      const n = (days[k] || {}).lessons || 0;
      const cell = h("i", { class: (n >= 3 ? "l3" : n === 2 ? "l2" : n === 1 ? "l1" : "") + (d > today ? " future" : ""), title: `${NDC.fmtDate(k, { month: "short", day: "numeric" })}: ${n} lesson${n === 1 ? "" : "s"}` });
      wrap.append(cell);
    }
    return wrap;
  }

  function proficiency(state) {
    const rows = NDC.courses.map((c) => {
      const cs = G.courseStats(state, c);
      return h("div", { style: { padding: "0.6rem 0", borderBottom: "1px dashed var(--line)" } },
        h("div", { class: "prof-row", style: { padding: 0 } },
          h("span", { class: "nm", style: { color: c.hex } }, c.name),
          h("div", { class: "bar px", style: { "--n": "2px" } }, h("i", { style: { width: Math.round(cs.pct * 100) + "%", background: c.hex } })),
          h("span", { class: "pct" }, Math.round(cs.pct * 100) + "%")),
        h("p", { class: "muted", style: { fontSize: "0.88rem", marginTop: "0.3rem" } },
          `${cs.rank} · ${cs.done}/${cs.total} lessons` + (cs.done ? ` · ${Math.round(cs.acc * 100)}% right first try` : "") + (cs.skipped ? ` · ${cs.skipped} skipped` : "")));
    });
    return h("div", null, rows);
  }

  function badgesGrid(stats) {
    return h("div", { class: "badges" }, G.badges.map((b) => {
      const has = stats.badges.includes(b.id);
      return h("div", { class: "badge px" + (has ? "" : " locked") }, h("div", { class: "g" }, b.glyph), h("b", null, b.name), h("small", null, b.desc));
    }));
  }

  function officerPanel() {
    const host = h("div", null, h("p", { class: "muted" }, "Loading…"));
    NDC.auth.listProgress().then((r) => {
      NDC.clear(host);
      if (r.demo) {
        host.append(h("p", { class: "muted" }, "In demo mode, progress only exists in each person's own browser, so there is nothing to list. Turn on real sign-in (see README) and every member's progress appears here, visible only to officers."));
        return;
      }
      if (!r.rows.length) { host.append(h("p", { class: "muted" }, "Nobody has signed in yet.")); return; }
      const table = h("table", { class: "officer-table" }, h("thead", null, h("tr", null, ["Member", "Level", "XP", "Lessons", "Streak", "Last active"].map((t) => h("th", null, t)))));
      const tb = h("tbody");
      r.rows.forEach((row) => {
        const st = G.stats(Object.assign({ done: {}, skipped: {}, days: {}, equipped: {}, answers: { total: 0, correct: 0 } }, row.data || {}));
        tb.append(h("tr", null, h("td", null, row.display_name || row.email), h("td", null, st.level), h("td", null, st.xp), h("td", null, st.lessons), h("td", null, st.streak), h("td", null, row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-")));
      });
      table.append(tb); host.append(h("div", { style: { overflowX: "auto" } }, table));
    }).catch((e) => { NDC.clear(host); host.append(h("p", { class: "muted" }, "Couldn't load progress: " + e.message)); });
    return host;
  }

  NDC.pages.account = function () {
    const user = NDC.auth.user;
    const state = NDC.store.get();
    const stats = NDC.store.stats();

    if (!user) {
      return h("div", { class: "page" }, h("div", { class: "wrap" },
        h("div", { class: "signed-out px" },
          h("h1", null, "Sign in"),
          h("p", null, stats.lessons
            ? `You've earned ${stats.xp} XP on this device. Sign in with your email to keep it on every device.`
            : "Sign in with your email to track your rank in every language and keep a streak."),
          h("button", { class: "btn primary", type: "button", onclick: NDC.openSignIn }, "Sign in"))));
    }

    const name = state.name || user.email.split("@")[0];
    const titleEl = h("h1", null, name);
    const nameInput = h("input", { class: "field", type: "text", maxlength: 40, value: state.name || "", placeholder: user.email.split("@")[0], "aria-label": "Display name",
      oninput: () => { NDC.store.update((s) => { s.name = nameInput.value.trim(); }); titleEl.textContent = nameInput.value.trim() || user.email.split("@")[0]; } });

    const top = h("div", { class: "acct-top" },
      h("div", null, titleEl,
        h("p", { class: "rank-line" }, `Level ${stats.level} ${G.title(stats.level)} · ${stats.xp} XP`),
        h("div", { class: "bar px", style: { maxWidth: "26rem" } }, h("i", { style: { width: Math.round(stats.levelPct * 100) + "%" } })),
        h("p", { class: "muted", style: { marginTop: "0.5rem" } }, `${stats.levelSpan - stats.levelInto} XP to level ${stats.level + 1}`),
        h("div", { class: "row", style: { marginTop: "1rem", gap: "0.7rem" } },
          h("span", { class: "chip flame px" }, `${stats.streak} day streak`),
          h("span", { class: "chip px" }, `${stats.lessons} lessons`),
          h("span", { class: "chip px" }, `${stats.badges.length}/${G.badges.length} badges`))));

    const settings = h("div", null,
      h("div", { class: "form-row" }, h("label", { for: "dn" }, "Display name"), nameInput),
      h("p", { class: "muted", style: { fontSize: "0.9rem", marginBottom: "1rem" } }, `Signed in as ${user.email}. Only you and club officers can see your progress.`),
      h("div", { class: "row", style: { gap: "0.7rem" } },
        h("button", { class: "btn small", type: "button", onclick: () => {
          const blob = new Blob([NDC.store.exportJSON()], { type: "application/json" });
          const a = h("a", { href: URL.createObjectURL(blob), download: "ndc-progress.json" }); document.body.append(a); a.click(); a.remove();
        } }, "Download my progress"),
        h("button", { class: "btn small", type: "button", onclick: async () => { await NDC.auth.signOut(); NDC.toast("Signed out"); } }, "Sign out"),
        h("button", { class: "btn small bad", type: "button", onclick: () => {
          const scrim = h("div", { class: "scrim", onclick: (e) => { if (e.target === scrim) scrim.remove(); } },
            h("div", { class: "modal px", role: "dialog", "aria-modal": "true" }, h("h3", null, "Reset all progress?"),
              h("p", { class: "muted", style: { margin: "0.7rem 0 1.4rem" } }, "This erases your XP, lessons, streak and gear on this account. It can't be undone."),
              h("div", { class: "actions" }, h("button", { class: "btn bad block", type: "button", onclick: () => { NDC.store.reset(); scrim.remove(); NDC.route(); } }, "Erase everything"), h("button", { class: "btn block", type: "button", onclick: () => scrim.remove() }, "Cancel"))));
          document.body.append(scrim);
        } }, "Reset progress")));

    const card = (cls, title, content) => h("section", { class: "card px " + cls }, h("h2", null, title), content);
    return h("div", { class: "page" }, h("div", { class: "wrap" }, top,
      h("div", { class: "acct-grid" },
        card("c7", "Proficiency", proficiency(state)),
        card("c5", "Badges", badgesGrid(stats)),
        card("c12", "Activity", h("div", null, heat(state.days), h("p", { class: "muted", style: { marginTop: "0.6rem", fontSize: "0.9rem" } }, `${stats.activeDays} active days · longest streak ${stats.bestStreak}`))),
        card(NDC.auth.officer ? "c6" : "c12", "Settings", settings),
        NDC.auth.officer ? card("c6", "Officer view", officerPanel()) : null)));
  };
})();
