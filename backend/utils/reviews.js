/**
 * Weekly reviews ("dojmovi"): three star ratings plus a free-text reflection.
 *
 * firestore.rules accepts exactly what buildReviewDoc produces — whole stars
 * 1–5 in all three categories, a reflection of at most MAX_REFLECTION_LENGTH
 * characters, a name of at most MAX_NAME_LENGTH — so the two must change
 * together.
 */

export const RATING_KEYS = ["training", "eating", "communication"];
export const MAX_REFLECTION_LENGTH = 2000;
export const MAX_NAME_LENGTH = 100;

/** A star the client actually picked: a whole number from 1 to 5. */
export function isStar(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

/** Every category rated — an untouched category is not a rating. */
export function isCompleteRatings(ratings) {
  return RATING_KEYS.every((key) => isStar(ratings?.[key]));
}

/**
 * The document to store, or null when the ratings are incomplete. Only the
 * three known categories are copied, the reflection is trimmed and capped,
 * and a missing name (an Apple account can have none) is stored as null.
 */
export function buildReviewDoc({ userId, userName, ratings, reflection }) {
  if (!userId || !isCompleteRatings(ratings)) return null;
  const name =
    typeof userName === "string" && userName.trim()
      ? userName.trim().slice(0, MAX_NAME_LENGTH)
      : null;
  return {
    userId,
    userName: name,
    ratings: Object.fromEntries(RATING_KEYS.map((k) => [k, ratings[k]])),
    reflection: String(reflection ?? "")
      .trim()
      .slice(0, MAX_REFLECTION_LENGTH),
  };
}

const millis = (ts) =>
  typeof ts?.toMillis === "function"
    ? ts.toMillis()
    : ts instanceof Date
      ? ts.getTime()
      : typeof ts?.seconds === "number"
        ? ts.seconds * 1000
        : 0;

/**
 * Newest first. Firestore returns a plain `where` query in document-id order,
 * which for random ids is no order at all.
 */
export function sortReviewsNewestFirst(reviews) {
  return [...(reviews ?? [])].sort(
    (a, b) => millis(b.createdAt) - millis(a.createdAt),
  );
}
