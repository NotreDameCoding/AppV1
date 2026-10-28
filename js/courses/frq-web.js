/* Free-response lessons for HTML and CSS: every step builds on the page from the last one. */
(function () {
  const Q = NDC.Q;
  const num = (s) => (String(s).match(/[\d.]+/g) || [0, 0, 0, 1]).map(Number);
  const avg = (c) => (c[0] + c[1] + c[2]) / 3;
  const KIND = {
    red: (c) => c[0] > 170 && c[1] < 100 && c[2] < 100,
    blue: (c) => c[2] > 170 && c[0] < 100,
    green: (c) => c[1] > 120 && c[0] < 110 && c[2] < 110,
    orange: (c) => c[0] > 200 && c[1] > 100 && c[1] < 210 && c[2] < 90,
    gold: (c) => c[0] > 200 && c[1] > 150 && c[2] < 100,
    dark: (c) => c[3] !== 0 && avg(c) < 90,
    light: (c) => avg(c) > 170,
  };
  const low = (s) => String(s || "").toLowerCase();
  /* a check is [label, kind, ...args] */
  function mk(c) {
    const [label, k, a, b, e] = c;
    const q = (d, s) => d.querySelector(s);
    const f = {
      has: (d) => d.querySelectorAll(a).length >= (b || 1),
      text: (d) => low((q(d, a) || {}).textContent).includes(low(b)),
      attr: (d) => { const el = q(d, a); if (!el || !el.hasAttribute(b)) return false; return e ? new RegExp(e, "i").test(el.getAttribute(b)) : true; },
      css: (d, w) => { const el = q(d, a); return !!el && new RegExp(e).test(w.getComputedStyle(el)[b]); },
      color: (d, w) => { const el = q(d, a); return !!el && KIND[e](num(w.getComputedStyle(el)[b])); },
      title: (d) => low(d.title).trim() === low(a),
      media: (d) => [...d.styleSheets].some((ss) => [...ss.cssRules].some((r) => r.media && new RegExp(a).test(r.conditionText || r.media.mediaText))),
    }[k];
    return { label, test: f };
  }
  const DATA = {};
  function lesson(id, o, ...steps) { DATA[id] = Object.assign({ steps }, o); }
  const S = (p, hint, h, c, checks, extra) => ({ p, hint, h, c, checks, extra });

  /* ============ HTML ============ */
  lesson("ht-1", { html: "" },
    S("Make a heading that says Welcome.", "A heading is an `h1` element.", "<h1>Welcome</h1>\n", "", [["Has an h1", "has", "h1"], ["The h1 says Welcome", "text", "h1", "welcome"]]),
    S("Add a paragraph under it that says We code every week.", "A paragraph is a `p` element.", "<p>We code every week.</p>\n", "", [["Has a p", "has", "p"], ["The p says what we do", "text", "p", "we code every week"]]),
    S("Add a smaller heading (h2) that says Join us.", "`h2` is one step smaller than `h1`.", "<h2>Join us</h2>\n", "", [["Has an h2", "has", "h2"], ["The h2 says Join us", "text", "h2", "join us"]]),
    S("Add a second paragraph that says Meetings are on Mondays.", "Another `p` element.", "<p>Meetings are on Mondays.</p>\n", "", [["Has two paragraphs", "has", "p", 2], ["Mentions Mondays", "text", "p:nth-of-type(2)", "monday"]]));

  lesson("ht-2", { html: "<!DOCTYPE html>\n<html>\n  <head>\n    \n  </head>\n  <body>\n    \n  </body>\n</html>\n", doc: true },
    S("Give the page a title of My Club inside the head.", "The `title` element goes inside `head`.", null, null, [["Title is My Club", "title", "my club"], ["Title is in the head", "has", "head > title"]], { ins: ["    \n  </head>", "    <title>My Club</title>\n  </head>"] }),
    S("Add an h1 in the body that says My Club.", "Headings go in the `body`.", null, null, [["Has an h1 in the body", "has", "body > h1"], ["The h1 says My Club", "text", "h1", "my club"]], { ins: ["    \n  </body>", "    <h1>My Club</h1>\n    \n  </body>"] }),
    S("Add a meta tag for the character set: charset utf-8, in the head.", "`<meta charset=\"utf-8\">` goes in the head.", null, null, [["meta charset in the head", "attr", "head > meta", "charset", "utf-8"]], { ins: ["    <title>", "    <meta charset=\"utf-8\">\n    <title>"] }),
    S("Add a paragraph in the body that says Welcome, knights.", "A `p` after the h1.", null, null, [["Has a paragraph in the body", "has", "body > p"], ["Says Welcome, knights", "text", "p", "welcome, knights"]], { ins: ["    \n  </body>", "    <p>Welcome, knights.</p>\n  </body>"] }));

  lesson("ht-3", { html: "" },
    S("Make an unordered list with three items: Python, JavaScript, HTML.", "`ul` holds `li` items.", "<ul>\n  <li>Python</li>\n  <li>JavaScript</li>\n  <li>HTML</li>\n</ul>\n", "", [["Has a ul", "has", "ul"], ["Has 3 list items", "has", "ul li", 3], ["First item is Python", "text", "ul li", "python"]]),
    S("Add a heading (h2) above the list that says Languages.", "Put the h2 before the `ul`.", "@pre<h2>Languages</h2>\n", "", [["Has an h2", "has", "h2"], ["It says Languages", "text", "h2", "languages"]]),
    S("Add an ordered list (ol) of three steps: Learn, Build, Share.", "`ol` numbers its items.", "<ol>\n  <li>Learn</li>\n  <li>Build</li>\n  <li>Share</li>\n</ol>\n", "", [["Has an ol", "has", "ol"], ["Has 3 steps", "has", "ol li", 3]]),
    S("Make the word Build in the ordered list bold using strong.", "Wrap just the word in `strong`.", "@rep<li>Build</li>|<li><strong>Build</strong></li>", "", [["Has a strong", "has", "strong"], ["It says Build", "text", "strong", "build"], ["It is inside the ol", "has", "ol strong"]]));

  lesson("ht-4", { html: "" },
    S("Add a link with the text Our school that goes to https://ndhs.org.", "`a` needs an `href`.", '<a href="https://ndhs.org">Our school</a>\n', "", [["Has a link", "has", "a"], ["href is ndhs.org", "attr", "a", "href", "ndhs.org"], ["Text says Our school", "text", "a", "our school"]]),
    S("Add an image of knight.png with the alt text A pixel knight.", "`img` needs `src` and `alt`.", '<img src="knight.png" alt="A pixel knight">\n', "", [["Has an img", "has", "img"], ["src is knight.png", "attr", "img", "src", "knight.png"], ["Has the alt text", "attr", "img", "alt", "pixel knight"]]),
    S("Add a second link with the text Contact that goes to contact.html.", "Another `a` element.", '<a href="contact.html">Contact</a>\n', "", [["Has two links", "has", "a", 2], ["Has a Contact link", "attr", "a[href='contact.html']", "href", "contact"]]),
    S("Wrap the knight image in a link that goes to home.html.", "Put the `img` inside an `a`.", "@rep<img src=\"knight.png\" alt=\"A pixel knight\">|<a href=\"home.html\"><img src=\"knight.png\" alt=\"A pixel knight\"></a>", "", [["The image is inside a link", "has", "a > img"], ["That link goes to home.html", "attr", "a:has(> img)", "href", "home.html"]]));

  lesson("ht-5", { html: "" },
    S("Make a header element containing an h1 that says Knights.", "`header` wraps the top of the page.", "<header>\n  <h1>Knights</h1>\n</header>\n", "", [["Has a header", "has", "header"], ["The h1 is inside it", "has", "header h1"]]),
    S("Add a main element with a paragraph that says Welcome.", "`main` holds the main content.", "<main>\n  <p>Welcome</p>\n</main>\n", "", [["Has a main", "has", "main"], ["The p is inside main", "has", "main p"]]),
    S("Add a footer with a paragraph that says 2026 Notre Dame Coding.", "`footer` goes last.", "<footer>\n  <p>2026 Notre Dame Coding</p>\n</footer>\n", "", [["Has a footer", "has", "footer"], ["The footer mentions Notre Dame", "text", "footer", "notre dame"]]),
    S("Add a nav with two links, Home and About, between the header and main.", "`nav` holds links.", "@rep<main>|<nav>\n  <a href=\"#\">Home</a>\n  <a href=\"#about\">About</a>\n</nav>\n<main>", "", [["Has a nav with 2 links", "has", "nav a", 2], ["nav comes before main", "has", "nav + main"]]));

  lesson("ht-6", { html: "" },
    S("Make a form containing a text input named name.", "`input` goes inside `form`.", '<form>\n  <input type="text" name="name">\n</form>\n', "", [["Has a form", "has", "form"], ["Has a text input named name", "attr", "form input", "name", "^name$"]]),
    S("Add a label that says Your name for that input (connect them with id and for).", "The input needs an `id` and the label's `for` must match.", "@rep<input type=\"text\" name=\"name\">|<label for=\"name\">Your name</label>\n  <input type=\"text\" id=\"name\" name=\"name\">", "", [["Has a label", "has", "label"], ["Label says Your name", "text", "label", "your name"], ["The label's for matches an input id", "has", "label[for='name'] + input#name"]]),
    S("Add a textarea named message inside the form.", "`textarea` is its own element.", "@rep</form>|  <textarea name=\"message\"></textarea>\n</form>", "", [["Has a textarea", "has", "form textarea"], ["Named message", "attr", "textarea", "name", "^message$"]]),
    S("Add a submit button that says Send.", "`button type=\"submit\"`.", "@rep</form>|  <button type=\"submit\">Send</button>\n</form>", "", [["Has a submit button", "attr", "form button", "type", "^submit$"], ["Says Send", "text", "button", "send"]]));

  lesson("ht-7", { html: "" },
    S("Make a table with one header row: Name and Score.", "`tr` is a row and `th` a header cell.", "<table>\n  <tr><th>Name</th><th>Score</th></tr>\n</table>\n", "", [["Has a table", "has", "table"], ["Has 2 header cells", "has", "th", 2]]),
    S("Add a row for Ana with a score of 10.", "Use `td` for data cells.", "@rep</table>|  <tr><td>Ana</td><td>10</td></tr>\n</table>", "", [["Has 2 rows", "has", "tr", 2], ["Has Ana", "text", "td", "ana"]]),
    S("Add a row for Sam with a score of 8.", "Another row.", "@rep</table>|  <tr><td>Sam</td><td>8</td></tr>\n</table>", "", [["Has 3 rows", "has", "tr", 3], ["Has a td with 8", "text", "tr:nth-of-type(3)", "sam"]]),
    S("Add a caption inside the table that says Scores.", "`caption` is the first child of the table.", "@rep<table>|<table>\n  <caption>Scores</caption>", "", [["Has a caption", "has", "table caption"], ["Says Scores", "text", "caption", "scores"]]));

  lesson("ht-8", { html: "" },
    S("Add a video with the source clip.mp4 and visible controls.", "Include the `controls` attribute.", '<video src="clip.mp4" controls></video>\n', "", [["Has a video", "has", "video"], ["Source is clip.mp4", "attr", "video", "src", "clip.mp4"], ["Has controls", "attr", "video", "controls"]]),
    S("Add an audio element with the source song.mp3 and controls.", "Same pattern as video.", '<audio src="song.mp3" controls></audio>\n', "", [["Has an audio", "has", "audio"], ["Source is song.mp3", "attr", "audio", "src", "song.mp3"], ["Has controls", "attr", "audio", "controls"]]),
    S("Add a figure that holds an image (knight.png, with alt text A knight).", "`figure` wraps media.", '<figure>\n  <img src="knight.png" alt="A knight">\n</figure>\n', "", [["Has a figure with an image", "has", "figure img"], ["The image has alt text", "attr", "img", "alt", "knight"]]),
    S("Add a figcaption inside the figure that says Our mascot.", "`figcaption` goes inside `figure`.", "@rep</figure>|  <figcaption>Our mascot</figcaption>\n</figure>", "", [["Has a figcaption in the figure", "has", "figure figcaption"], ["Says Our mascot", "text", "figcaption", "our mascot"]]));

  lesson("ht-9", { html: "" },
    S("Build a page skeleton with a header, a main and a footer.", "Three semantic elements.", "<header></header>\n<main></main>\n<footer></footer>\n", "", [["Has a header", "has", "header"], ["Has a main", "has", "main"], ["Has a footer", "has", "footer"]]),
    S("Put an h1 that says News in the header.", "The h1 goes inside the header.", "@rep<header></header>|<header>\n  <h1>News</h1>\n</header>", "", [["The h1 is in the header", "has", "header h1"], ["It says News", "text", "h1", "news"]]),
    S("Put an article inside main with an h2 (Meeting moved) and a paragraph.", "`article` is a self-contained piece.", "@rep<main></main>|<main>\n  <article>\n    <h2>Meeting moved</h2>\n    <p>We now meet on Monday.</p>\n  </article>\n</main>", "", [["Has an article in main", "has", "main article"], ["Has an h2 inside it", "has", "article h2"], ["Has a p inside it", "has", "article p"]]),
    S("Add an aside inside main with a paragraph that says Tip: bring a laptop.", "`aside` is a side note.", "@rep</main>|  <aside>\n    <p>Tip: bring a laptop.</p>\n  </aside>\n</main>", "", [["Has an aside in main", "has", "main aside"], ["Says the tip", "text", "aside", "bring a laptop"]]));

  lesson("ht-10", { html: "" },
    S("Make a form with an email input that has the label Email (id and for connected).", "The label's `for` equals the input's `id`.", '<form>\n  <label for="email">Email</label>\n  <input type="email" id="email" name="email">\n</form>\n', "", [["Has an email input", "attr", "input", "type", "^email$"], ["Label is connected", "has", "label[for='email'] + input#email"]]),
    S("Add a password input with the label Password.", "`type=\"password\"`", "@rep</form>|  <label for=\"pw\">Password</label>\n  <input type=\"password\" id=\"pw\" name=\"pw\">\n</form>", "", [["Has a password input", "has", "input[type='password']"], ["Has a Password label", "has", "label[for='pw']"]]),
    S("Add a select with three options: Freshman, Sophomore, Junior.", "`select` holds `option` elements.", "@rep</form>|  <select name=\"year\">\n    <option>Freshman</option>\n    <option>Sophomore</option>\n    <option>Junior</option>\n  </select>\n</form>", "", [["Has a select", "has", "select"], ["Has 3 options", "has", "option", 3]]),
    S("Add a checkbox with the label I agree.", "`type=\"checkbox\"` plus a label.", "@rep</form>|  <input type=\"checkbox\" id=\"agree\" name=\"agree\">\n  <label for=\"agree\">I agree</label>\n</form>", "", [["Has a checkbox", "has", "input[type='checkbox']"], ["Label says I agree", "text", "label[for='agree']", "i agree"]]));

  lesson("ht-11", { html: "" },
    S("Make a link with the text About that jumps to #about.", "`href=\"#about\"`", '<a href="#about">About</a>\n', "", [["Has an anchor link", "attr", "a", "href", "^#about$"]]),
    S("Add a section with the id about and a heading that says About us.", "`id=\"about\"` goes on the target element.", '<section id="about">\n  <h2>About us</h2>\n</section>\n', "", [["Has an element with id about", "has", "#about"], ["It has an h2 that says About us", "text", "#about h2", "about us"]]),
    S("Add an email link with the text Email us that goes to mailto:hi@school.org.", "Start the href with `mailto:`.", '<a href="mailto:hi@school.org">Email us</a>\n', "", [["Has a mailto link", "has", "a[href^='mailto:']"], ["Says Email us", "text", "a[href^='mailto:']", "email us"]]),
    S("Add a link to https://ndhs.org that opens in a new tab (target _blank with rel noopener).", "Two attributes: `target` and `rel`.", '<a href="https://ndhs.org" target="_blank" rel="noopener">School site</a>\n', "", [["Opens in a new tab", "has", "a[target='_blank']"], ["Has rel noopener", "attr", "a[target='_blank']", "rel", "noopener"]]));

  lesson("ht-12", { html: "" },
    S("Start a profile page: an h1 with your name (use Ada Lovelace) and a paragraph about you.", "An `h1` then a `p`.", "<h1>Ada Lovelace</h1>\n<p>I like math and machines.</p>\n", "", [["Has an h1", "has", "h1"], ["Has a paragraph", "has", "p"]]),
    S("Add a list of three things you like.", "A `ul` with three `li`.", "<ul>\n  <li>Math</li>\n  <li>Music</li>\n  <li>Machines</li>\n</ul>\n", "", [["Has a list with 3 items", "has", "ul li", 3]]),
    S("Add a picture with alt text and a link to a website.", "An `img` with `alt` and an `a` with `href`.", '<img src="ada.png" alt="Portrait of Ada">\n<a href="https://example.com">My website</a>\n', "", [["Has an image with alt", "attr", "img", "alt", "."], ["Has a link with an href", "attr", "a", "href", "."]]),
    S("Add a footer with a paragraph, and wrap your h1 in a header.", "`header` around the h1, `footer` at the end.", "@rep<h1>Ada Lovelace</h1>|<header>\n  <h1>Ada Lovelace</h1>\n</header>@end<footer>\n  <p>Thanks for visiting.</p>\n</footer>\n", "", [["The h1 is in a header", "has", "header h1"], ["Has a footer with a paragraph", "has", "footer p"]]));

  /* ============ CSS ============ */
  const css = (id, html, ...steps) => lesson(id, { html, css: true }, ...steps);
  const C = (p, hint, h, c, checks) => S(p, hint, h, c, checks);

  css("cs-1", "<h1>Knights</h1>\n<p>Welcome to the club.</p>\n",
    C("Make the h1 red.", "Select `h1` and set `color`.", "", "h1 { color: red; }\n", [["h1 is red", "color", "h1", "color", "red"]]),
    C("Make the paragraph blue.", "A rule for `p`.", "", "p { color: blue; }\n", [["h1 is still red", "color", "h1", "color", "red"], ["p is blue", "color", "p", "color", "blue"]]),
    C("Give the page a light background using body.", "Style `body` with `background`.", "", "body { background: #eef; }\n", [["Light page background", "color", "body", "backgroundColor", "light"]]),
    C("Make the h1 text 40px.", "Add `font-size` to the h1 rule.", "", "h1 { font-size: 40px; }\n", [["h1 is 40px", "css", "h1", "fontSize", "^40px$"], ["h1 is still red", "color", "h1", "color", "red"]]));

  css("cs-2", '<h1 class="title">Club</h1>\n<p class="note">First</p>\n<p>Second</p>\n<p id="last">Third</p>\n',
    C("Make every p green.", "Select by tag: `p`.", "", "p { color: green; }\n", [["Every p is green", "color", "p", "color", "green"]]),
    C("Make only the .note paragraph bold.", "A class selector starts with a dot.", "", ".note { font-weight: bold; }\n", [["The note is bold", "css", ".note", "fontWeight", "^(700|bold)$"], ["The second p is not bold", "css", "p:nth-of-type(2)", "fontWeight", "^(400|normal)$"]]),
    C("Give the element with id last a gold background.", "An id selector starts with #.", "", "#last { background: gold; }\n", [["#last is gold", "color", "#last", "backgroundColor", "gold"]]),
    C("Make the .title 36px.", "Class selector again.", "", ".title { font-size: 36px; }\n", [["Title is 36px", "css", ".title", "fontSize", "^36px$"], ["Note still bold", "css", ".note", "fontWeight", "^(700|bold)$"]]));

  css("cs-3", '<div class="box">Knight</div>\n',
    C("Give .box 20px of padding.", "`padding` adds space inside.", "", ".box { padding: 20px; }\n", [["20px padding", "css", ".box", "paddingTop", "^20px$"]]),
    C("Add a 3px solid border.", "`border: 3px solid black;`", "", ".box { border: 3px solid black; }\n", [["3px border", "css", ".box", "borderTopWidth", "^3px$"], ["Solid style", "css", ".box", "borderTopStyle", "^solid$"]]),
    C("Add 30px of margin around it.", "`margin` adds space outside.", "", ".box { margin: 30px; }\n", [["30px margin", "css", ".box", "marginTop", "^30px$"]]),
    C("Make the box 200px wide and use border-box sizing.", "`width` and `box-sizing: border-box`.", "", ".box { width: 200px; box-sizing: border-box; }\n", [["200px wide", "css", ".box", "width", "^200px$"], ["border-box", "css", ".box", "boxSizing", "^border-box$"]]));

  css("cs-4", '<h2 class="title">Club news</h2>\n<p>We meet every week to code and build things.</p>\n',
    C("Make the title 32px.", "`font-size`", "", ".title { font-size: 32px; }\n", [["32px title", "css", ".title", "fontSize", "^32px$"]]),
    C("Center the title.", "`text-align: center`", "", ".title { text-align: center; }\n", [["Centered", "css", ".title", "textAlign", "^center$"]]),
    C("Make the paragraph use a serif font.", "`font-family: Georgia, serif`", "", "p { font-family: Georgia, serif; }\n", [["Serif font", "css", "p", "fontFamily", "serif"]]),
    C("Give the paragraph a line height of 1.6.", "`line-height: 1.6`", "", "p { line-height: 1.6; }\n", [["Line height is 1.6 times the font size", "css", "p", "lineHeight", "^(25\\.6px|1\\.6)"]]));

  css("cs-5", '<div class="row"><span>A</span><span>B</span><span>C</span></div>\n',
    C("Make .row a flex container.", "`display: flex`", "", ".row { display: flex; }\n", [["display is flex", "css", ".row", "display", "^flex$"]]),
    C("Add a 10px gap between the items.", "`gap: 10px`", "", ".row { gap: 10px; }\n", [["10px gap", "css", ".row", "columnGap", "^10px$"]]),
    C("Center the items along the row.", "`justify-content: center`", "", ".row { justify-content: center; }\n", [["Centered", "css", ".row", "justifyContent", "^center$"]]),
    C("Make the row 120px tall and center the items vertically too.", "`height` and `align-items: center`.", "", ".row { height: 120px; align-items: center; }\n", [["120px tall", "css", ".row", "height", "^120px$"], ["align-items centered", "css", ".row", "alignItems", "^center$"], ["Still flex", "css", ".row", "display", "^flex$"]]));

  css("cs-6", '<div class="grid"><div>1</div><div>2</div><div>3</div><div>4</div></div>\n',
    C("Make .grid a grid container.", "`display: grid`", "", ".grid { display: grid; }\n", [["display is grid", "css", ".grid", "display", "^grid$"]]),
    C("Make two equal columns.", "`grid-template-columns: 1fr 1fr`", "", ".grid { grid-template-columns: 1fr 1fr; }\n", [["Two columns", "css", ".grid", "gridTemplateColumns", "^\\S+ \\S+$"]]),
    C("Add a 12px gap.", "`gap: 12px`", "", ".grid { gap: 12px; }\n", [["12px gap", "css", ".grid", "rowGap", "^12px$"]]),
    C("Give each cell a gold background.", "Select `.grid div`.", "", ".grid div { background: gold; }\n", [["Cells are gold", "color", ".grid div", "backgroundColor", "gold"], ["Still two columns", "css", ".grid", "gridTemplateColumns", "^\\S+ \\S+$"]]));

  css("cs-7", '<div class="panel">Hello</div>\n',
    C("Give .panel a dark background using a hex color.", "A hex color like `#111`.", "", ".panel { background: #111; }\n", [["Dark background", "color", ".panel", "backgroundColor", "dark"]]),
    C("Make its text light.", "`color: white;`", "", ".panel { color: white; }\n", [["Light text", "color", ".panel", "color", "light"], ["Dark background", "color", ".panel", "backgroundColor", "dark"]]),
    C("Make the background a gradient from #111 to #446.", "`linear-gradient(...)` goes in `background`.", "", ".panel { background: linear-gradient(#111, #446); }\n", [["Uses a gradient", "css", ".panel", "backgroundImage", "gradient"]]),
    C("Make the text color semi-see-through with rgba.", "`rgba(255, 255, 255, 0.8)`", "", ".panel { color: rgba(255, 255, 255, 0.8); }\n", [["Text uses rgba with alpha", "css", ".panel", "color", "rgba"]]));

  css("cs-8", '<div class="card">Knight</div>\n',
    C("Give .card a 2px solid border.", "`border: 2px solid black`", "", ".card { border: 2px solid black; }\n", [["2px border", "css", ".card", "borderTopWidth", "^2px$"]]),
    C("Round the corners by 12px.", "`border-radius: 12px`", "", ".card { border-radius: 12px; }\n", [["12px corners", "css", ".card", "borderTopLeftRadius", "^12px$"]]),
    C("Add a box shadow.", "`box-shadow: 0 4px 10px gray`", "", ".card { box-shadow: 0 4px 10px gray; }\n", [["Has a shadow", "css", ".card", "boxShadow", "^(?!none)"]]),
    C("Add 20px of padding so the text isn't cramped.", "`padding: 20px`", "", ".card { padding: 20px; }\n", [["20px padding", "css", ".card", "paddingTop", "^20px$"], ["Rounded still", "css", ".card", "borderTopLeftRadius", "^12px$"]]));

  css("cs-9", '<button class="btn">Press</button>\n<a href="#">Home</a>\n',
    C("Give .btn a gold background.", "`background: gold`", "", ".btn { background: gold; }\n", [["Gold button", "color", ".btn", "backgroundColor", "gold"]]),
    C("Add a rule so that .btn turns orange on hover.", "The selector is `.btn:hover`.", "", ".btn:hover { background: orange; }\n", [["Has a hover rule for .btn", "hoverrule", ".btn"]]),
    C("Make the button's changes smooth with a 0.3s transition.", "`transition: background 0.3s`", "", ".btn { transition: background 0.3s; }\n", [["Transition lasts 0.3s", "css", ".btn", "transitionDuration", "0.3s"]]),
    C("Make the link orange with no underline.", "`text-decoration: none`", "", "a { color: orange; text-decoration: none; }\n", [["Orange link", "color", "a", "color", "orange"], ["No underline", "css", "a", "textDecorationLine", "none"]]));

  css("cs-10", '<div class="card"><span class="badge">New</span></div>\n',
    C("Give .card a dark background, 200px wide and 100px tall.", "`width`, `height` and `background`.", "", ".card { width: 200px; height: 100px; background: #223; }\n", [["200px wide", "css", ".card", "width", "^200px$"], ["100px tall", "css", ".card", "height", "^100px$"]]),
    C("Make the card position: relative.", "`position: relative` makes it the anchor.", "", ".card { position: relative; }\n", [["Card is relative", "css", ".card", "position", "^relative$"]]),
    C("Make the badge position: absolute.", "`position: absolute` on the badge.", "", ".badge { position: absolute; }\n", [["Badge is absolute", "css", ".badge", "position", "^absolute$"]]),
    C("Pin the badge 8px from the top and 8px from the right.", "`top: 8px; right: 8px;`", "", ".badge { top: 8px; right: 8px; }\n", [["top 8px", "css", ".badge", "top", "^8px$"], ["right 8px", "css", ".badge", "right", "^8px$"], ["Still absolute", "css", ".badge", "position", "^absolute$"]]));

  css("cs-11", '<div class="wrap"><img src="x.png" alt="x"><h1>Hello</h1></div>\n',
    C("Make the image never wider than its container.", "`max-width: 100%`", "", "img { max-width: 100%; }\n", [["max-width is 100%", "css", "img", "maxWidth", "^100%$"]]),
    C("Make the h1 3rem.", "`font-size: 3rem`", "", "h1 { font-size: 3rem; }\n", [["h1 is 48px (3rem)", "css", "h1", "fontSize", "^48px$"]]),
    C("Add a media query for screens up to 600px.", "`@media (max-width: 600px) { ... }`", "", "@media (max-width: 600px) {\n  h1 { font-size: 1.5rem; }\n}\n", [["Has a max-width media query", "media", "max-width"]]),
    C("Inside the media query, also make .wrap have 10px of padding.", "Add the rule inside the same braces.", "", "@media (max-width: 600px) {\n  .wrap { padding: 10px; }\n}\n", [["Has a max-width media query", "media", "max-width"], ["Image still capped", "css", "img", "maxWidth", "^100%$"]]));

  css("cs-12", '<div class="card">\n  <h2 class="title">Club</h2>\n  <button class="go">Join</button>\n</div>\n',
    C("Give the card 20px padding, a 2px border and 12px rounded corners.", "`padding`, `border`, `border-radius`.", "", ".card { padding: 20px; border: 2px solid #333; border-radius: 12px; }\n", [["20px padding", "css", ".card", "paddingTop", "^20px$"], ["2px border", "css", ".card", "borderTopWidth", "^2px$"], ["12px corners", "css", ".card", "borderTopLeftRadius", "^12px$"]]),
    C("Center the title and make it 28px.", "`text-align` and `font-size`.", "", ".title { text-align: center; font-size: 28px; }\n", [["Centered", "css", ".title", "textAlign", "^center$"], ["28px", "css", ".title", "fontSize", "^28px$"]]),
    C("Style the button: gold background, dark text and rounded corners.", "Select `.go`.", "", ".go { background: gold; color: #222; border-radius: 8px; padding: 12px 24px; }\n", [["Gold button", "color", ".go", "backgroundColor", "gold"], ["Dark text", "color", ".go", "color", "dark"], ["Rounded", "css", ".go", "borderTopLeftRadius", "^[1-9]"]]),
    C("Add a hover rule so the button turns orange, and a shadow to the card.", "`.go:hover` and `box-shadow`.", "", ".go:hover { background: orange; }\n.card { box-shadow: 0 4px 10px gray; }\n", [["Hover rule", "hoverrule", ".go"], ["Card shadow", "css", ".card", "boxShadow", "^(?!none)"]]));

  /* hover rule check: some stylesheet rule whose selector is `<sel>:hover` */
  const base = mk;
  mk = function (c) {
    if (c[1] === "hoverrule") return { label: c[0], test: (d) => [...d.styleSheets].some((ss) => [...ss.cssRules].some((r) => r.selectorText && r.selectorText.replace(/\s/g, "") === c[2] + ":hover")) };
    return base(c);
  };

  /* ---------- build the exercises ---------- */
  function build(id, d) {
    let body = d.html || "", cssText = "";
    const out = [];
    d.steps.forEach((s, i) => {
      let doc;
      if (d.doc) {
        const [a, b] = (s.extra || {}).ins || [];
        body = body.replace(a, b);
        doc = body;
      } else {
        let h = s.h || "";
        if (h.startsWith("@pre")) body = h.slice(4) + body;
        else if (h.startsWith("@rep")) {
          const [spec, tail] = h.slice(4).split("@end");
          const [a, b] = spec.split("|");
          body = body.replace(a, b);
          if (tail) body += tail;
        } else body += h;
        cssText += s.c || "";
        doc = body + (d.css ? "<style>\n" + cssText.split("\n").filter(Boolean).map((l) => "  " + l).join("\n") + "\n</style>\n" : "");
      }
      const prev = i === 0 ? null : out[i - 1].solution;
      const start = i === 0 ? (d.css ? (d.html + "<style>\n  \n</style>\n") : d.html) : prev;
      out.push(Object.assign(Q.web(s.p, start, s.checks.map(mk), "Each step keeps the page you built before and adds to it.", s.hint), { chain: i > 0, solution: doc }));
    });
    return out;
  }
  NDC.courses.forEach((course) => course.units.forEach((u) => u.lessons.forEach((l) => {
    if (DATA[l.id]) l.ex = build(l.id, DATA[l.id]);
  })));
})();
