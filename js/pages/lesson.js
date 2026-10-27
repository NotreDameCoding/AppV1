(function () {
  const h = NDC.h, G = NDC.game;
  const WIDE = new Set(["run", "web"]);

  NDC.pages.lesson = function (id) {
    const found = NDC.findLesson(id);
    if (!found) { location.hash = "#/learn"; return h("div"); }
    const { course, lesson } = found;
    if (!NDC.store.isUnlocked(course, lesson.id) && !NDC.store.isDone(lesson.id)) { location.hash = "#/learn/" + course.id; return h("div"); }
    if (course.lang === "py" && lesson.ex.some((e) => e.type === "run")) NDC.run.warmPython();

    const queue = lesson.ex.map((ex, i) => ({ ex, tries: 0, key: i }));
    const total = queue.length;
    let pos = 0, completed = 0, firstTry = 0, wrongs = 0;
    let rend = null, state = "intro", item = null, ready = false;

    const barFill = h("i", { style: { width: "0%" } });
    const body = h("div", { class: "player-body" });
    const col = h("div", { class: "player-col" });
    body.append(col);
    const msg = h("div", { class: "foot-msg", "aria-live": "polite", role: "status" });
    const primary = h("button", { class: "btn primary", type: "button" }, "Start");
    const secondary = h("button", { class: "link-btn", type: "button", hidden: true }, "Skip this one");
    const footIn = h("div", { class: "foot-in" }, msg, h("div", { class: "row", style: { gap: "1.2rem", flexWrap: "nowrap" } }, secondary, primary));
    const foot = h("div", { class: "player-foot" }, footIn);
    const closeBtn = h("button", { class: "x", type: "button", "aria-label": "Leave lesson", onclick: confirmLeave }, "×");
    const root = h("div", { class: "player", style: { "--cc": course.hex }, role: "main" },
      h("div", { class: "player-top" }, closeBtn, h("div", { class: "bar px" }, barFill)), body, foot);

    function setPrimary(label, disabled, cls) { primary.textContent = label; primary.disabled = !!disabled; primary.className = "btn " + (cls || "primary"); }
    function setFoot(kind, title, text) {
      foot.className = "player-foot" + (kind ? " " + kind : "");
      NDC.clear(msg);
      if (title) msg.append(h("span", { class: "t" }, title));
      if (text) msg.append(h("span", { class: "e" }, typeof text === "string" ? NDC.rich(text) : text));
    }
    function progress() { barFill.style.width = Math.round((completed / total) * 100) + "%"; }

    function teardown() { if (rend && rend.destroy) rend.destroy(); rend = null; }

    /* ---- intro ---- */
    function showIntro() {
      state = "intro"; teardown(); NDC.clear(col); col.className = "player-col";
      const intro = lesson.intro;
      col.append(h("div", { class: "intro-card px" },
        h("p", { class: "muted", style: { marginBottom: "0.4rem" } }, `${course.name} · ${lesson.title}`),
        h("h2", null, lesson.blurb),
        intro ? h("p", null, NDC.rich(intro.text)) : null,
        intro && intro.code ? NDC.codeBlock(intro.code, course.lang) : null,
        h("p", { class: "muted", style: { marginBottom: 0 } }, `${total} questions. A wrong answer comes back later, so you can fix it.`)));
      setFoot("", "", "");
      setPrimary("Start", false);
      secondary.hidden = true;
    }

    /* ---- question ---- */
    function showQuestion() {
      teardown(); NDC.clear(col);
      item = queue[pos];
      state = "asking";
      col.className = "player-col" + (WIDE.has(item.ex.type) ? " wide" : "");
      rend = NDC.renderers[item.ex.type](item.ex, { lang: course.lang, ready: (v) => { ready = v; if (state === "asking") setPrimary("Check", !v); } });
      col.append(rend.el);
      ready = rend.canCheck();
      setFoot("", "", "");
      setPrimary("Check", !ready);
      secondary.hidden = true;
      body.scrollTop = 0;
    }

    async function doCheck() {
      if (state !== "asking" || !ready) return;
      state = "checking";
      setPrimary("Checking…", true);
      const r = await rend.check();
      if (r.noPenalty) { state = "asking"; setFoot("no", "Couldn't check that", r.answer); setPrimary("Check", false); return; }
      if (r.ok) {
        if (item.tries === 0 && r.firstTry !== false) firstTry++;
        completed++; progress();
        state = "ok";
        setFoot("ok", "Correct", item.ex.why);
        setPrimary("Continue", false, "good");
        secondary.hidden = true;
        primary.focus();
        return;
      }
      item.tries++; wrongs++;
      if (r.retrySame) {
        // code exercises: keep the editor open so they can fix it
        state = "retry";
        setFoot("no", "Not quite", "Look at the checks, change your code, and run it again.");
        setPrimary("Check again", false, "bad");
        secondary.hidden = false;
        return;
      }
      state = "wrong";
      const ans = r.answer ? h("span", null, h("b", null, "Answer: "), ...(String(r.answer).split("\n").flatMap((l, i) => [i ? h("br") : null, l])), h("br"), NDC.rich(item.ex.why || "")) : NDC.rich(item.ex.why || "");
      setFoot("no", "Not quite", ans);
      setPrimary("Got it", false, "bad");
      primary.focus();
    }

    function next() {
      if (state === "wrong") { if (item.tries < 2) queue.push({ ex: item.ex, tries: item.tries, key: item.key }); else completed++; }
      pos++;
      if (pos >= queue.length) return finish();
      showQuestion();
    }

    function skipThis() { completed++; progress(); pos++; if (pos >= queue.length) finish(); else showQuestion(); }

    primary.addEventListener("click", () => {
      if (state === "intro") { showQuestion(); return; }
      if (state === "asking") return doCheck();
      if (state === "retry") { state = "asking"; setFoot("", "", ""); secondary.hidden = true; setPrimary("Check", false); return doCheck(); }
      if (state === "ok" || state === "wrong") return next();
      if (state === "done-next") { const to = primary.dataset.to; location.hash = to ? "#/lesson/" + to : "#/learn/" + course.id; }
    });
    secondary.addEventListener("click", () => { if (state === "retry") skipThis(); });

    /* ---- finish ---- */
    function finish() {
      teardown(); NDC.clear(col); col.className = "player-col";
      const res = NDC.store.completeLesson(lesson.id, { firstTry, total, attempts: total + wrongs });
      completed = total; progress();
      const acc = Math.round(res.acc * 100);
      const nextL = NDC.store.nextLesson(course);
      const unlocks = [];
      if (res.coinsGained) unlocks.push(h("div", { class: "unlock px" }, h("span", { class: "pixel", style: { fontSize: "1.4rem", color: "var(--gold)", minWidth: "40px", textAlign: "center" } }, "$"), h("span", null, h("b", null, "+" + res.coinsGained + " coins"), ` (you have ${res.stats.coins})`)));
      res.newBadges.forEach((b) => { const bd = G.badges.find((x) => x.id === b); unlocks.push(h("div", { class: "unlock px" }, h("span", { class: "pixel", style: { fontSize: "1.4rem", color: "var(--gold)", minWidth: "40px", textAlign: "center" } }, bd.glyph), h("span", null, h("b", null, "Badge: "), bd.name))); });
      if (res.levelUp) unlocks.unshift(h("div", { class: "unlock px" }, h("span", { class: "pixel", style: { fontSize: "1.4rem", color: "var(--gold)", minWidth: "40px", textAlign: "center" } }, "L" + res.levelUp), h("span", null, h("b", null, "Level up! "), `You are now a ${G.title(res.levelUp)}.`)));
      col.append(h("div", { class: "finish" },
        h("h2", null, res.first ? "Lesson complete" : "Nice practice"),
        h("div", { class: "knight-big" }, NDC.knight.node(NDC.store.equipped())),
        h("div", { class: "finish-stats" },
          h("div", { class: "fstat px" }, h("div", { class: "v" }, res.xpGained ? "+" + res.xpGained : "0"), h("div", { class: "l" }, "XP earned")),
          h("div", { class: "fstat px" }, h("div", { class: "v" }, acc + "%"), h("div", { class: "l" }, "Right first try")),
          h("div", { class: "fstat px" }, h("div", { class: "v" }, String(res.stats.streak)), h("div", { class: "l" }, res.stats.streak === 1 ? "Day streak" : "Day streak"))),
        unlocks.length ? h("div", { class: "unlock-list" }, unlocks) : null,
        !res.first ? h("p", { class: "muted", style: { marginBottom: "1rem" } }, "Replays only raise your best score. XP is earned once per lesson.") : null,
        !NDC.auth.user ? h("div", { class: "card px", style: { maxWidth: "30rem", margin: "0 auto 1rem", textAlign: "left" } },
          h("p", null, "Your progress is saved on this device. Sign in to keep it everywhere and show up on the club's roster."),
          h("button", { class: "btn small", type: "button", style: { marginTop: "0.8rem" }, onclick: NDC.openSignIn }, "Sign in")) : null));
      setFoot("", "", "");
      secondary.hidden = false;
      secondary.textContent = "Back to path";
      secondary.onclick = () => { location.hash = "#/learn/" + course.id; };
      state = "done-next";
      if (nextL && nextL.id !== lesson.id && NDC.store.isUnlocked(course, nextL.id)) { setPrimary("Next lesson", false); primary.dataset.to = nextL.id; }
      else { setPrimary("Done", false); primary.dataset.to = ""; }
    }
    /* ---- leaving ---- */
    function confirmLeave() {
      if (state === "intro" || state === "done" || state === "done-next") { location.hash = "#/learn/" + course.id; return; }
      const scrim = h("div", { class: "scrim", onclick: (e) => { if (e.target === scrim) scrim.remove(); } },
        h("div", { class: "modal px", role: "dialog", "aria-modal": "true" },
          h("h3", null, "Leave this lesson?"),
          h("p", { class: "muted", style: { margin: "0.7rem 0 1.4rem" } }, "You'll lose your progress in this lesson, but nothing you've already finished."),
          h("div", { class: "actions" },
            h("button", { class: "btn primary block", type: "button", onclick: () => scrim.remove() }, "Keep going"),
            h("button", { class: "btn block", type: "button", onclick: () => { scrim.remove(); location.hash = "#/learn/" + course.id; } }, "Leave"))));
      document.body.append(scrim);
    }

    const onKey = (e) => {
      if (e.key === "Escape") return;
      const tag = e.target && e.target.tagName;
      if (e.key === "Enter") {
        if (tag === "TEXTAREA" && !(e.ctrlKey || e.metaKey)) return;
        if (tag === "BUTTON" && e.target !== primary && !e.target.classList.contains("btn")) return;
        if (!primary.disabled && tag !== "BUTTON") { e.preventDefault(); primary.click(); }
      }
    };
    document.addEventListener("keydown", onKey);

    showIntro();
    return { el: root, destroy() { teardown(); document.removeEventListener("keydown", onKey); } };
  };
})();
