/* Settings you can change. Everything here is safe to commit: the Supabase "anon" key is
   meant to be public (the database rules in supabase/schema.sql are what protect the data). */
window.NDC = window.NDC || { courses: [], pages: {}, lib: {} };
NDC.config = {
  clubName: "Notre Dame Coding",
  school: "Notre Dame High School",
  contactEmail: "blake.westin.2029@ndhs.org",
  meetingInfo: "Gold Tuesdays and Wednesdays in the Steam Center",
  githubOrg: "https://github.com/NotreDameCoding",

  // Leave both empty to run in DEMO MODE (sign-in is local to this browser, no emails are sent).
  // Fill both in after following the steps in README.md to turn on real email sign-in.
  supabaseUrl: "https://vfcwcmwuutgxcwpaakwf.supabase.co",
  supabaseAnonKey: "sb_publishable_ZIBCgu7O27E9YN61j7cjag_gAPkpLdR",

  // Demo mode only: these emails see the officer panel on the Account page.
  demoOfficers: ["blake.westin.2029@ndhs.org"],
};
