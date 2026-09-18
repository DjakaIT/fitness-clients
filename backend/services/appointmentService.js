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
import { diffSlotSelection, slotDocId } from "../utils/bookingRules";
import { canCancel } from "../utils/appointmentConfig";

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

export class TooLateToCancelError extends Error {
  constructor() {
    super("Past the cancellation cutoff.");
    this.name = "TooLateToCancelError";
    this.code = "too-late";
  }
}

const isActive = (snap) => snap.exists() && snap.data().status === "active";

/**
 * Brings the client's week in line with `desired` in a single atomic step.
 *
 * Slots the client already holds are left completely untouched — the previous
 * implementation cancelled every booking and re-created them all, which
 * released unchanged slots into a window where anyone could take them.
 */
export async function syncWeekInTransaction({
  tx,
  slotRef,
  userId,
  desired = [],
  existing = [],
  timestamp,
}) {
  const { toBook, toCancel, unchanged } = diffSlotSelection(existing, desired);

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

  // ── Phase 2: verify before mutating anything, so a conflict on the last slot
  // does not leave the first three already written.
  for (const { slot, snap } of claims) {
    if (isActive(snap) && snap.data().userId !== userId) {
      throw new SlotTakenError(slot);
    }
  }

  // ── Phase 3: write.
  for (const { ref, snap } of releases) {
    if (isActive(snap) && snap.data().userId === userId) {
      tx.update(ref, { status: "cancelled", cancelledAt: timestamp() });
    }
  }

  for (const { slot, ref, snap } of claims) {
    const payload = {
      userId,
      appointmentDate: slot.date,
      time: slot.time,
      status: "active",
      updatedAt: timestamp(),
    };
    // Re-claiming a slot somebody released keeps the document (and its id),
    // which is what stops the id from being burned after a cancellation.
    if (snap.exists()) tx.update(ref, payload);
    else tx.set(ref, { ...payload, createdAt: timestamp() });
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
