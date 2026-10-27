/* Meetings. Add a new one at the bottom. `concept` and `learned` show up once the date has passed.
   Put `backticks` around code and it is shown as code. `practice` links to a lesson in the Learn tab. */
NDC.meetings = [
  { date: "2026-10-06", title: "Pull Requests", note: "General information about the club will be covered and Members will make a pull request adding themselves to the website",
    concept: "Git & Pull Requests",
    learned: "The club website lives in one shared GitHub repo, so everyone can work on it without overwriting each other. You edited `data.js` to add your own line, committed the change, and opened a pull request: a request to merge your change into the main code. Once an officer reviewed and merged it, your name showed up on the Members wall." },
  { date: "2026-10-14", title: "HTML Basics on CodePen", practice: "ht-1", note: "Club members will learn tags, elements, and attributes by building a small page on CodePen",
    concept: "Tags & Elements",
    learned: "HTML describes what is on a web page. A page is made of elements, and most elements have an opening tag and a closing tag, like `<p>Hello</p>`. Attributes go inside the opening tag and add extra info, like the `href` in `<a href=\"page.html\">`. CodePen let us type HTML and watch the page update right away." },
   { date: "2026-10-28", title: "Autonomous Coding", practice: "cs-1", note: "Club members will learn selectors, colors, and fonts, and link a stylesheet",
    concept: "Selectors & Styles",
    learned: "CSS controls how a page looks. A rule has a selector that picks elements and declarations that style them, like `h1 { color: blue; }`. Selectors can target a tag (`p`), a class (`.card`), or an id (`#title`). A stylesheet is connected with `<link rel=\"stylesheet\" href=\"style.css\">` inside the `<head>`." },
  { date: "2026-11-03", title: "Website Planning", practice: "cs-3", note: "Club members will learn margin, padding, and borders using the browser inspector",
    concept: "Padding, Border & Margin",
    learned: "Every element is a box with four layers: the content, `padding` around the content, a `border`, and `margin` outside the border that pushes other boxes away. Right-click any element and choose Inspect to see the size of each layer in the browser's dev tools." },
  { date: "2026-11-10", title: "Claude Code", practice: "cs-5", note: "Club members will learn rows, columns, and centering, and build a nav bar",
    concept: "Flexbox",
    learned: "`display: flex` lines up an element's children in a row. `justify-content` spaces them out along the row (like `center` or `space-between`), `align-items` lines them up top to bottom, and `gap` adds space between them. We used it to build a nav bar. Practice it with the Flexbox game in Coding Games." },
  { date: "2026-11-17", title: "Website First Draft", practice: "ht-5", note: "Club members will sketch a wireframe and set up a repo for their personal site",
    concept: "Wireframes",
    learned: "A wireframe is a quick sketch of a page's layout made before writing any code. Deciding your sections first (like About, Projects, and Contact) makes building much faster. You also set up your own GitHub repo to hold your site." },
  { date: "2026-11-24", title: "Finalize Website", practice: "ht-6", note: "Club members will turn their wireframe into a styled HTML/CSS page",
    concept: "Building in Small Steps",
    learned: "You turned your wireframe into real HTML and CSS: structure first, then style. Making one small change at a time and checking the browser after each one makes mistakes easy to spot, and committing often means you can always go back." },
  // add new meetings above this line
];
