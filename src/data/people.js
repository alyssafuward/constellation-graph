import { AUTHORS as SAMPLE_AUTHORS, MIA as SAMPLE_MIA } from "./people.sample.js";

// people.local.js is gitignored and usually won't exist — that's expected.
// import.meta.glob tolerates zero matches instead of erroring like a static import would.
const localModules = import.meta.glob("./people.local.js", { eager: true });
const local = localModules["./people.local.js"];

export const AUTHORS = local ? local.AUTHORS : SAMPLE_AUTHORS;
export const MIA = local ? local.MIA : SAMPLE_MIA;
export const ALL_PEOPLE = [...AUTHORS, MIA];
