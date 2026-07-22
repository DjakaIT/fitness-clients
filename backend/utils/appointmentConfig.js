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

export const TIMES = Array.from(
  { length: 23 },
  (_, i) =>
    `${String(Math.floor(i / 2) + 8).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
);

function parseLocal(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateLong(dateStr) {
  const d = parseLocal(dateStr);
  return `${DAYS_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS_HR[d.getMonth()]}.`;
}

export function formatDateShort(dateStr) {
  const d = parseLocal(dateStr);
  return `${DAYS_LONG[d.getDay()].slice(0, 3)}, ${d.getDate()}. ${MONTHS_HR[d.getMonth()]}.`;
}

export function toLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getBookableDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();

  const daysToSat = dow === 6 ? 0 : 6 - dow;
  const thisSat = new Date(today);
  thisSat.setDate(today.getDate() + daysToSat);

  const maxDate = new Date(thisSat);
  if (dow === 6 || dow === 0) maxDate.setDate(thisSat.getDate() + 7);

  const dates = [];
  const cursor = new Date(today);
  while (cursor <= maxDate) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(toLocalDateString(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function canCancel(appointmentDate, time) {
  const [y, m, d] = appointmentDate.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const slot = new Date(y, m - 1, d, h, min, 0);
  const cutoff = new Date(slot.getTime() - 24 * 60 * 60 * 1000);
  return Date.now() < cutoff.getTime();
}

// Hours from now until the appointment (negative if it already started).
export function hoursUntilAppointment(appointmentDate, time) {
  const [y, m, d] = appointmentDate.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const slot = new Date(y, m - 1, d, h, min, 0);
  return (slot.getTime() - Date.now()) / (1000 * 60 * 60);
}

export const WORK_DAYS = [
  { key: "monday", label: "Ponedjeljak", shortLabel: "Pon" },
  { key: "tuesday", label: "Utorak", shortLabel: "Uto" },
  { key: "wednesday", label: "Srijeda", shortLabel: "Sri" },
  { key: "thursday", label: "Četvrtak", shortLabel: "Čet" },
  { key: "friday", label: "Petak", shortLabel: "Pet" },
];

export const MAIN_JOB_START_TIMES = TIMES.filter((time) => time <= "17:00");

export const MAIN_JOB_DURATION_MINUTES = 4 * 60;
export const CLIENT_SESSION_DURATION_MINUTES = 60;
export const TRAVEL_BUFFER_MINUTES = 30;
export const CLIENT_DAY_START = "08:00";
export const CLIENT_DAY_END = "20:00";

function timeToMinutes(time) {
  const parts = time.split(":").map(Number);
  return parts[0] * 60 + parts[1];
}

function minutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export const CLIENT_APPOINTMENT_START_TIMES = TIMES.filter((time) => {
  const startMinutes = timeToMinutes(time);
  const endMinutes = startMinutes + CLIENT_SESSION_DURATION_MINUTES;
  return (
    startMinutes >= timeToMinutes(CLIENT_DAY_START) &&
    endMinutes <= timeToMinutes(CLIENT_DAY_END)
  );
});

export function getShiftEndTime(workStart) {
  if (!workStart) return null;
  return minutesToTime(timeToMinutes(workStart) + MAIN_JOB_DURATION_MINUTES);
}

// Times available when defining a busy block (06:00–22:00, 30-min grid).
export const BLOCK_TIMES = Array.from({ length: (22 - 6) * 2 + 1 }, (_, i) =>
  minutesToTime(timeToMinutes("06:00") + i * 30),
);

// A day's schedule value may be: null/undefined (fully free), a legacy single
// main-job start string (→ one 4h block), or an array of { start, end } blocks.
export function normalizeDayBlocks(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((b) => b && b.start && b.end)
      .map((b) => ({ start: b.start, end: b.end }))
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }
  if (typeof value === "string") {
    return [{ start: value, end: getShiftEndTime(value) }];
  }
  return [];
}

// Free 60-min client slots are those that don't overlap any busy block, within
// the client day. Free time runs right up to each block (no travel buffer).
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

// Free time as human-readable windows, e.g. "08:00 - 12:00, 16:00 - 18:00".
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
    if (timeToMinutes(free[i]) - timeToMinutes(previous) !== 30) {
      closeWindow();
      windowStart = free[i];
    }
    previous = free[i];
  }
  closeWindow();
  return windows.join(", ");
}

const DOW_KEY_MAP = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
};

export function getTrainerWorkStartForDate(schedule, dateStr) {
  if (!schedule) return null;
  const key = DOW_KEY_MAP[parseLocal(dateStr).getDay()];
  return key ? (schedule[key] ?? null) : null;
}

export function getBookingWindow() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();

  const daysToThisMonday = dow === 0 ? -6 : 1 - dow;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + daysToThisMonday);

  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(thisMonday.getDate() + 7);

  const bookableDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(nextMonday);
    d.setDate(nextMonday.getDate() + i);
    return toLocalDateString(d);
  });

  return {
    isOpen: true,
    bookableDates,
    weekStart: bookableDates[0],
    weekEnd: bookableDates[4],
    nextSaturday: "",
  };
}

// ─── Week utilities (workout builder / my workouts) ──────────────────────────

export function getWeekMondayFromOffset(offsetWeeks = 0) {
  const today = new Date();
  const dow = today.getDay();
  const daysToMon = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMon + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  return toLocalDateString(monday);
}

export function formatWeekLabel(mondayStr) {
  const mon = parseLocal(mondayStr);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  return `${mon.getDate()}. ${MONTHS_HR[mon.getMonth()]} – ${fri.getDate()}. ${MONTHS_HR[fri.getMonth()]}`;
}
