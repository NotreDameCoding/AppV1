/* The Forge: a place to write and run code. Also the code viewer used by the Projects page.
   Limits keep it safe and quick: code length, run time (set in runner.js), output size and how fast you can press Run. */
(function () {
  const h = NDC.h;
  const MAX_CODE = 6000, MAX_OUT = 6000, MAX_LINES = 150, MIN_GAP = 800;

  const LANGS = {
    py: { name: "Python", file: "main.py", cmd: "python main.py", kind: "run", start: 'name = "Knight"\nfor i in range(3):\n    print(f"Hello, {name} #{i + 1}")\n' },
    js: { name: "JavaScript", file: "script.js", cmd: "node script.js", kind: "run", start: 'const squares = [1, 2, 3, 4].map((n) => n * n);\nconsole.log("Squares:", squares.join(", "));\n' },
    ht: { name: "HTML", file: "index.html", kind: "web", start: '<h1>Hello, Forge</h1>\n<p>Edit me and press Run.</p>\n<button onclick="this.textContent = \'Clicked!\'">Click me</button>\n' },
    cs: { name: "CSS", file: "style.css", kind: "web", start: '<h1 class="title">Styled with CSS</h1>\n<p>Change the rules below.</p>\n\n<style>\n  body { font-family: sans-serif; padding: 20px; }\n  .title { color: #1b2146; border-bottom: 4px solid gold; }\n</style>\n' },
    jv: { name: "Java", file: "Main.java", kind: "view", start: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Forge");\n    }\n}\n' },
    ar: { name: "Arduino", file: "sketch.ino", kind: "view", start: 'void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}\n' },
  };

  function clip(text) {
    let t = String(text || "");
    const lines = t.split("\n");
    let cut = false;
    if (lines.length > MAX_LINES) { t = lines.slice(0, MAX_LINES).join("\n"); cut = true; }
    if (t.length > MAX_OUT) { t = t.slice(0, MAX_OUT); cut = true; }
    return { text: t, cut };
  }

  /* an editor plus a terminal (Python, JavaScript), a live preview (HTML, CSS) or just the code (Java, Arduino) */
  NDC.codePad = function (opts) {
    const lang = opts.lang, L = LANGS[lang] || LANGS.py;
    const start = String(opts.code != null ? opts.code : L.start).slice(0, MAX_CODE);
    const ta = h("textarea", { class: "editor", spellcheck: "false", autocapitalize: "off", autocomplete: "off", maxlength: String(MAX_CODE), "aria-label": L.name + " code", rows: String(opts.rows || 14) });
    ta.value = start;
    const count = h("span", { class: "faint" }, "");
    const upd = () => { count.textContent = `${ta.value.length}/${MAX_CODE}`; opts.onChange && opts.onChange(ta.value); };
    ta.addEventListener("input", upd);
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Tab") { e.preventDefault(); ta.setRangeText(lang === "ht" || lang === "cs" ? "  " : "    ", ta.selectionStart, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input")); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); doRun(); }
    });
    upd();

    let last = 0, busy = false, frame = null;
    const term = h("pre", { class: "term" });
    const prompt = () => { NDC.clear(term); if (L.cmd) term.append(h("span", { class: "prompt" }, "$ " + L.cmd + "\n")); };
    prompt();
    term.append(h("span", { class: "dim" }, L.kind === "run" ? "Press Run (or Ctrl+Enter) to see the output here." : ""));

    async function doRun() {
      if (busy) return;
      const now = Date.now();
      if (now - last < MIN_GAP) return;
      last = now;
      if (L.kind === "web") {
        frame.srcdoc = ta.value;
        return;
      }
      if (L.kind !== "run") return;
      busy = true; runBtn.disabled = true;
      prompt();
      term.append(h("span", { class: "dim" }, lang === "py" && !NDC.run.pythonReady() ? "Starting Python (the first run takes a few seconds)…" : "Running…"));
      let r;
      try { r = await NDC.run.run(lang, ta.value); } catch (e) { r = { out: "", err: "Something went wrong running that." }; }
      prompt();
      const o = clip(r.out);
      if (o.text) term.append(o.text + "\n");
      if (o.cut) term.append(h("span", { class: "dim" }, "… output cut off\n"));
      if (r.err) term.append(h("span", { class: "err" }, String(r.err).slice(0, 600) + "\n"));
      if (!o.text && !r.err) term.append(h("span", { class: "dim" }, "(nothing printed)\n"));
      term.append(h("span", { class: "dim" }, "[finished]"));
      busy = false; runBtn.disabled = false;
    }
    const runBtn = h("button", { class: "btn small px", type: "button", onclick: doRun }, "Run");
    const resetBtn = h("button", { class: "link-btn", type: "button", onclick: () => { ta.value = start; upd(); if (L.kind === "web") frame.srcdoc = ta.value; else if (L.kind === "run") { prompt(); } } }, "Reset");
    if (lang === "py") NDC.run.warmPython();

    let side;
    if (L.kind === "web") {
      frame = h("iframe", { class: "preview forge-frame", title: "Preview", sandbox: "allow-scripts" });
      frame.srcdoc = ta.value;
      side = frame;
    } else if (L.kind === "run") side = term;
    else side = h("div", { class: "term" }, h("span", { class: "dim" }, `${L.name} can't run in the browser yet, so this is a place to write and read it. Copy it into your own tools to run it.`));

    const el = h("div", { class: "ide two forge-ide" },
      h("div", { class: "ed-wrap" },
        h("div", { class: "ed-head" }, h("span", null, L.file, " ", count), h("span", { class: "row", style: { gap: "0.9rem" } }, resetBtn, L.kind === "view" ? null : runBtn)), ta),
      h("div", null, side));
    return { el, getCode: () => ta.value };
  };

  /* project viewer: opens a project's code in a pad that can be run */
  NDC.viewProject = function (p) {
    const scrim = h("div", { class: "scrim", onclick: (e) => { if (e.target === scrim) close(); } });
    const close = () => { scrim.remove(); document.removeEventListener("keydown", esc); };
    const esc = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    const pad = NDC.codePad({ lang: p.lang || (p.languages || [])[0] || "py", code: p.code, rows: 16 });
    scrim.append(h("div", { class: "modal wide px", role: "dialog", "aria-modal": "true", "aria-label": p.title },
      h("div", { class: "row", style: { justifyContent: "space-between", alignItems: "start" } },
        h("div", null, h("h3", null, p.title), h("p", { class: "muted", style: { margin: "0.3rem 0 1rem" } }, (p.authors || []).join(", ") + (p.blurb ? " · " + p.blurb : ""))),
        h("button", { class: "btn small", type: "button", onclick: close }, "Close")),
      pad.el,
      h("p", { class: "muted", style: { fontSize: "0.85rem", marginTop: "0.8rem" } }, "You can change the code and run it here. Your changes aren't saved.")));
    document.body.append(scrim);
  };

  /* the page */
  const KEY = (l) => "ndc.forge." + l;
  const read = (l) => { try { return localStorage.getItem(KEY(l)); } catch (e) { return null; } };
  const write = (l, v) => { try { localStorage.setItem(KEY(l), v); } catch (e) {} };
  const LASTK = "ndc.forge.lang";

  NDC.pages.forge = function () {
    let lang = "py";
    try { const l = localStorage.getItem(LASTK); if (LANGS[l]) lang = l; } catch (e) {}
    const host = h("div"), tabs = h("div", { class: "row", style: { gap: "0.5rem", margin: "1.2rem 0" } });
    function draw() {
      NDC.clear(tabs); NDC.clear(host);
      Object.keys(LANGS).forEach((id) => tabs.append(h("button", { class: "btn small" + (lang === id ? " primary" : ""), type: "button", "aria-pressed": String(lang === id), onclick: () => { lang = id; try { localStorage.setItem(LASTK, id); } catch (e) {} draw(); } }, LANGS[id].name)));
      const saved = read(lang);
      const pad = NDC.codePad({ lang, code: saved != null ? saved : LANGS[lang].start, rows: 18, onChange: (v) => write(lang, v) });
      host.append(pad.el);
      const k = LANGS[lang].kind;
      host.append(h("p", { class: "muted", style: { fontSize: "0.9rem", marginTop: "0.9rem" } },
        k === "run" ? `Runs in your browser. Code is limited to ${MAX_CODE} characters, a run stops after a few seconds, and long output is cut off.`
          : k === "web" ? "The preview updates when you press Run. Code is limited to " + MAX_CODE + " characters."
            : `${LANGS[lang].name} can't run in the browser yet. You can still write and keep it here.`,
        " Your code is saved in this browser."));
    }
    draw();
    return h("div", { class: "page" }, h("div", { class: "wrap" },
      h("div", { class: "page-head" }, h("h1", null, "Forge"), h("p", null, "Write and run code in any language. Press Ctrl+Enter to run.")),
      tabs, host));
  };
})();
