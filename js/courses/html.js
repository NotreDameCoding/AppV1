(function () {
  const Q = NDC.Q;
  const text = (d, sel) => ((d.querySelector(sel) || {}).textContent || "").trim().toLowerCase();
  NDC.courses.push({
    id: "ht", name: "HTML", lang: "ht", hex: "#ff5d73", color: "var(--c-ht)", glyph: "Ht",
    tagline: "The skeleton of every web page. You'll build real pages here.",
    runnable: true,
    units: [
      {
        title: "Page anatomy", blurb: "Tags, elements and the shape of a page.",
        lessons: [
          {
            id: "ht-1", title: "Tags and elements", blurb: "The building blocks.",
            intro: { text: "HTML describes what is on a page. An element is an opening tag, some content, and a closing tag. The closing tag has a slash.", code: "<h1>Hello</h1>\n<p>My first page.</p>" },
            ex: [
              Q.mc("Which one is a closing tag?", ["</p>", "<p>", "<p/>", "p>"], 0, "A closing tag starts with `</`."),
              Q.fill("Open the tag that matches this closing tag.", "<___>Hello</p>", ["p", "h1", "a", "div"], "p", "The opening and closing tag names have to match."),
              Q.web("Make a heading that says Hello.", "<!-- write your heading below -->\n", [{ label: "Has an h1", test: (d) => !!d.querySelector("h1") }, { label: "The h1 says Hello", test: (d) => text(d, "h1").includes("hello") }], "A heading is an `h1` element.", "<h1>Hello</h1>"),
              Q.mc("Which tag makes the biggest, most important heading?", ["h1", "h6", "head", "title"], 0, "`h1` is the main heading. `h6` is the smallest."),
              Q.web("Add a paragraph and a smaller heading (h2).", "<h1>My page</h1>\n", [{ label: "Has a p", test: (d) => !!d.querySelector("p") }, { label: "Has an h2", test: (d) => !!d.querySelector("h2") }], "Each one is its own element.", "<h2>About</h2>\n<p>Some text.</p>"),
              Q.match("Match each tag to what it makes.", [["<p>", "a paragraph"], ["<h1>", "the main heading"], ["<a>", "a link"], ["<img>", "an image"]], "You'll use these four in almost every page."),
            ],
          },
          {
            id: "ht-2", title: "Page structure", blurb: "doctype, head and body.",
            intro: { text: "A full page starts with `<!DOCTYPE html>`. Inside `<html>`, the `<head>` holds information about the page, like its `<title>`. The `<body>` holds everything people see.", code: "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Hello</h1>\n  </body>\n</html>" },
            ex: [
              Q.order("Put the lines in order to make a full page.", ["<!DOCTYPE html>", "<html>", "<head>", "<title>Hi</title>", "</head>", "<body>", "</body>", "</html>"], "Head first, then body, all inside html."),
              Q.mc("What belongs in the `<head>`?", ["Information about the page, like its title", "The visible text", "Images only", "Nothing"], 0, "People don't see the head's contents on the page itself."),
              Q.fill("Finish the first line of every HTML page.", "<!DOCTYPE ___>", ["html", "page", "web", "doc"], "html", "It tells the browser to expect modern HTML."),
              Q.mc("Which tag sets the text on the browser tab?", ["<title>", "<h1>", "<tab>", "<meta>"], 0, "The `<title>` lives in the head."),
              Q.web("Build a page whose title is My Page and has an h1 inside the body.", "<!DOCTYPE html>\n<html>\n  <head>\n    \n  </head>\n  <body>\n    \n  </body>\n</html>\n", [{ label: "Title is My Page", test: (d) => d.title.trim().toLowerCase() === "my page" }, { label: "Title is in the head", test: (d) => !!d.head.querySelector("title") }, { label: "Has an h1 in the body", test: (d) => !!d.body.querySelector("h1") }], "The title goes in the head and the h1 goes in the body.", "<title>My Page</title> in the head."),
              Q.type("Which attribute on <html> sets the page language, like lang=\"en\"?", "lang", "Screen readers use `lang` to pronounce text properly.", '<html ___="en">'),
            ],
          },
        ],
      },
      {
        title: "Content", blurb: "Text, lists, links and images.",
        lessons: [
          {
            id: "ht-3", title: "Text and lists", blurb: "Organize information.",
            intro: { text: "`<ul>` makes a bulleted list and `<ol>` a numbered one. Each item is an `<li>`. `<strong>` marks important text and `<em>` adds emphasis.", code: "<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n</ul>" },
            ex: [
              Q.mc("Which tag makes a bulleted list?", ["<ul>", "<ol>", "<li>", "<bullet>"], 0, "`ul` stands for unordered list."),
              Q.fill("Open the list.", "<___>\n  <li>One</li>\n</ul>", ["ul", "li", "list", "p"], "ul", "The list's opening and closing tags match."),
              Q.web("Make a list with three items.", "", [{ label: "Has a ul", test: (d) => !!d.querySelector("ul") }, { label: "At least 3 list items", test: (d) => d.querySelectorAll("ul li").length >= 3 }], "A `ul` holds `li` items.", "<ul><li>One</li><li>Two</li><li>Three</li></ul>"),
              Q.mc("Which tag marks text as important?", ["<strong>", "<big>", "<loud>", "<b2>"], 0, "`strong` means important. Browsers show it bold."),
              Q.web("Make a numbered list of 2 steps and put one word in <strong>.", "", [{ label: "Has an ol", test: (d) => !!d.querySelector("ol") }, { label: "At least 2 steps", test: (d) => d.querySelectorAll("ol li").length >= 2 }, { label: "Has a strong element", test: (d) => !!d.querySelector("strong") }], "`ol` is the numbered one.", "<ol><li>Open <strong>CodePen</strong></li><li>Type</li></ol>"),
              Q.match("Match each tag to its job.", [["<ol>", "numbered list"], ["<li>", "one list item"], ["<strong>", "important text"], ["<br>", "line break"]], "Lists are everywhere on the web."),
            ],
          },
          {
            id: "ht-4", title: "Links and images", blurb: "Connect pages and show pictures.",
            intro: { text: "Attributes add extra information inside an opening tag. A link needs `href`. An image needs `src` for the file and `alt` for a text description.", code: '<a href="https://ndhs.org">Our school</a>\n<img src="knight.png" alt="A pixel knight">' },
            ex: [
              Q.fill("Which attribute holds a link's address?", '<a ___="https://ndhs.org">School</a>', ["href", "src", "link", "url"], "href", "`href` means hypertext reference."),
              Q.mc("What is the `alt` attribute for?", ["A text description if the image can't be seen", "The image's size", "A tooltip color", "The file name"], 0, "Screen readers read it out, and it shows if the image fails to load."),
              Q.web("Make a link that says Example and goes to https://example.com.", "", [{ label: "Has a link", test: (d) => !!d.querySelector("a") }, { label: "It goes to example.com", test: (d) => (d.querySelector("a") || {}).href === "https://example.com/" }, { label: "The link text says Example", test: (d) => text(d, "a").includes("example") }], "Use `href` on an `a` tag.", '<a href="https://example.com">Example</a>'),
              Q.web("Add an image with src cat.png and alt text that says A cat.", "", [{ label: "Has an img", test: (d) => !!d.querySelector("img") }, { label: "src is cat.png", test: (d) => (d.querySelector("img") || {}).getAttribute("src") === "cat.png" }, { label: "alt says A cat", test: (d) => ((d.querySelector("img") || {}).alt || "").toLowerCase() === "a cat" }], "An `img` has no closing tag.", '<img src="cat.png" alt="A cat">'),
              Q.mc("Which of these has no closing tag?", ["<img>", "<p>", "<h1>", "<a>"], 0, "Void elements like `img` and `br` have nothing inside them."),
              Q.type("Which tag makes a link?", "a", "`a` is short for anchor.", "<___ href=\"...\">text</___>"),
            ],
          },
        ],
      },
      {
        title: "Layout and forms", blurb: "Sections and ways to take input.",
        lessons: [
          {
            id: "ht-5", title: "Page sections", blurb: "Say what each part of the page is.",
            intro: { text: "Semantic tags describe a section's job: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`. A plain `<div>` is a generic box when nothing else fits.", code: "<header>...</header>\n<nav>...</nav>\n<main>...</main>\n<footer>...</footer>" },
            ex: [
              Q.mc("Which tag holds a page's main navigation links?", ["<nav>", "<menu2>", "<links>", "<footer>"], 0, "`nav` is for navigation."),
              Q.fill("Wrap the page's bottom info.", "<___>Contact us</footer>", ["footer", "header", "main", "nav"], "footer", "The opening tag matches the closing tag."),
              Q.web("Build a page with a header, a main, and a footer.", "", [{ label: "Has a header", test: (d) => !!d.querySelector("header") }, { label: "Has a main", test: (d) => !!d.querySelector("main") }, { label: "Has a footer", test: (d) => !!d.querySelector("footer") }], "These are just tags with text or other elements inside.", "<header>Top</header><main>Middle</main><footer>Bottom</footer>"),
              Q.match("Match each tag to its job.", [["<header>", "top of the page"], ["<main>", "the main content"], ["<footer>", "bottom of the page"], ["<div>", "a generic box"]], "Semantic tags help screen readers and search engines."),
              Q.mc("When is `<div>` the right choice?", ["When no more specific tag fits", "Always, for everything", "Only for headings", "Never"], 0, "Use meaningful tags first and `div` as a fallback."),
              Q.web("Put a nav with two links inside a header.", "", [{ label: "A nav inside a header", test: (d) => !!d.querySelector("header nav") }, { label: "Two links in the nav", test: (d) => d.querySelectorAll("header nav a").length >= 2 }], "Nest the elements: header, then nav, then links.", '<header><nav><a href="#">Home</a> <a href="#">About</a></nav></header>'),
            ],
          },
          {
            id: "ht-6", title: "Forms", blurb: "Let people type things in.",
            intro: { text: "A `<form>` holds inputs. Each `<input>` has a `type`. A `<label>` describes it, and `for` ties the label to the input's `id`. A `<button>` sends the form.", code: '<form>\n  <label for="email">Email</label>\n  <input id="email" type="email">\n  <button>Join</button>\n</form>' },
            ex: [
              Q.mc("What is a `<label>` for?", ["Describing an input so people know what to type", "Styling the page", "Adding an image", "Making a link"], 0, "It also makes the input easier to click."),
              Q.fill("Make this a field for email addresses.", '<input ___="email">', ["type", "href", "name2", "src"], "type", "`type` picks what kind of input it is."),
              Q.web("Build a form with a label, a text input, and a button.", "", [{ label: "Has a form", test: (d) => !!d.querySelector("form") }, { label: "Has a label", test: (d) => !!d.querySelector("label") }, { label: "Has a text input", test: (d) => { const i = d.querySelector("input"); return !!i && (!i.type || i.type === "text"); } }, { label: "Has a button", test: (d) => !!d.querySelector("button") }], "Put all three inside the form tags.", '<form><label>Name <input type="text"></label><button>Send</button></form>'),
              Q.mc("Which input type hides what the user types?", ["password", "secret", "hidden-text", "text"], 0, "`type=\"password\"` shows dots instead of letters."),
              Q.web("Add an email input that is required, plus a button.", "<form>\n  \n</form>\n", [{ label: "An email input", test: (d) => !!d.querySelector('input[type="email"]') }, { label: "It is required", test: (d) => { const i = d.querySelector('input[type="email"]'); return !!i && i.required; } }, { label: "A button", test: (d) => !!d.querySelector("button") }], "`required` is an attribute with no value.", '<input type="email" required>'),
              Q.type("Which attribute ties a label to an input's id?", "for", "`for=\"email\"` matches `id=\"email\"`.", '<label ___="email">Email</label>'),
            ],
          },
        ],
      },
      {
        title: "Tables and media", blurb: "Show data in rows, and add video.",
        lessons: [
          {
            id: "ht-7", title: "Tables", blurb: "Rows and columns of data.",
            intro: { text: "A `<table>` is built from rows. Each `<tr>` is a row, `<th>` is a header cell, and `<td>` is a regular data cell. Use tables for real data, not for page layout.", code: "<table>\n  <tr><th>Name</th><th>Score</th></tr>\n  <tr><td>Ana</td><td>10</td></tr>\n</table>" },
            ex: [
              Q.mc("Which tag makes one row in a table?", ["<tr>", "<td>", "<th>", "<row>"], 0, "`tr` stands for table row."),
              Q.fill("Make the cell a header cell.", "<tr>\n  <___>Name</th>\n</tr>", ["th", "td", "tr", "head"], "th", "`th` marks a header cell, and browsers make it bold by default."),
              Q.mc("What belongs inside a `<tr>`?", ["Cells: th and td", "More tables only", "Images only", "Nothing"], 0, "A row is made of cells."),
              Q.web("Build a table with a header row (Name, Score) and one data row.", "<!-- build your table below -->\n", [{ label: "Has a table", test: (d) => !!d.querySelector("table") }, { label: "Has at least 2 header cells", test: (d) => d.querySelectorAll("th").length >= 2 }, { label: "Has at least 2 data cells", test: (d) => d.querySelectorAll("td").length >= 2 }], "Start with `table`, then a `tr` of `th` cells, then a `tr` of `td` cells.", "<table><tr><th>Name</th><th>Score</th></tr><tr><td>Ana</td><td>10</td></tr></table>"),
              Q.mc("What does `colspan=\"2\"` do on a cell?", ["Stretches the cell across two columns", "Makes two copies", "Colors the cell", "Hides it"], 0, "It makes one cell as wide as two columns."),
              Q.match("Match each tag to its job.", [["<table>", "wraps the whole table"], ["<tr>", "one row"], ["<th>", "a header cell"], ["<td>", "a data cell"]], "These four build every table."),
            ],
          },
          {
            id: "ht-8", title: "Media and figures", blurb: "Video, audio and captions.",
            intro: { text: "`<video>` and `<audio>` add media. Include the `controls` attribute or there will be no play button. Wrap a picture or video in `<figure>` and add a `<figcaption>` to caption it. Add `alt` text to every image for people who can't see it.", code: '<figure>\n  <video src="clip.mp4" controls></video>\n  <figcaption>Our demo day</figcaption>\n</figure>' },
            ex: [
              Q.mc("Which attribute adds play and pause buttons to a video?", ["controls", "play", "buttons", "show"], 0, "Without `controls` the video has no buttons."),
              Q.fill("Give the video its buttons.", '<video src="clip.mp4" ___></video>', ["controls", "play", "buttons", "show"], "controls", "It's a yes/no attribute with no value."),
              Q.mc("Which tag holds a caption for a figure?", ["<figcaption>", "<caption>", "<title>", "<label>"], 0, "`figcaption` goes inside `figure`."),
              Q.web("Build a figure that contains a video with controls and a caption.", "<!-- build below -->\n", [{ label: "Has a figure", test: (d) => !!d.querySelector("figure") }, { label: "The figure has a video with controls", test: (d) => !!d.querySelector("figure video[controls]") }, { label: "The figure has a figcaption", test: (d) => !!d.querySelector("figure figcaption") }], "Nest the video and the caption inside the figure.", '<figure><video src="a.mp4" controls></video><figcaption>My clip</figcaption></figure>'),
              Q.type("Which attribute describes an image for screen readers?", "alt", "`alt` text is read aloud when the image can't be seen.", '<img src="knight.png" ___="A knight">'),
              Q.mc("What does `loading=\"lazy\"` do on an image?", ["Loads it only when it's near the screen", "Makes it blurry", "Hides it", "Deletes it"], 0, "It saves data by waiting until the image is about to be seen."),
            ],
          },
        ],
      },
      {
        title: "Meaningful pages", blurb: "Semantic tags and better forms.",
        lessons: [
          {
            id: "ht-9", title: "Semantic structure", blurb: "Tags that say what a section is.",
            intro: { text: "`<header>`, `<nav>`, `<main>`, `<article>`, `<aside>` and `<footer>` say what each part of a page is. They look the same as a plain `<div>`, but screen readers and search engines understand them. Use one `<main>` per page and one `<h1>`.", code: "<header><h1>My Site</h1></header>\n<nav><a href=\"#\">Home</a></nav>\n<main><article>...</article></main>\n<footer>Made at NDHS</footer>" },
            ex: [
              Q.mc("Which tag holds the main navigation links?", ["<nav>", "<menu>", "<links>", "<header>"], 0, "`nav` is for major navigation."),
              Q.mc("How many `<main>` elements should a page have?", ["One", "As many as you like", "Zero", "Two"], 0, "`main` is the page's one main content area."),
              Q.fill("Wrap the site title in the right tag.", "<___>\n  <h1>My Site</h1>\n</header>", ["header", "top", "head", "banner"], "header", "`header` holds the top of a page or section."),
              Q.web("Build a page with a header, a nav with two links, a main containing an article, and a footer.", "<!-- build below -->\n", [{ label: "Has a header", test: (d) => !!d.querySelector("header") }, { label: "The nav has 2 links", test: (d) => d.querySelectorAll("nav a").length >= 2 }, { label: "The main has an article", test: (d) => !!d.querySelector("main article") }, { label: "Has a footer", test: (d) => !!d.querySelector("footer") }], "Use the semantic tag for each part.", '<header></header><nav><a href="#">A</a><a href="#">B</a></nav><main><article></article></main><footer></footer>'),
              Q.match("Match each tag to its meaning.", [["<header>", "the top of a page"], ["<nav>", "major links"], ["<main>", "the main content"], ["<footer>", "the bottom of a page"]], "Tags that describe their own content."),
              Q.mc("Why use semantic tags instead of only `<div>`s?", ["Screen readers and search engines understand the page better", "They load faster", "They are required", "They add color"], 0, "Meaning in the markup helps both people and software."),
            ],
          },
          {
            id: "ht-10", title: "More form inputs", blurb: "Labels, choices and checkboxes.",
            intro: { text: "Every input should have a `<label>`. Connect them by giving the input an `id` and the label a matching `for`. `type=\"email\"` and `type=\"password\"` change the input's behavior. A `<select>` holds `<option>` choices, and `type=\"checkbox\"` makes a tick box.", code: '<label for="email">Email</label>\n<input type="email" id="email">\n<select><option>Red</option><option>Blue</option></select>\n<input type="checkbox" id="ok"> <label for="ok">Remember me</label>' },
            ex: [
              Q.mc("How does a label connect to its input?", ["The label's `for` matches the input's `id`", "They sit next to each other", "Matching `class`", "It happens automatically"], 0, "The `for` attribute holds the input's `id`."),
              Q.fill("Hide what the user types.", '<input type="___">', ["password", "secret", "hidden", "text"], "password", "`password` shows dots instead of letters."),
              Q.mc("Which tag holds the choices in a drop-down?", ["<option>", "<choice>", "<item>", "<li>"], 0, "A `select` contains `option` elements."),
              Q.web("Build a sign-up form with a labelled email input, a select with two options, and a submit button.", "<!-- build below -->\n", [{ label: "Has an email input", test: (d) => !!d.querySelector("input[type=email]") }, { label: "A label points at the email input", test: (d) => { const i = d.querySelector("input[type=email]"); return !!(i && i.id && d.querySelector('label[for="' + i.id + '"]')); } }, { label: "Has a select with 2 options", test: (d) => d.querySelectorAll("select option").length >= 2 }, { label: "Has a submit button", test: (d) => !!d.querySelector("button[type=submit], button:not([type]), input[type=submit]") }], "Give the input an id and point a label at it with `for`.", '<form><label for="e">Email</label><input type="email" id="e"><select><option>A</option><option>B</option></select><button type="submit">Join</button></form>'),
              Q.web("Add a checkbox with the label Remember me.", "<!-- build below -->\n", [{ label: "Has a checkbox", test: (d) => !!d.querySelector("input[type=checkbox]") }, { label: "A label says Remember me", test: (d) => text(d, "label").includes("remember me") }], "A checkbox is an `input` with a type.", '<input type="checkbox" id="r"><label for="r">Remember me</label>'),
              Q.match("Match each input type to what it makes.", [['type="email"', "an email box"], ['type="checkbox"', "a tick box"], ['type="number"', "a numbers-only box"], ['type="submit"', "a send button"]], "One tag, many behaviors."),
            ],
          },
        ],
      },
      {
        title: "Finishing touches", blurb: "Links within a page, then put it together.",
        lessons: [
          {
            id: "ht-11", title: "Anchors and links", blurb: "Jump around a page and reach out.",
            intro: { text: "A link to `#about` jumps to the element with `id=\"about\"` on the same page. `mailto:` links open an email, and `target=\"_blank\"` opens a link in a new tab. When you use `_blank`, add `rel=\"noopener\"` for safety.", code: '<a href="#about">About</a>\n<a href="mailto:hi@school.org">Email us</a>\n<a href="https://example.com" target="_blank" rel="noopener">Visit</a>\n<section id="about">...</section>' },
            ex: [
              Q.mc("What does `<a href=\"#about\">` do?", ["Jumps to the element with id about", "Opens a new website", "Makes the text bold", "Downloads a file"], 0, "A hash link scrolls to a matching id on the page."),
              Q.fill("Make a link that opens an email.", '<a href="___:hi@school.org">Email us</a>', ["mailto", "email", "mail", "send"], "mailto", "`mailto:` tells the browser to start an email."),
              Q.mc("What does `target=\"_blank\"` do?", ["Opens the link in a new tab", "Hides the link", "Makes it blank", "Closes the page"], 0, "It opens the destination in a new tab."),
              Q.web("Make a link that points to #contact and a section with the id contact.", "<!-- build below -->\n", [{ label: "Has a link to #contact", test: (d) => !!d.querySelector('a[href="#contact"]') }, { label: "Has an element with id contact", test: (d) => !!d.getElementById("contact") }], "The link's `href` and the element's `id` have to match.", '<a href="#contact">Contact</a><section id="contact"></section>'),
              Q.type("Which attribute, used with target=\"_blank\", should be set to noopener?", "rel", "`rel=\"noopener\"` stops the new tab from controlling yours.", '<a href="..." target="_blank" ___="noopener">'),
              Q.mc("What does `<meta name=\"viewport\" ...>` help with?", ["Making the page fit phone screens", "Adding color", "Playing sound", "Linking CSS"], 0, "It tells phones to use the real screen width."),
            ],
          },
          {
            id: "ht-12", title: "Build a profile page", blurb: "Use everything you've learned.",
            intro: { text: "Time to combine your tags. A good page has a clear structure, one `<h1>`, readable headings, real lists, links that go somewhere, and images with alt text. Build it a piece at a time and check it in the preview as you go.", code: "<h1>Ada Lovelace</h1>\n<p>I like math and machines.</p>\n<ul>\n  <li>Chess</li>\n  <li>Code</li>\n</ul>" },
            ex: [
              Q.web("Build a profile: an h1 with your name, a paragraph about you, a list of 3 hobbies, and a link.", "<!-- build below -->\n", [{ label: "Has an h1", test: (d) => !!d.querySelector("h1") }, { label: "Has a paragraph", test: (d) => !!d.querySelector("p") }, { label: "Has a list with 3 items", test: (d) => d.querySelectorAll("ul li, ol li").length >= 3 }, { label: "Has a link", test: (d) => !!d.querySelector("a[href]") }], "Mix headings, paragraphs, a list and a link.", '<h1>Me</h1><p>About me.</p><ul><li>Chess</li><li>Code</li><li>Art</li></ul><a href="https://example.com">Site</a>'),
              Q.web("Build a card: a section with an image (with alt text), an h2 and a paragraph.", "<!-- build below -->\n", [{ label: "Has a section", test: (d) => !!d.querySelector("section") }, { label: "The section has an image with alt text", test: (d) => { const i = d.querySelector("section img"); return !!(i && (i.getAttribute("alt") || "").trim()); } }, { label: "The section has an h2", test: (d) => !!d.querySelector("section h2") }, { label: "The section has a paragraph", test: (d) => !!d.querySelector("section p") }], "Put the image, heading and paragraph inside the section.", '<section><img src="a.png" alt="A dragon"><h2>Dragon</h2><p>Breathes fire.</p></section>'),
              Q.order("Order the lines to build a simple full page.", ["<!DOCTYPE html>", "<html lang=\"en\">", "<head><title>Me</title></head>", "<body>", "<h1>Hi</h1>", "</body>", "</html>"], "Doctype, then html, then head, then body."),
              Q.mc("How many `<h1>` elements should most pages have?", ["One", "One per paragraph", "None", "Five"], 0, "One `h1` names the page. Use `h2` and below for sections."),
              Q.mc("A friend can't see your image. What helps most?", ["Good alt text", "A bigger image", "A border", "A title tag"], 0, "Alt text is read aloud in place of the image."),
              Q.match("Match each goal to the tag.", [["a list of hobbies", "<ul>"], ["the page name", "<h1>"], ["a clickable address", "<a>"], ["a picture", "<img>"]], "Pick the tag that matches the meaning."),
            ],
          },
        ],
      },
    ],
  });
})();
