/**
 * Runtime validation for every shape that crosses the Firestore boundary.
 *
 * Firestore security rules are the enforcement layer; these schemas are the
 * layer that stops malformed data from ever being sent, and that gives the UI a
 * precise reason to show the user. Both layers exist on purpose — a rule can
 * reject a write, but it cannot tell the client *which* field was wrong.
 */
import { z } from "zod";
import { GOAL_KEYS, MAX_TARGET_WEIGHT, MIN_TARGET_WEIGHT } from "./goals.js";

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/** "YYYY-MM-DD" that is also a real calendar date (rejects 2025-02-30). */
export const dateStringSchema = z
  .string()
  .regex(DATE_RE, "Datum mora biti u obliku YYYY-MM-DD.")
  .refine((value) => {
    const [y, m, d] = value.split("-").map(Number);
    const parsed = new Date(y, m - 1, d);
    return (
      parsed.getFullYear() === y &&
      parsed.getMonth() === m - 1 &&
      parsed.getDate() === d
    );
  }, "Datum ne postoji u kalendaru.");

/** Body measurements — numbers arrive as strings from TextInput. */
const measurementValueSchema = z
  .string()
  .trim()
  .refine(
    (v) =>
      v === "" ||
      (/^\d{1,3}([.,]\d{1,2})?$/.test(v) && Number(v.replace(",", ".")) > 0),
    "Unesi broj (npr. 62 ili 62.5).",
  );

export const measurementSchema = z.object({
  userId: z.string().min(1),
  date: dateStringSchema,
  weight: measurementValueSchema,
  waist: measurementValueSchema,
  hips: measurementValueSchema,
  chest: measurementValueSchema,
  arms: measurementValueSchema,
});

export const userStatusSchema = z.enum(["pending", "active", "rejected"]);

/** What the client answers in the goal survey after she is approved. */
export const goalSchema = z.object({
  goal: z.enum(GOAL_KEYS),
  targetWeight: z
    .number()
    .min(MIN_TARGET_WEIGHT, `Ciljana kilaža mora biti barem ${MIN_TARGET_WEIGHT} kg.`)
    .max(MAX_TARGET_WEIGHT, `Ciljana kilaža može biti najviše ${MAX_TARGET_WEIGHT} kg.`)
    .nullable(),
});

/**
 * Collapses a ZodError into `{ ok: false, error: "<first message>" }` so callers
 * get one user-facing string instead of having to walk the issue tree.
 */
export function validate(schema, value) {
  const result = schema.safeParse(value);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    error: result.error.issues[0]?.message ?? "Neispravan unos.",
    issues: result.error.issues,
  };
}
