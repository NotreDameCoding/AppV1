# Notre Dame Coding — Hub

The club site: learn Python, Java, JavaScript, HTML, CSS and Arduino in short lessons, earn XP and gear for your knight, and see meetings, members and projects. Plain HTML, CSS and JavaScript. No build step.

## Run it
Open `index.html`, or for the best results run a tiny server: `python3 -m http.server` and visit http://localhost:8000.
Deploy: push to GitHub, then Settings > Pages > Deploy from branch > main.

## Where to edit
| What | File |
| --- | --- |
| Members | `js/data-members.js` |
| Meetings | `js/data-meetings.js` |
| Projects | `js/data-projects.js` |
| Lessons | `js/courses/*.js` (one file per language) |
| Colors and fonts | `css/styles.css` (top of file) |
| Knight gear and unlock rules | `js/game.js`, sprites in `js/knight.js` |
| Club name, email, keys | `js/config.js` |
