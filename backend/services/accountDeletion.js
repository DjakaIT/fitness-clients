/**
 * Erasing a client's data — by the client deleting her own account (App
 * Store guideline 5.1.1(v), GDPR art. 17), or by the trainer acting on an
 * erasure request.
 *
 * Firestore-free, like the other services: the caller injects `ops`, which
 * is what lets the order and the failure handling be unit-tested.
 *
 *   ops.listOwned(collection)   → ids of her documents in that collection
 *   ops.remove(collection, id)  → delete one document (a missing one is fine)
 *   ops.removeProfile()         → delete users/<uid>
 */
import { PHOTO_ANGLE_KEYS } from "../utils/progress.js";

/** Collections whose documents belong to one client, found by `userId`. */
export const CLIENT_COLLECTIONS = [
  "exercise_logs",
  "weekly_review",
  "workouts",
];

/**
 * Left over from in-person training, which the app no longer offers. Nothing
 * writes them any more; the trainer's erasure still clears a former
 * in-person client's old bookings so nothing tied to her id stays behind.
 */
export const LEGACY_BOOKING_COLLECTIONS = ["appointments", "booking_weeks"];

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
 * Her own deletion. Everything she owns goes first; any failure stops the
 * run before the profile goes, so she can simply try again. The profile goes
 * last: until then the rules still know who she is.
 */
export async function deleteOwnData({ ops }) {
  const checkIns = await removeCheckIns(ops);
  for (const collection of CLIENT_COLLECTIONS) {
    await removeAll(ops, collection);
  }
  await ops.removeProfile();
  return { checkIns };
}

/**
 * The trainer erasing a former client: everything, legacy bookings included
 * (an erasure request covers her history). Her sign-in account itself can
 * only be removed in the Firebase console.
 */
export async function deleteClientDataAsTrainer({ ops }) {
  let legacy = 0;
  for (const collection of LEGACY_BOOKING_COLLECTIONS) {
    legacy += await removeAll(ops, collection);
  }
  const checkIns = await removeCheckIns(ops);
  for (const collection of CLIENT_COLLECTIONS) {
    await removeAll(ops, collection);
  }

  await ops.removeProfile();
  return { checkIns, legacy };
}
