/**
 * Single source of truth for everything that changes when this app is handed to
 * a different trainer. Nothing outside this file should hard-code a trainer's
 * name, e-mail, or program policy.
 *
 * Re-branding checklist:
 *   1. Edit BRAND + PROGRAM_POLICY below.
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
 * The online program. Every training is written by the trainer for one
 * client and one week; these are the shapes the builder offers.
 */
export const PROGRAM_POLICY = {
  /** How many trainings a week the trainer can plan. */
  sessionsPerWeekOptions: [2, 3, 4, 5],
  defaultSessionsPerWeek: 3,
};
