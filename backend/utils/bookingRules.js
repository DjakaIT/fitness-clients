/**
 * Pure booking domain rules — no Firestore, no React.
 *
 * The screen decides what to *render*; this module decides what is *legal*. The
 * same predicates run again inside the write transaction (see
 * src/hooks/useAppointments write path) and again in firestore.rules, so a
 * client that skips the UI still cannot create an illegal booking.
 */
import { BOOKING_POLICY } from "../config/tenant";
import {
  CLIENT_APPOINTMENT_START_TIMES,
  getFreeClientTimes,
  getTrainerWorkStartForDate,
  hoursUntilAppointment,
  parseLocalDate,
} from "./appointmentConfig";
import { validate, weeklySlotSelectionSchema } from "./appointmentSchemas";

/**
 * One appointment document per slot, keyed by the slot itself. This is the
 * mechanism that makes double-booking impossible: two clients racing for the
 * same minute race for the *same document id*, and Firestore serialises that.
 * A random id would let both writes succeed.
 */
export function slotDocId(date, time) {
  return `${date}_${time}`;
}

export function parseSlotDocId(docId) {
  if (typeof docId !== "string") return null;
  const [date, time] = docId.split("_");
  if (!date || !time) return null;
  return { date, time };
}

/** Stable key for comparing two selections regardless of array order. */
const slotKey = (slot) => slotDocId(slot.date, slot.time);

/**
 * Which slots actually have to change.
 *
 * The old flow cancelled every existing booking and re-created all of them,
 * which meant an unchanged Tuesday 09:00 was released — and could be taken by
 * someone else — in the gap between the two writes. Diffing keeps untouched
 * slots untouched.
 */
export function diffSlotSelection(existing = [], desired = []) {
  const existingByKey = new Map(existing.map((s) => [slotKey(s), s]));
  const desiredByKey = new Map(desired.map((s) => [slotKey(s), s]));

  const toBook = [];
  const unchanged = [];
  for (const [key, slot] of desiredByKey) {
    if (existingByKey.has(key)) unchanged.push(slot);
    else toBook.push(slot);
  }

  const toCancel = [];
  for (const [key, slot] of existingByKey) {
    if (!desiredByKey.has(key)) toCancel.push(slot);
  }

  return { toBook, toCancel, unchanged };
}

export const SLOT_STATUS = {
  AVAILABLE: "available",
  MINE: "mine",
  TAKEN: "taken",
  TRAINER_BUSY: "trainer_busy",
  PAST: "past",
};

/**
 * Status of a single time on a single day, from the client's point of view.
 * `bookedForDate` is the list of { time, userId, status } already on that day.
 */
export function getSlotStatus({
  date,
  time,
  schedule,
  bookedForDate = [],
  userId,
  now = Date.now(),
}) {
  const booking = bookedForDate.find(
    (b) => b.time === time && b.status !== "cancelled",
  );
  if (booking) {
    return booking.userId === userId ? SLOT_STATUS.MINE : SLOT_STATUS.TAKEN;
  }

  if (hoursUntilAppointment(date, time, now) <= 0) return SLOT_STATUS.PAST;

  const daySchedule = getTrainerWorkStartForDate(schedule, date);
  if (!getFreeClientTimes(daySchedule).includes(time)) {
    return SLOT_STATUS.TRAINER_BUSY;
  }

  return SLOT_STATUS.AVAILABLE;
}

export const DATE_STATUS = {
  AVAILABLE: "available",
  ADDED: "added",
  FULL: "full",
  UNAVAILABLE: "unavailable",
};

/** Status of a whole day in the date strip. */
export function getDateStatus({
  date,
  schedule,
  bookedForDate = [],
  userId,
  selectedDates = [],
  now = Date.now(),
}) {
  if (selectedDates.includes(date)) return DATE_STATUS.ADDED;

  const statuses = CLIENT_APPOINTMENT_START_TIMES.map((time) =>
    getSlotStatus({ date, time, schedule, bookedForDate, userId, now }),
  );

  const hasOpenSlot = statuses.some(
    (s) => s === SLOT_STATUS.AVAILABLE || s === SLOT_STATUS.MINE,
  );
  if (hasOpenSlot) return DATE_STATUS.AVAILABLE;

  // No open slot: distinguish "trainer never offered this day" from "sold out",
  // because the two need different copy.
  const trainerOffersAnything =
    getFreeClientTimes(getTrainerWorkStartForDate(schedule, date)).length > 0;
  return trainerOffersAnything ? DATE_STATUS.FULL : DATE_STATUS.UNAVAILABLE;
}

/**
 * Full validation of a submitted week. Returns { ok, error } — the single
 * message is what the sheet shows the client.
 */
export function validateSelection(
  slots,
  {
    bookableDates = [],
    schedule = null,
    bookedSlots = {},
    userId,
    now = Date.now(),
  } = {},
) {
  const shape = validate(weeklySlotSelectionSchema, slots);
  if (!shape.ok) return shape;

  for (const { date, time } of slots) {
    if (bookableDates.length && !bookableDates.includes(date)) {
      return { ok: false, error: "Termin je izvan tjedna koji se rezervira." };
    }
    if (!parseLocalDate(date)) {
      return { ok: false, error: "Neispravan datum termina." };
    }

    const status = getSlotStatus({
      date,
      time,
      schedule,
      bookedForDate: bookedSlots[date] ?? [],
      userId,
      now,
    });

    if (status === SLOT_STATUS.TAKEN) {
      return { ok: false, error: `Termin ${time} je upravo rezerviran.` };
    }
    if (status === SLOT_STATUS.TRAINER_BUSY) {
      return { ok: false, error: `Trenerica nije slobodna u ${time}.` };
    }
    if (status === SLOT_STATUS.PAST) {
      return { ok: false, error: "Termin je u prošlosti." };
    }
  }

  return { ok: true, data: slots };
}

/**
 * Whether a client is still allowed to release this booking themselves.
 * The trainer bypasses the cutoff — `isAdmin` short-circuits it.
 */
export function canClientCancel(
  { appointmentDate, time },
  { isAdmin = false, now = Date.now() } = {},
) {
  if (isAdmin) return true;
  const hours = hoursUntilAppointment(appointmentDate, time, now);
  return !Number.isNaN(hours) && hours >= BOOKING_POLICY.cancelCutoffHours;
}
