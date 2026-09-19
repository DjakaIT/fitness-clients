import {
  isSlotKeyed,
  planMigration,
} from "../backend/services/appointmentMigration";

const legacy = (id, over = {}) => ({
  id,
  data: {
    userId: "u1",
    appointmentDate: "2025-03-17",
    time: "09:00",
    status: "active",
    ...over,
  },
});

const keyed = (date, time, over = {}) => ({
  id: `${date}_${time}`,
  data: {
    userId: "u1",
    appointmentDate: date,
    time,
    status: "active",
    ...over,
  },
});

describe("isSlotKeyed", () => {
  it("recognises a slot-keyed id", () => {
    expect(isSlotKeyed("2025-03-17_09:00")).toBe(true);
  });

  it.each([
    "abc123XYZ",
    "2025-03-17",
    "2025-03-17_9:00",
    "2025-3-17_09:00",
    "2025-03-17_09:00:00",
    "",
    null,
    undefined,
    12345,
  ])("rejects %p", (id) => {
    expect(isSlotKeyed(id)).toBe(false);
  });
});

describe("planMigration", () => {
  it("does nothing to an already-migrated collection", () => {
    const plan = planMigration([
      keyed("2025-03-17", "09:00"),
      keyed("2025-03-18", "10:00"),
    ]);

    expect(plan.moves).toEqual([]);
    expect(plan.conflicts).toEqual([]);
    expect(plan.alreadyMigrated).toBe(2);
  });

  it("handles an empty collection", () => {
    expect(planMigration()).toMatchObject({ moves: [], conflicts: [] });
  });

  it("moves a legacy booking onto its slot id", () => {
    const plan = planMigration([legacy("randomId123")]);

    expect(plan.moves).toHaveLength(1);
    expect(plan.moves[0]).toMatchObject({
      fromId: "randomId123",
      toId: "2025-03-17_09:00",
      action: "move",
    });
  });

  // The whole point of the migration is that nobody loses a session.
  it("preserves the booking rather than cancelling it", () => {
    const plan = planMigration([legacy("randomId123", { userId: "clientA" })]);

    expect(plan.moves[0].payload).toMatchObject({
      userId: "clientA",
      appointmentDate: "2025-03-17",
      time: "09:00",
      status: "active",
    });
  });

  it("drops the name and photo that should never have been on the document", () => {
    const plan = planMigration([
      legacy("r1", { userName: "Ana Anić", userPhoto: "https://x/y.jpg" }),
    ]);

    expect(plan.moves[0].payload).not.toHaveProperty("userName");
    expect(plan.moves[0].payload).not.toHaveProperty("userPhoto");
  });

  it("carries createdAt over when it exists", () => {
    const plan = planMigration([legacy("r1", { createdAt: "TS" })]);
    expect(plan.moves[0].payload.createdAt).toBe("TS");
  });

  it("migrates several bookings across different slots", () => {
    const plan = planMigration([
      legacy("r1"),
      legacy("r2", { appointmentDate: "2025-03-18", time: "10:00" }),
      legacy("r3", { appointmentDate: "2025-03-19", time: "11:00" }),
    ]);

    expect(plan.moves.map((m) => m.toId)).toEqual([
      "2025-03-17_09:00",
      "2025-03-18_10:00",
      "2025-03-19_11:00",
    ]);
  });
});

