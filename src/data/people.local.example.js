/*
 * Template for real respondent data.
 *
 * To use: copy this file to `people.local.js` in this same folder and fill in
 * real names/handles/colors/answers. `people.local.js` is gitignored — it will
 * never be committed or show up in git history. If that file doesn't exist,
 * the app falls back to the placeholder data in `people.sample.js`.
 *
 * Keep the same shape as people.sample.js: AUTHORS is an array of people with
 * answers keyed by question id (q1..q10), and MIA is a single freeform entry
 * with an `essay` array instead of `answers`.
 */

export const AUTHORS = [
  // { id: "...", name: "...", handle: "@...", color: "#......", answers: { q1: ["..."] } },
];

export const MIA = {
  id: "", name: "", handle: "", color: "#......", freeform: true,
  essay: [],
};
