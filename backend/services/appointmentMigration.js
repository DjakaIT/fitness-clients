/**
 * Plans the move of pre-slot-key appointments onto slot-keyed document ids.
 *
 * Appointments created before the slot-key scheme have random ids, so the
 * collision guarantee ("one document per slot, so two bookers contend for one
 * key") does not hold for the slots they occupy. This rewrites them onto
 * "<date>_<time>" **without cancelling anybody** — clients keep every booking
 * they already made.
 *
 * Pure on purpose: the plan is computed and asserted in tests, and the script
 * in scripts/migrate-appointments.mjs only executes it.
 */
import { slotDocId } from "../utils/bookingRules";

export const SLOT_ID_RE = /^\d{4}-\d{2}-\d{2}_\d{2}:\d{2}$/;

export function isSlotKeyed(docId) {
  return typeof docId === "string" && SLOT_ID_RE.test(docId);
}

/** Fields worth carrying over. userName/userPhoto are deliberately dropped. */
function migratedPayload(data) {
  return {
    userId: data.userId,
    appointmentDate: data.appointmentDate,
    time: data.time,
    status: data.status ?? "active",
    ...(data.createdAt ? { createdAt: data.createdAt } : {}),
  };
}

function isWellFormed(data) {
  return (
    !!data &&
    typeof data.userId === "string" &&
    data.userId.length > 0 &&
    typeof data.appointmentDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(data.appointmentDate) &&
    typeof data.time === "string" &&
    /^\d{2}:\d{2}$/.test(data.time)
  );
}

/**
 * @param docs  every document in the appointments collection, as { id, data }.
 * @param purgeCancelled  also delete legacy docs that are already cancelled.
 *        They block nothing (queries filter on status), so this is off by
 *        default — the safe run touches only what actually matters.
 *
 * @returns {{ moves, conflicts, malformed, alreadyMigrated, cancelledLeftAlone }}
 *   moves      — write `payload` at `toId`, then delete `fromId`
 *   conflicts  — a different client already holds that slot; left untouched for
 *                a human to resolve, because either choice loses somebody's
 *                booking
 */
export function planMigration(docs = [], { purgeCancelled = false } = {}) {
  const moves = [];
  const conflicts = [];
  const malformed = [];
  const cancelledLeftAlone = [];

  const slotKeyed = new Map();
  const legacy = [];

  for (const doc of docs) {
    if (isSlotKeyed(doc.id)) slotKeyed.set(doc.id, doc.data);
    else legacy.push(doc);
  }

  // Deterministic order so two runs produce the same plan, and so the oldest
  // booking wins a contested slot rather than whichever document came back
  // first from the server.
  legacy.sort((a, b) => {
    const at = a.data?.createdAtMillis ?? Number.MAX_SAFE_INTEGER;
    const bt = b.data?.createdAtMillis ?? Number.MAX_SAFE_INTEGER;
    return at !== bt ? at - bt : a.id.localeCompare(b.id);
  });

  for (const doc of legacy) {
    const { id, data } = doc;

    if (!isWellFormed(data)) {
      malformed.push({ id, data });
      continue;
    }

    const cancelled = data.status === "cancelled";
    if (cancelled && !purgeCancelled) {
      // Holds no slot, so it cannot cause a double booking.
      cancelledLeftAlone.push({ id });
      continue;
    }
    if (cancelled) {
      moves.push({ fromId: id, toId: null, payload: null, action: "delete" });
      continue;
    }

    const toId = slotDocId(data.appointmentDate, data.time);
    const target = slotKeyed.get(toId);

    if (!target) {
      const payload = migratedPayload(data);
      slotKeyed.set(toId, payload);
      moves.push({ fromId: id, toId, payload, action: "move" });
      continue;
    }

    if (target.status !== "active" || target.userId === data.userId) {
      // Either the slot is free again, or it is the same client's booking
      // recorded twice. Claiming / de-duplicating loses nobody a session.
      const payload = migratedPayload(data);
      slotKeyed.set(toId, payload);
      moves.push({
        fromId: id,
        toId,
        payload,
        action: target.userId === data.userId ? "dedupe" : "reclaim",
      });
      continue;
    }

    conflicts.push({
      id,
      toId,
      keptUserId: target.userId,
      losingUserId: data.userId,
    });
  }

  return {
    moves,
    conflicts,
    malformed,
    cancelledLeftAlone,
    alreadyMigrated: docs.length - legacy.length,
  };
}