describe("planMigration — collisions", () => {
  it("reports a slot two different clients hold, and changes nothing", () => {
    const plan = planMigration([
      keyed("2025-03-17", "09:00", { userId: "clientA" }),
      legacy("r1", { userId: "clientB" }),
    ]);

    expect(plan.moves).toEqual([]);
    expect(plan.conflicts).toEqual([
      {
        id: "r1",
        toId: "2025-03-17_09:00",
        keptUserId: "clientA",
        losingUserId: "clientB",
      },
    ]);
  });

  it("de-duplicates the same client booked twice for one slot", () => {
    const plan = planMigration([
      keyed("2025-03-17", "09:00", { userId: "clientA" }),
      legacy("r1", { userId: "clientA" }),
    ]);

    expect(plan.conflicts).toEqual([]);
    expect(plan.moves[0].action).toBe("dedupe");
  });

  it("lets a legacy booking claim a slot that was released", () => {
    const plan = planMigration([
      keyed("2025-03-17", "09:00", {
        userId: "clientA",
        status: "cancelled",
      }),
      legacy("r1", { userId: "clientB" }),
    ]);

    expect(plan.conflicts).toEqual([]);
    expect(plan.moves[0]).toMatchObject({
      action: "reclaim",
      toId: "2025-03-17_09:00",
    });
    expect(plan.moves[0].payload.userId).toBe("clientB");
  });

  // Two legacy documents for one slot: the slot can only hold one, so the
  // earlier booking keeps it and the later one is reported.
  it("gives a contested slot to the booking made first", () => {
    const plan = planMigration([
      legacy("later", { userId: "clientB", createdAtMillis: 2000 }),
      legacy("earlier", { userId: "clientA", createdAtMillis: 1000 }),
    ]);

    expect(plan.moves).toHaveLength(1);
    expect(plan.moves[0].fromId).toBe("earlier");
    expect(plan.conflicts).toEqual([
      expect.objectContaining({ id: "later", losingUserId: "clientB" }),
    ]);
  });

  it("produces the same plan regardless of the order docs came back in", () => {
    const docs = [
      legacy("a", { userId: "c1", createdAtMillis: 1000 }),
      legacy("b", { userId: "c2", createdAtMillis: 2000 }),
      legacy("c", {
        userId: "c3",
        appointmentDate: "2025-03-18",
        createdAtMillis: 3000,
      }),
    ];

    const forward = planMigration(docs);
    const reversed = planMigration([...docs].reverse());

    expect(reversed.moves).toEqual(forward.moves);
    expect(reversed.conflicts).toEqual(forward.conflicts);
  });
});

describe("planMigration — cancelled and malformed", () => {
  it("leaves cancelled legacy docs alone by default — they block no slot", () => {
    const plan = planMigration([legacy("r1", { status: "cancelled" })]);

    expect(plan.moves).toEqual([]);
    expect(plan.cancelledLeftAlone).toEqual([{ id: "r1" }]);
  });

  it("deletes them only when explicitly asked", () => {
    const plan = planMigration([legacy("r1", { status: "cancelled" })], {
      purgeCancelled: true,
    });

    expect(plan.moves).toEqual([
      { fromId: "r1", toId: null, payload: null, action: "delete" },
    ]);
  });

  it("does not let a cancelled legacy doc displace an active booking", () => {
    const plan = planMigration([
      keyed("2025-03-17", "09:00", { userId: "clientA" }),
      legacy("r1", { userId: "clientB", status: "cancelled" }),
    ]);

    expect(plan.moves).toEqual([]);
    expect(plan.conflicts).toEqual([]);
  });

  it.each([
    ["missing userId", { userId: undefined }],
    ["empty userId", { userId: "" }],
    ["missing date", { appointmentDate: undefined }],
    ["malformed date", { appointmentDate: "17-03-2025" }],
    ["missing time", { time: undefined }],
    ["malformed time", { time: "9:00" }],
  ])("skips a document with a %s instead of writing junk", (_label, over) => {
    const plan = planMigration([legacy("r1", over)]);

    expect(plan.moves).toEqual([]);
    expect(plan.malformed).toHaveLength(1);
  });

  it("keeps going past a malformed document", () => {
    const plan = planMigration([
      legacy("bad", { time: "nope" }),
      legacy("good", { appointmentDate: "2025-03-18" }),
    ]);

    expect(plan.malformed).toHaveLength(1);
    expect(plan.moves).toHaveLength(1);
    expect(plan.moves[0].fromId).toBe("good");
  });
});

describe("planMigration — idempotence", () => {
  // Re-running after a successful migration must be a no-op, so a half-finished
  // run can simply be repeated.
  it("is a no-op on the result of applying it", () => {
    const before = [
      legacy("r1", { userId: "clientA" }),
      legacy("r2", {
        userId: "clientB",
        appointmentDate: "2025-03-18",
        time: "10:00",
      }),
    ];

    const first = planMigration(before);
    const after = first.moves.map((m) => ({ id: m.toId, data: m.payload }));

    const second = planMigration(after);
    expect(second.moves).toEqual([]);
    expect(second.conflicts).toEqual([]);
    expect(second.alreadyMigrated).toBe(2);
  });

  it("finishes the job when only some documents were migrated", () => {
    const partiallyDone = [
      keyed("2025-03-17", "09:00", { userId: "clientA" }),
      legacy("r2", {
        userId: "clientB",
        appointmentDate: "2025-03-18",
        time: "10:00",
      }),
    ];

    const plan = planMigration(partiallyDone);
    expect(plan.moves).toHaveLength(1);
    expect(plan.moves[0].toId).toBe("2025-03-18_10:00");
  });
});
