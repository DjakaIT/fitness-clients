/**
 * Calendar + slot maths for the booking flow.
 *
 * Everything here is a pure function of its arguments (the clock is injectable
 * via a `now` parameter) so the rules can be unit-tested without freezing time.
 * Every size, boundary and policy number comes from BOOKING_POLICY — see
 * backend/config/tenant.js.
 */
import { BOOKING_POLICY } from "../config/tenant.js";

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
const TIME_RE = /^\d{1,2}:\d{2}$/;

export function timeToMinutes(time) {
  if (typeof time !== "string" || !TIME_RE.test(time)) return NaN;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

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

/** "YYYY-MM-DD" + "HH:MM" → the local Date the session starts, or null. */
export function parseSlotDateTime(dateStr, time) {
  const date = parseLocalDate(dateStr);
  const minutes = timeToMinutes(time);
  if (!date || Number.isNaN(minutes)) return null;
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
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

// ─── Time grids ───────────────────────────────────────────────────────────────

function buildGrid(startTime, endTime, step = BOOKING_POLICY.slotGridMinutes) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const grid = [];
  for (let t = start; t <= end; t += step) grid.push(minutesToTime(t));
  return grid;
}

export const CLIENT_SESSION_DURATION_MINUTES = BOOKING_POLICY.sessionMinutes;
export const CLIENT_DAY_START = BOOKING_POLICY.dayStart;
export const CLIENT_DAY_END = BOOKING_POLICY.dayEnd;

/** Every start time at which a full session still fits inside the client day. */
export const CLIENT_APPOINTMENT_START_TIMES = buildGrid(
  BOOKING_POLICY.dayStart,
  BOOKING_POLICY.dayEnd,
).filter(
  (time) =>
    timeToMinutes(time) + CLIENT_SESSION_DURATION_MINUTES <=
    timeToMinutes(BOOKING_POLICY.dayEnd),
);

/** Times the trainer can pick when marking herself busy (wider than the client day). */
export const BLOCK_TIMES = buildGrid(
  BOOKING_POLICY.blockDayStart,
  BOOKING_POLICY.blockDayEnd,
);

/** Legacy: a bare start string used to mean "a 4h main-job shift from here". */
export const MAIN_JOB_DURATION_MINUTES = 4 * 60;

export function getShiftEndTime(workStart) {
  const start = timeToMinutes(workStart);
  if (Number.isNaN(start)) return null;
  return minutesToTime(start + MAIN_JOB_DURATION_MINUTES);
}

export const WORK_DAYS = [
  { key: "monday", label: "Ponedjeljak", shortLabel: "Pon" },
  { key: "tuesday", label: "Utorak", shortLabel: "Uto" },
  { key: "wednesday", label: "Srijeda", shortLabel: "Sri" },
  { key: "thursday", label: "Četvrtak", shortLabel: "Čet" },
  { key: "friday", label: "Petak", shortLabel: "Pet" },
];

const DOW_KEY_MAP = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
};

// ─── Busy blocks → free client slots ─────────────────────────────────────────

/**
 * A day's schedule value may be null/undefined (fully free), a legacy single
 * main-job start string (→ one 4h block), or an array of { start, end } blocks.
 * Invalid and zero-length blocks are dropped, and overlapping/touching blocks
 * are merged so downstream maths never sees the same minute twice.
 */
export function normalizeDayBlocks(value) {
  let blocks = [];

  if (Array.isArray(value)) {
    blocks = value
      .filter(
        (b) => b && typeof b.start === "string" && typeof b.end === "string",
      )
      .map((b) => [timeToMinutes(b.start), timeToMinutes(b.end)])
      .filter(([s, e]) => !Number.isNaN(s) && !Number.isNaN(e) && e > s);
  } else if (typeof value === "string" && value) {
    const start = timeToMinutes(value);
    if (!Number.isNaN(start)) {
      blocks = [[start, start + MAIN_JOB_DURATION_MINUTES]];
    }
  }

  blocks.sort((a, b) => a[0] - b[0]);

  const merged = [];
  for (const [start, end] of blocks) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  return merged.map(([start, end]) => ({
    start: minutesToTime(start),
    end: minutesToTime(end),
  }));
}

