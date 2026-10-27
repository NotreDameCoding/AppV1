/* App shell: top bar, sign-in, and a tiny hash router (#/learn, #/members, ...). */
(function () {
  const h = NDC.h;
  const cfg = NDC.config;
  const LINKS = [["learn", "Learn"], ["projects", "Projects"], ["meetings", "Meetings"], ["members", "Members"], ["account", "Account"]];
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
    body.append(
      h("h3", null, "Sign in"),
      h("p", { class: "muted", style: { margin: "0.7rem 0 1.3rem" } }, real
        ? "No password. We email you a one-time link."
        : "Demo mode: no email is sent. Your progress saves in this browser under the address you enter."),
      form,
      h("p", { class: "muted", style: { fontSize: "0.88rem", marginTop: "1.2rem" } }, "We only keep your email and your lesson progress. Only club officers can see progress."));
    scrim.append(h("div", { class: "modal px", role: "dialog", "aria-modal": "true", "aria-label": "Sign in" }, body));
    document.body.append(scrim);
    setTimeout(() => input.focus(), 30);
  }
  NDC.openSignIn = openSignIn;

  /* ---------- top bar ---------- */
  function renderRight() {
    NDC.clear(rightEl);
    const st = NDC.store.stats();
    const user = NDC.auth.user;
    if (st.streak > 0) rightEl.append(h("span", { class: "chip flame px", title: "Day streak" }, st.streak + "d"));
    rightEl.append(h("span", { class: "chip px", title: "Experience points" }, st.xp + " XP"));
    if (!user) {
      rightEl.append(h("button", { class: "btn primary small", type: "button", onclick: openSignIn }, "Sign in"));
      return;
    }
    const menu = h("div", { class: "menu px", role: "menu", hidden: true },
      h("div", { class: "who" }, user.email),
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
    meetings: () => NDC.pages.meetings(),
    projects: () => NDC.pages.projects(),
    account: () => NDC.pages.account(),
  };
  const TITLES = { "": "", learn: "Learn", lesson: "Lesson", members: "Members", meetings: "Meetings", projects: "Projects", account: "Account" };

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
    NDC.bus.on("auth", () => { renderRight(); if (/^#\/account/.test(location.hash)) route(); });
  };
})();
