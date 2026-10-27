/* Tiny helpers shared by every page. No frameworks. */
window.NDC = window.NDC || { courses: [], pages: {}, lib: {} };

/* h("div", {class: "x", onclick: fn}, "text", childNode, ...)
   Strings are always inserted as text, never as HTML, so nothing a user types can inject markup. */
NDC.h = function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "style" && typeof v === "object") { for (const [sk, sv] of Object.entries(v)) { if (sv == null) continue; if (sk.startsWith("--")) el.style.setProperty(sk, sv); else el.style[sk] = sv; } }
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "dataset") Object.assign(el.dataset, v);
      else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, v);
    }
  }
  NDC.append(el, kids);
  return el;
};
NDC.append = function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
  return el;
};
/* Parse a trusted, generated SVG string (never user text) into a node. */
NDC.svg = function svg(markup) {
  const t = document.createElement("template");
  t.innerHTML = markup.trim();
  return t.content.firstChild;
};
NDC.clear = function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; };

NDC.dayKey = function dayKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};
NDC.parseDay = function parseDay(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
NDC.addDays = function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
NDC.fmtDate = function fmtDate(k, opts) { return NDC.parseDay(k).toLocaleDateString(undefined, opts || { weekday: "long", month: "long", day: "numeric" }); };

NDC.shuffle = function shuffle(arr, seed) {
  const a = arr.slice();
  let s = seed == null ? Math.floor(Math.random() * 1e9) : seed;
  const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
NDC.hash = function hash(str) { let x = 2166136261; for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; };

/* ---------- tiny syntax highlighter (safe: builds nodes, never HTML) ---------- */
NDC.highlight = function highlight(code, lang) {
  const KW = {
    py: "def return if elif else for while in import from as class True False None and or not break continue pass print range len",
    jv: "public private static void class int double boolean String if else for while return new true false null import break continue final char long",
    js: "const let var function return if else for while of in new true false null undefined class import export break continue typeof async await",
    ar: "void int long float boolean byte char if else for while return true false HIGH LOW INPUT OUTPUT INPUT_PULLUP const unsigned",
    ht: "", cs: "",
  }[lang] || "";
  const kw = new Set(KW.split(" ").filter(Boolean));
  const out = document.createDocumentFragment();
  const push = (cls, text) => {
    if (!cls) out.append(document.createTextNode(text));
    else { const s = document.createElement("span"); s.className = cls; s.textContent = text; out.append(s); }
  };
  if (lang === "ht" || lang === "cs") {
    const re = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][\w-]*)|(\/?>)|("[^"]*"|'[^']*')|(\b[\w-]+(?=\s*[:=]))|(\/\*[\s\S]*?\*\/)|(#[0-9a-fA-F]{3,8}\b|\b\d+(\.\d+)?(px|rem|em|%|vh|vw|fr|s)?\b)|(@[\w-]+)/g;
    let last = 0, m;
    while ((m = re.exec(code))) {
      if (m.index > last) push(null, code.slice(last, m.index));
      const t = m[0];
      if (m[1] || m[6]) push("tk-c", t);
      else if (m[2] || m[3]) push("tk-k", t);
      else if (m[4]) push("tk-s", t);
      else if (m[5]) push("tk-t", t);
      else if (m[7]) push("tk-n", t);
      else if (m[9]) push("tk-k", t);
      else push(null, t);
      last = m.index + t.length;
    }
    if (last < code.length) push(null, code.slice(last));
    return out;
  }
  const re = /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w]*)(?=\s*\()|([A-Za-z_][\w]*)/g;
  let last = 0, m;
  while ((m = re.exec(code))) {
    if (m.index > last) push(null, code.slice(last, m.index));
    const t = m[0];
    if (m[1]) { if (lang !== "py" && t[0] === "#") push(null, t); else push("tk-c", t); }
    else if (m[2]) push("tk-s", t);
    else if (m[3]) push("tk-n", t);
    else if (m[4]) push(kw.has(t) ? "tk-k" : "tk-f", t);
    else if (m[5]) push(kw.has(t) ? "tk-k" : null, t);
    else push(null, t);
    last = m.index + t.length;
  }
  if (last < code.length) push(null, code.slice(last));
  return out;
};
NDC.codeBlock = function codeBlock(code, lang) {
  const pre = NDC.h("pre", { class: "code" });
  pre.append(NDC.highlight(code, lang));
  return pre;
};

/* Rich-ish text: `backticks` become inline code and **double stars** become bold. */
NDC.rich = function rich(text) {
  const frag = document.createDocumentFragment();
  String(text).split(/(`[^`]+`|\*\*[^*]+\*\*)/).forEach((part) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) frag.append(NDC.h("code", { class: "inline" }, part.slice(1, -1)));
    else if (part.startsWith("**") && part.endsWith("**") && part.length > 4) frag.append(NDC.h("strong", null, part.slice(2, -2)));
    else if (part) frag.append(document.createTextNode(part));
  });
  return frag;
};

NDC.toast = function toast(title, sub) {
  let box = document.querySelector(".toasts");
  if (!box) { box = NDC.h("div", { class: "toasts", "aria-live": "polite" }); document.body.append(box); }
  const t = NDC.h("div", { class: "toast px" }, title, sub ? NDC.h("small", null, sub) : null);
  box.append(t);
  setTimeout(() => t.remove(), 4800);
};

/* tiny pub/sub */
NDC.bus = (() => {
  const m = {};
  return {
    on(ev, fn) { (m[ev] = m[ev] || []).push(fn); return () => { m[ev] = m[ev].filter((f) => f !== fn); }; },
    emit(ev, d) { (m[ev] || []).slice().forEach((f) => f(d)); },
  };
})();

NDC.ring = function ring(pct, color, glyph, size) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, pct)));
  const el = NDC.h("span", { class: "ring", style: size ? { "--size": size + "px" } : null });
  el.append(NDC.svg(`<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="${r}" fill="none" stroke="#29314d" stroke-width="6"/><circle cx="30" cy="30" r="${r}" fill="none" stroke="${color}" stroke-width="6" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" stroke-linecap="butt"/></svg>`));
  el.append(NDC.h("span", { class: "glyph", style: { color } }, glyph));
  return el;
};
