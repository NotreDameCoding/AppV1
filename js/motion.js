/* Scroll and entrance motion, built on GSAP + ScrollTrigger (loaded from a CDN after the page is up).
   The page is fully readable without it: nothing is hidden unless this file is about to animate it,
   a timer reveals everything if the library is slow, and people who ask for less motion get none of it.
   Markup hooks:  data-reveal  fade and rise once       data-stagger  children rise one after another
                  data-split   headline, word by word   data-count    number counts up
                  data-parallax="n"  drifts n% while its section scrolls past */
(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SRC = ["https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js", "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"];
  let state = "idle", waiting = null, mm = null;

  const release = () => root.classList.remove("m-pending");
  const loadScript = (src) => new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.append(s); });
  function load() {
    if (state !== "idle") return;
    state = "loading";
    loadScript(SRC[0]).then(() => loadScript(SRC[1])).then(() => {
      if (!(window.gsap && window.ScrollTrigger)) throw new Error("gsap missing");
      gsap.registerPlugin(ScrollTrigger);
      state = "ready";
      const el = waiting; waiting = null;
      if (el && root.classList.contains("m-pending") && document.body.contains(el)) build(el); else release();
    }).catch(() => { state = "failed"; waiting = null; release(); });
  }

  function split(el) {
    if (el.dataset.splitDone) return;
    const text = el.textContent.trim(), words = text.split(/\s+/);
    el.textContent = "";
    const sr = document.createElement("span"); sr.className = "sr"; sr.textContent = text; el.append(sr);
    words.forEach((w, i) => {
      const o = document.createElement("span"); o.className = "w"; o.setAttribute("aria-hidden", "true");
      const s = document.createElement("span"); s.textContent = w; o.append(s); el.append(o);
      if (i < words.length - 1) el.append(" ");
    });
    el.dataset.splitDone = "1";
  }

  function teardown() {
    if (mm) { try { mm.revert(); } catch (e) {} mm = null; }
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  function build(rootEl) {
    teardown();
    const q = (s) => Array.from(rootEl.querySelectorAll(s));
    q("[data-split]").forEach(split);
    mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 900px)" }, (ctx) => {
      const wide = ctx.conditions.wide;

      q("[data-split]").forEach((el) => {
        const words = el.querySelectorAll(".w > span");
        gsap.set(el, { opacity: 1 });
        gsap.from(words, { yPercent: 115, duration: 1, ease: "power4.out", stagger: 0.09, delay: 0.1, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });

      const reveal = q("[data-reveal]");
      if (reveal.length) {
        gsap.set(reveal, { opacity: 0, y: 28 });
        ScrollTrigger.batch(reveal, { start: "top 91%", once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, overwrite: true }) });
      }

      q("[data-stagger]").forEach((box) => {
        const kids = Array.from(box.children);
        gsap.set(kids, { opacity: 0, y: 26 });
        ScrollTrigger.create({ trigger: box, start: "top 86%", once: true, onEnter: () => gsap.to(kids, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }) });
      });

      q("[data-count]").forEach((el) => {
        const end = +el.dataset.count || 0, o = { v: 0 };
        el.textContent = "0";
        ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: "power2.out", onUpdate: () => { el.textContent = String(Math.round(o.v)); } }) });
      });

      q("[data-parallax]").forEach((el) => {
        gsap.to(el, { yPercent: +el.dataset.parallax || -6, ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
      });

      /* the lesson demo plays as you scroll: question, code, then the checks passing */
      const demo = rootEl.querySelector(".demo");
      if (demo) {
        const lines = Array.from(demo.querySelectorAll(".dl")), checks = Array.from(demo.querySelectorAll("[data-check]"));
        const steps = Array.from(demo.querySelectorAll("[data-step]")), question = demo.querySelector(".win-q");
        const setOn = (n) => steps.forEach((s, i) => s.classList.toggle("on", i === n));
        gsap.set([question, ...lines, ...checks], { opacity: 0, x: -12 });
        setOn(0);
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onUpdate: () => setOn(tl.time() < 1.2 ? 0 : tl.time() < 3.4 ? 1 : 2),
          scrollTrigger: { trigger: demo, start: wide ? "top top+=64" : "top 75%", end: wide ? "+=130%" : "bottom 55%", scrub: 0.6, pin: wide, anticipatePin: 1 },
        });
        tl.to(question, { opacity: 1, x: 0, duration: 1 }, 0)
          .to(lines[0], { opacity: 1, x: 0, duration: 1 }, 1.4)
          .to(lines[1], { opacity: 1, x: 0, duration: 1 }, 2.4)
          .to(checks, { opacity: 1, x: 0, duration: 0.6, stagger: 0.55 }, 3.6)
          .to({}, { duration: 0.8 });
      }
    });
    release();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => window.ScrollTrigger && ScrollTrigger.refresh());
    ScrollTrigger.refresh();
  }

  function apply(el) {
    if (reduce || state === "failed") { release(); return; }
    if (state === "ready") { build(el); return; }
    waiting = el; load();
  }

  window.NDC = window.NDC || { courses: [], pages: {}, lib: {} };
  NDC.motion = { apply, teardown };
})();
