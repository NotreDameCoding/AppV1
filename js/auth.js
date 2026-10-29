/* Sign-in.
   DEMO MODE (no keys in config.js): "signing in" just opens a save slot for that email, in this browser.
   REAL MODE (Supabase keys set): the person gets a one-time link by email, and progress syncs to the database. */
(function () {
  const cfg = NDC.config;
  const SESSION = "ndc.hub.session";
  const real = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  let sb = null;

  const A = (NDC.auth = {
    mode: real ? "supabase" : "demo",
    user: null, // { email, id }
    officer: false,
    ready: null,

    init() {
      A.ready = real ? initReal() : initDemo();
      return A.ready;
    },

    /* the name shown for the signed-in member: the one they chose, else their account's first and last name, else the start of their email */
    displayName(state) {
      let chosen = ((state && state.name) || "").trim();
      // a name that is just the member's email (or the start of it) was never really chosen
      const em = A.user && A.user.email ? A.user.email.toLowerCase() : "";
      if (em && (chosen.toLowerCase() === em || chosen.toLowerCase() === em.split("@")[0])) chosen = "";
      if (chosen) return chosen;
      if (A.user && A.user.name) return A.user.name;
      return A.user && A.user.email ? A.user.email.split("@")[0] : "";
    },

    validEmail: (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e),

    /* returns { signedIn: true } in demo mode, { emailSent: true } in real mode */
    async signIn(email) {
      email = String(email || "").trim().toLowerCase();
      if (!A.validEmail(email)) throw new Error("That doesn't look like an email address. Check for typos and try again.");
      if (!real) {
        try { localStorage.setItem(SESSION, JSON.stringify({ email })); } catch (e) {}
        setUser({ email, id: email });
        NDC.store.setIdentity(email, { inheritGuest: true });
        return { signedIn: true };
      }
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
      if (error) throw new Error(error.message || "Couldn't send the sign-in email. Try again in a minute.");
      return { emailSent: true };
    },

    /* real mode only: opens Google's account chooser, then comes back here signed in */
    async signInGoogle() {
      if (!real || !sb) throw new Error("Sign-in isn't available right now. Check your connection and reload.");
      const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname, queryParams: { prompt: "select_account" } } });
      if (error) throw new Error(error.message || "Couldn't start Google sign-in.");
    },

    async signOut() {
      if (real && sb) await sb.auth.signOut();
      try { localStorage.removeItem(SESSION); } catch (e) {}
      NDC.store.setRemote(null);
      setUser(null);
      NDC.store.setIdentity("guest");
    },

    /* Officers' knights: an officer's equipped gear is shared so the Members page can show their real look. Names and gear only. */
    async publishLook(state) {
      if (!real || !sb || !A.user || !A.officer) return;
      const name = A.displayName(state);
      if (!name || !Object.keys(state.equipped || {}).length) return; // nothing chosen yet: keep the default look
      await sb.from("looks").upsert({ user_id: A.user.id, name, equipped: state.equipped || {}, updated_at: new Date().toISOString() });
    },
    async looks() {
      if (!real || !sb) return [];
      const { data, error } = await sb.from("looks").select("name,equipped");
      return error ? [] : (data || []);
    },

    /* officers only */
    async listProgress() {
      if (!real) return { demo: true, rows: [] };
      const { data, error } = await sb.from("progress").select("email,display_name,xp,updated_at,data").order("xp", { ascending: false });
      if (error) throw new Error(error.message);
      return { rows: data };
    },
  });

  function setUser(u) {
    A.user = u;
    A.officer = !!u && !real && (cfg.demoOfficers || []).includes(u.email);
    NDC.bus.emit("auth", u);
  }

  async function initDemo() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SESSION) || "null"); } catch (e) {}
    if (s && s.email) { setUser({ email: s.email, id: s.email }); NDC.store.setIdentity(s.email); }
    else setUser(null);
  }

  function loadScript(src) {
    return new Promise((res, rej) => {
      const t = document.createElement("script");
      t.src = src; t.onload = res; t.onerror = () => rej(new Error("Couldn't load " + src));
      document.head.append(t);
    });
  }

  async function initReal() {
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js");
      sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    } catch (e) {
      NDC.toast("Sign-in is offline", "Progress will still save in this browser.");
      setUser(null);
      return;
    }
    sb.auth.onAuthStateChange((_ev, session) => { applySession(session); });
    const { data } = await sb.auth.getSession();
    await applySession(data.session);
  }

  async function applySession(session) {
    if (!session || !session.user) { NDC.store.setRemote(null); setUser(null); return; }
    const u = session.user;
    setUser({ email: u.email, id: u.id, name: (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || "" });
    // pull the saved copy, merge it with whatever is on this device, then keep them in sync
    let remoteState = null;
    try {
      const { data } = await sb.from("progress").select("data").eq("user_id", u.id).maybeSingle();
      if (data && data.data) remoteState = data.data;
    } catch (e) {}
    NDC.store.setIdentity(u.id, { inheritGuest: true, remoteState });
    NDC.store.setRemote({
      push: async (state) => {
        const xp = NDC.game.stats(state).xp;
        const { error } = await sb.from("progress").upsert({ user_id: u.id, email: u.email, display_name: A.displayName(state) || null, data: state, xp, updated_at: new Date().toISOString() });
        if (error) throw error;
        A.publishLook(state).catch(() => {});
      },
    });
    try { const { data } = await sb.rpc("is_officer"); A.officer = data === true; NDC.bus.emit("auth", A.user); } catch (e) {}
    if (A.officer) A.publishLook(NDC.store.get()).catch(() => {});
    // refresh the saved name now, so older rows stop showing an email
    try { await NDC.store.getRemote().push(NDC.store.get()); } catch (e) {}
  }
})();
