import {
  DATE_STATUS,
  SLOT_STATUS,
  canClientCancel,
  diffSlotSelection,
  getDateStatus,
  getSlotStatus,
  parseSlotDocId,
  slotDocId,
  validateSelection,
} from "../backend/utils/bookingRules";

const MONDAY = "2025-03-17";
const TUESDAY = "2025-03-18";
const WEDNESDAY = "2025-03-19";
// Well before any of the dates above, so nothing counts as past.
const NOW = new Date(2025, 2, 12, 9, 0).getTime();

const freeSchedule = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
};

describe("slotDocId", () => {
  it("keys a document by the slot itself so two bookers collide on one key", () => {
    expect(slotDocId(MONDAY, "09:00")).toBe("2025-03-17_09:00");
  });

  it("round-trips through parseSlotDocId", () => {
    expect(parseSlotDocId(slotDocId(MONDAY, "09:00"))).toEqual({
      date: MONDAY,
      time: "09:00",
    });
  });

  it("returns null for anything that is not a slot id", () => {
    expect(parseSlotDocId("garbage")).toBeNull();
    expect(parseSlotDocId(null)).toBeNull();
    expect(parseSlotDocId(123)).toBeNull();
  });
});

describe("diffSlotSelection", () => {
  const a = { date: MONDAY, time: "09:00" };
  const b = { date: TUESDAY, time: "10:00" };
  const c = { date: WEDNESDAY, time: "11:00" };

  it("books everything when nothing exists yet", () => {
    const d = diffSlotSelection([], [a, b]);
    expect(d.toBook).toEqual([a, b]);
    expect(d.toCancel).toEqual([]);
    expect(d.unchanged).toEqual([]);
  });

  // This is the regression that mattered: the old flow cancelled every booking
  // and re-created all of them, so an untouched slot was briefly released.
  it("leaves an unchanged slot completely alone", () => {
    const d = diffSlotSelection([a, b], [a, c]);
    expect(d.unchanged).toEqual([a]);
    expect(d.toBook).toEqual([c]);
    expect(d.toCancel).toEqual([b]);
  });

  it("is a no-op when the selection did not change", () => {
    const d = diffSlotSelection([a, b], [b, a]);
    expect(d.toBook).toEqual([]);
    expect(d.toCancel).toEqual([]);
    expect(d.unchanged).toHaveLength(2);
  });

  it("treats a moved time on the same day as cancel + book", () => {
    const d = diffSlotSelection([a], [{ date: MONDAY, time: "10:00" }]);
    expect(d.toBook).toEqual([{ date: MONDAY, time: "10:00" }]);
    expect(d.toCancel).toEqual([a]);
  });

  it("cancels everything when the selection is emptied", () => {
    expect(diffSlotSelection([a, b], []).toCancel).toEqual([a, b]);
  });

  it("defaults both sides to empty", () => {
    expect(diffSlotSelection()).toEqual({
      toBook: [],
      toCancel: [],
      unchanged: [],
    });
  });
});

describe("getSlotStatus", () => {
  const base = { date: MONDAY, schedule: freeSchedule, userId: "me", now: NOW };

  it("is available on an empty day the trainer offers", () => {
    expect(getSlotStatus({ ...base, time: "09:00" })).toBe(
      SLOT_STATUS.AVAILABLE,
    );
  });

  it("marks the caller's own booking as theirs, not as taken", () => {
    expect(
      getSlotStatus({
        ...base,
        time: "09:00",
        bookedForDate: [{ time: "09:00", userId: "me", status: "active" }],
      }),
    ).toBe(SLOT_STATUS.MINE);
  });

  it("marks someone else's booking as taken", () => {
    expect(
      getSlotStatus({
        ...base,
        time: "09:00",
        bookedForDate: [{ time: "09:00", userId: "other", status: "active" }],
      }),
    ).toBe(SLOT_STATUS.TAKEN);
  });

  it("frees a slot again once it is cancelled", () => {
    expect(
      getSlotStatus({
        ...base,
        time: "09:00",
        bookedForDate: [
          { time: "09:00", userId: "other", status: "cancelled" },
        ],
      }),
    ).toBe(SLOT_STATUS.AVAILABLE);
  });

  it("reports trainer_busy when the block covers the session", () => {
    expect(
      getSlotStatus({
        ...base,
        time: "09:00",
        schedule: { monday: [{ start: "08:00", end: "12:00" }] },
      }),
    ).toBe(SLOT_STATUS.TRAINER_BUSY);
  });

  it("reports past for a slot that already started", () => {
    expect(
      getSlotStatus({
        ...base,
        time: "09:00",
        now: new Date(2025, 2, 17, 10, 0).getTime(),
      }),
    ).toBe(SLOT_STATUS.PAST);
  });

  it("prefers an existing booking over the past check, so a held slot still reads as yours", () => {
    expect(
      getSlotStatus({
        ...base,
        time: "09:00",
        bookedForDate: [{ time: "09:00", userId: "me", status: "active" }],
        now: new Date(2025, 2, 17, 10, 0).getTime(),
      }),
    ).toBe(SLOT_STATUS.MINE);
  });
});

