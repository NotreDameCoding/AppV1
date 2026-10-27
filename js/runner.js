/* Runs member code safely in the browser.
   JavaScript: a Web Worker (can be stopped if it loops forever).
   Python: Pyodide (real CPython compiled to WebAssembly) in a Web Worker, loaded the first time it's needed.
   HTML/CSS: a sandboxed iframe with scripts turned off. */
(function () {
  const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

  const JS_WORKER = `
    const fmt = (a) => a.map((x) => {
      if (typeof x === "string") return x;
      if (typeof x === "function") return String(x);
      if (x === undefined) return "undefined";
      try { return JSON.stringify(x); } catch (_) { return String(x); }
    }).join(" ");
    self.onmessage = (e) => {
      const out = [];
      const con = { log: (...a) => out.push(fmt(a)), info: (...a) => out.push(fmt(a)), warn: (...a) => out.push(fmt(a)), error: (...a) => out.push(fmt(a)) };
      try { new Function("console", e.data.code)(con); postMessage({ id: e.data.id, out: out.join("\\n") }); }
      catch (err) { postMessage({ id: e.data.id, out: out.join("\\n"), err: String(err && err.message || err) }); }
    };`;

  const PY_WORKER = `
    importScripts("${PYODIDE}pyodide.js");
    const ready = loadPyodide({ indexURL: "${PYODIDE}" });
    self.onmessage = async (e) => {
      const { id, code } = e.data;
      let py;
      try { py = await ready; } catch (err) { postMessage({ id, fatal: "Couldn't load Python. Check your connection and try again." }); return; }
      const out = [];
      py.setStdout({ batched: (s) => out.push(s) });
      py.setStderr({ batched: (s) => out.push(s) });
      try {
        const g = py.globals.get("dict")();
        py.runPython(code, { globals: g });
        g.destroy();
        postMessage({ id, out: out.join("\\n") });
      } catch (err) {
        const lines = String(err && err.message || err).trim().split("\\n").filter(Boolean);
        postMessage({ id, out: out.join("\\n"), err: lines.slice(-1)[0] });
      }
    };`;

  let jsW = null, pyW = null, pyLoaded = false, seq = 0;
  const pending = new Map();

  function makeWorker(src) {
    const url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
    const w = new Worker(url);
    w.onmessage = (e) => { const p = pending.get(e.data.id); if (p) { pending.delete(e.data.id); p.resolve(e.data); } };
    w.onerror = (e) => { e.preventDefault && e.preventDefault(); };
    return w;
  }

  function call(kind, code, ms) {
    return new Promise((resolve) => {
      let w;
      try {
        if (kind === "js") w = jsW = jsW || makeWorker(JS_WORKER);
        else w = pyW = pyW || makeWorker(PY_WORKER);
      } catch (e) { resolve({ out: "", err: "This browser blocked the code runner." }); return; }
      const id = ++seq;
      const timer = setTimeout(() => {
        pending.delete(id);
        if (kind === "js") { jsW.terminate(); jsW = null; } else { pyW.terminate(); pyW = null; pyLoaded = false; }
        resolve({ out: "", err: "That took too long. Is there a loop that never ends?" });
      }, ms);
      pending.set(id, { resolve: (d) => { clearTimeout(timer); if (kind === "py" && !d.fatal) pyLoaded = true; resolve(d.fatal ? { out: "", err: d.fatal } : d); } });
      w.postMessage({ id, code });
    });
  }

  const norm = (s) => String(s == null ? "" : s).replace(/\r/g, "").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").trim();

  NDC.run = {
    pythonReady: () => pyLoaded,
    warmPython() { if (!pyW) { try { pyW = makeWorker(PY_WORKER); pyW.postMessage({ id: ++seq, code: "1" }); } catch (e) {} } },

    run(lang, code) {
      if (lang === "js") return call("js", code, 3000);
      if (lang === "py") return call("py", code, pyLoaded ? 5000 : 60000);
      return Promise.resolve({ out: "", err: "This language can't run here." });
    },

    /* run the member's code once per check, compare the printed output */
    async runChecks(lang, userCode, checks) {
      const rows = [];
      for (const c of checks) {
        let code = userCode;
        if (c.replace) code = code.replace(new RegExp(c.replace[0]), c.replace[1]);
        if (c.append) code += "\n" + c.append;
        const r = await NDC.run.run(lang, code);
        const got = norm(r.out);
        const want = norm(c.out);
        const ok = !r.err && got === want;
        rows.push({ ok, label: c.label || `Prints ${want.split("\n").length > 1 ? "this" : "“" + want + "”"}`, got, want, err: r.err, fatal: r.err && /Couldn't load Python/.test(r.err) });
        if (r.err && /Couldn't load Python|too long/.test(r.err)) break;
      }
      return rows;
    },

    norm,

    /* web exercises: returns the rows of passed/failed checks against the rendered page */
    runWebChecks(iframe, checks) {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      return checks.map((c) => {
        let ok = false;
        try { ok = !!c.test(doc, win); } catch (e) { ok = false; }
        return { ok, label: c.label };
      });
    },
  };
})();
