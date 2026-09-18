import {
  NotOwnerError,
  SlotTakenError,
  TooLateToCancelError,
  cancelAppointmentInTransaction,
  syncWeekInTransaction,
} from "../backend/services/appointmentService";
import { slotDocId } from "../backend/utils/bookingRules";

const MONDAY = "2025-03-17";
const TUESDAY = "2025-03-18";
const WEDNESDAY = "2025-03-19";
const TS = () => "SERVER_TS";

/**
 * Minimal stand-in for a Firestore transaction backed by a plain object store.
 * It also records the call order, which is how we assert the "all reads before
 * any write" contract that Firestore enforces at runtime.
 */
function makeFakeTx(initialDocs = {}) {
  const store = { ...initialDocs };
  const calls = [];

  const snapshotOf = (id) => ({
    id,
    exists: () => Object.prototype.hasOwnProperty.call(store, id),
    data: () => store[id],
  });

  return {
    store,
    calls,
    tx: {
      get: async (ref) => {
        calls.push(["get", ref.id]);
        return snapshotOf(ref.id);
      },
      set: (ref, data) => {
        calls.push(["set", ref.id]);
        store[ref.id] = { ...data };
      },
      update: (ref, data) => {
        calls.push(["update", ref.id]);
        if (!Object.prototype.hasOwnProperty.call(store, ref.id)) {
          throw new Error(`update on missing doc ${ref.id}`);
        }
        store[ref.id] = { ...store[ref.id], ...data };
      },
    },
    slotRef: (id) => ({ id }),
  };
}

const activeDoc = (userId, date, time) => ({
  userId,
  appointmentDate: date,
  time,
  status: "active",
});