describe("getDateStatus", () => {
  const base = { date: MONDAY, schedule: freeSchedule, userId: "me", now: NOW };

  it("is available when at least one slot is open", () => {
    expect(getDateStatus(base)).toBe(DATE_STATUS.AVAILABLE);
  });

  it("is added when the day is already in the selection", () => {
    expect(getDateStatus({ ...base, selectedDates: [MONDAY] })).toBe(
      DATE_STATUS.ADDED,
    );
  });

  it("is unavailable when the trainer offers nothing that day", () => {
    expect(
      getDateStatus({
        ...base,
        schedule: { monday: [{ start: "06:00", end: "22:00" }] },
      }),
    ).toBe(DATE_STATUS.UNAVAILABLE);
  });

  // "Sold out" and "the trainer never opened this day" need different copy,
  // so they must not collapse into one status.
  it("is full when the trainer offers slots but all are taken by others", () => {
    // Trainer offers only 08:00–10:00, i.e. the 08:00 / 08:30 / 09:00 starts.
    const bookedForDate = [
      { time: "08:00", userId: "other", status: "active" },
      { time: "08:30", userId: "other", status: "active" },
      { time: "09:00", userId: "other", status: "active" },
    ];
    expect(
      getDateStatus({
        ...base,
        schedule: {
          monday: [
            { start: "06:00", end: "08:00" },
            { start: "10:00", end: "22:00" },
          ],
        },
        bookedForDate,
      }),
    ).toBe(DATE_STATUS.FULL);
  });

  it("stays available when the only booking on a sold-out day is the caller's", () => {
    expect(
      getDateStatus({
        ...base,
        schedule: {
          monday: [
            { start: "06:00", end: "08:00" },
            { start: "09:00", end: "22:00" },
          ],
        },
        bookedForDate: [{ time: "08:00", userId: "me", status: "active" }],
      }),
    ).toBe(DATE_STATUS.AVAILABLE);
  });
});

describe("validateSelection", () => {
  const ctx = {
    bookableDates: [MONDAY, TUESDAY, WEDNESDAY],
    schedule: freeSchedule,
    bookedSlots: {},
    userId: "me",
    now: NOW,
  };
  const valid = [
    { date: MONDAY, time: "09:00" },
    { date: TUESDAY, time: "10:00" },
  ];

  it("accepts a well-formed week", () => {
    expect(validateSelection(valid, ctx).ok).toBe(true);
  });

  it("rejects fewer than the weekly minimum", () => {
    const r = validateSelection([valid[0]], ctx);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/barem 2/);
  });

  it("rejects more than the weekly maximum", () => {
    const five = [
      "2025-03-17",
      "2025-03-18",
      "2025-03-19",
      "2025-03-20",
      "2025-03-21",
    ].map((date, i) => ({
      date,
      time: ["08:00", "09:00", "10:00", "11:00", "12:00"][i],
    }));
    const r = validateSelection(five, { ...ctx, bookableDates: [] });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Najviše 4/);
  });

  it("rejects two sessions on the same day", () => {
    const r = validateSelection(
      [
        { date: MONDAY, time: "09:00" },
        { date: MONDAY, time: "11:00" },
      ],
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/jedan termin po danu/);
  });

  it("rejects a time that is off the grid", () => {
    const r = validateSelection(
      [{ date: MONDAY, time: "09:17" }, valid[1]],
      ctx,
    );
    expect(r.ok).toBe(false);
  });

  it("rejects a date outside the week being booked", () => {
    const r = validateSelection(
      [{ date: "2025-04-07", time: "09:00" }, valid[1]],
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/izvan tjedna/);
  });

  it("rejects a slot somebody else has taken since the screen loaded", () => {
    const r = validateSelection(valid, {
      ...ctx,
      bookedSlots: {
        [MONDAY]: [{ time: "09:00", userId: "other", status: "active" }],
      },
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/upravo rezerviran/);
  });

  it("rejects a slot the trainer has since blocked out", () => {
    const r = validateSelection(valid, {
      ...ctx,
      schedule: { ...freeSchedule, monday: [{ start: "08:00", end: "12:00" }] },
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/nije slobodna/);
  });

  it("rejects a calendar date that does not exist", () => {
    const r = validateSelection(
      [{ date: "2025-02-30", time: "09:00" }, valid[1]],
      { ...ctx, bookableDates: [] },
    );
    expect(r.ok).toBe(false);
  });

  it("rejects a non-array selection instead of throwing", () => {
    expect(validateSelection(null, ctx).ok).toBe(false);
    expect(validateSelection("nope", ctx).ok).toBe(false);
  });
});

describe("canClientCancel", () => {
  const appt = { appointmentDate: MONDAY, time: "10:00" };
  const slotStart = new Date(2025, 2, 17, 10, 0).getTime();

  it("allows a client outside the cutoff", () => {
    expect(canClientCancel(appt, { now: slotStart - 30 * 3600_000 })).toBe(
      true,
    );
  });

  it("refuses a client inside the cutoff", () => {
    expect(canClientCancel(appt, { now: slotStart - 3600_000 })).toBe(false);
  });

  it("lets the trainer override the cutoff", () => {
    expect(
      canClientCancel(appt, { isAdmin: true, now: slotStart - 3600_000 }),
    ).toBe(true);
  });

  it("refuses rather than throwing on a malformed appointment", () => {
    expect(canClientCancel({ appointmentDate: "x", time: "y" }, {})).toBe(
      false,
    );
  });
});
