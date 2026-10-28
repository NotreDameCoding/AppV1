/* App shell: top bar, sign-in, and a tiny hash router (#/learn, #/members, ...). */
(function () {
  const h = NDC.h;
  const cfg = NDC.config;
  const LINKS = [["learn", "Learn"], ["members", "Members"], ["knight", "Knight"], ["dungeon", "Dungeon"], ["meetings", "Meetings"], ["projects", "Projects"], ["account", "Account"]];
  let current = null; // { destroy }
  let navEl, rightEl, appEl;

  /* ---------- sign-in dialog ---------- */
  function openSignIn() {
    const real = NDC.auth.mode === "supabase";
    const err = h("p", { class: "muted", style: { color: "var(--bad)", minHeight: "1.4em", marginTop: "0.5rem" }, role: "alert" });
    const input = h("input", { class: "field", type: "email", required: true, autocomplete: "email", placeholder: "you@example.com", "aria-label": "Email address" });
    const body = h("div");
    const scrim = h("div", { class: "scrim", onclick: (e) => { if (e.target === scrim) close(); } });
    const close = () => { scrim.remove(); document.removeEventListener("keydown", esc); };
    const esc = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);

    const submit = h("button", { class: "btn primary block", type: "submit" }, real ? "Email me a sign-in link" : "Sign in");
    const form = h("form", { onsubmit: async (e) => {
      e.preventDefault(); err.textContent = ""; submit.disabled = true;
      try {
        const r = await NDC.auth.signIn(input.value);
        if (r.signedIn) { close(); NDC.toast("Signed in", input.value.trim().toLowerCase()); if (location.hash.startsWith("#/account") || !location.hash) route(); }
        else {
          NDC.clear(body);
          body.append(h("h3", null, "Check your inbox"), h("p", { class: "muted", style: { margin: "0.8rem 0 1.4rem" } }, "We sent a sign-in link to ", h("b", null, input.value.trim()), ". Open it on this device and you're in. It can take a minute to arrive."),
            h("button", { class: "btn block", type: "button", onclick: close }, "Done"));
        }
      } catch (ex) { err.textContent = ex.message; }
      submit.disabled = false;
    } },
      h("div", { class: "form-row" }, h("label", { for: "si-email" }, "Email address"), input),
      err, submit);
    input.id = "si-email";
    const gBtn = h("button", { class: "btn block g-btn", type: "button", onclick: async () => {
      err.textContent = ""; gBtn.disabled = true;
      try { await NDC.auth.signInGoogle(); } catch (ex) { err.textContent = ex.message; gBtn.disabled = false; }
    } }, NDC.svg('<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.6z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.6-5.9c-2.1 1.4-4.8 2.3-8 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>'), h("span", null, "Continue with Google"));
    body.append(
      h("h3", null, "Sign in"),
      h("p", { class: "muted", style: { margin: "0.7rem 0 1.3rem" } }, real
        ? "Pick your Google account. No password to remember."
        : "Demo mode: no email is sent. Your progress saves in this browser under the address you enter."),
      real ? h("div", null, gBtn, err) : form,
      h("p", { class: "muted", style: { fontSize: "0.88rem", marginTop: "1.2rem" } }, "We only keep your email and your lesson progress. Only club officers can see progress."));
    scrim.append(h("div", { class: "modal px", role: "dialog", "aria-modal": "true", "aria-label": "Sign in" }, body));
    document.body.append(scrim);
    if (!real) setTimeout(() => input.focus(), 30);
  }
  NDC.openSignIn = openSignIn;

  /* ---------- top bar ---------- */
  function renderRight() {
    NDC.clear(rightEl);
    const st = NDC.store.stats();
    const user = NDC.auth.user;
    if (st.streak > 0) rightEl.append(h("span", { class: "chip flame px", title: "Day streak" }, st.streak + "d"));
    rightEl.append(h("span", { class: "chip px", title: "Experience points" }, st.xp + " XP"));
    rightEl.append(h("span", { class: "chip px", title: "Coins" }, st.coins + " coins"));
    if (!user) {
      rightEl.append(h("button", { class: "btn primary small", type: "button", onclick: openSignIn }, "Sign in"));
      return;
    }
    const menu = h("div", { class: "menu px", role: "menu", hidden: true },
      h("div", { class: "who" }, NDC.auth.displayName(NDC.store.get()) || user.email),
      h("a", { href: "#/account", role: "menuitem", onclick: () => (menu.hidden = true) }, "Account"),
      h("button", { type: "button", role: "menuitem", onclick: async () => { menu.hidden = true; await NDC.auth.signOut(); NDC.toast("Signed out"); } }, "Sign out"));
    const btn = h("button", { class: "avatar-btn", type: "button", "aria-haspopup": "true", "aria-label": "Account menu", onclick: (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; } },
      h("span", { class: "face px" }, NDC.knight.head(NDC.store.equipped())));
    rightEl.append(h("div", { class: "menu-host" }, btn, menu));
    document.addEventListener("click", () => { menu.hidden = true; }, { once: true });
  }

  function renderNav() {
    const active = (location.hash.replace(/^#\/?/, "").split("/")[0]) || "";
    NDC.clear(navEl);
    const links = h("nav", { class: "nav-links", "aria-label": "Main" }, LINKS.map(([k, label]) => h("a", { href: "#/" + k, "aria-current": active === k ? "page" : null, onclick: () => navEl.classList.remove("open") }, label)));
    rightEl = h("div", { class: "nav-right" });
    navEl.append(h("div", { class: "wrap" },
      h("a", { class: "brand", href: "#/" }, NDC.knight.head({ helm: "iron" }), h("span", null, cfg.clubName)),
      links, rightEl,
      h("button", { class: "nav-toggle", type: "button", "aria-label": "Menu", onclick: () => navEl.classList.toggle("open") }, "Menu")));
    renderRight();
  }

  /* ---------- router ---------- */
  const ROUTES = {
    "": () => NDC.pages.home(),
    learn: (a) => NDC.pages.learn(a[0]),
    lesson: (a) => NDC.pages.lesson(a[0]),
    members: () => NDC.pages.members(),
    knight: () => NDC.pages.knight(),
    dungeon: () => NDC.pages.dungeon(),
    meetings: () => NDC.pages.meetings(),
    projects: () => NDC.pages.projects(),
    account: () => NDC.pages.account(),
  };
  const TITLES = { "": "", learn: "Learn", lesson: "Lesson", members: "Members", knight: "Knight", dungeon: "Dungeon", meetings: "Meetings", projects: "Projects", account: "Account" };

  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const key = parts[0] || "";
    const fn = ROUTES[key] || ROUTES[""];
    if (current && current.destroy) { try { current.destroy(); } catch (e) {} }
    current = null;
    document.querySelectorAll(".scrim").forEach((s) => s.remove());
    NDC.clear(appEl);
    const res = fn(parts.slice(1));
    const el = res && res.el ? res.el : res;
    current = res && res.el ? res : null;
    appEl.append(el);
    document.title = (TITLES[key] ? TITLES[key] + " · " : "") + cfg.clubName;
    document.body.classList.toggle("in-lesson", key === "lesson");
    renderNav();
    if (key !== "lesson") window.scrollTo(0, 0);
    appEl.focus({ preventScroll: true });
  }
  NDC.route = route;

  function footer() {
    return h("footer", { class: "site" }, h("div", { class: "wrap" },
      h("span", null, cfg.clubName + " · " + cfg.school),
      h("span", null, "Built by club members. ", h("a", { href: cfg.githubOrg, target: "_blank", rel: "noopener" }, "Source on GitHub"))));
  }

  NDC.boot = async function boot() {
    navEl = document.getElementById("nav");
    appEl = document.getElementById("app");
    document.getElementById("foot").append(footer());
    await NDC.auth.init();
    renderNav();
    route();
    window.addEventListener("hashchange", route);
    // keep the top bar's XP and avatar fresh without redrawing the page
    NDC.bus.on("progress", () => { if (rightEl) renderRight(); });
    NDC.bus.on("auth", () => { renderRight(); if (/^#\/(account|knight|dungeon)/.test(location.hash)) route(); });
  };
})();
