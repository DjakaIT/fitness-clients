/**
 * Erasing a client's data — by the client deleting her own account (App
 * Store guideline 5.1.1(v), GDPR art. 17), or by the trainer acting on an
 * erasure request.
 *
 * Firestore-free, like the other services: the caller injects `ops`, which
 * is what lets the order and the failure handling be unit-tested.
 *
 *   ops.listOwned(collection)   → ids of her documents in that collection
 *   ops.listAppointments()      → her appointments, [{ id, appointmentDate, time, status }]
 *   ops.cancelAppointment(id)   → release one booking
 *   ops.remove(collection, id)  → delete one document (a missing one is fine)
 *   ops.removeProfile()         → delete users/<uid>
 */
import { canCancel } from "../utils/appointmentConfig.js";
import { PHOTO_ANGLE_KEYS } from "../utils/progress.js";

/** Collections whose documents belong to one client, found by `userId`. */
export const CLIENT_COLLECTIONS = [
  "exercise_logs",
  "weekly_review",
  "workouts",
];

/**
 * Check-ins and their photos. Photo ids are derived from the check-in ids
 * ("<uid>_<date>" → "<uid>_<date>_<angle>") rather than listed, because
 * listing photos would download every one of them just to learn its id. A
 * check-in and its photos are only ever written and deleted together.
 */
async function removeCheckIns(ops) {
  const checkIns = await ops.listOwned("measurements");
  const photos = checkIns.flatMap((id) =>
    PHOTO_ANGLE_KEYS.map((angle) => `${id}_${angle}`),
  );
  await Promise.all(photos.map((id) => ops.remove("progress_photos", id)));
  await Promise.all(checkIns.map((id) => ops.remove("measurements", id)));
  return checkIns.length;
}

async function removeAll(ops, collection) {
  const ids = await ops.listOwned(collection);
  await Promise.all(ids.map((id) => ops.remove(collection, id)));
  return ids.length;
}

/**
 * Her own deletion. Order matters:
 *
 *  1. Bookings she can still cancel are released, so the slots go back to
 *     other clients. A session less than 24h away cannot be released by her
 *     (the rules hold her to the same cutoff as always); it stays on the
 *     trainer's calendar under an id that no longer leads to anyone.
 *  2. Week lists are deleted where the rules allow (a past week, or one whose
 *     bookings are all released). One holding a session inside the cutoff
 *     stays, for the same reason — that is not a failure.
 *  3. Everything else she owns is deleted. Any failure here stops the run
 *     before the profile goes, so she can simply try again.
 *  4. The profile goes last: until then the rules still know who she is.
 */
export async function deleteOwnData({ ops, now = Date.now() }) {
  const kept = [];

  let appointments = [];
  try {
    appointments = await ops.listAppointments();
  } catch {
    // An online client may not read the calendar at all — she has nothing
    // on it. Anything she does hold, the trainer can still release.
    appointments = [];
  }
  const active = appointments.filter((a) => a.status === "active");
  const releasable = active.filter((a) =>
    canCancel(a.appointmentDate, a.time, now),
  );
  await Promise.all(releasable.map((a) => ops.cancelAppointment(a.id)));
  kept.push(
    ...active
      .filter((a) => !releasable.includes(a))
      .map((a) => `appointments/${a.id}`),
  );

  const weeks = await ops.listOwned("booking_weeks");
  const weekResults = await Promise.allSettled(
    weeks.map((id) => ops.remove("booking_weeks", id)),
  );
  weekResults.forEach((r, i) => {
    if (r.status === "rejected") kept.push(`booking_weeks/${weeks[i]}`);
  });

  await removeCheckIns(ops);
  for (const collection of CLIENT_COLLECTIONS) {
    await removeAll(ops, collection);
  }

  await ops.removeProfile();

  return { released: releasable.length, kept };
}

/**
 * The trainer erasing a former client: everything, bookings included (past
 * ones too — an erasure request covers her history). The trainer is not
 * bound by the cutoff, so nothing is left behind in Firestore. Her sign-in
 * account itself can only be removed in the Firebase console.
 */
export async function deleteClientDataAsTrainer({ ops }) {
  const appointments = await ops.listAppointments();
  await Promise.all(appointments.map((a) => ops.remove("appointments", a.id)));

  await removeAll(ops, "booking_weeks");
  await removeCheckIns(ops);
  for (const collection of CLIENT_COLLECTIONS) {
    await removeAll(ops, collection);
  }

  await ops.removeProfile();
  return { appointments: appointments.length };
}