/**
 * Start times whose full session fits in a gap between busy blocks. Free time
 * runs right up to each block — there is deliberately no travel buffer.
 */
export function getFreeClientTimes(value) {
  const busy = normalizeDayBlocks(value).map((b) => [
    timeToMinutes(b.start),
    timeToMinutes(b.end),
  ]);

  return CLIENT_APPOINTMENT_START_TIMES.filter((time) => {
    const start = timeToMinutes(time);
    const end = start + CLIENT_SESSION_DURATION_MINUTES;
    return busy.every(([b0, b1]) => end <= b0 || start >= b1);
  });
}

/** Free time as human-readable windows, e.g. "08:00 - 12:00, 16:00 - 18:00". */
export function getFreeClientTimeText(value) {
  const free = getFreeClientTimes(value);
  if (free.length === 0) return "Nema slobodnih termina.";

  const windows = [];
  let windowStart = free[0];
  let previous = free[0];

  const closeWindow = () =>
    windows.push(
      `${windowStart} - ${minutesToTime(
        timeToMinutes(previous) + CLIENT_SESSION_DURATION_MINUTES,
      )}`,
    );

  for (let i = 1; i < free.length; i += 1) {
    if (
      timeToMinutes(free[i]) - timeToMinutes(previous) !==
      BOOKING_POLICY.slotGridMinutes
    ) {
      closeWindow();
      windowStart = free[i];
    }
    previous = free[i];
  }
  closeWindow();
  return windows.join(", ");
}

/** The raw schedule value for the weekday `dateStr` falls on (null on weekends). */
export function getTrainerWorkStartForDate(schedule, dateStr) {
  if (!schedule) return null;
  const date = parseLocalDate(dateStr);
  if (!date) return null;
  const key = DOW_KEY_MAP[date.getDay()];
  return key ? (schedule[key] ?? null) : null;
}

// ─── Cancellation ────────────────────────────────────────────────────────────

/** Hours from `now` until the session starts (negative once it has started). */
export function hoursUntilAppointment(appointmentDate, time, now = Date.now()) {
  const slot = parseSlotDateTime(appointmentDate, time);
  if (!slot) return NaN;
  return (slot.getTime() - now) / (1000 * 60 * 60);
}

/** A client may cancel until BOOKING_POLICY.cancelCutoffHours before the start. */
export function canCancel(appointmentDate, time, now = Date.now()) {
  const hours = hoursUntilAppointment(appointmentDate, time, now);
  if (Number.isNaN(hours)) return false;
  return hours >= BOOKING_POLICY.cancelCutoffHours;
}

// ─── Week windows ────────────────────────────────────────────────────────────

/** Local midnight of the Monday of `date`'s week (weeks run Mon–Sun). */
function mondayOf(date) {
  const dow = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() + (dow === 0 ? -6 : 1 - dow));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * The week clients are currently booking: always *next* week, Mon–Fri, so the
 * trainer always has the current week to plan against.
 */
export function getBookingWindow(now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const nextMonday = mondayOf(today);
  nextMonday.setDate(nextMonday.getDate() + 7);

  const bookableDates = BOOKING_POLICY.workDayNumbers.map((_, i) => {
    const d = new Date(nextMonday);
    d.setDate(nextMonday.getDate() + i);
    return toLocalDateString(d);
  });

  return {
    bookableDates,
    weekStart: bookableDates[0],
    weekEnd: bookableDates[bookableDates.length - 1],
  };
}

/** Monday of the week `offsetWeeks` away from the current one, as "YYYY-MM-DD". */
export function getWeekMondayFromOffset(offsetWeeks = 0, now = new Date()) {
  const monday = mondayOf(new Date(now));
  monday.setDate(monday.getDate() + offsetWeeks * 7);
  return toLocalDateString(monday);
}

export function formatWeekLabel(mondayStr) {
  const mon = parseLocalDate(mondayStr);
  if (!mon) return "";
  const last = new Date(mon);
  last.setDate(mon.getDate() + BOOKING_POLICY.workDayNumbers.length - 1);
  return `${mon.getDate()}. ${MONTHS_HR[mon.getMonth()]} – ${last.getDate()}. ${MONTHS_HR[last.getMonth()]}`;
}
