import {
  CLIENT_COLLECTIONS,
  LEGACY_BOOKING_COLLECTIONS,
  deleteClientDataAsTrainer,
  deleteOwnData,
} from "../backend/services/accountDeletion";

/** An in-memory stand-in for Firestore that records every call in order. */
function makeOps({ owned = {}, failRemove = () => false } = {}) {
  const calls = [];
  const ops = {
    calls,
    listOwned: jest.fn(async (name) => {
      calls.push(["list", name]);
      return owned[name] ?? [];
    }),
    remove: jest.fn(async (name, id) => {
      calls.push(["remove", name, id]);
      if (failRemove(name, id)) throw new Error(`denied ${name}/${id}`);
    }),
    removeProfile: jest.fn(async () => {
      calls.push(["removeProfile"]);
    }),
  };
  return ops;
}

describe("deleteOwnData", () => {
  it("deletes check-ins with all four photo ids, without listing the photos", async () => {
    const ops = makeOps({ owned: { measurements: ["u_2026-10-01"] } });
    const result = await deleteOwnData({ ops });

    const photoDeletes = ops.remove.mock.calls
      .filter(([name]) => name === "progress_photos")
      .map(([, id]) => id)
      .sort();
    expect(photoDeletes).toEqual([
      "u_2026-10-01_back",
      "u_2026-10-01_front",
      "u_2026-10-01_left",
      "u_2026-10-01_right",
    ]);
    // Listing photos would download every image just to learn its id.
    expect(ops.listOwned).not.toHaveBeenCalledWith("progress_photos");
    expect(ops.remove).toHaveBeenCalledWith("measurements", "u_2026-10-01");
    expect(result.checkIns).toBe(1);
  });

  it("deletes everything she owns in every client collection", async () => {
    const owned = Object.fromEntries(
      CLIENT_COLLECTIONS.map((name) => [name, [`${name}-1`, `${name}-2`]]),
    );
    const ops = makeOps({ owned });
    await deleteOwnData({ ops });

    for (const name of CLIENT_COLLECTIONS) {
      expect(ops.remove).toHaveBeenCalledWith(name, `${name}-1`);
      expect(ops.remove).toHaveBeenCalledWith(name, `${name}-2`);
    }
  });

  // In-person booking is gone; a client cannot touch those collections and
  // must not fail her own deletion trying to.
  it("leaves the legacy booking collections to the trainer", async () => {
    const ops = makeOps({ owned: { appointments: ["a"], booking_weeks: ["w"] } });
    await deleteOwnData({ ops });
    for (const name of LEGACY_BOOKING_COLLECTIONS) {
      expect(ops.listOwned).not.toHaveBeenCalledWith(name);
    }
  });

  // Until the profile is gone the rules still know who she is; and if any
  // step fails she must be able to run it again from a working account.
  it("removes the profile last", async () => {
    const ops = makeOps({ owned: { measurements: ["m"], weekly_review: ["r"] } });
    await deleteOwnData({ ops });
    expect(ops.calls.at(-1)).toEqual(["removeProfile"]);
  });

  it("keeps the profile when deleting her data fails, so she can retry", async () => {
    const ops = makeOps({
      owned: { weekly_review: ["r"] },
      failRemove: (name) => name === "weekly_review",
    });
    await expect(deleteOwnData({ ops })).rejects.toThrow("denied");
    expect(ops.removeProfile).not.toHaveBeenCalled();
  });
});

describe("deleteClientDataAsTrainer", () => {
  it("deletes legacy bookings, all her data, then the profile", async () => {
    const ops = makeOps({
      owned: {
        appointments: ["past", "soon"],
        booking_weeks: ["w"],
        measurements: ["m"],
        exercise_logs: ["l"],
        weekly_review: ["r"],
        workouts: ["p"],
      },
    });

    const result = await deleteClientDataAsTrainer({ ops });

    for (const [name, id] of [
      ["appointments", "past"],
      ["appointments", "soon"],
      ["booking_weeks", "w"],
      ["measurements", "m"],
      ["exercise_logs", "l"],
      ["weekly_review", "r"],
      ["workouts", "p"],
      ["progress_photos", "m_front"],
    ]) {
      expect(ops.remove).toHaveBeenCalledWith(name, id);
    }
    expect(ops.calls.at(-1)).toEqual(["removeProfile"]);
    expect(result).toEqual({ checkIns: 1, legacy: 3 });
  });
});
