import {
  appointmentSchema,
  busyBlockSchema,
  dateStringSchema,
  gridTimeSchema,
  measurementSchema,
  slotSchema,
  timeStringSchema,
  trainingTypeSchema,
  userStatusSchema,
  validate,
  weeklySlotSelectionSchema,
} from "../backend/utils/appointmentSchemas";

describe("dateStringSchema", () => {
  it.each(["2025-01-01", "2024-02-29", "2025-12-31"])("accepts %s", (v) => {
    expect(dateStringSchema.safeParse(v).success).toBe(true);
  });

  it.each([
    "2025-02-30",
    "2023-02-29",
    "2025-13-01",
    "2025-00-10",
    "2025-1-1",
    "25-01-01",
    "2025/01/01",
    "",
  ])("rejects %s", (v) => {
    expect(dateStringSchema.safeParse(v).success).toBe(false);
  });

  it("rejects non-strings without throwing", () => {
    expect(dateStringSchema.safeParse(null).success).toBe(false);
    expect(dateStringSchema.safeParse(20250101).success).toBe(false);
  });
});

describe("timeStringSchema / gridTimeSchema", () => {
  it.each(["00:00", "09:30", "23:59"])("accepts %s as a time", (v) => {
    expect(timeStringSchema.safeParse(v).success).toBe(true);
  });

  it.each(["24:00", "9:30", "09:60", "0930", "09:3"])("rejects %s", (v) => {
    expect(timeStringSchema.safeParse(v).success).toBe(false);
  });

  it("only accepts grid-aligned times for bookings", () => {
    expect(gridTimeSchema.safeParse("09:30").success).toBe(true);
    expect(gridTimeSchema.safeParse("09:00").success).toBe(true);
    expect(gridTimeSchema.safeParse("09:15").success).toBe(false);
    expect(gridTimeSchema.safeParse("09:01").success).toBe(false);
  });
});

describe("slotSchema", () => {
  it("accepts a well-formed slot", () => {
    expect(
      slotSchema.safeParse({ date: "2025-03-17", time: "09:00" }).success,
    ).toBe(true);
  });

  it("rejects a slot missing either half", () => {
    expect(slotSchema.safeParse({ date: "2025-03-17" }).success).toBe(false);
    expect(slotSchema.safeParse({ time: "09:00" }).success).toBe(false);
  });
});

describe("weeklySlotSelectionSchema", () => {
  const slot = (date, time) => ({ date, time });

  it("accepts 2 to 4 slots on distinct days", () => {
    for (const n of [2, 3, 4]) {
      const slots = ["2025-03-17", "2025-03-18", "2025-03-19", "2025-03-20"]
        .slice(0, n)
        .map((date) => slot(date, "09:00"));
      expect(weeklySlotSelectionSchema.safeParse(slots).success).toBe(true);
    }
  });

  it("rejects 1 slot and 5 slots", () => {
    expect(
      weeklySlotSelectionSchema.safeParse([slot("2025-03-17", "09:00")])
        .success,
    ).toBe(false);
    expect(
      weeklySlotSelectionSchema.safeParse(
        ["17", "18", "19", "20", "21"].map((d) =>
          slot(`2025-03-${d}`, "09:00"),
        ),
      ).success,
    ).toBe(false);
  });

  it("rejects two slots on the same day", () => {
    expect(
      weeklySlotSelectionSchema.safeParse([
        slot("2025-03-17", "09:00"),
        slot("2025-03-17", "11:00"),
      ]).success,
    ).toBe(false);
  });
});

describe("appointmentSchema", () => {
  it("accepts a stored appointment", () => {
    expect(
      appointmentSchema.safeParse({
        userId: "abc",
        appointmentDate: "2025-03-17",
        time: "09:00",
        status: "active",
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown status and an empty userId", () => {
    const base = {
      userId: "abc",
      appointmentDate: "2025-03-17",
      time: "09:00",
      status: "active",
    };
    expect(appointmentSchema.safeParse({ ...base, status: "x" }).success).toBe(
      false,
    );
    expect(appointmentSchema.safeParse({ ...base, userId: "" }).success).toBe(
      false,
    );
  });
});

describe("busyBlockSchema", () => {
  it("accepts a forward block", () => {
    expect(
      busyBlockSchema.safeParse({ start: "08:00", end: "12:00" }).success,
    ).toBe(true);
  });

  it("rejects an inverted or zero-length block", () => {
    expect(
      busyBlockSchema.safeParse({ start: "12:00", end: "08:00" }).success,
    ).toBe(false);
    expect(
      busyBlockSchema.safeParse({ start: "12:00", end: "12:00" }).success,
    ).toBe(false);
  });

  it("allows blocks off the booking grid — the trainer is not bound by it", () => {
    expect(
      busyBlockSchema.safeParse({ start: "08:15", end: "12:45" }).success,
    ).toBe(true);
  });
});

describe("measurementSchema", () => {
  const base = {
    userId: "abc",
    date: "2025-03-17",
    weight: "",
    waist: "",
    hips: "",
    chest: "",
    arms: "",
  };

  it("treats every field as optional-by-emptiness", () => {
    expect(measurementSchema.safeParse(base).success).toBe(true);
  });

  it.each(["62", "62.5", "62,5", "100"])("accepts %s", (v) => {
    expect(measurementSchema.safeParse({ ...base, weight: v }).success).toBe(
      true,
    );
  });

  it.each(["abc", "-5", "0", "62.555", "1e3"])("rejects %s", (v) => {
    expect(measurementSchema.safeParse({ ...base, weight: v }).success).toBe(
      false,
    );
  });

  it("trims surrounding whitespace before validating", () => {
    const r = measurementSchema.safeParse({ ...base, weight: "  62  " });
    expect(r.success).toBe(true);
    expect(r.data.weight).toBe("62");
  });
});

describe("enums", () => {
  it("pins the user lifecycle to three states", () => {
    for (const s of ["pending", "active", "rejected"]) {
      expect(userStatusSchema.safeParse(s).success).toBe(true);
    }
    expect(userStatusSchema.safeParse("admin").success).toBe(false);
    expect(userStatusSchema.safeParse("approved").success).toBe(false);
  });

  it("pins the training type to two options", () => {
    expect(trainingTypeSchema.safeParse("online").success).toBe(true);
    expect(trainingTypeSchema.safeParse("in_person").success).toBe(true);
    expect(trainingTypeSchema.safeParse("hybrid").success).toBe(false);
  });
});

describe("validate", () => {
  it("returns the parsed data on success", () => {
    const r = validate(slotSchema, { date: "2025-03-17", time: "09:00" });
    expect(r).toEqual({
      ok: true,
      data: { date: "2025-03-17", time: "09:00" },
    });
  });

  it("collapses a failure into one user-facing message", () => {
    const r = validate(slotSchema, { date: "nope", time: "09:00" });
    expect(r.ok).toBe(false);
    expect(typeof r.error).toBe("string");
    expect(r.error.length).toBeGreaterThan(0);
    expect(r.issues.length).toBeGreaterThan(0);
  });
});
