/**
 * Calendar helpers for the weekly program, check-ins and progress.
 *
 * Everything here is a pure function of its arguments (the clock is injectable
 * via a `now` parameter) so it can be unit-tested without freezing time.
 * Dates travel as local "YYYY-MM-DD" strings, never as UTC timestamps, so a
 * check-in made at 23:30 belongs to the day the client saw on her phone.
 */

// ─── Display maps ─────────────────────────────────────────────────────────────
const DAYS_LONG = [
  "Nedjelja",
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
];
const MONTHS_HR = [
  "sij",
  "velj",
  "ožu",
  "tra",
  "svi",
  "lip",
  "srp",
  "kol",
  "ruj",
  "lis",
  "stu",
  "pro",
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * "YYYY-MM-DD" → local midnight Date, or null when the string is not a real
 * calendar date. Returning null (rather than an Invalid Date) is what lets the
 * formatters below degrade to "" instead of rendering "undefined, NaN.".
 */
export function parseLocalDate(dateStr) {
  if (typeof dateStr !== "string" || !DATE_RE.test(dateStr)) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

export function formatDateLong(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return "";
  return `${DAYS_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS_HR[d.getMonth()]}.`;
}

export function formatDateShort(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return "";
  return `${DAYS_LONG[d.getDay()].slice(0, 3)}, ${d.getDate()}. ${MONTHS_HR[d.getMonth()]}.`;
}

export function toLocalDateString(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole days from `fromStr` to `toStr` (negative if `to` is earlier). */
export function daysBetween(fromStr, toStr) {
  const from = parseLocalDate(fromStr);
  const to = parseLocalDate(toStr);
  if (!from || !to) return NaN;
  // Rounded: a DST change makes one "day" 23 or 25 hours long.
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

// ─── Weeks (Monday–Sunday) ───────────────────────────────────────────────────

/** Local midnight of the Monday of `date`'s week (weeks run Mon–Sun). */
function mondayOf(date) {
  const dow = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() + (dow === 0 ? -6 : 1 - dow));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Monday of the week a "YYYY-MM-DD" falls in, as "YYYY-MM-DD" ("" if invalid). */
export function weekStartOf(dateStr) {
  const date = parseLocalDate(dateStr);
  return date ? toLocalDateString(mondayOf(date)) : "";
}

/** Monday of the week `offsetWeeks` away from the current one, as "YYYY-MM-DD". */
export function getWeekMondayFromOffset(offsetWeeks = 0, now = new Date()) {
  const monday = mondayOf(new Date(now));
  monday.setDate(monday.getDate() + offsetWeeks * 7);
  return toLocalDateString(monday);
}

/** How many weeks `mondayStr` lies after the current week (0 = this week). */
export function weekOffsetOf(mondayStr, now = new Date()) {
  const days = daysBetween(getWeekMondayFromOffset(0, now), weekStartOf(mondayStr));
  return Number.isNaN(days) ? NaN : Math.round(days / 7);
}

/** "13. lis – 19. lis": the whole program week, Monday to Sunday. */
export function formatWeekLabel(mondayStr) {
  const mon = parseLocalDate(mondayStr);
  if (!mon) return "";
  const last = new Date(mon);
  last.setDate(mon.getDate() + 6);
  return `${mon.getDate()}. ${MONTHS_HR[mon.getMonth()]} – ${last.getDate()}. ${MONTHS_HR[last.getMonth()]}`;
}
