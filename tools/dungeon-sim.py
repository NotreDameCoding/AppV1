"""Plays the real Dungeon in headless Chromium with a simple bot, to check that Floor 5 can be beaten with the fixed knight.

    python3 -m http.server 8000   (from the repo root, in another terminal)
    python3 tools/dungeon-sim.py [floor] [runs] [reaction-seconds] [json overrides]

The bot is deliberately ordinary: it walks to the nearest enemy and swings, blocks when something winds up in front of it,
and dashes out of ground slams. It never parries on purpose. If it wins most runs, a person can.
Time is sped up by feeding the game's animation loop fake frame times, so a floor takes a second or two.
"""
import sys, json
from playwright.sync_api import sync_playwright

URL = "http://localhost:8000/index.html#/dungeon"
floor = int(sys.argv[1]) if len(sys.argv) > 1 else 5
runs = int(sys.argv[2]) if len(sys.argv) > 2 else 20
react = float(sys.argv[3]) if len(sys.argv) > 3 else 0.2
over = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {}   # e.g. '{"hp": 180, "stamina": 180, "dmg": 3}'

INIT = """
(() => {
  let now = 0;
  const q = [];
  window.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
  window.cancelAnimationFrame = () => {};
  window.__pump = (n) => { for (let i = 0; i < n; i++) { now += 16.667; const fns = q.splice(0); fns.forEach((f) => { try { window.__bot && window.__bot(now / 1000); f(now); } catch (e) { window.__err = String(e); } }); } };
})();
"""

BOT = """
(reaction) => {
  const seen = new Map();     // enemy -> time its wind-up was first noticed
  let lastDash = -9;
  window.__bot = (t) => {
    const dg = NDC._dg, run = dg.run, keys = dg.keys;
    if (!run || dg.phase !== 'play' || run.over) { ['w','a','s','d','j','k','l'].forEach((k) => keys.delete(k)); return; }
    const p = run.p;
    const set = (k, on) => on ? keys.add(k) : keys.delete(k);
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const live = run.enemies.filter((e) => e.spawnT <= 0);
    // threats: anything winding up near us (after a reaction delay)
    let threat = null, slam = null;
    for (const e of live) {
      const winding = e.st === 'wind' || e.st === 'windC' || e.st === 'windS';
      if (winding) { if (!seen.has(e)) seen.set(e, t); } else seen.delete(e);
      if (winding && t - seen.get(e) >= reaction) {
        const d = dist(p, e);
        if (e.k === 'B' && d < 70) slam = e;
        else if (e.k === 'K' && e.st === 'windS' && d < 120) slam = e;
        else if (e.k === 'K' && e.st === 'windC') threat = e;
        else if (e.k !== 'a' && d < 85 && (!threat || d < dist(p, threat))) threat = e;
      }
    }
    // arrows heading at us: sidestep with a dash
    let sidestep = null;
    for (const a of run.arrows) {
      const dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy);
      if (d < 55 && (a.vx * dx + a.vy * dy) / (d * Math.hypot(a.vx, a.vy) || 1) > 0.8) sidestep = a;
    }
    // target: nearest enemy, archers a bit preferred
    let target = null, best = 1e9;
    for (const e of live) { const d = dist(p, e) - (e.k === 'a' ? 40 : 0); if (d < best) { best = d; target = e; } }
    let mx = 0, my = 0, swing = false, block = false, dash = false;
    const toward = (o, s) => { const dx = o.x - p.x, dy = o.y - p.y, d = Math.hypot(dx, dy) || 1; mx += s * dx / d; my += s * dy / d; };
    const lowSt = p.st < 24;
    if (slam && p.st >= 22 && t - lastDash > 0.5) { toward(slam, -1); dash = true; lastDash = t; }
    else if (sidestep && p.st >= 30 && t - lastDash > 0.5) { const n = Math.hypot(sidestep.vx, sidestep.vy) || 1; mx += -sidestep.vy / n; my += sidestep.vx / n; dash = true; lastDash = t; }
    else if (threat && p.st > 12) { block = true; toward(threat, 0.3); }
    else if (target) {
      const d = dist(p, target);
      if (lowSt) { if (d < 70) toward(target, -1); }         // catch our breath
      else if (d > 28) toward(target, 1);
      else { swing = true; toward(target, 0.1); }
      if (d < 40 && p.hp < p.maxHp * 0.4 && !swing) toward(target, -0.6);
    }
    // stay off the walls without fighting the main direction
    if (p.x < 55) mx += 0.35; if (p.x > 425) mx -= 0.35; if (p.y < 105) my += 0.35; if (p.y > 255) my -= 0.35;
    const th = 0.2;
    set('a', mx < -th); set('d', mx > th); set('w', my < -th); set('s', my > th);
    set('j', swing); set('k', block); set('l', dash);
  };
}
"""

def play(page, f):
    page.evaluate("(f) => { const b = [...document.querySelectorAll('.dg-floors .btn')][f - 1]; b.click(); }", f)
    for _ in range(400):                      # up to ~400 * 120 frames = plenty of game time
        page.evaluate("__pump(120)")
        ph = page.evaluate("NDC._dg.phase")
        if ph in ("clear", "dead"):
            r = page.evaluate("({hp: Math.round(NDC._dg.run.p.hp), max: NDC._dg.run.p.maxHp, kills: NDC._dg.run.kills, t: Math.round(NDC._dg.run.t)})")
            r["win"] = ph == "clear"; return r
    return {"win": False, "timeout": True}

with sync_playwright() as pw:
    b = pw.chromium.launch()
    page = b.new_page()
    page.add_init_script(INIT)
    page.goto(URL); page.wait_for_selector(".dg-floors .btn")
    page.evaluate(BOT, react)
    page.evaluate("""(o) => { const G = NDC.game;
      if (o.regen != null) G.STAMINA_REGEN = o.regen; if (o.hp != null) G.BASE_HP = o.hp; if (o.stamina != null) G.BASE_STAMINA = o.stamina;
      if (o.dmg != null) G.KIT.weapon.dmg = o.dmg; if (o.swing != null) G.KIT.weapon.swing = o.swing;
      if (o.helm != null) G.KIT.helm.hp = o.helm; if (o.cost != null) G.KIT.shield.cost = o.cost; }""", over)
    wins, out = 0, []
    for i in range(runs):
        page.evaluate("document.querySelectorAll('.dg-menu .btn').length && 0")
        if page.evaluate("NDC._dg.phase") != "menu":
            page.evaluate("(() => { const bs = [...document.querySelectorAll('.dg-menu .btn')]; const fl = bs.find((x) => /Floor list/.test(x.textContent)); fl && fl.click(); })()")
        r = play(page, floor); out.append(r); wins += r["win"]
    err = page.evaluate("window.__err || null")
    print(json.dumps({"floor": floor, "runs": runs, "wins": wins, "reaction": react, "over": over, "err": err}))
    for r in out[:12]: print(r)
    b.close()
