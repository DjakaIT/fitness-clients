/**
 * Transaction bodies for the booking flow.
 *
 * These are deliberately free of Firestore imports: the caller injects `tx` and
 * a `slotRef(id)` factory, which is what lets the concurrency rules be tested
 * with a fake transaction instead of an emulator.
 *
 * Concurrency model: one document per slot, id "<date>_<time>". Claiming a slot
 * means writing that exact document, so two clients racing for the same minute
 * contend on the same key and Firestore serialises them — the loser's
 * transaction re-runs, re-reads the now-taken slot, and fails loudly.
 */
import {
  bookingWeekDocId,
  diffSlotSelection,
  slotDocId,
} from "../utils/bookingRules.js";
import { canCancel } from "../utils/appointmentConfig.js";

export class SlotTakenError extends Error {
  constructor(slot) {
    super(`Slot ${slot.date} ${slot.time} is already booked.`);
    this.name = "SlotTakenError";
    this.code = "slot-taken";
    this.slot = slot;
  }
}

export class NotOwnerError extends Error {
  constructor() {
    super("Appointment belongs to another user.");
    this.name = "NotOwnerError";
    this.code = "not-owner";
  }
}

/**
 * The week changed under the screen: a booking of hers that the screen did
 * not know about (made on another phone, say) is still on her week list.
 * Saving would silently keep it past the weekly cap, so the rules refuse —
 * this names the situation instead of a bare permission error.
 */
export class StaleWeekError extends Error {
  constructor() {
    super("The week's bookings changed since the screen loaded.");
    this.name = "StaleWeekError";
    this.code = "stale-week";
  }
}

export class TooLateToCancelError extends Error {
  /** `slot` ({ date, time }) is set when a week sync tried to drop it. */
  constructor(slot = null) {
    super("Past the cancellation cutoff.");
    this.name = "TooLateToCancelError";
    this.code = "too-late";
    this.slot = slot;
  }
}

const isActive = (snap) => snap.exists() && snap.data().status === "active";

/**
 * Brings the client's week in line with `desired` in a single atomic step.
 *
 * Slots the client already holds are left completely untouched — the previous
 * implementation cancelled every booking and re-created them all, which
 * released unchanged slots into a window where anyone could take them.
 *
 * With `weekStart` (the Monday) and `weekRef`, it also rewrites her week list,
 * `booking_weeks/<uid>_<monday>`, to exactly the desired slots. firestore.rules
 * caps that list (4 slots, one a day) and requires every client booking to be
 * on it, which is how the weekly limits hold for a tampered client too.
 */
export async function syncWeekInTransaction({
  tx,
  slotRef,
  weekRef,
  weekStart,
  userId,
  desired = [],
  existing = [],
  now = Date.now(),
  timestamp,
}) {
  const { toBook, toCancel, unchanged } = diffSlotSelection(existing, desired);
  const tracksWeek = Boolean(weekStart && weekRef);

  // ── Phase 1: every read, before any write (Firestore requires this order).
  const claims = [];
  for (const slot of toBook) {
    const ref = slotRef(slotDocId(slot.date, slot.time));
    claims.push({ slot, ref, snap: await tx.get(ref) });
  }

  const releases = [];
  for (const slot of toCancel) {
    const ref = slotRef(slotDocId(slot.date, slot.time));
    releases.push({ slot, ref, snap: await tx.get(ref) });
  }

  // Slots on her stored list that this sync neither keeps nor releases: if
  // any is still an active booking of hers, the screen was out of date.
  let weekDocRef = null;
  if (tracksWeek) {
    weekDocRef = weekRef(bookingWeekDocId(userId, weekStart));
    const weekSnap = await tx.get(weekDocRef);
    const handled = new Set(
      [...desired, ...toCancel].map((s) => slotDocId(s.date, s.time)),
    );
    const listed = weekSnap.exists() ? (weekSnap.data().slots ?? []) : [];
    for (const id of listed.filter((id) => !handled.has(id))) {
      const snap = await tx.get(slotRef(id));
      if (isActive(snap) && snap.data().userId === userId) {
        throw new StaleWeekError();
      }
    }
  }

  // ── Phase 2: verify before mutating anything, so a conflict on the last slot
  // does not leave the first three already written.
  for (const { slot, snap } of claims) {
    if (isActive(snap) && snap.data().userId !== userId) {
      throw new SlotTakenError(slot);
    }
  }

  // Dropping a slot from the week is a cancellation, so the 24h cutoff
  // applies exactly as it does to the cancel button — checked against the
  // stored slot, not the screen's copy. Without this the rules refused the
  // whole transaction and the client saw a generic "check your connection".
  const ownReleases = releases.filter(
    ({ snap }) => isActive(snap) && snap.data().userId === userId,
  );
  for (const { slot, snap } of ownReleases) {
    const { appointmentDate, time } = snap.data();
    if (!canCancel(appointmentDate, time, now)) {
      throw new TooLateToCancelError(slot);
    }
  }

  // ── Phase 3: write.
  for (const { ref } of ownReleases) {
    tx.update(ref, { status: "cancelled", cancelledAt: timestamp() });
  }

  for (const { slot, ref, snap } of claims) {
    const payload = {
      userId,
      appointmentDate: slot.date,
      time: slot.time,
      status: "active",
      ...(tracksWeek ? { weekStart } : {}),
      updatedAt: timestamp(),
    };
    // Re-claiming a slot somebody released keeps the document (and its id),
    // which is what stops the id from being burned after a cancellation.
    if (snap.exists()) tx.update(ref, payload);
    else tx.set(ref, { ...payload, createdAt: timestamp() });
  }

  if (tracksWeek) {
    tx.set(weekDocRef, {
      userId,
      weekStart,
      slots: desired.map((s) => slotDocId(s.date, s.time)).sort(),
      updatedAt: timestamp(),
    });
  }

  return { booked: toBook, cancelled: toCancel, unchanged };
}

/**
 * Releases one appointment. Re-checks ownership and the cutoff against the
 * stored document rather than trusting what the screen had in state.
 */
export async function cancelAppointmentInTransaction({
  tx,
  ref,
  userId,
  isAdmin = false,
  now = Date.now(),
  timestamp,
}) {
  const snap = await tx.get(ref);
  if (!snap.exists()) return { alreadyGone: true };

  const data = snap.data();
  if (data.status === "cancelled") return { alreadyGone: true };
  if (!isAdmin && data.userId !== userId) throw new NotOwnerError();
  if (!isAdmin && !canCancel(data.appointmentDate, data.time, now)) {
    throw new TooLateToCancelError();
  }

  tx.update(ref, { status: "cancelled", cancelledAt: timestamp() });
  return { alreadyGone: false };
}
