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

export const WORK_DAYS = [
  { key: "monday", label: "Ponedjeljak", shortLabel: "Pon" },
  { key: "tuesday", label: "Utorak", shortLabel: "Uto" },
  { key: "wednesday", label: "Srijeda", shortLabel: "Sri" },
  { key: "thursday", label: "Cetvrtak", shortLabel: "Cet" },
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

function formatRange(start, end) {
  return start === end ? start : `${start} - ${end}`;
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

export function getFreeClientTimes(workStart) {
  if (!workStart) return CLIENT_APPOINTMENT_START_TIMES;

  const shiftStartMinutes = timeToMinutes(workStart);
  const shiftEndMinutes = shiftStartMinutes + MAIN_JOB_DURATION_MINUTES;

  return CLIENT_APPOINTMENT_START_TIMES.filter((time) => {
    const appointmentStart = timeToMinutes(time);
    const appointmentEnd = appointmentStart + CLIENT_SESSION_DURATION_MINUTES;

    const fitsBeforeWork =
      appointmentEnd + TRAVEL_BUFFER_MINUTES <= shiftStartMinutes;

    const fitsAfterWork =
      shiftEndMinutes + TRAVEL_BUFFER_MINUTES <= appointmentStart;

    return fitsBeforeWork || fitsAfterWork;
  });
}

export function getFreeClientTimeText(workStart) {
  const freeTimes = getFreeClientTimes(workStart);

  if (freeTimes.length === 0) return "Nema slobodnih termina.";

  const ranges = [];
  let rangeStart = freeTimes[0];
  let previous = freeTimes[0];

  for (let i = 1; i < freeTimes.length; i += 1) {
    const current = freeTimes[i];

    if (timeToMinutes(current) - timeToMinutes(previous) !== 30) {
      ranges.push(formatRange(rangeStart, previous));
      rangeStart = current;
    }

    previous = current;
  }

  ranges.push(formatRange(rangeStart, previous));
  return ranges.join(", ");
}
