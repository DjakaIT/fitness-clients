/**
 * Client check-ins: body measurements plus up to four progress photos.
 *
 * The client enters these herself — for an online client the trainer cannot
 * measure anyone — and the trainer reads them.
 *
 * Photos live in Firestore, not Storage (the project has no Storage bucket and
 * the owner chose not to enable billing). Each photo is its own document,
 * `progress_photos/{uid}_{date}_{angle}`, holding a re-encoded JPEG as base64.
 * The angle is part of the id, which is what caps a check-in at four photos:
 * there are exactly four ids a date can have.
 */

export const PHOTO_ANGLES = [
  {
    key: "front",
    label: "Sprijeda",
    hint: "Stani ravno, ruke uz tijelo, pogled u kameru.",
  },
  {
    key: "back",
    label: "Straga",
    hint: "Okreni se leđima, ruke opuštene uz tijelo.",
  },
  {
    key: "left",
    label: "Lijevi bok",
    hint: "Lijevi bok prema kameri, ruke opuštene.",
  },
  {
    key: "right",
    label: "Desni bok",
    hint: "Desni bok prema kameri, ruke opuštene.",
  },
];

export const PHOTO_ANGLE_KEYS = PHOTO_ANGLES.map((a) => a.key);

/** Shown above the slots every time, so every check-in is comparable. */
export const PHOTO_GUIDANCE =
  "Isto svjetlo i ista udaljenost svaki put, uska odjeća, mobitel u visini struka.";

/** Long edge after re-encoding — sharp on any phone, a few hundred KB. */
export const PHOTO_MAX_EDGE = 1440;
/** Firestore caps a document at 1 MiB; leave room for the other fields. */
export const MAX_PHOTO_BASE64_LENGTH = 700_000;
/** Qualities tried in turn until the photo fits under the cap. */
export const PHOTO_QUALITIES = [0.7, 0.55, 0.4];

export const MEASUREMENT_FIELDS = [
  { key: "weight", label: "Kilaža", unit: "kg" },
  { key: "waist", label: "Struk", unit: "cm" },
  { key: "hips", label: "Bokovi", unit: "cm" },
  { key: "chest", label: "Grudi", unit: "cm" },
  { key: "arms", label: "Ruke", unit: "cm" },
];

export function measurementDocId(userId, date) {
  return `${userId}_${date}`;
}

export function photoDocId(userId, date, angle) {
  return `${userId}_${date}_${angle}`;
}

export function isPhotoAngle(angle) {
  return PHOTO_ANGLE_KEYS.includes(angle);
}

/**
 * Target size for a resize that keeps the aspect ratio and never upscales.
 * Returns null when the image is already small enough.
 */
export function fitWithin(width, height, maxEdge = PHOTO_MAX_EDGE) {
  if (!(width > 0) || !(height > 0)) return null;
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return null;
  return width >= height
    ? { width: maxEdge, height: null }
    : { width: null, height: maxEdge };
}

/** A base64 JPEG always starts with the encoding of the FF D8 FF marker. */
export function isJpegBase64(data) {
  return typeof data === "string" && data.startsWith("/9j/");
}

export function fitsInDocument(data) {
  return typeof data === "string" && data.length <= MAX_PHOTO_BASE64_LENGTH;
}

/**
 * The measurement document for a check-in. `photoAngles` records which photos
 * exist, so lists can show "3 slike" without downloading any of them.
 */
export function buildMeasurementDoc({ userId, date, values, photoAngles }) {
  const doc = { userId, date };
  for (const f of MEASUREMENT_FIELDS) {
    doc[f.key] = String(values?.[f.key] ?? "")
      .trim()
      .replace(",", ".");
  }
  doc.photoAngles = PHOTO_ANGLE_KEYS.filter((k) =>
    (photoAngles ?? []).includes(k),
  );
  return doc;
}

export function hasAnyMeasurement(values) {
  return MEASUREMENT_FIELDS.some(
    (f) => String(values?.[f.key] ?? "").trim() !== "",
  );
}

/**
 * The photo changes a save has to make: slots filled with a new image are
 * written, slots that had an image and were cleared are deleted, untouched
 * slots are left alone so nothing is re-uploaded.
 */
export function diffPhotos(before = {}, after = {}) {
  const writes = [];
  const deletes = [];
  for (const angle of PHOTO_ANGLE_KEYS) {
    const had = before[angle];
    const has = after[angle];
    if (has && has !== had) writes.push(angle);
    else if (!has && had) deletes.push(angle);
  }
  return { writes, deletes };
}

/**
 * The earliest and latest check-ins that have a photo for the given angle —
 * what the trainer lays side by side.
 */
export function comparisonPair(entries, angle) {
  const withAngle = (entries ?? [])
    .filter(
      (e) => Array.isArray(e.photoAngles) && e.photoAngles.includes(angle),
    )
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  if (withAngle.length < 2) return null;
  return { first: withAngle[0], last: withAngle[withAngle.length - 1] };
}
