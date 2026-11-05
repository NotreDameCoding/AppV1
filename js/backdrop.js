/* The page background: faint contour lines that drift very slowly, like a map of terrain that never settles.
   Drawn on one fixed canvas at about 20 frames a second. It stops when the tab is hidden or a lesson is open,
   and it draws a single still frame for people who ask their system for less motion. */
(function () {
  const cv = document.getElementById("backdrop");
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext("2d");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CELL = 26, STEP = 0.32, LEVELS = [];
  for (let v = -1.28; v <= 1.3; v += STEP) LEVELS.push(+v.toFixed(2));
  let W = 0, H = 0, cols = 0, rows = 0, vals = null, t = 0, last = 0, raf = 0, colour = "rgba(0,0,0,0.08)";

  const field = (x, y, s) =>
    Math.sin(x * 3.1 + s * 0.11) * 0.5 +
    Math.sin(y * 2.7 - s * 0.09 + 1.3) * 0.4 +
    Math.sin((x + y) * 2.2 + s * 0.07) * 0.35 +
    Math.sin(Math.hypot(x - 0.5, y - 0.4) * 5 - s * 0.12) * 0.3;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / CELL) + 1; rows = Math.ceil(H / CELL) + 1;
    vals = new Float32Array((cols + 1) * (rows + 1));
  }
  function refresh() {
    colour = getComputedStyle(document.documentElement).getPropertyValue("--contour").trim() || colour;
    draw();
  }
  function draw() {
    if (!vals) return;
    ctx.clearRect(0, 0, W, H);
    const aspect = W / H, vw = cols + 1;
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) vals[j * vw + i] = field((i / cols) * aspect, j / rows, t);
    ctx.strokeStyle = colour; ctx.lineWidth = 1;
    ctx.beginPath();
    for (const L of LEVELS) {
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const a = vals[j * vw + i], b = vals[j * vw + i + 1], c = vals[(j + 1) * vw + i + 1], d = vals[(j + 1) * vw + i];
        const k = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
        if (k === 0 || k === 15) continue;
        const x = i * CELL, y = j * CELL;
        const T = [x + CELL * ((L - a) / (b - a)), y], R = [x + CELL, y + CELL * ((L - b) / (c - b))];
        const B = [x + CELL * ((L - d) / (c - d)), y + CELL], Lf = [x, y + CELL * ((L - a) / (d - a))];
        const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
        switch (k) {
          case 1: case 14: seg(Lf, B); break;
          case 2: case 13: seg(B, R); break;
          case 3: case 12: seg(Lf, R); break;
          case 4: case 11: seg(T, R); break;
          case 5: seg(T, Lf); seg(B, R); break;
          case 6: case 9: seg(T, B); break;
          case 7: case 8: seg(T, Lf); break;
          case 10: seg(T, R); seg(Lf, B); break;
        }
      }
    }
    ctx.stroke();
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < 48 || document.hidden || document.body.classList.contains("in-lesson")) return;
    t += (now - last) / 1000; last = now;
    draw();
  }
  size(); refresh();
  let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { size(); draw(); }, 150); });
  if (!still) raf = requestAnimationFrame((n) => { last = n; loop(n); });
  window.NDC = window.NDC || { courses: [], pages: {}, lib: {} };
  NDC.backdrop = { refresh };
})();
