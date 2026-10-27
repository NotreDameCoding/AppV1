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
    ],
  });
})();
