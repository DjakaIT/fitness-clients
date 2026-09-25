/**
 * Shape and presentation of the short coaching tips shown under a video.
 *
 * Tips live on the video document in Firestore (`tips: [{ type, text }]`) so
 * the trainer can edit them without a release. This module is the one place
 * that decides what a valid tip is, so a malformed entry typed in the console
 * is dropped instead of rendering as a broken row.
 */

export const TIP_KINDS = {
  form: { label: "Izvedba" },
  mistake: { label: "Pazi na" },
  alternative: { label: "Alternativa" },
};

export const MAX_TIPS = 3;
export const MAX_TIP_LENGTH = 220;

// Stable reading order regardless of how they were entered.
const ORDER = ["form", "mistake", "alternative"];

export function normalizeTips(tips) {
  if (!Array.isArray(tips)) return [];
  return tips
    .filter(
      (t) =>
        t &&
        typeof t === "object" &&
        Object.prototype.hasOwnProperty.call(TIP_KINDS, t.type) &&
        typeof t.text === "string" &&
        t.text.trim().length > 0,
    )
    .map((t) => ({
      type: t.type,
      text: t.text.trim().slice(0, MAX_TIP_LENGTH),
    }))
    .sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type))
    .slice(0, MAX_TIPS);
}
