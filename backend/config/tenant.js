/**
 * Single source of truth for everything that changes when this app is handed to
 * a different trainer. Nothing outside this file should hard-code a trainer's
 * name, e-mail, or booking policy.
 *
 * Re-branding checklist:
 *   1. Edit BRAND + BOOKING_POLICY below.
 *   2. Set EXPO_PUBLIC_ADMIN_EMAIL in .env (comma-separated for co-trainers).
 *   3. Mirror that same list in `trainerEmails()` inside firestore.rules and
 *      redeploy the rules — the client list is convenience, the rules list is
 *      the one that is actually enforced.
 */

/** Trainer/admin accounts. Comma-separated so a studio can have co-trainers. */
export const ADMIN_EMAILS = (process.env.EXPO_PUBLIC_ADMIN_EMAIL ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email) {
  if (typeof email !== "string" || !email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export const BRAND = {
  appName: "MARTA FITNESS",
  trainerName: "Marta",
  /** Used in copy like "Čekamo potvrdu trenerice Marte." */
  trainerNameGenitive: "Marte",
  locale: "hr",
};

/**
 * Booking policy. All downstream slot math derives from these numbers, so
 * changing a session to 45 minutes or the day to 07:00–21:00 is a one-line edit.
 */
export const BOOKING_POLICY = {
  /** Length of one client session, in minutes. */
  sessionMinutes: 60,
  /** Granularity of the time grid clients and the trainer pick from. */
  slotGridMinutes: 30,
  /** Earliest session start / latest session end, inclusive of the full session. */
  dayStart: "08:00",
  dayEnd: "20:00",
  /** Window in which the trainer can mark herself busy (wider than the client day). */
  blockDayStart: "06:00",
  blockDayEnd: "22:00",
  /** How many sessions a client must book per week, and may book at most. */
  minSlotsPerWeek: 2,
  maxSlotsPerWeek: 4,
  /** A client may cancel until this many hours before the session starts. */
  cancelCutoffHours: 24,
  /** Weekday numbers (Date#getDay) the trainer works. 1 = Monday … 5 = Friday. */
  workDayNumbers: [1, 2, 3, 4, 5],
};
