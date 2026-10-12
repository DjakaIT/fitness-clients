/**
 * Keeping number fields numeric while the user types.
 *
 * `keyboardType="decimal-pad"` is a suggestion, not a guarantee: Android
 * keyboards can still offer "-" or a space, a paste can drop in anything, and
 * a Croatian phone types "," where code expects ".". These run on every
 * keystroke, so a field can only ever hold something that parses — the
 * letters never appear in the first place instead of being flagged later.
 */

/**
 * A decimal as the user types it: digits, at most one separator (shown as
 * the comma she typed, or a dot), capped integer and fraction lengths.
 *
 *   sanitizeDecimal("62,55kg")      → "62,5"   (decimals: 1)
 *   sanitizeDecimal("1234", {intDigits: 3}) → "123"
 */
export function sanitizeDecimal(text, { intDigits = 3, decimals = 2 } = {}) {
  const raw = String(text ?? "").replace(/[^\d.,]/g, "");
  const sepIndex = raw.search(/[.,]/);
  if (sepIndex === -1) return raw.slice(0, intDigits);

  const sep = raw[sepIndex];
  const intPart = raw.slice(0, sepIndex).slice(0, intDigits);
  if (decimals === 0) return intPart;
  const fraction = raw
    .slice(sepIndex + 1)
    .replace(/[.,]/g, "")
    .slice(0, decimals);
  // A separator typed first reads as "0," — what she meant.
  return `${intPart || "0"}${sep}${fraction}`;
}

/** Digits only, at most `maxDigits` of them. */
export function sanitizeInteger(text, maxDigits = 3) {
  return String(text ?? "")
    .replace(/\D/g, "")
    .slice(0, maxDigits);
}

/**
 * Repetitions as a trainer writes them: "12", "8-10", "10–12". Digits and a
 * single range dash; an en dash or a spaced dash is normalised to "-".
 */
export function sanitizeReps(text, maxLength = 7) {
  const cleaned = String(text ?? "")
    .replace(/[–—]/g, "-")
    .replace(/[^\d-]/g, "");
  const firstDash = cleaned.indexOf("-");
  const single =
    firstDash === -1
      ? cleaned
      : cleaned.slice(0, firstDash + 1) +
        cleaned.slice(firstDash + 1).replace(/-/g, "");
  return single.replace(/^-+/, "").slice(0, maxLength);
}

/**
 * Whether a sets field is "finished" and focus can move on by itself. Sets
 * run 1–10, so "1" might still become "10" — wait for it; 2–9 and 10 are
 * final.
 */
export function isCompleteSetCount(text) {
  return /^([2-9]|10)$/.test(String(text ?? ""));
}
