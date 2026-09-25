/**
 * Transaction body for saving a training's weights. Firestore-free, like
 * appointmentService: the caller injects `tx` and `logRef(id)`.
 *
 * All reads happen before any write, and the whole training commits at once —
 * a half-saved session (three exercises logged, two lost) would show the
 * client stale "last time" values on exactly the exercises she just did.
 */
import {
  buildLogUpdate,
  isEmptySession,
  logDocId,
} from "../utils/exerciseLog.js";

export async function saveTrainingLogsInTransaction({
  tx,
  logRef,
  userId,
  weekStart,
  trainingNumber,
  date,
  entries = [],
  timestamp,
}) {
  // An exercise the client did not fill in keeps its previous weights rather
  // than being overwritten with a blank session.
  const filled = entries.filter((e) => !isEmptySession(e.sets));

  const reads = [];
  for (const entry of filled) {
    const ref = logRef(logDocId(userId, entry.exerciseId));
    reads.push({ entry, ref, snap: await tx.get(ref) });
  }

  for (const { entry, ref, snap } of reads) {
    const existing = snap.exists() ? snap.data() : null;
    const update = buildLogUpdate(existing, {
      ...entry,
      userId,
      weekStart,
      trainingNumber,
      date,
    });
    tx.set(ref, { ...update, updatedAt: timestamp() });
  }

  return {
    saved: filled.map((e) => String(e.exerciseId)),
    skipped: entries.length - filled.length,
  };
}
