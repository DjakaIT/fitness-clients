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
