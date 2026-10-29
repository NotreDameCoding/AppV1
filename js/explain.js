/* "Walk me through it": explains the answer to a code step one line at a time. */
(function () {
  const h = NDC.h;
  const q = (s) => "`" + s + "`";
  const lit = (v) => /^["'`]/.test(v) ? "the text " + v : /^-?\d+(\.\d+)?$/.test(v) ? "the number " + v : /^(True|False|true|false)$/.test(v) ? "the value " + v : /^\[/.test(v) ? "a list " + v : /^\{/.test(v) ? "a group of named values " + v : q(v);

  function code(lang, raw) {
    const line = raw.trim(), ind = /^\s+/.test(raw);
    const inside = ind ? " This line is indented, so it belongs to the block above it." : "";
    let m;
    if (!line || /^[})\];]+$/.test(line)) return null;
    if (lang === "py") {
      if (line.startsWith("#")) return "A comment. Python ignores it. It's just a note for people reading the code.";
      if ((m = line.match(/^print\((.*)\)$/))) { const a = m[1]; return (/^f["']/.test(a) ? `Shows a sentence on the screen. In an f-string, anything inside { } is replaced by that variable's value.` : /^["']/.test(a) ? `Shows ${a} on the screen exactly as typed.` : `Works out ${q(a)} and shows the result on the screen.`) + inside; }
      if ((m = line.match(/^def (\w+)\((.*)\):$/))) return `Starts a function called ${q(m[1])}` + (m[2] ? ` that takes ${m[2].includes(",") ? "the inputs" : "an input"} ${q(m[2])}.` : " that takes no inputs.") + " The indented lines under it are what it does.";
      if ((m = line.match(/^return (.*)$/))) return `Sends ${q(m[1])} back to whoever called the function.` + inside;
      if ((m = line.match(/^for (\w+) in range\((.*)\):$/))) return `A loop. It repeats the indented lines below, and ${q(m[1])} counts through ${q("range(" + m[2] + ")")}.`;
      if ((m = line.match(/^for (\w+) in (.+):$/))) return `A loop. It goes through ${q(m[2])} one item at a time, calling the current item ${q(m[1])}, and repeats the lines below for each.`;
      if ((m = line.match(/^while (.+):$/))) return `A loop that keeps repeating the lines below for as long as ${q(m[1])} is true.`;
      if ((m = line.match(/^if (.+):$/))) return `Checks whether ${q(m[1])} is true. If it is, the indented lines below run.` + inside;
      if ((m = line.match(/^elif (.+):$/))) return `If the earlier test failed, try this one: is ${q(m[1])} true? If so, the lines below run.`;
      if (line === "else:") return "If none of the earlier tests were true, the lines below run instead.";
      if (line === "try:") return "Try the risky lines below. If one fails with an error, Python jumps to the matching except instead of crashing.";
      if ((m = line.match(/^except (\w+):$/))) return `Runs only if the try block hit a ${q(m[1])}.`;
      if ((m = line.match(/^(\w+) (\+|-|\*|\/)= (.+)$/))) return `Changes ${q(m[1])} by ${m[2]} ${q(m[3])} and stores the new value back in ${q(m[1])}.` + inside;
      if ((m = line.match(/^(\w+) = \1 ([+\-*/]) (.+)$/))) return `Updates ${q(m[1])}: takes its current value, ${({ "+": "adds", "-": "subtracts", "*": "multiplies by", "/": "divides by" })[m[2]]} ${q(m[3])}, and stores the result back in ${q(m[1])}.` + inside;
      if ((m = line.match(/^(\w+)\[(.+)\] = (.+)$/))) return `Puts ${lit(m[3])} into ${q(m[1])} under the key ${q(m[2])}.`;
      if ((m = line.match(/^(\w+) = (.+)$/))) return `Makes a variable called ${q(m[1])} and stores ${lit(m[2])} in it.` + inside;
      if ((m = line.match(/^(\w+)\.(\w+)\((.*)\)$/))) return `Calls the ${q(m[2])} method on ${q(m[1])}${m[3] ? " with " + q(m[3]) : ""}.`;
      return "This line is part of the answer. It does what the question asked." + inside;
    }
    /* javascript */
    if (line.startsWith("//")) return "A comment. JavaScript ignores it. It's just a note for people.";
    if ((m = line.match(/^console\.log\((.*)\);?$/))) { const a = m[1]; return (/^`/.test(a) ? "Logs a sentence. In a template literal, anything inside ${ } is replaced by its value." : /^["']/.test(a) ? `Logs ${a} exactly as typed.` : `Works out ${q(a)} and logs the result.`) + inside; }
    if ((m = line.match(/^function (\w+)\((.*)\) \{$/))) return `Starts a function called ${q(m[1])}` + (m[2] ? ` that takes ${q(m[2])}.` : " that takes no inputs.") + " Everything until the closing } is what it does.";
    if ((m = line.match(/^return (.*?);?$/))) return `Sends ${q(m[1])} back to whoever called the function.` + inside;
    if ((m = line.match(/^(const|let) (\w+) = (\(.*\)|\w+) => (.*?);?$/))) return `Makes an arrow function called ${q(m[2])}. Give it ${q(m[3])} and it gives back ${q(m[4])}.`;
    if ((m = line.match(/^for \((let|const) (\w+) of (.+)\) \{$/))) return `A loop. It goes through ${q(m[3])} one item at a time, calling the current one ${q(m[2])}.`;
    if ((m = line.match(/^for \((.+); (.+); (.+)\) \{$/))) return `A loop. It starts with ${q(m[1])}, keeps going while ${q(m[2])} is true, and runs ${q(m[3])} after each pass.`;
    if ((m = line.match(/^while \((.+)\) \{$/))) return `Repeats the block below for as long as ${q(m[1])} is true.`;
    if ((m = line.match(/^\}? ?else if \((.+)\) \{$/))) return `If the earlier test failed, try this one: is ${q(m[1])} true? If so, the block runs.`;
    if ((m = line.match(/^if \((.+)\) (\{|console.*)$/))) return `Checks whether ${q(m[1])} is true. If it is, the code after it runs.` + inside;
    if (/^\} else \{$/.test(line)) return "If none of the earlier tests were true, this block runs instead.";
    if ((m = line.match(/^else (.*)$/))) return `The fallback: if nothing above matched, this runs.`;
    if ((m = line.match(/^(\w+)(\+\+|--);?$/))) return `${m[2] === "++" ? "Adds" : "Subtracts"} 1 ${m[2] === "++" ? "to" : "from"} ${q(m[1])}.` + inside;
    if ((m = line.match(/^(\w+) (\+|-|\*|\/)= (.+?);?$/))) return `Changes ${q(m[1])} by ${m[2]} ${q(m[3])} and stores the result back.` + inside;
    if ((m = line.match(/^(\w+) = \1 ([+\-*/]) (.+?);?$/))) return `Updates ${q(m[1])}: takes its current value, ${({ "+": "adds", "-": "subtracts", "*": "multiplies by", "/": "divides by" })[m[2]]} ${q(m[3])}, and stores it back in ${q(m[1])}.` + inside;
    if ((m = line.match(/^(const|let) (\w+) = (.+?);?$/))) return `Makes a ${m[1] === "const" ? "constant (it won't be reassigned)" : "variable (it can change later)"} called ${q(m[2])} and stores ${lit(m[3])} in it.`;
    if ((m = line.match(/^(\w+)\.(\w+) = (.+?);?$/))) return `Sets the ${q(m[2])} property of ${q(m[1])} to ${q(m[3])}.`;
    if ((m = line.match(/^(\w+)\.(\w+)\((.*)\);?$/))) return `Calls the ${q(m[2])} method on ${q(m[1])}${m[3] ? " with " + q(m[3]) : ""}.`;
    return "This line is part of the answer. It does what the question asked." + inside;
  }

  const TAGS = { h1: "the main heading", h2: "a smaller heading", h3: "a small heading", p: "a paragraph", a: "a link", img: "an image", ul: "a bulleted list", ol: "a numbered list", li: "one item in a list", strong: "bold, important text", em: "emphasized text", header: "the top section of the page", nav: "a group of navigation links", main: "the main content of the page", footer: "the bottom section of the page", section: "a section of content", article: "a self-contained piece of content", aside: "a side note", form: "a form", input: "a place for the visitor to type or choose something", label: "a text label for an input", button: "a button", textarea: "a big box for typing longer text", select: "a drop-down menu", option: "one choice in a drop-down", table: "a table", tr: "one row in the table", th: "a header cell", td: "a data cell", caption: "a caption for the table", video: "a video player", audio: "an audio player", figure: "a figure that groups media with its caption", figcaption: "the caption for a figure", title: "the page title shown on the browser tab", meta: "information about the page", div: "a generic box", span: "a generic piece of inline text", style: "a block of CSS styles", html: "the whole page", head: "the part of the page that holds information about it", body: "the visible part of the page" };
  const ATTR = { href: "where the link goes", src: "which file to load", alt: "a text description for people who can't see the image", id: "a unique name for the element", for: "which input this label belongs to", type: "what kind of input or button it is", name: "the name the form uses for this value", controls: "shows the play buttons", target: "where the link opens (_blank is a new tab)", rel: "safety information for links that open a new tab", charset: "the text encoding of the page" };
  function html(raw) {
    const line = raw.trim(); let m;
    if (!line) return null;
    if (/^<!doctype/i.test(line)) return "Tells the browser this is a modern HTML page.";
    if ((m = line.match(/^<!--(.*)-->$/))) return "A comment. The browser ignores it.";
    if ((m = line.match(/^<\/(\w+)>$/))) return null;
    if ((m = line.match(/^<(\w+)([^>]*)>(.*)$/))) {
      const tag = m[1].toLowerCase(), attrs = [...m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].filter((a) => a[1] !== "/");
      let text = m[3].replace(/<\/?[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const nested = [...m[3].matchAll(/<(\w+)/g)].map((x) => x[1]);
      let s = `Adds ${TAGS[tag] || "a " + tag + " element"}` + (text ? `, with the text “${text}”.` : ".");
      if (attrs.length) s += " " + attrs.map((a) => a[2] !== undefined ? `${q(a[1] + '="' + a[2] + '"')} sets ${ATTR[a[1]] || "an option"}.` : `${q(a[1])} turns on ${ATTR[a[1]] || "an option"}.`).join(" ");
      if (nested.length) s += ` Inside it sits ${nested.map((n) => TAGS[n] || "a " + n).join(" and ")}.`;
      return s;
    }
    return null;
  }

  const PROP = { color: "the text color", background: "the background", "background-color": "the background color", "font-size": "the text size", "font-weight": "how bold the text is", "font-family": "the font", "text-align": "how text lines up", "text-decoration": "underline and other text lines", "line-height": "the space between lines", padding: "the space inside the element", margin: "the space outside the element", border: "the border", "border-radius": "how rounded the corners are", "box-shadow": "a shadow", display: "how the element lays out its children", "justify-content": "how items spread along the main direction", "align-items": "how items line up across it", gap: "the space between items", width: "the width", height: "the height", "max-width": "the biggest width allowed", position: "how the element is positioned", top: "the distance from the top", right: "the distance from the right", transition: "how smoothly changes animate", "grid-template-columns": "the columns of the grid", "box-sizing": "whether padding counts inside the width" };
  function css(raw) {
    const line = raw.trim(); let m;
    if (!line || line === "</style>" || line === "}") return null;
    if (line === "<style>") return null;
    if ((m = line.match(/^@media (.*) \{$/))) return `Applies the styles inside only when ${q(m[1].replace(/^\(|\)$/g, ""))} is true, for example on a small screen.`;
    if ((m = line.match(/^([^{]+)\{(.*)\}$/))) {
      const sel = m[1].trim();
      const who = sel.endsWith(":hover") ? `${q(sel.replace(":hover", ""))} while the mouse is over it` : sel[0] === "." ? `every element with the class ${q(sel.slice(1))}` : sel[0] === "#" ? `the element with the id ${q(sel.slice(1))}` : /\s/.test(sel) ? `${q(sel)}` : `every ${q(sel)} element`;
      const decls = m[2].split(";").map((d) => d.trim()).filter(Boolean).map((d) => { const i = d.indexOf(":"); const p = d.slice(0, i).trim(), v = d.slice(i + 1).trim(); return `${q(p + ": " + v)} sets ${PROP[p] || p}`; });
      return `Styles ${who}. ` + decls.join("; ") + ".";
    }
    return null;
  }

  function linesOf(solution, base) {
    const have = {}; String(base || "").split("\n").forEach((l) => { const k = l.trim(); if (k) have[k] = (have[k] || 0) + 1; });
    const out = [];
    String(solution).split("\n").forEach((l) => { const k = l.trim(); if (!k) return; if (have[k]) { have[k]--; return; } out.push(l); });
    return out;
  }

  function panel(ex, base, onUse, lang) {
    const sol = ex.solution; if (!sol) return null;
    const isWeb = ex.type === "web";
    const rows = [];
    linesOf(sol, base).forEach((l) => {
      const t = isWeb ? (/\{/.test(l) && !/^</.test(l.trim()) || /^\s*@media/.test(l) ? css(l) : html(l)) : code(lang, l);
      if (t) rows.push(h("li", null, h("code", { class: "wl" }, l.replace(/\s+$/, "")), h("p", null, NDC.rich(t))));
    });
    if (!rows.length) rows.push(h("li", null, h("p", null, "Your code already has everything this step asks for. Run it and compare the output with the checks above.")));
    return h("div", { class: "walk" },
      h("h4", null, "Here is the answer, one line at a time"),
      h("p", { class: "muted" }, "Only the lines this step adds are shown. Everything above them is code you already wrote."),
      h("ol", { class: "walk-list" }, rows),
      h("button", { class: "btn small", type: "button", onclick: onUse }, "Put this code in the editor"));
  }

  NDC.explain = { panel, code, html, css, linesOf };
})();
