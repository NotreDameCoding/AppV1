# Notre Dame Coding — Hub

The club site: learn Python, Java, JavaScript, HTML, CSS and Arduino in short lessons, earn XP, fight your way down five Dungeon floors with one fixed knight, and browse member projects. Plain HTML, CSS and JavaScript. No build step.

## Run it
Open `index.html`, or for the best results run a tiny server: `python3 -m http.server` and visit http://localhost:8000.
Deploy: push to GitHub, then Settings > Pages > Deploy from branch, and pick the branch you want live.

## Where to edit
| What | File |
| --- | --- |
| Projects | `js/data-projects.js` |
| Lessons | `js/courses/*.js` (one file per language) |
| The knight's fixed kit and stats | `js/game.js` (`G.KIT`, `G.BASE_HP`, `G.BASE_STAMINA`), sprites in `js/knight.js`, game in `js/pages/dungeon.js` |
| Colors, fonts, light and dark themes | `css/styles.css` (tokens at the top) |
| Check that Floor 5 is beatable | `tools/dungeon-sim.py` |
| Club name, email, keys | `js/config.js` |

## Sign-in
Real Google sign-in is on (Supabase keys are in `js/config.js`). Clear those two keys to fall back to demo mode, where signing in saves progress in that browser only. Run `supabase/schema.sql` once in Supabase.
For real email sign-in and saved progress on any device:
1. Create a free project at supabase.com. Run `supabase/schema.sql` in the SQL editor.
2. Authentication > Providers > Email: turn on, and keep "Confirm email" on.
3. Authentication > URL Configuration: set Site URL to your published site address.
4. Put the project URL and anon key in `js/config.js`. (The anon key is meant to be public. The row-level security rules in the schema protect the data.)
5. Supabase's built-in email sender allows only a few emails per hour. For a whole club, add a custom SMTP sender under Authentication > SMTP (Resend has a free tier).
6. Add officers with the insert line at the bottom of the schema file. They'll see a member table on their Account page.

Student privacy: you're storing emails and progress for minors. Check with your advisor or school before turning real sign-in on.

## Notes
- Python runs in the browser with Pyodide (downloaded from a CDN the first time, about 10 MB).
- Java and Arduino lessons use reading, predicting, ordering and an LED simulator. They don't run real code.
- The AI tutor isn't included yet.
