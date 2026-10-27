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
    ],
  });
})();
