/**
 * Runtime validation for every shape that crosses the Firestore boundary.
 *
 * Firestore security rules are the enforcement layer; these schemas are the
 * layer that stops malformed data from ever being sent, and that gives the UI a
 * precise reason to show the user. Both layers exist on purpose — a rule can
 * reject a write, but it cannot tell the client *which* field was wrong.
 */
import { z } from "zod";
import { BOOKING_POLICY } from "../config/tenant";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
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

/** "HH:MM", 24-hour. */
export const timeStringSchema = z
  .string()
  .regex(TIME_RE, "Vrijeme mora biti u obliku HH:MM.");

/** "HH:MM" that also lands on the booking grid (e.g. :00 / :30). */
export const gridTimeSchema = timeStringSchema.refine(
  (value) => Number(value.slice(3)) % BOOKING_POLICY.slotGridMinutes === 0,
  `Vrijeme mora biti na ${BOOKING_POLICY.slotGridMinutes}-minutnoj mreži.`,
);

export const slotSchema = z.object({
  date: dateStringSchema,
  time: gridTimeSchema,
});

/** The set of slots a client submits for one week. */
export const weeklySlotSelectionSchema = z
  .array(slotSchema)
  .min(
    BOOKING_POLICY.minSlotsPerWeek,
    `Odaberi barem ${BOOKING_POLICY.minSlotsPerWeek} termina.`,
  )
  .max(
    BOOKING_POLICY.maxSlotsPerWeek,
    `Najviše ${BOOKING_POLICY.maxSlotsPerWeek} termina tjedno.`,
  )
  .refine(
    (slots) => new Set(slots.map((s) => s.date)).size === slots.length,
    "Možeš odabrati samo jedan termin po danu.",
  );

/** One appointment document as it is stored. */
export const appointmentSchema = z.object({
  userId: z.string().min(1),
  appointmentDate: dateStringSchema,
  time: gridTimeSchema,
  status: z.enum(["active", "cancelled"]),
});

/** One busy block on the trainer's calendar. */
export const busyBlockSchema = z
  .object({ start: timeStringSchema, end: timeStringSchema })
  .refine((b) => b.end > b.start, "Kraj mora biti nakon početka.");

export const dayScheduleSchema = z.array(busyBlockSchema);

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
export const trainingTypeSchema = z.enum(["online", "in_person"]);

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
