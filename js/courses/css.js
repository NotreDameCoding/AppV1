(function () {
  const Q = NDC.Q;
  const cs = (win, el, p) => win.getComputedStyle(el)[p];
  const rgb = (win, el, p) => (cs(win, el, p).match(/[\d.]+/g) || [0, 0, 0, 1]).map(Number);
  const avg = (c) => (c[0] + c[1] + c[2]) / 3;

  NDC.courses.push({
    id: "cs", name: "CSS", lang: "cs", hex: "#a58bff", color: "var(--c-cs)", glyph: "Cs",
    tagline: "Make pages look the way you picture them. Layout, color and type.",
    runnable: true,
    units: [
      {
        title: "Selectors and color", blurb: "Point at things and style them.",
        lessons: [
          {
            id: "cs-1", title: "Your first rule", blurb: "Selector, property, value.",
            intro: { text: "A CSS rule has a selector (what to style) and declarations (how). Each declaration is a property, a colon, a value, and a semicolon.", code: "h1 {\n  color: blue;\n  font-size: 32px;\n}" },
            ex: [
              Q.mc("In `h1 { color: blue; }`, what is `color`?", ["The property", "The selector", "The value", "The element"], 0, "`h1` is the selector, `color` the property, and `blue` the value."),
              Q.fill("Fill in the property that changes text color.", "h1 { ___: blue; }", ["color", "font", "paint", "text"], "color", "`color` sets the text color."),
              Q.web("Make every paragraph red.", "<p>Hello</p>\n<p>World</p>\n<style>\n  /* your rule here */\n</style>\n", [{ label: "Every p is red", test: (d, w) => { const ps = [...d.querySelectorAll("p")]; return ps.length >= 2 && ps.every((p) => { const c = rgb(w, p, "color"); return c[0] > 170 && c[1] < 100 && c[2] < 100; }); } }], "Select `p` and set its `color`.", "p { color: red; }"),
              Q.mc("What ends each declaration?", ["A semicolon", "A comma", "A period", "A slash"], 0, "Without the `;` the next declaration can break."),
              Q.fill("Close the rule.", "p {\n  color: teal;\n___", ["}", ")", "]", ">"], "}", "Rules open and close with curly braces."),
              Q.web("Give the page a dark background and light paragraph text.", "<p>Night mode</p>\n<style>\n  \n</style>\n", [{ label: "Dark page background", test: (d, w) => { const c = rgb(w, d.body, "backgroundColor"); return c[3] !== 0 && avg(c) < 90; } }, { label: "Light paragraph text", test: (d, w) => avg(rgb(w, d.querySelector("p"), "color")) > 170 }], "Style `body` for the background and `p` for the text.", "body { background: #111; } p { color: white; }"),
            ],
          },
          {
            id: "cs-2", title: "Selectors", blurb: "Style the right things.",
            intro: { text: "Pick elements by tag (`p`), by class (`.card`), or by id (`#title`). A class can be used many times. An id should be used once.", code: ".badge { color: gold; }\n#title { font-size: 40px; }" },
            ex: [
              Q.match("Match each selector to what it picks.", [["p", "every paragraph"], [".card", "elements with class=\"card\""], ["#title", "the element with id=\"title\""]], "Dot for class, hash for id."),
              Q.mc("How do you select elements with class=\"note\"?", [".note", "#note", "note", "*note"], 0, "A dot means class."),
              Q.fill("Pick the paragraph with class badge.", "___ { color: gold; }", [".badge", "#badge", "badge", "p.class"], ".badge", "Classes start with a dot."),
              Q.web("Give only the badge a gold background.", '<p class="badge">New</p>\n<p>Plain</p>\n<style>\n  \n</style>\n', [{ label: "The badge is gold", test: (d, w) => { const c = rgb(w, d.querySelector(".badge"), "backgroundColor"); return c[0] > 200 && c[1] > 120 && c[2] < 120 && c[3] !== 0; } }, { label: "The plain paragraph is not", test: (d, w) => { const c = rgb(w, d.querySelectorAll("p")[1], "backgroundColor"); return c[3] === 0 || c[2] > 150; } }], "Select the class, not every `p`.", ".badge { background: gold; }"),
              Q.mc("An id should be used...", ["Once per page", "As many times as you like", "Only on images", "Only on headings"], 0, "Ids are unique. Use classes when you need to reuse."),
              Q.web("Make only the heading with id=\"title\" blue.", '<h1 id="title">Title</h1>\n<h1>Other</h1>\n<style>\n  \n</style>\n', [{ label: "#title is blue", test: (d, w) => { const c = rgb(w, d.getElementById("title"), "color"); return c[2] > 150 && c[0] < 100; } }, { label: "The other h1 is not blue", test: (d, w) => { const c = rgb(w, d.querySelectorAll("h1")[1], "color"); return !(c[2] > 150 && c[0] < 100); } }], "Hash for id.", "#title { color: blue; }"),
            ],
          },
        ],
      },
      {
        title: "Boxes and type", blurb: "Space around things, and how text looks.",
        lessons: [
          {
            id: "cs-3", title: "The box model", blurb: "Content, padding, border, margin.",
            intro: { text: "Every element is a box. From the inside out: content, `padding`, `border`, then `margin`. Padding is space inside the border. Margin is space outside it. Right-click and choose Inspect in any browser to see the layers.", code: ".box {\n  padding: 20px;\n  border: 2px solid black;\n  margin: 10px;\n}" },
            ex: [
              Q.mc("From the inside out, what is the order of the box layers?", ["content, padding, border, margin", "margin, border, padding, content", "content, margin, padding, border", "padding, content, border, margin"], 0, "Content sits in the middle, wrapped by padding, then border, then margin."),
              Q.fill("Add space inside the box.", ".box { ___: 20px; }", ["padding", "margin", "border", "gap"], "padding", "Padding is inside the border."),
              Q.web("Give .box 20px of padding on all sides.", '<div class="box">Hello</div>\n<style>\n  .box { background: #ddd; }\n</style>\n', [{ label: "Padding is 20px on all sides", test: (d, w) => { const b = d.querySelector(".box"); return ["Top", "Right", "Bottom", "Left"].every((s) => cs(w, b, "padding" + s) === "20px"); } }], "One `padding` value applies to all four sides.", "padding: 20px;"),
              Q.mc("Which one pushes OTHER elements away?", ["margin", "padding", "content", "background"], 0, "Margin is the space outside the border."),
              Q.web("Give .box a 2px solid border and a 10px margin.", '<div class="box">Hello</div>\n<style>\n  .box { background: #ddd; padding: 8px; }\n</style>\n', [{ label: "2px solid border", test: (d, w) => { const b = d.querySelector(".box"); return cs(w, b, "borderTopWidth") === "2px" && cs(w, b, "borderTopStyle") === "solid"; } }, { label: "10px margin", test: (d, w) => cs(w, d.querySelector(".box"), "marginTop") === "10px" }], "A border needs a width, a style, and a color.", "border: 2px solid black; margin: 10px;"),
              Q.mc("A box is 200px wide, with 20px padding and a 5px border on each side (default box-sizing). How wide is it on the page?", ["250px", "200px", "225px", "260px"], 0, "200 + 20 + 20 + 5 + 5 = 250.", ".box { width: 200px; padding: 20px; border: 5px solid; }"),
            ],
          },
          {
            id: "cs-4", title: "Text and fonts", blurb: "Size, weight, alignment.",
            intro: { text: "`font-size`, `font-weight`, `text-align` and `line-height` shape text. `font-family` takes a list, and the browser uses the first one it has.", code: "h1 {\n  font-family: Georgia, serif;\n  font-size: 40px;\n  text-align: center;\n}" },
            ex: [
              Q.fill("Make the text bigger.", "p { ___: 20px; }", ["font-size", "text-size", "size", "font-height"], "font-size", "The full property name is `font-size`."),
              Q.mc("Why does `font-family` take a list?", ["The browser uses the first font it has, and falls back to the next", "It mixes the fonts together", "It only works with two fonts", "It picks randomly"], 0, "That list is called a font stack."),
              Q.web("Center the heading and make it 24px.", "<h1>Welcome</h1>\n<style>\n  \n</style>\n", [{ label: "Centered", test: (d, w) => cs(w, d.querySelector("h1"), "textAlign") === "center" }, { label: "24px", test: (d, w) => cs(w, d.querySelector("h1"), "fontSize") === "24px" }], "Two declarations on `h1`.", "h1 { text-align: center; font-size: 24px; }"),
              Q.mc("What does `line-height` change?", ["The space between lines of text", "How tall the screen is", "The height of images", "The font size"], 0, "More line-height makes paragraphs easier to read."),
              Q.web("Make the link bold with no underline.", '<a href="#">Read more</a>\n<style>\n  \n</style>\n', [{ label: "Bold", test: (d, w) => parseInt(cs(w, d.querySelector("a"), "fontWeight"), 10) >= 700 }, { label: "No underline", test: (d, w) => cs(w, d.querySelector("a"), "textDecorationLine") === "none" }], "`font-weight` and `text-decoration`.", "a { font-weight: bold; text-decoration: none; }"),
              Q.match("Match each property to what it changes.", [["font-size", "how big the text is"], ["font-weight", "how bold it is"], ["text-align", "left, center or right"], ["color", "the text color"]], "The big four of typography."),
            ],
          },
        ],
      },
      {
        title: "Layout", blurb: "Flexbox and grid.",
        lessons: [
          {
            id: "cs-5", title: "Flexbox", blurb: "Line things up in a row or column.",
            intro: { text: "`display: flex` lines up an element's children in a row. `justify-content` spaces them along the row, `align-items` lines them up across it, and `gap` adds space between them.", code: ".row {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 10px;\n}" },
            ex: [
              Q.mc("What does `display: flex` do to an element's children?", ["Lines them up in a row", "Hides them", "Makes them all the same color", "Rotates them"], 0, "Row is the default direction."),
              Q.fill("Center the children along the row.", ".row { display: flex; justify-content: ___; }", ["center", "middle", "align", "centered"], "center", "`justify-content: center` centers along the main axis."),
              Q.web("Make .row a flex container with a 10px gap.", '<div class="row"><span>A</span><span>B</span><span>C</span></div>\n<style>\n  \n</style>\n', [{ label: "display is flex", test: (d, w) => cs(w, d.querySelector(".row"), "display") === "flex" }, { label: "gap is 10px", test: (d, w) => cs(w, d.querySelector(".row"), "columnGap") === "10px" }], "Two declarations on `.row`.", ".row { display: flex; gap: 10px; }"),
              Q.web("Center the items both ways inside .row.", '<div class="row"><span>A</span><span>B</span></div>\n<style>\n  .row { display: flex; height: 120px; background: #ddd; }\n</style>\n', [{ label: "justify-content is center", test: (d, w) => cs(w, d.querySelector(".row"), "justifyContent") === "center" }, { label: "align-items is center", test: (d, w) => cs(w, d.querySelector(".row"), "alignItems") === "center" }], "One property for each direction.", "justify-content: center; align-items: center;"),
              Q.mc("Which property stacks flex children in a column?", ["flex-direction: column", "display: column", "flex-flow: stack", "align-items: column"], 0, "`flex-direction` picks row or column."),
              Q.match("Match each flexbox property to its job.", [["justify-content", "spaces items along the main axis"], ["align-items", "lines items up across it"], ["gap", "space between items"], ["flex-wrap", "lets items wrap to a new line"]], "These four cover most layouts."),
            ],
          },
          {
            id: "cs-6", title: "Grid and sizing", blurb: "Two-dimensional layout.",
            intro: { text: "`display: grid` makes rows and columns. `grid-template-columns: repeat(3, 1fr)` makes three equal columns. Make images shrink to fit with `max-width: 100%`.", code: ".gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;\n}\nimg { max-width: 100%; }" },
            ex: [
              Q.mc("Which declaration turns an element into a grid?", ["display: grid", "grid: on", "layout: grid", "position: grid"], 0, "Same idea as flex: set `display`."),
              Q.fill("Make three equal columns.", ".g { display: grid; grid-template-columns: ___(3, 1fr); }", ["repeat", "loop", "columns", "equal"], "repeat", "`repeat(3, 1fr)` is shorthand for `1fr 1fr 1fr`."),
              Q.web("Make .g a grid with three columns.", '<div class="g"><p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p></div>\n<style>\n  \n</style>\n', [{ label: "display is grid", test: (d, w) => cs(w, d.querySelector(".g"), "display") === "grid" }, { label: "three columns", test: (d, w) => cs(w, d.querySelector(".g"), "gridTemplateColumns").trim().split(/\s+/).length === 3 }], "Use `repeat(3, 1fr)`.", ".g { display: grid; grid-template-columns: repeat(3, 1fr); }"),
              Q.mc("What is a media query for?", ["Changing styles based on screen size", "Loading images", "Playing audio", "Saving a file"], 0, "It lets one page adapt to phones and desktops."),
              Q.mc("When does this rule apply?", ["When the screen is 600px wide or less", "When it is exactly 600px", "When it is 600px or wider", "Always"], 0, "`max-width` means up to that size.", "@media (max-width: 600px) {\n  body { font-size: 14px; }\n}"),
              Q.web("Make the image never wider than its container.", '<div style="width:120px"><img src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27200%27%3E%3Crect width=%27400%27 height=%27200%27 fill=%27%23a58bff%27/%3E%3C/svg%3E" alt="Purple box"></div>\n<style>\n  \n</style>\n', [{ label: "max-width is 100%", test: (d, w) => cs(w, d.querySelector("img"), "maxWidth") === "100%" }, { label: "The image fits inside 120px", test: (d, w) => d.querySelector("img").getBoundingClientRect().width <= 121 }], "`max-width: 100%` on the img.", "img { max-width: 100%; }"),
            ],
          },
        ],
      },
      {
        title: "Looks", blurb: "Color, borders and shadows.",
        lessons: [
          {
            id: "cs-7", title: "Color and backgrounds", blurb: "Hex, rgb and gradients.",
            intro: { text: "Colors can be names (`gold`), hex codes (`#f4b942`), or `rgb(244, 185, 66)`. Add a fourth value, `rgba(0, 0, 0, 0.5)`, for transparency. `background` can also be a gradient like `linear-gradient(to right, red, blue)`.", code: ".box {\n  background: #f4b942;\n  color: #111;\n}\n.banner {\n  background: linear-gradient(to right, red, blue);\n}" },
            ex: [
              Q.mc("Which color is `#000000`?", ["Black", "White", "Red", "Transparent"], 0, "No red, green or blue light at all is black. `#ffffff` is white."),
              Q.mc("Which value makes a color half see-through?", ["rgba(0, 0, 0, 0.5)", "rgb(0, 0, 0, 5)", "half(black)", "#00000"], 0, "The fourth number in `rgba` is the opacity from 0 to 1."),
              Q.fill("Make a left-to-right gradient.", "background: ___(to right, red, blue);", ["linear-gradient", "gradient", "blend", "mix"], "linear-gradient", "The function is `linear-gradient`."),
              Q.web("Give the box a gold background (#f4b942) and dark text.", '<div class="box">Hello</div>\n<style>\n  .box { padding: 20px; }\n</style>\n', [{ label: "Gold background", test: (d, w) => { const c = rgb(w, d.querySelector(".box"), "backgroundColor"); return Math.abs(c[0] - 244) < 25 && Math.abs(c[1] - 185) < 25 && Math.abs(c[2] - 66) < 40; } }, { label: "Dark text", test: (d, w) => avg(rgb(w, d.querySelector(".box"), "color")) < 90 }], "Set `background` and `color` in the `.box` rule.", ".box { background: #f4b942; color: #111; }"),
              Q.web("Give the banner a gradient background.", '<div class="banner">Welcome</div>\n<style>\n  .banner { padding: 30px; }\n</style>\n', [{ label: "The banner uses a gradient", test: (d, w) => cs(w, d.querySelector(".banner"), "backgroundImage").includes("gradient") }], "Use `linear-gradient(...)` as the background.", ".banner { background: linear-gradient(to right, red, blue); }"),
              Q.match("Match each color to what it is.", [["#fff", "white"], ["#000", "black"], ["rgb(255, 0, 0)", "red"], ["rgba(0, 0, 0, 0.5)", "half-transparent black"]], "Four ways you'll see color written."),
            ],
          },
          {
            id: "cs-8", title: "Borders and shadows", blurb: "Frames, round corners and depth.",
            intro: { text: "`border: 2px solid red` draws a frame: width, style, color. `border-radius` rounds the corners, and `50%` on a square makes a circle. `box-shadow: 0 4px 8px rgba(0,0,0,0.3)` adds depth: sideways offset, down offset, blur, color.", code: ".card {\n  border: 2px solid #f4b942;\n  border-radius: 12px;\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);\n}" },
            ex: [
              Q.mc("Which line draws a 2px solid red border?", ["border: 2px solid red;", "border: red solid;", "border: 2 red;", "frame: 2px red;"], 0, "`border` takes a width, a style and a color."),
              Q.fill("Round the corners.", ".card { border-___: 12px; }", ["radius", "round", "curve", "corner"], "radius", "The property is `border-radius`."),
              Q.mc("What does `border-radius: 50%` do to a square?", ["Makes it a circle", "Makes it half as big", "Adds a border", "Does nothing"], 0, "50% rounds every corner all the way."),
              Q.web("Give the card a 3px solid border and corners rounded by at least 10px.", '<div class="card">Hello</div>\n<style>\n  .card { padding: 20px; }\n</style>\n', [{ label: "3px border", test: (d, w) => cs(w, d.querySelector(".card"), "borderTopWidth") === "3px" }, { label: "Solid style", test: (d, w) => cs(w, d.querySelector(".card"), "borderTopStyle") === "solid" }, { label: "Rounded corners", test: (d, w) => parseFloat(cs(w, d.querySelector(".card"), "borderTopLeftRadius")) >= 10 }], "Use `border` and `border-radius`.", ".card { border: 3px solid gold; border-radius: 12px; }"),
              Q.web("Make the .dot a circle that is 40px wide and 40px tall.", '<div class="dot"></div>\n<style>\n  .dot { background: gold; }\n</style>\n', [{ label: "40px wide", test: (d, w) => cs(w, d.querySelector(".dot"), "width") === "40px" }, { label: "40px tall", test: (d, w) => cs(w, d.querySelector(".dot"), "height") === "40px" }, { label: "Round", test: (d, w) => { const r = cs(w, d.querySelector(".dot"), "borderTopLeftRadius"); return r.endsWith("%") ? parseFloat(r) >= 50 : parseFloat(r) >= 20; } }], "Set a width, a height and a 50% radius.", ".dot { width: 40px; height: 40px; border-radius: 50%; }"),
              Q.type("Which property adds a shadow behind a box? (two words joined by a hyphen)", "box-shadow", "`box-shadow` takes offsets, blur and a color."),
            ],
          },
        ],
      },
      {
        title: "Interaction and position", blurb: "Hover effects and placing things exactly.",
        lessons: [
          {
            id: "cs-9", title: "Hover and transitions", blurb: "Make things react and animate.",
            intro: { text: "A pseudo-class like `:hover` styles an element in a special state, such as when the mouse is over it. `transition` makes the change smooth instead of instant. `transition: background 0.3s` animates the background over 0.3 seconds.", code: ".btn {\n  background: gold;\n  transition: background 0.3s;\n}\n.btn:hover {\n  background: orange;\n}" },
            ex: [
              Q.mc("When does `a:hover` apply?", ["While the mouse is over the link", "After the link is clicked", "Always", "Only on phones"], 0, "`:hover` matches while the pointer is on the element."),
              Q.fill("Style the button when the mouse is over it.", ".btn___ { background: gold; }", [":hover", ".hover", "#hover", "::hover"], ":hover", "Pseudo-classes start with a single colon."),
              Q.mc("What does `transition: background 0.3s` do?", ["Animates background changes over 0.3 seconds", "Delays the page", "Changes the background to 0.3", "Nothing"], 0, "Without a transition the change is instant."),
              Q.web("Make the button's changes smooth: give .btn a transition lasting 0.3s.", '<button class="btn">Press</button>\n<style>\n  .btn { background: gold; }\n  .btn:hover { background: orange; }\n</style>\n', [{ label: "Transition lasts 0.3s", test: (d, w) => cs(w, d.querySelector(".btn"), "transitionDuration").split(",").some((x) => x.trim() === "0.3s") }], "Add a `transition` property to `.btn`.", ".btn { transition: all 0.3s; }"),
              Q.web("Style the link: orange text and no underline.", '<a href="#">Home</a>\n<style>\n  \n</style>\n', [{ label: "Orange text", test: (d, w) => { const c = rgb(w, d.querySelector("a"), "color"); return c[0] > 200 && c[1] > 100 && c[2] < 80; } }, { label: "No underline", test: (d, w) => cs(w, d.querySelector("a"), "textDecorationLine") === "none" }], "Set `color` and `text-decoration`.", "a { color: orange; text-decoration: none; }"),
              Q.match("Match each selector to when it applies.", [[":hover", "the mouse is over it"], [":focus", "it is selected by keyboard or click"], [":first-child", "it is the first of its siblings"], ["::before", "adds content before the element"]], "Pseudo-classes and pseudo-elements."),
            ],
          },
          {
            id: "cs-10", title: "Positioning", blurb: "Place an element exactly where you want it.",
            intro: { text: "By default elements follow the normal flow (`position: static`). `position: relative` keeps the flow but lets you nudge. `position: absolute` removes the element from the flow and places it against the nearest positioned ancestor using `top`, `right`, `bottom` and `left`. `position: fixed` sticks to the screen. `z-index` decides what sits on top.", code: ".card { position: relative; }\n.badge {\n  position: absolute;\n  top: 0;\n  right: 0;\n}" },
            ex: [
              Q.mc("What is the default value of `position`?", ["static", "relative", "absolute", "fixed"], 0, "Elements follow normal flow unless you change it."),
              Q.mc("An absolutely positioned element is placed relative to what?", ["The nearest positioned ancestor", "The browser window always", "The previous sibling", "The body only"], 0, "Give the parent `position: relative` to make it the anchor."),
              Q.fill("Pin the badge to the card's corner.", ".badge { position: ___; top: 0; right: 0; }", ["absolute", "static", "fixed", "flow"], "absolute", "`absolute` uses `top` and `right` to place it."),
              Q.mc("Which element shows on top?", ["The one with the higher z-index", "The one with the lower z-index", "The first one in the code", "Neither"], 0, "A higher `z-index` stacks above a lower one."),
              Q.web("Pin the badge in the top-right corner of the card.", '<div class="card"><span class="badge">New</span></div>\n<style>\n  .card { width: 200px; height: 100px; background: #223; }\n</style>\n', [{ label: "The card is positioned", test: (d, w) => cs(w, d.querySelector(".card"), "position") !== "static" }, { label: "The badge is absolute", test: (d, w) => cs(w, d.querySelector(".badge"), "position") === "absolute" }, { label: "The badge is at the top", test: (d, w) => cs(w, d.querySelector(".badge"), "top") === "0px" }], "Make the card `relative`, the badge `absolute`.", ".card { position: relative; } .badge { position: absolute; top: 0; right: 0; }"),
              Q.web("Make the nav stay stuck to the top of the screen.", "<nav>Menu</nav>\n<style>\n  \n</style>\n", [{ label: "The nav is fixed", test: (d, w) => cs(w, d.querySelector("nav"), "position") === "fixed" }, { label: "It sits at the top", test: (d, w) => cs(w, d.querySelector("nav"), "top") === "0px" }], "Use `position: fixed` and `top: 0`.", "nav { position: fixed; top: 0; }"),
            ],
          },
        ],
      },
      {
        title: "Responsive and polish", blurb: "Pages that fit every screen.",
        lessons: [
          {
            id: "cs-11", title: "Responsive design", blurb: "Make layouts adapt to the screen.",
            intro: { text: "A media query applies styles only when a condition is true, such as `@media (max-width: 600px)` for small screens. Use flexible units like `%`, `rem` and `vw` instead of fixed pixels. `max-width: 100%` stops an image from overflowing its container.", code: "img { max-width: 100%; }\nh1 { font-size: 3rem; }\n\n@media (max-width: 600px) {\n  h1 { font-size: 2rem; }\n}" },
            ex: [
              Q.mc("What does a media query do?", ["Applies styles only when a condition is true", "Loads media files", "Plays audio", "Hides the page"], 0, "It's a conditional for CSS, usually about screen width."),
              Q.fill("Apply this rule only on screens up to 600px wide.", "@media (___-width: 600px) {\n  h1 { font-size: 2rem; }\n}", ["max", "min", "wide", "less"], "max", "`max-width` means 600px or narrower."),
              Q.mc("Which unit is a share of the screen's width?", ["vw", "px", "em", "pt"], 0, "`1vw` is 1% of the viewport width."),
              Q.web("Stop the image from ever being wider than its container.", '<div style="width: 200px"><img src="x.png" alt="x"></div>\n<style>\n  \n</style>\n', [{ label: "Max width is 100%", test: (d, w) => cs(w, d.querySelector("img"), "maxWidth") === "100%" }], "Set `max-width` to 100%.", "img { max-width: 100%; }"),
              Q.web("Add a media query for screens up to 600px that makes the h1 smaller.", "<h1>Hello</h1>\n<style>\n  h1 { font-size: 3rem; }\n</style>\n", [{ label: "Has a max-width media query", test: (d) => [...d.styleSheets].some((ss) => [...ss.cssRules].some((r) => r.type === 4 && /max-width/.test(r.media.mediaText))) }, { label: "Changes the h1 inside it", test: (d) => [...d.styleSheets].some((ss) => [...ss.cssRules].some((r) => r.type === 4 && /max-width/.test(r.media.mediaText) && [...r.cssRules].some((x) => x.selectorText === "h1"))) }], "Wrap an h1 rule inside the `@media` block.", "@media (max-width: 600px) { h1 { font-size: 2rem; } }"),
              Q.match("Match each unit to its meaning.", [["px", "a fixed size"], ["%", "a share of the parent"], ["rem", "relative to the root font size"], ["vw", "a share of the screen width"]], "Flexible units help pages adapt."),
            ],
          },
          {
            id: "cs-12", title: "Style a card", blurb: "Put it all together.",
            intro: { text: "Good CSS is built a layer at a time: spacing first, then color and type, then borders and details. Open your browser's developer tools and inspect an element to see which rules apply. When two rules conflict, the more specific selector wins: an id beats a class, and a class beats a tag.", code: ".card {\n  padding: 20px;\n  border: 2px solid #f4b942;\n  border-radius: 12px;\n  background: #1b2146;\n  color: white;\n}" },
            ex: [
              Q.web("Style the card: 20px of padding, a 2px border and 12px rounded corners.", '<div class="card">Knight</div>\n<style>\n  \n</style>\n', [{ label: "20px padding", test: (d, w) => cs(w, d.querySelector(".card"), "paddingTop") === "20px" }, { label: "2px border", test: (d, w) => cs(w, d.querySelector(".card"), "borderTopWidth") === "2px" }, { label: "12px rounded corners", test: (d, w) => parseFloat(cs(w, d.querySelector(".card"), "borderTopLeftRadius")) === 12 }], "Three properties on the `.card` rule.", ".card { padding: 20px; border: 2px solid gold; border-radius: 12px; }"),
              Q.web("Make the title centered and 28px.", '<h2 class="title">Club</h2>\n<style>\n  \n</style>\n', [{ label: "Centered", test: (d, w) => cs(w, d.querySelector(".title"), "textAlign") === "center" }, { label: "28px text", test: (d, w) => cs(w, d.querySelector(".title"), "fontSize") === "28px" }], "Use `text-align` and `font-size`.", ".title { text-align: center; font-size: 28px; }"),
              Q.web("Style the button: gold background, dark text, 12px 24px padding and rounded corners.", '<button class="go">Join</button>\n<style>\n  \n</style>\n', [{ label: "Gold background", test: (d, w) => { const c = rgb(w, d.querySelector(".go"), "backgroundColor"); return c[0] > 200 && c[1] > 150 && c[2] < 120; } }, { label: "Dark text", test: (d, w) => avg(rgb(w, d.querySelector(".go"), "color")) < 100 }, { label: "12px 24px padding", test: (d, w) => cs(w, d.querySelector(".go"), "paddingTop") === "12px" && cs(w, d.querySelector(".go"), "paddingLeft") === "24px" }, { label: "Rounded", test: (d, w) => parseFloat(cs(w, d.querySelector(".go"), "borderTopLeftRadius")) >= 4 }], "Combine background, color, padding and radius.", ".go { background: gold; color: #111; padding: 12px 24px; border-radius: 8px; }"),
              Q.mc("Two rules set a different color for the same element: one on `.a`, one on `#a`. Which wins?", ["The id rule", "The class rule", "The one written first", "Neither"], 0, "An id is more specific than a class."),
              Q.type("Which property sets the space inside a box, between its content and its border?", "padding", "Margin is outside the border. Padding is inside."),
              Q.mc("Where do you see which CSS rules apply to an element?", ["Developer tools: right-click and Inspect", "The page source's title", "The address bar", "The favicon"], 0, "Inspect shows the computed styles and which rule wins."),
            ],
          },
        ],
      },
    ],
  });
})();
