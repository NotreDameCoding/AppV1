/* The Dungeon: a small top-down fighting game for the knight.
   Move with WASD or the arrow keys, swing with Space or J, hold Shift or K to block.
   Game XP lives in state.game and is fully separate from lessons, coins and looks. */
(function () {
  const h = NDC.h, G = NDC.game;
  const CW = 640, CH = 400, WALL = 32;
  const KEYS = {
    left: ["a", "arrowleft"], right: ["d", "arrowright"], up: ["w", "arrowup"], down: ["s", "arrowdown"],
    swing: [" ", "j"], block: ["shift", "k"],
  };
  const FLOORS = [
    null,
    { name: "Slime Cellar", slimes: 3, goblins: 1 },
    { name: "Mossy Halls", slimes: 4, goblins: 2 },
    { name: "Goblin Camp", slimes: 4, goblins: 3 },
    { name: "Deep Warrens", slimes: 5, goblins: 4 },
    { name: "The Goblin King", slimes: 3, goblins: 2, boss: true },
  ];
  const XP = { slime: 5, goblin: 10, boss: 80 };
  const TAU = Math.PI * 2;
  const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return Math.abs(d); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  NDC.pages.dungeon = function () {
    const state0 = NDC.store.get();
    let gs = G.gameStats(state0);
    let sprite = null; // knight image
    let raf = 0, last = 0, alive = true;
    const keys = new Set();
    let run = null; // the current fight
    let phase = "menu"; // menu | play | clear | dead
    let pendingXp = 0, pendingKills = 0;

    const canvas = h("canvas", { width: CW, height: CH, class: "dg-canvas", tabindex: "0", "aria-label": "Dungeon game" });
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const menuEl = h("div", { class: "dg-menu" });
    const boardEl = h("div");
    const statEl = h("div", { class: "dg-stat" });

    /* ---------- loadout and sprite ---------- */
    function loadout() { return G.loadout(NDC.store.get()); }
    function makeSprite() {
      const eq = NDC.store.equipped();
      const img = new Image();
      img.onload = () => { sprite = img; };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(NDC.knight.svg(eq, { crop: [0, 0, 20, 20] }));
    }

    /* ---------- starting a floor ---------- */
    function start(floor) {
      gs = G.gameStats(NDC.store.get());
      const L = loadout(), def = FLOORS[floor];
      const scale = 1 + 0.25 * (floor - 1);
      const p = {
        x: CW / 2, y: CH - 70, r: 12, dir: -Math.PI / 2,
        maxHp: 100 + gs.hpBonus + L.hp, hp: 100 + gs.hpBonus + L.hp,
        maxSt: 100 + gs.staminaBonus, st: 100 + gs.staminaBonus, stWait: 0,
        speed: 130 * (1 + L.speed), swing: 0, swingDur: L.weapon.swing, swingHit: false,
        blocking: false, blockT: 0, stun: 0, inv: 0, L,
      };
      const enemies = [];
      const spawn = (kind, n) => {
        for (let i = 0; i < n; i++) {
          const x = 80 + Math.random() * (CW - 160), y = 60 + Math.random() * 130;
          if (kind === "slime") enemies.push({ kind, x, y, r: 11, hp: 2 * scale, max: 2 * scale, speed: 38, dmg: 10, cd: Math.random(), flash: 0, windup: 0, stun: 0, hop: Math.random() * 6 });
          if (kind === "goblin") enemies.push({ kind, x, y, r: 12, hp: 4 * scale, max: 4 * scale, speed: 72, dmg: 14, cd: 1 + Math.random(), flash: 0, windup: 0, stun: 0, hop: 0 });
        }
      };
      spawn("slime", def.slimes); spawn("goblin", def.goblins);
      if (def.boss) enemies.push({ kind: "boss", x: CW / 2, y: 90, r: 22, hp: 45, max: 45, speed: 52, dmg: 22, cd: 1.5, flash: 0, windup: 0, stun: 0, hop: 0, summoned: false });
      run = { floor, p, enemies, fx: [], gained: 0, kills: 0, msg: def.name, msgT: 2.2 };
      phase = "play";
      makeSprite();
      menuEl.hidden = true;
      canvas.focus({ preventScroll: true });
    }

    /* ---------- finishing ---------- */
    function commit() {
      if (!pendingXp && !pendingKills) return;
      const xp = pendingXp, kills = pendingKills;
      pendingXp = 0; pendingKills = 0;
      NDC.store.update((s) => { s.game = { xp: ((s.game || {}).xp || 0) + xp, best: (s.game || {}).best || 0, kills: ((s.game || {}).kills || 0) + kills }; });
    }
    function setBest(floor) {
      NDC.store.update((s) => { const g = s.game || { xp: 0, best: 0, kills: 0 }; s.game = { xp: g.xp, kills: g.kills, best: Math.max(g.best || 0, floor) }; });
    }
    function finish(win) {
      const before = G.gameStats(NDC.store.get()).level;
      if (win) { pendingXp += 15 * run.floor; setBest(run.floor); run.p.hp = Math.min(run.p.maxHp, run.p.hp + run.p.maxHp * 0.4); }
      commit();
      const after = G.gameStats(NDC.store.get());
      run.levelUp = after.level > before ? after.level : 0;
      run.totalXp = run.gained + (win ? 15 * run.floor : 0);
      phase = win ? "clear" : "dead";
      gs = after;
      drawMenu(); drawStat(); loadBoard();
      NDC.auth.postScore(NDC.store.get()).catch(() => {});
    }

    /* ---------- update ---------- */
    function down(name) { return KEYS[name].some((k) => keys.has(k)); }
    function dmgPlayer(e, raw) {
      const p = run.p;
      if (p.inv > 0) return;
      const ang = Math.atan2(e.y - p.y, e.x - p.x);
      let dmg = raw * (1 - p.L.def);
      if (p.blocking && p.stun <= 0 && angDiff(p.dir, ang) <= (p.L.shield.arc * Math.PI) / 360) {
        const sh = p.L.shield;
        if (sh.parry && p.blockT < sh.parry) {
          e.stun = 1; e.windup = 0; e.cd = 1.2;
          run.fx.push({ t: 0.35, kind: "ring", x: p.x + Math.cos(p.dir) * 18, y: p.y + Math.sin(p.dir) * 18, c: "#f4b942" });
          p.inv = 0.25;
          return;
        }
        dmg *= 1 - sh.block;
        p.st -= sh.cost;
        p.stWait = 0.8;
        run.fx.push({ t: 0.25, kind: "ring", x: p.x + Math.cos(p.dir) * 18, y: p.y + Math.sin(p.dir) * 18, c: "#dfe6f7" });
        if (p.st <= 0) { p.st = 0; p.stun = 0.8; p.blocking = false; }
      }
      p.hp -= dmg; p.inv = 0.5;
      p.x += Math.cos(ang + Math.PI) * 10; p.y += Math.sin(ang + Math.PI) * 10;
      run.fx.push({ t: 0.3, kind: "num", x: p.x, y: p.y - 16, v: Math.round(dmg), c: "#ff5d73" });
      if (p.hp <= 0) { p.hp = 0; finish(false); }
    }

    function update(dt) {
      if (phase !== "play") return;
      const p = run.p, L = p.L;
      p.inv = Math.max(0, p.inv - dt); p.stun = Math.max(0, p.stun - dt); p.stWait = Math.max(0, p.stWait - dt);
      run.msgT = Math.max(0, run.msgT - dt);

      // block
      const wantBlock = down("block") && p.stun <= 0 && p.swing <= 0 && p.st > 0;
      if (wantBlock && !p.blocking) p.blockT = 0;
      p.blocking = wantBlock;
      if (p.blocking) { p.blockT += dt * 1000; p.st -= 6 * dt; p.stWait = 0.4; if (p.st <= 0) { p.st = 0; p.blocking = false; } }

      // move
      let mx = (down("right") ? 1 : 0) - (down("left") ? 1 : 0), my = (down("down") ? 1 : 0) - (down("up") ? 1 : 0);
      if (mx || my) {
        const m = Math.hypot(mx, my); mx /= m; my /= m;
        if (p.swing <= 0 && p.stun <= 0) p.dir = Math.atan2(my, mx);
        const sp = p.speed * (p.blocking ? 0.55 : 1) * (p.swing > 0 ? 0.5 : 1) * (p.stun > 0 ? 0.3 : 1);
        p.x += mx * sp * dt; p.y += my * sp * dt;
      }
      p.x = clamp(p.x, WALL + p.r, CW - WALL - p.r); p.y = clamp(p.y, WALL + p.r + 8, CH - WALL - p.r);

      // swing
      if (p.swing > 0) {
        const before = p.swing;
        p.swing -= dt * 1000;
        if (!p.swingHit && before > p.swingDur * 0.5 && p.swing <= p.swingDur * 0.5) { p.swingHit = true; doHit(); }
        if (p.swing <= 0) { p.swing = 0; p.stWait = 0.5; }
      } else if (down("swing") && !p.blocking && p.stun <= 0 && p.st >= 10) {
        p.swing = p.swingDur; p.swingHit = false; p.st -= 10; p.stWait = 0.45;
      }
      if (p.stWait <= 0 && !p.blocking) p.st = Math.min(p.maxSt, p.st + 34 * dt);

      // enemies
      for (const e of run.enemies) {
        e.flash = Math.max(0, e.flash - dt); e.stun = Math.max(0, e.stun - dt); e.cd -= dt; e.hop += dt * 5;
        if (e.stun > 0) continue;
        const dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy) || 1;
        if (e.kind === "slime") {
          const hopv = 0.4 + 0.6 * Math.max(0, Math.sin(e.hop));
          e.x += (dx / dist) * e.speed * hopv * dt; e.y += (dy / dist) * e.speed * hopv * dt;
          if (dist < e.r + p.r + 2 && e.cd <= 0) { e.cd = 0.9; dmgPlayer(e, e.dmg); }
        } else {
          // goblins and the king: close in, wind up, then strike
          const reach = e.r + p.r + (e.kind === "boss" ? 14 : 10);
          if (e.windup > 0) {
            e.windup -= dt;
            if (e.windup <= 0) { if (Math.hypot(p.x - e.x, p.y - e.y) < reach + 8) dmgPlayer(e, e.dmg); e.cd = e.kind === "boss" ? 1.3 : 1.1; }
          } else {
            if (dist > reach - 4) { e.x += (dx / dist) * e.speed * dt; e.y += (dy / dist) * e.speed * dt; }
            else if (e.cd <= 0) e.windup = e.kind === "boss" ? 0.65 : 0.45;
          }
          if (e.kind === "boss" && !e.summoned && e.hp < e.max / 2) {
            e.summoned = true;
            for (let i = 0; i < 2; i++) run.enemies.push({ kind: "slime", x: e.x + (i ? 40 : -40), y: e.y + 30, r: 11, hp: 3, max: 3, speed: 40, dmg: 10, cd: 1, flash: 0, windup: 0, stun: 0, hop: 0 });
            run.msg = "The king calls for help!"; run.msgT = 1.6;
          }
        }
        // keep enemies apart a little
        for (const o of run.enemies) if (o !== e) {
          const ox = e.x - o.x, oy = e.y - o.y, d = Math.hypot(ox, oy) || 1, min = e.r + o.r;
          if (d < min) { e.x += (ox / d) * (min - d) * 0.5; e.y += (oy / d) * (min - d) * 0.5; }
        }
        e.x = clamp(e.x, WALL + e.r, CW - WALL - e.r); e.y = clamp(e.y, WALL + e.r + 8, CH - WALL - e.r);
      }

      run.fx = run.fx.filter((f) => (f.t -= dt) > 0);
      if (run.enemies.length === 0 && phase === "play") finish(true);
    }

    function doHit() {
      const p = run.p, w = p.L.weapon;
      const range = w.reach * 44, half = ((w.reach > 1.5 ? 200 : 130) * Math.PI) / 360;
      let hit = 0;
      for (const e of run.enemies) {
        const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
        if (d > range + e.r || angDiff(p.dir, Math.atan2(dy, dx)) > half) continue;
        hit++;
        e.hp -= w.dmg; e.flash = 0.15;
        const kb = (e.kind === "boss" ? 4 : 10) + w.dmg * 2;
        e.x += (dx / (d || 1)) * kb; e.y += (dy / (d || 1)) * kb;
        if (e.windup > 0 && w.dmg >= 4) { e.windup = 0; e.cd = 0.8; }
        run.fx.push({ t: 0.3, kind: "num", x: e.x, y: e.y - 14, v: w.dmg, c: "#fff" });
      }
      const dead = run.enemies.filter((e) => e.hp <= 0);
      if (dead.length) {
        dead.forEach((e) => { const xp = XP[e.kind]; run.gained += xp; pendingXp += xp; pendingKills++; run.kills++; run.fx.push({ t: 0.5, kind: "ring", x: e.x, y: e.y, c: e.kind === "slime" ? "#5fd38d" : "#9bd05a" }); });
        run.enemies = run.enemies.filter((e) => e.hp > 0);
      }
      return hit;
    }

    /* ---------- drawing ---------- */
    const R = (c, x, y, w, hh) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, hh); };
    function drawSlime(e) {
      const sq = Math.sin(e.hop) * 2, x = e.x - 12, y = e.y - 10 - sq;
      const c = e.flash > 0 ? "#fff" : "#4fc47e";
      R("#0a0c16", x - 2, y + 2, 28, 22 + sq);
      R(c, x, y + 4, 24, 16 + sq); R(c, x + 4, y, 16, 6);
      R("#8cf0b4", x + 4, y + 4, 6, 4);
      R("#0a0c16", x + 6, y + 10, 4, 5); R("#0a0c16", x + 14, y + 10, 4, 5);
    }
    function drawGoblin(e, big) {
      const s = big ? 2 : 1, x = e.x - 12 * s, y = e.y - 14 * s;
      const skin = e.flash > 0 ? "#fff" : big ? "#6fae3a" : "#8bc34a", dark = big ? "#3f6a1d" : "#5a8a2a";
      R("#0a0c16", x - 2, y + 2, 28 * s, 30 * s);
      R(skin, x + 2 * s, y, 20 * s, 12 * s); R(skin, x - 2 * s, y + 3 * s, 4 * s, 4 * s); R(skin, x + 22 * s, y + 3 * s, 4 * s, 4 * s);
      R("#0a0c16", x + 6 * s, y + 5 * s, 3 * s, 3 * s); R("#0a0c16", x + 15 * s, y + 5 * s, 3 * s, 3 * s);
      R(big ? "#7a3d1a" : "#8a5a2f", x + 4 * s, y + 12 * s, 16 * s, 12 * s);
      R(dark, x + 4 * s, y + 24 * s, 6 * s, 5 * s); R(dark, x + 14 * s, y + 24 * s, 6 * s, 5 * s);
      if (big) { R("#f4b942", x + 2 * s, y - 4 * s, 20 * s, 4 * s); R("#f4b942", x + 2 * s, y - 8 * s, 4 * s, 4 * s); R("#f4b942", x + 10 * s, y - 8 * s, 4 * s, 4 * s); R("#f4b942", x + 18 * s, y - 8 * s, 4 * s, 4 * s); }
      // club
      const sx = e.x > run.p.x ? -1 : 1;
      R("#6a4630", e.x + sx * 16 * s - 2, e.y - 6 * s, 4 * s, 18 * s);
    }
    function drawPlayer() {
      const p = run.p;
      if (p.inv > 0 && Math.floor(p.inv * 20) % 2) return;
      ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(p.x - 14, p.y + 12, 28, 6);
      if (sprite) {
        const flip = Math.cos(p.dir) < -0.3;
        ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y));
        if (flip) ctx.scale(-1, 1);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sprite, -24, -34, 48, 48);
        ctx.restore();
      } else R("#9fb0d0", p.x - 10, p.y - 16, 20, 28);
      // shield
      if (p.blocking) {
        const a = p.dir, sx = p.x + Math.cos(a) * 20, sy = p.y + Math.sin(a) * 20;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(a);
        const col = (NDC.knight.SHIELDS[p.L.eq.shield] || NDC.knight.SHIELDS.oak);
        ctx.fillStyle = "#0a0c16"; ctx.fillRect(-4, -((p.L.shield.arc / 100) * 14) - 2, 10, (p.L.shield.arc / 100) * 28 + 4);
        ctx.fillStyle = col.m; ctx.fillRect(-2, -((p.L.shield.arc / 100) * 14), 6, (p.L.shield.arc / 100) * 28);
        ctx.fillStyle = col.n; ctx.fillRect(0, -3, 2, 6);
        ctx.restore();
      }
      // sword swing
      if (p.swing > 0) {
        const t = 1 - p.swing / p.swingDur, w = p.L.weapon, wp = NDC.knight.WEAPONS[p.L.eq.weapon] || NDC.knight.WEAPONS.wood;
        const range = w.reach * 44, half = ((w.reach > 1.5 ? 200 : 130) * Math.PI) / 360;
        const a = p.dir - half + t * half * 2;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(a);
        ctx.fillStyle = "#0a0c16"; ctx.fillRect(10, -4, range - 6, 8);
        ctx.fillStyle = wp.w || wp.n; ctx.fillRect(12, -2, range - 10, 4);
        ctx.fillStyle = "#f4b942"; ctx.fillRect(8, -6, 4, 12);
        ctx.restore();
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.arc(p.x, p.y, range, p.dir - half, p.dir + half); ctx.fill();
      }
    }
    function bar(x, y, w, hh, pct, col) {
      R("#0a0c16", x - 2, y - 2, w + 4, hh + 4); R("#1f2540", x, y, w, hh); R(col, x, y, Math.max(0, Math.round(w * clamp(pct, 0, 1))), hh);
    }
    function draw() {
      // floor
      for (let y = 0; y < CH; y += 32) for (let x = 0; x < CW; x += 32) R(((x + y) / 32) % 2 ? "#141a30" : "#10162a", x, y, 32, 32);
      R("#06080f", 0, 0, CW, WALL); R("#06080f", 0, CH - WALL, CW, WALL); R("#06080f", 0, 0, WALL, CH); R("#06080f", CW - WALL, 0, WALL, CH);
      for (let x = 0; x < CW; x += 32) { R("#1c2340", x + 2, 6, 28, 18); R("#1c2340", x + 2, CH - 26, 28, 18); }
      for (let y = 32; y < CH - 32; y += 32) { R("#1c2340", 6, y + 2, 18, 28); R("#1c2340", CW - 24, y + 2, 18, 28); }
      if (!run) return;
      const list = run.enemies.slice().sort((a, b) => a.y - b.y);
      for (const e of list) {
        if (e.windup > 0) { ctx.fillStyle = "rgba(255,93,115,0.35)"; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 14, 0, TAU); ctx.fill(); R("#ff5d73", e.x - 2, e.y - e.r - 26, 4, 10); R("#ff5d73", e.x - 2, e.y - e.r - 13, 4, 4); }
        if (e.stun > 0) { R("#f4b942", e.x - 10, e.y - e.r - 14, 20, 4); }
        ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(e.x - e.r, e.y + e.r - 4, e.r * 2, 5);
        if (e.kind === "slime") drawSlime(e); else drawGoblin(e, e.kind === "boss");
        if (e.hp < e.max) bar(e.x - e.r, e.y - e.r - 14, e.r * 2, 4, e.hp / e.max, "#e5484d");
      }
      drawPlayer();
      for (const f of run.fx) {
        if (f.kind === "ring") { ctx.strokeStyle = f.c; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(f.x, f.y, Math.max(1, 6 + (0.35 - f.t) * 60), 0, TAU); ctx.stroke(); }
        else { ctx.fillStyle = f.c; ctx.font = "bold 14px 'Pixelify Sans', monospace"; ctx.textAlign = "center"; ctx.fillText(String(f.v), f.x, f.y - (0.3 - f.t) * 30); }
      }
      // HUD
      const p = run.p;
      ctx.font = "13px 'Pixelify Sans', monospace"; ctx.textAlign = "left";
      bar(44, 40, 150, 10, p.hp / p.maxHp, "#e5484d"); ctx.fillStyle = "#f4f1e6"; ctx.fillText("Health", 202, 49);
      bar(44, 62, 150, 8, p.st / p.maxSt, p.stun > 0 ? "#6a7899" : "#4f9cf0"); ctx.fillText("Stamina", 202, 70);
      ctx.textAlign = "right"; ctx.fillText(`Floor ${run.floor}  ·  ${run.enemies.length} left`, CW - 44, 49);
      if (run.msgT > 0) { ctx.textAlign = "center"; ctx.font = "26px 'Pixelify Sans', monospace"; ctx.fillStyle = "rgba(244,185,66," + Math.min(1, run.msgT) + ")"; ctx.fillText(run.msg, CW / 2, 150); }
    }

    function loop(t) {
      if (!alive) return;
      const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
      update(dt); draw();
      raf = requestAnimationFrame(loop);
    }

    /* ---------- menus ---------- */
    function floorBtn(f) {
      const open = gs.floorOpen(f);
      return h("button", { class: "btn" + (open ? "" : " locked"), type: "button", disabled: !open, onclick: () => start(f) },
        open ? `Floor ${f}: ${FLOORS[f].name}` : `Floor ${f}: reach level ${f}`);
    }
    function drawMenu() {
      NDC.clear(menuEl); menuEl.hidden = false;
      const L = loadout();
      if (phase === "clear" || phase === "dead") {
        const win = phase === "clear";
        const nextF = run.floor + 1;
        menuEl.append(h("h2", null, win ? `Floor ${run.floor} cleared` : "You were knocked out"),
          h("p", { class: "muted" }, `+${run.totalXp} game XP · ${run.kills} defeated` + (run.levelUp ? ` · Game level ${run.levelUp}!` : "")),
          h("div", { class: "row", style: { gap: "0.7rem", justifyContent: "center", marginTop: "1rem" } },
            win && nextF <= G.FLOORS && gs.floorOpen(nextF) ? h("button", { class: "btn primary", type: "button", onclick: () => start(nextF) }, `Go to floor ${nextF}`) : null,
            h("button", { class: "btn" + (win && nextF <= G.FLOORS && gs.floorOpen(nextF) ? "" : " primary"), type: "button", onclick: () => start(run.floor) }, win ? "Replay this floor" : "Try again"),
            h("button", { class: "btn", type: "button", onclick: () => { phase = "menu"; run = null; drawMenu(); } }, "Floor list")));
        if (win && nextF <= G.FLOORS && !gs.floorOpen(nextF)) menuEl.append(h("p", { class: "muted", style: { marginTop: "0.8rem" } }, `Floor ${nextF} opens at game level ${nextF}.`));
        return;
      }
      menuEl.append(h("h2", null, "Choose a floor"),
        h("div", { class: "dg-floors" }, FLOORS.slice(1).map((_, i) => floorBtn(i + 1))),
        h("p", { class: "muted", style: { marginTop: "0.9rem", fontSize: "0.92rem" } }, `Your ${L.weapon.dmg} damage weapon swings every ${L.weapon.swing} ms. Shield blocks ${Math.round(L.shield.block * 100)}%.`));
    }
    function drawStat() {
      NDC.clear(statEl);
      const g = gs, L = loadout();
      statEl.append(
        h("div", { class: "dg-pill px" }, h("span", null, "Game level"), h("b", { class: "pixel" }, g.level)),
        h("div", { class: "dg-pill px" }, h("span", null, "Best floor"), h("b", { class: "pixel" }, g.best || "-")),
        h("div", { class: "dg-pill px wide" }, h("span", null, `${g.into} / ${g.span} XP to level ${g.level + 1}`), h("div", { class: "bar px", style: { margin: "0.3rem 0 0" } }, h("i", { style: { width: Math.round(g.pct * 100) + "%" } }))),
        h("div", { class: "dg-pill px" }, h("span", null, "Health"), h("b", { class: "pixel" }, 100 + g.hpBonus + L.hp)),
        h("div", { class: "dg-pill px" }, h("span", null, "Stamina"), h("b", { class: "pixel" }, 100 + g.staminaBonus)));
    }
    async function loadBoard() {
      NDC.clear(boardEl);
      boardEl.append(h("h2", null, "Deepest floors"));
      let rows = null;
      try { rows = (await NDC.auth.leaderboard()).rows; } catch (e) { boardEl.append(h("p", { class: "muted" }, "The leaderboard couldn't load right now.")); return; }
      if (!alive) return;
      if (rows === null) {
        const me = G.gameStats(NDC.store.get());
        boardEl.append(h("p", { class: "muted" }, "Sign in to put your name on the leaderboard."), h("p", null, `You: floor ${me.best || 0}, game level ${me.level}`));
        return;
      }
      if (!rows.length) { boardEl.append(h("p", { class: "muted" }, "Nobody has cleared a floor yet.")); return; }
      boardEl.append(h("ol", { class: "dg-board" }, rows.map((r, i) => h("li", null, h("span", { class: "rk pixel" }, i + 1), h("span", { class: "nm" }, r.name), h("span", { class: "muted" }, `Level ${r.game_level}`), h("b", { class: "pixel" }, `Floor ${r.best_floor}`)))));
    }

    /* ---------- input ---------- */
    const onDown = (e) => {
      const tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (phase === "play" && (Object.values(KEYS).some((a) => a.includes(k)))) e.preventDefault();
      keys.add(k);
    };
    const onUp = (e) => keys.delete(e.key.toLowerCase());
    const clearKeys = () => keys.clear();
    document.addEventListener("keydown", onDown);
    document.addEventListener("keyup", onUp);
    window.addEventListener("blur", clearKeys);

    const holdBtn = (label, key, cls) => {
      const b = h("button", { class: "btn dg-touch " + (cls || ""), type: "button" }, label);
      const on = (e) => { e.preventDefault(); keys.add(key); }, off = (e) => { e.preventDefault(); keys.delete(key); };
      b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
      return b;
    };
    const pad = h("div", { class: "dg-pad" },
      h("div", { class: "dg-dpad" }, holdBtn("▲", "arrowup", "u"), holdBtn("◀", "arrowleft", "l"), holdBtn("▶", "arrowright", "r"), holdBtn("▼", "arrowdown", "d")),
      h("div", { class: "dg-acts" }, holdBtn("Block", "k"), holdBtn("Swing", "j", "primary")));

    NDC._dg = { get run() { return run; }, get phase() { return phase; }, keys };
    makeSprite(); drawStat(); drawMenu(); loadBoard();
    raf = requestAnimationFrame(loop);

    const root = h("div", { class: "page" }, h("div", { class: "wrap", style: { maxWidth: "980px" } },
      h("div", { class: "page-head" }, h("h1", null, "Dungeon"),
        h("p", null, "Move: WASD or arrows. Swing: Space or J. Hold to block: Shift or K.")),
      statEl,
      h("div", { class: "dg-stage px" }, canvas, menuEl),
      pad,
      h("section", { class: "card px", style: { marginTop: "1.4rem" } }, boardEl),
      h("p", { class: "muted", style: { marginTop: "1rem", fontSize: "0.92rem" } }, "Game XP is separate from lessons. It raises your health and stamina and opens deeper floors, and it never changes your coins or your knight's look. Gear you buy on the Knight page changes how you fight.")));

    return {
      el: root,
      destroy() {
        alive = false; cancelAnimationFrame(raf);
        document.removeEventListener("keydown", onDown); document.removeEventListener("keyup", onUp); window.removeEventListener("blur", clearKeys);
        commit();
      },
    };
  };
})();