describe("syncWeekInTransaction", () => {
  it("creates a document per slot, keyed by the slot itself", async () => {
    const f = makeFakeTx();

    await syncWeekInTransaction({
      tx: f.tx,
      slotRef: f.slotRef,
      userId: "me",
      desired: [
        { date: MONDAY, time: "09:00" },
        { date: TUESDAY, time: "10:00" },
      ],
      existing: [],
      timestamp: TS,
    });

    expect(Object.keys(f.store).sort()).toEqual([
      "2025-03-17_09:00",
      "2025-03-18_10:00",
    ]);
    expect(f.store["2025-03-17_09:00"]).toMatchObject({
      userId: "me",
      appointmentDate: MONDAY,
      time: "09:00",
      status: "active",
    });
  });

  it("does every read before any write, as Firestore requires", async () => {
    const f = makeFakeTx({
      [slotDocId(MONDAY, "09:00")]: activeDoc("me", MONDAY, "09:00"),
    });

    await syncWeekInTransaction({
      tx: f.tx,
      slotRef: f.slotRef,
      userId: "me",
      desired: [{ date: TUESDAY, time: "10:00" }],
      existing: [{ date: MONDAY, time: "09:00" }],
      timestamp: TS,
    });

    const firstWrite = f.calls.findIndex(([op]) => op !== "get");
    const lastRead = f.calls.map(([op]) => op).lastIndexOf("get");
    expect(lastRead).toBeLessThan(firstWrite);
  });

  // The core concurrency guarantee.
  it("refuses a slot another client already holds", async () => {
    const f = makeFakeTx({
      [slotDocId(MONDAY, "09:00")]: activeDoc("other", MONDAY, "09:00"),
    });

    await expect(
      syncWeekInTransaction({
        tx: f.tx,
        slotRef: f.slotRef,
        userId: "me",
        desired: [{ date: MONDAY, time: "09:00" }],
        existing: [],
        timestamp: TS,
      }),
    ).rejects.toBeInstanceOf(SlotTakenError);

    expect(f.store[slotDocId(MONDAY, "09:00")].userId).toBe("other");
  });

  it("names the contested slot on the error so the UI can say which one", async () => {
    const f = makeFakeTx({
      [slotDocId(TUESDAY, "11:00")]: activeDoc("other", TUESDAY, "11:00"),
    });

    await expect(
      syncWeekInTransaction({
        tx: f.tx,
        slotRef: f.slotRef,
        userId: "me",
        desired: [{ date: TUESDAY, time: "11:00" }],
        existing: [],
        timestamp: TS,
      }),
    ).rejects.toMatchObject({
      code: "slot-taken",
      slot: { date: TUESDAY, time: "11:00" },
    });
  });

  // Without the verify-then-write split, a conflict on the last slot would
  // leave the earlier ones already written.
  it("writes nothing at all when any slot in the batch conflicts", async () => {
    const f = makeFakeTx({
      [slotDocId(WEDNESDAY, "12:00")]: activeDoc("other", WEDNESDAY, "12:00"),
    });

    await expect(
      syncWeekInTransaction({
        tx: f.tx,
        slotRef: f.slotRef,
        userId: "me",
        desired: [
          { date: MONDAY, time: "09:00" },
          { date: WEDNESDAY, time: "12:00" },
        ],
        existing: [],
        timestamp: TS,
      }),
    ).rejects.toBeInstanceOf(SlotTakenError);

    expect(f.store[slotDocId(MONDAY, "09:00")]).toBeUndefined();
    expect(f.calls.some(([op]) => op === "set" || op === "update")).toBe(false);
  });

  // Regression: the previous flow released every booking before re-creating
  // them, opening a window where an unchanged slot could be taken.
  it("never touches a slot the client is keeping", async () => {
    const keptId = slotDocId(MONDAY, "09:00");
    const f = makeFakeTx({
      [keptId]: activeDoc("me", MONDAY, "09:00"),
      [slotDocId(TUESDAY, "10:00")]: activeDoc("me", TUESDAY, "10:00"),
    });

    await syncWeekInTransaction({
      tx: f.tx,
      slotRef: f.slotRef,
      userId: "me",
      desired: [
        { date: MONDAY, time: "09:00" },
        { date: WEDNESDAY, time: "12:00" },
      ],
      existing: [
        { date: MONDAY, time: "09:00" },
        { date: TUESDAY, time: "10:00" },
      ],
      timestamp: TS,
    });

    expect(f.calls.filter(([, id]) => id === keptId)).toEqual([]);
    expect(f.store[keptId].status).toBe("active");
    expect(f.store[slotDocId(TUESDAY, "10:00")].status).toBe("cancelled");
    expect(f.store[slotDocId(WEDNESDAY, "12:00")].status).toBe("active");
  });

  it("lets a client re-claim a slot somebody else released", async () => {
    const id = slotDocId(MONDAY, "09:00");
    const f = makeFakeTx({
      [id]: { ...activeDoc("other", MONDAY, "09:00"), status: "cancelled" },
    });

    await syncWeekInTransaction({
      tx: f.tx,
      slotRef: f.slotRef,
      userId: "me",
      desired: [{ date: MONDAY, time: "09:00" }],
      existing: [],
      timestamp: TS,
    });

    expect(f.store[id]).toMatchObject({ userId: "me", status: "active" });
  });

  it("does not cancel a slot that has already been taken over by someone else", async () => {
    const id = slotDocId(MONDAY, "09:00");
    const f = makeFakeTx({ [id]: activeDoc("other", MONDAY, "09:00") });

    await syncWeekInTransaction({
      tx: f.tx,
      slotRef: f.slotRef,
      userId: "me",
      desired: [],
      // Stale client state: it thinks it still owns Monday 09:00.
      existing: [{ date: MONDAY, time: "09:00" }],
      timestamp: TS,
    });

    expect(f.store[id]).toMatchObject({ userId: "other", status: "active" });
  });

  it("is idempotent when the submitted week matches what is stored", async () => {
    const id = slotDocId(MONDAY, "09:00");
    const f = makeFakeTx({ [id]: activeDoc("me", MONDAY, "09:00") });

    const result = await syncWeekInTransaction({
      tx: f.tx,
      slotRef: f.slotRef,
      userId: "me",
      desired: [{ date: MONDAY, time: "09:00" }],
      existing: [{ date: MONDAY, time: "09:00" }],
      timestamp: TS,
    });

    expect(f.calls).toEqual([]);
    expect(result).toEqual({
      booked: [],
      cancelled: [],
      unchanged: [{ date: MONDAY, time: "09:00" }],
    });
  });

  it("re-writes a slot the client owns but had lost track of", async () => {
    const id = slotDocId(MONDAY, "09:00");
    const f = makeFakeTx({ [id]: activeDoc("me", MONDAY, "09:00") });

    await syncWeekInTransaction({
      tx: f.tx,
      slotRef: f.slotRef,
      userId: "me",
      desired: [{ date: MONDAY, time: "09:00" }],
      existing: [],
      timestamp: TS,
    });

    expect(f.store[id]).toMatchObject({ userId: "me", status: "active" });
  });

  it("handles an empty submission without writing anything", async () => {
    const f = makeFakeTx();
    const result = await syncWeekInTransaction({
      tx: f.tx,
      slotRef: f.slotRef,
      userId: "me",
      timestamp: TS,
    });
    expect(f.calls).toEqual([]);
    expect(result.booked).toEqual([]);
  });
});

