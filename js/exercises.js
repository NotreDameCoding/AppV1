/* Exercise types. Each one is written as a tiny data object (see js/courses/*.js) and drawn by a renderer here.
   A renderer returns { el, canCheck(), check() -> Promise<result>, destroy?() }.
   result = { ok, firstTry?, answer?, rows? } */
(function () {
  const h = NDC.h;

  /* ---------- how lessons are written ---------- */
  NDC.Q = {
    mc: (prompt, options, ans, why, code) => ({ type: "mc", prompt, options, ans, why, code }),
    fill: (prompt, code, bank, answers, why) => ({ type: "fill", prompt, code, bank, answers: [].concat(answers), why }),
    order: (prompt, lines, why) => ({ type: "order", prompt, lines, why }),
    type: (prompt, accept, why, code) => ({ type: "type", prompt, accept: [].concat(accept), why, code }),
    match: (prompt, pairs, why) => ({ type: "match", prompt, pairs, why }),
    run: (prompt, starter, checks, why, hint) => ({ type: "run", prompt, starter, checks, why, hint }),
    web: (prompt, starter, checks, why, hint) => ({ type: "web", prompt, starter, checks, why, hint }),
    led: (prompt, sketch, params, ok, why) => ({ type: "led", prompt, sketch, params, ok, why }),
  };
  const LABEL = { mc: "Pick one", fill: "Fill in the blank", order: "Put the lines in order", type: "Type the answer", match: "Match the pairs", run: "Write some code", web: "Build it", led: "Try it on the board" };
  NDC.exerciseLabel = (t) => LABEL[t] || "";

  const norm = (s) => String(s).trim().replace(/\s+/g, " ");

  function promptEl(ex, i) {
    return h("div", null, h("p", { class: "q-type" }, LABEL[ex.type]), h("h2", { class: "q-prompt" }, NDC.rich(ex.prompt)));
  }
  function keyed(name, el) { return el; }

  /* ---------- multiple choice ---------- */
  function mc(ex, ctx) {
    const order = NDC.shuffle(ex.options.map((_, i) => i));
    let chosen = null;
    const btns = order.map((oi, pos) => {
      const b = h("button", { class: "opt px", role: "radio", "aria-checked": "false", type: "button", onclick: () => pick(oi) },
        h("span", { class: "k" }, String(pos + 1)), h("span", null, NDC.rich(ex.options[oi])));
      b.dataset.oi = oi;
      return b;
    });
    function pick(oi) {
      if (locked) return;
      chosen = oi;
      btns.forEach((b) => b.setAttribute("aria-checked", String(+b.dataset.oi === oi)));
      ctx.ready(true);
    }
    let locked = false;
    const onKey = (e) => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= btns.length) pick(order[n - 1]);
    };
    document.addEventListener("keydown", onKey);
    const el = h("div", null, promptEl(ex), ex.code ? NDC.codeBlock(ex.code, ctx.lang) : null, h("div", { class: "opts", role: "radiogroup" }, btns));
    return {
      el,
      canCheck: () => chosen != null,
      destroy: () => document.removeEventListener("keydown", onKey),
      async check() {
        locked = true;
        const ok = chosen === ex.ans;
        btns.forEach((b) => {
          if (+b.dataset.oi === ex.ans) b.classList.add("right");
          else if (+b.dataset.oi === chosen) b.classList.add("wrong");
        });
        return { ok, answer: ok ? null : ex.options[ex.ans] };
      },
    };
  }

  /* ---------- fill in the blank ---------- */
  function fill(ex, ctx) {
    const parts = ex.code.split("___");
    const n = parts.length - 1;
    const slots = Array(n).fill(null); // index into bank
    const bankOrder = NDC.shuffle(ex.bank.map((_, i) => i));
    let locked = false;
    const pre = h("pre", { class: "code" });
    const blanks = [];
    parts.forEach((p, i) => {
      pre.append(NDC.highlight(p, ctx.lang));
      if (i < n) {
        const b = h("button", { class: "blank", type: "button", "aria-label": "blank " + (i + 1), onclick: () => { if (!locked && slots[i] != null) { slots[i] = null; render(); } } }, " ");
        blanks.push(b); pre.append(b);
      }
    });
    const bank = h("div", { class: "bank" });
    const toks = bankOrder.map((bi) => h("button", { class: "tok px", type: "button", onclick: () => {
      if (locked) return;
      const free = slots.indexOf(null);
      if (free === -1) return;
      slots[free] = bi; render();
    } }, ex.bank[bi]));
    toks.forEach((t) => bank.append(t));
    function render() {
      blanks.forEach((b, i) => { b.textContent = slots[i] == null ? " " : ex.bank[slots[i]]; b.classList.toggle("filled", slots[i] != null); });
      toks.forEach((t, k) => { t.disabled = slots.includes(bankOrder[k]); });
      ctx.ready(slots.every((s) => s != null));
    }
    return {
      el: h("div", null, promptEl(ex), pre, bank),
      canCheck: () => slots.every((s) => s != null),
      async check() {
        locked = true;
        let ok = true;
        slots.forEach((s, i) => {
          const right = ex.bank[s] === ex.answers[i];
          if (!right) ok = false;
          blanks[i].classList.add(right ? "right" : "wrong");
        });
        return { ok, answer: ok ? null : ex.answers.join(", ") };
      },
    };
  }

  /* ---------- put lines in order ---------- */
  function order(ex, ctx) {
    const pool = NDC.shuffle(ex.lines.map((_, i) => i));
    let picked = [];
    let locked = false;
    const zone = h("div", { class: "order-zone" });
    const poolEl = h("div", { class: "order-pool" });
    function render() {
      NDC.clear(zone); NDC.clear(poolEl);
      picked.forEach((li, pos) => zone.append(h("button", { class: "line-tok px", type: "button", onclick: () => { if (!locked) { picked.splice(pos, 1); render(); } } }, ex.lines[li])));
      pool.forEach((li) => poolEl.append(h("button", { class: "line-tok px", type: "button", disabled: picked.includes(li) || null, onclick: () => { if (!locked) { picked.push(li); render(); } } }, ex.lines[li])));
      ctx.ready(picked.length === ex.lines.length);
    }
    render();
    return {
      el: h("div", null, promptEl(ex), zone, poolEl),
      canCheck: () => picked.length === ex.lines.length,
      async check() {
        locked = true;
        // compare the text, not the position, so identical lines like "}" can be picked in any order
        const same = (i) => ex.lines[picked[i]] === ex.lines[i];
        const ok = picked.every((_, i) => same(i));
        [...zone.children].forEach((c, i) => c.classList.add(same(i) ? "right" : "wrong"));
        return { ok, answer: ok ? null : "Correct order:\n" + ex.lines.join("\n") };
      },
    };
  }

  /* ---------- type the answer ---------- */
  function typeAns(ex, ctx) {
    const input = h("input", { class: "type-in", type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": "Your answer", oninput: () => ctx.ready(input.value.trim().length > 0) });
    setTimeout(() => input.focus(), 30);
    return {
      el: h("div", null, promptEl(ex), ex.code ? NDC.codeBlock(ex.code, ctx.lang) : null, input),
      canCheck: () => input.value.trim().length > 0,
      async check() {
        input.disabled = true;
        const v = norm(input.value);
        const ok = ex.accept.some((a) => (a instanceof RegExp ? a.test(v) : norm(a).toLowerCase() === v.toLowerCase()));
        return { ok, answer: ok ? null : String(ex.accept[0] instanceof RegExp ? "" : ex.accept[0]) };
      },
    };
  }

  /* ---------- match the pairs ---------- */
  function match(ex, ctx) {
    const L = NDC.shuffle(ex.pairs.map((_, i) => i)), R = NDC.shuffle(ex.pairs.map((_, i) => i));
    let selL = null, doneCount = 0, mistakes = 0;
    const lb = [], rb = [];
    const mk = (idx, txt, side) => {
      const b = h("button", { class: "opt px", type: "button", onclick: () => click(side, idx, b) }, h("span", null, NDC.rich(txt)));
      (side === "l" ? lb : rb).push(b); return b;
    };
    const colL = L.map((i) => mk(i, ex.pairs[i][0], "l")), colR = R.map((i) => mk(i, ex.pairs[i][1], "r"));
    function click(side, idx, b) {
      if (side === "l") { lb.forEach((x) => x.setAttribute("aria-checked", "false")); selL = { idx, b }; b.setAttribute("aria-checked", "true"); return; }
      if (!selL) return;
      if (selL.idx === idx) {
        selL.b.classList.add("done"); b.classList.add("done"); selL.b.setAttribute("aria-checked", "false"); selL = null; doneCount++;
        ctx.ready(doneCount === ex.pairs.length);
      } else {
        mistakes++; b.classList.add("flash-bad"); selL.b.classList.add("flash-bad");
        const a = selL.b; setTimeout(() => { b.classList.remove("flash-bad"); a.classList.remove("flash-bad"); }, 450);
      }
    }
    const grid = h("div", { class: "match-grid" });
    for (let i = 0; i < ex.pairs.length; i++) grid.append(colL[i], colR[i]);
    return {
      el: h("div", null, promptEl(ex), grid),
      canCheck: () => doneCount === ex.pairs.length,
      async check() { return { ok: true, firstTry: mistakes === 0 }; },
    };
  }

  /* ---------- editor widget ---------- */
  function editor(starter, opts) {
    const ta = h("textarea", { class: "editor", spellcheck: "false", autocapitalize: "off", autocomplete: "off", "aria-label": opts.label || "Code editor" });
    ta.value = starter;
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const s = ta.selectionStart, en = ta.selectionEnd;
        ta.setRangeText("    ", s, en, "end");
        ta.dispatchEvent(new Event("input"));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); opts.onRun && opts.onRun(); }
    });
    ta.addEventListener("input", () => opts.onInput && opts.onInput());
    return ta;
  }

  function checkRows(rows) {
    const box = h("div", { class: "checks", "aria-live": "polite" });
    rows.forEach((r) => box.append(h("div", { class: "check-row " + (r.ok ? "pass" : "fail") },
      h("span", { class: "b" }, r.ok ? "+" : "x"),
      h("span", null, r.label, !r.ok && r.got !== undefined && !r.err ? ` (yours printed “${r.got.length > 60 ? r.got.slice(0, 60) + "…" : r.got}”)` : "", r.err ? ` — ${r.err}` : ""))));
    return box;
  }

  /* after two misses, offer the answer one line at a time */
  let misses = new WeakMap();
  function stuck(host, ex, base, lang, use) {
    if (!ex.solution || !NDC.explain) return;
    const n = (misses.get(ex) || 0) + 1; misses.set(ex, n);
    if (n < 2) return;
    const slot = h("div", { style: { marginTop: "0.8rem" } });
    const btn = h("button", { class: "btn small", type: "button", onclick: () => { NDC.clear(slot); const p = NDC.explain.panel(ex, base, () => use(ex.solution), lang); if (p) slot.append(p); } }, "Stuck? Walk me through it line by line");
    slot.append(btn);
    host.append(slot);
  }

  /* ---------- run code (Python / JavaScript) ---------- */
  function run(ex, ctx) {
    const lang = ctx.lang; // "py" | "js"
    const carried = ex.chain && ctx.carry ? ctx.carry() : null;
    const st = carried != null ? carried : ex.starter;
    const consoleEl = h("pre", { class: "console" }, h("span", { class: "dim" }, "Output shows up here."));
    const rowsHost = h("div");
    let hintEl = null;
    const ta = editor(st, { label: "Code editor", onInput: () => ctx.ready(ta.value.trim().length > 0 && ta.value !== st), onRun: doRun });
    if (lang === "py") NDC.run.warmPython();
    async function doRun() {
      NDC.clear(consoleEl); consoleEl.append(h("span", { class: "dim" }, lang === "py" && !NDC.run.pythonReady() ? "Starting Python (the first run takes a few seconds)…" : "Running…"));
      const r = await NDC.run.run(lang, ta.value);
      NDC.clear(consoleEl);
      if (r.out) consoleEl.append(r.out + (r.err ? "\n" : ""));
      if (r.err) consoleEl.append(h("span", { class: "err" }, r.err));
      if (!r.out && !r.err) consoleEl.append(h("span", { class: "dim" }, "(nothing printed)"));
    }
    const runBtn = h("button", { class: "btn small px", type: "button", onclick: doRun }, "Run");
    const resetBtn = h("button", { class: "link-btn", type: "button", onclick: () => { ta.value = st; ctx.ready(false); } }, "Reset");
    const hintBtn = ex.hint ? h("button", { class: "link-btn", type: "button", onclick: () => { if (!hintEl) { hintEl = h("p", { class: "muted", style: { marginTop: "0.6rem" } }, "Hint: ", NDC.rich(ex.hint)); el.insertBefore(hintEl, ide); } } }, "Need a hint?") : null;
    const ide = h("div", { class: "ide two" },
      h("div", { class: "ed-wrap" }, h("div", { class: "ed-head" }, h("span", null, lang === "py" ? "main.py" : "script.js"), h("span", { class: "row", style: { gap: "0.9rem" } }, resetBtn, runBtn)), ta),
      h("div", null, consoleEl, rowsHost));
    const el = h("div", null, promptEl(ex), carried != null ? h("p", { class: "muted", style: { margin: "-0.8rem 0 0.8rem" } }, "Your code from the last question is already here. Build on it.") : null, hintBtn ? h("p", null, hintBtn) : null, ide);
    return {
      el,
      canCheck: () => ta.value.trim().length > 0 && ta.value !== st,
      async check() {
        NDC.clear(rowsHost);
        rowsHost.append(h("p", { class: "muted", style: { marginTop: "0.8rem" } }, "Checking…"));
        const rows = await NDC.run.runChecks(lang, ta.value, ex.checks);
        NDC.clear(rowsHost); rowsHost.append(checkRows(rows));
        const ok = rows.length === ex.checks.length && rows.every((r) => r.ok);
        if (!ok) stuck(rowsHost, ex, st, lang, (c) => { ta.value = c; ctx.ready(true); });
        if (rows.some((r) => r.fatal)) return { ok: false, noPenalty: true, answer: "Python couldn't load. Check your connection, then try again." };
        return { ok, retrySame: !ok, rows, code: ta.value };
      },
    };
  }

  /* ---------- web (HTML / CSS) ---------- */
  function web(ex, ctx) {
    const carried = ex.chain && ctx.carry ? ctx.carry() : null;
    const st = carried != null ? carried : ex.starter;
    const frame = h("iframe", { class: "preview", title: "Live preview", sandbox: "allow-same-origin" });
    const rowsHost = h("div");
    let t = null, hintEl = null;
    const ta = editor(st, { label: "Code editor", onInput: () => { clearTimeout(t); t = setTimeout(draw, 160); ctx.ready(ta.value.trim().length > 0 && ta.value !== st); } });
    const wrapDoc = (code) => /<html|<!doctype/i.test(code) ? code : `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;margin:16px;color:#111}</style></head><body>${code}</body></html>`;
    function draw() { frame.srcdoc = wrapDoc(ta.value); }
    draw();
    const resetBtn = h("button", { class: "link-btn", type: "button", onclick: () => { ta.value = st; draw(); ctx.ready(false); } }, "Reset");
    const hintBtn = ex.hint ? h("button", { class: "link-btn", type: "button", onclick: () => { if (!hintEl) { hintEl = h("p", { class: "muted", style: { marginTop: "0.6rem" } }, "Hint: ", NDC.rich(ex.hint)); el.insertBefore(hintEl, ide); } } }, "Need a hint?") : null;
    const ide = h("div", { class: "ide two" },
      h("div", { class: "ed-wrap" }, h("div", { class: "ed-head" }, h("span", null, "index.html"), resetBtn), ta),
      h("div", null, h("div", { class: "ed-wrap" }, h("div", { class: "ed-head" }, h("span", null, "Preview")), frame), rowsHost));
    const el = h("div", null, promptEl(ex), carried != null ? h("p", { class: "muted", style: { margin: "-0.8rem 0 0.8rem" } }, "Your code from the last question is already here. Build on it.") : null, hintBtn ? h("p", null, hintBtn) : null, ide);
    return {
      el,
      canCheck: () => ta.value.trim().length > 0 && ta.value !== st,
      async check() {
        clearTimeout(t); draw();
        await new Promise((res) => { frame.onload = res; setTimeout(res, 600); });
        const rows = NDC.run.runWebChecks(frame, ex.checks);
        NDC.clear(rowsHost); rowsHost.append(checkRows(rows));
        const ok = rows.every((r) => r.ok);
        if (!ok) stuck(rowsHost, ex, st, "web", (c) => { ta.value = c; draw(); ctx.ready(true); });
        return { ok, retrySame: !ok, rows, code: ta.value };
      },
    };
  }

  /* ---------- Arduino board simulator ---------- */
  function led(ex, ctx) {
    const params = Object.assign({}, ex.params);
    const ledEl = h("div", { class: "led", "aria-label": "LED" });
    const inputs = {};
    const box = h("div", { class: "sketch-box" });
    ex.sketch.split(/(\{\{\w+\}\})/).forEach((seg) => {
      const m = seg.match(/^\{\{(\w+)\}\}$/);
      if (m) {
        const inp = h("input", { type: "number", min: 1, max: 9999, value: params[m[1]], "aria-label": m[1], oninput: () => { params[m[1]] = Math.max(1, Math.min(9999, +inp.value || 1)); restart(); ctx.ready(true); } });
        inputs[m[1]] = inp; box.append(inp);
      } else box.append(NDC.highlight(seg, "ar"));
    });
    let timer = null, on = false;
    function restart() {
      clearTimeout(timer);
      const step = () => { on = !on; ledEl.classList.toggle("on", on); timer = setTimeout(step, Math.max(30, on ? params.on : params.off)); };
      on = false; step();
    }
    restart();
    const el = h("div", null, promptEl(ex),
      h("div", { class: "board px" }, h("div", { class: "led-wrap" }, ledEl, h("span", { class: "muted" }, "pin 13")), box),
      h("p", { class: "sim-note" }, "Change the numbers and watch the LED. 1000 ms is one second."));
    return {
      el, canCheck: () => true,
      destroy: () => clearTimeout(timer),
      async check() { clearTimeout(timer); const ok = !!ex.ok(params); return { ok, answer: ok ? null : "Try different numbers and count the blinks." }; },
    };
  }

  NDC.renderers = { mc, fill, order, type: typeAns, match, run, web, led };
})();