describe("cancelAppointmentInTransaction", () => {
  const ref = { id: slotDocId(MONDAY, "10:00") };
  const slotStart = new Date(2025, 2, 17, 10, 0).getTime();
  const wellAhead = slotStart - 48 * 3600_000;
  const tooClose = slotStart - 2 * 3600_000;

  it("cancels the caller's own booking outside the cutoff", async () => {
    const f = makeFakeTx({ [ref.id]: activeDoc("me", MONDAY, "10:00") });

    await cancelAppointmentInTransaction({
      tx: f.tx,
      ref,
      userId: "me",
      now: wellAhead,
      timestamp: TS,
    });

    expect(f.store[ref.id].status).toBe("cancelled");
    expect(f.store[ref.id].cancelledAt).toBe("SERVER_TS");
  });

  // The screen's own check can be stale or skipped entirely; this is the one
  // that runs against the stored document.
  it("refuses inside the cutoff even if the client asked anyway", async () => {
    const f = makeFakeTx({ [ref.id]: activeDoc("me", MONDAY, "10:00") });

    await expect(
      cancelAppointmentInTransaction({
        tx: f.tx,
        ref,
        userId: "me",
        now: tooClose,
        timestamp: TS,
      }),
    ).rejects.toBeInstanceOf(TooLateToCancelError);

    expect(f.store[ref.id].status).toBe("active");
  });

  it("refuses to cancel somebody else's booking", async () => {
    const f = makeFakeTx({ [ref.id]: activeDoc("other", MONDAY, "10:00") });

    await expect(
      cancelAppointmentInTransaction({
        tx: f.tx,
        ref,
        userId: "me",
        now: wellAhead,
        timestamp: TS,
      }),
    ).rejects.toBeInstanceOf(NotOwnerError);

    expect(f.store[ref.id].status).toBe("active");
  });

  it("lets the trainer cancel any booking, at any time", async () => {
    const f = makeFakeTx({ [ref.id]: activeDoc("other", MONDAY, "10:00") });

    await cancelAppointmentInTransaction({
      tx: f.tx,
      ref,
      userId: "trainer",
      isAdmin: true,
      now: tooClose,
      timestamp: TS,
    });

    expect(f.store[ref.id].status).toBe("cancelled");
  });

  it("treats a missing or already-cancelled document as nothing to do", async () => {
    const empty = makeFakeTx();
    await expect(
      cancelAppointmentInTransaction({
        tx: empty.tx,
        ref,
        userId: "me",
        now: wellAhead,
        timestamp: TS,
      }),
    ).resolves.toEqual({ alreadyGone: true });

    const cancelled = makeFakeTx({
      [ref.id]: { ...activeDoc("me", MONDAY, "10:00"), status: "cancelled" },
    });
    await expect(
      cancelAppointmentInTransaction({
        tx: cancelled.tx,
        ref,
        userId: "me",
        now: wellAhead,
        timestamp: TS,
      }),
    ).resolves.toEqual({ alreadyGone: true });
    expect(cancelled.calls.some(([op]) => op === "update")).toBe(false);
  });
});
