import {
  CLIENT_COLLECTIONS,
  deleteClientDataAsTrainer,
  deleteOwnData,
} from "../backend/services/accountDeletion";

/** An in-memory stand-in for Firestore that records every call in order. */
function makeOps({
  owned = {},
  appointments = [],
  failRemove = () => false,
} = {}) {
  const calls = [];
  const ops = {
    calls,
    listOwned: jest.fn(async (name) => {
      calls.push(["list", name]);
      return owned[name] ?? [];
    }),
    listAppointments: jest.fn(async () => {
      calls.push(["listAppointments"]);
      return appointments;
    }),
    cancelAppointment: jest.fn(async (id) => {
      calls.push(["cancel", id]);
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

const NOW = new Date(2026, 9, 6, 12, 0).getTime(); // Tue 6 Oct 2026, 12:00
const appt = (id, appointmentDate, time, status = "active") => ({
  id,
  appointmentDate,
  time,
  status,
});

describe("deleteOwnData", () => {
  it("releases bookings that can still be cancelled, keeps the ones inside 24h", async () => {
    const ops = makeOps({
      appointments: [
        appt("soon", "2026-10-07", "09:00"), // 21h away
        appt("later", "2026-10-09", "09:00"),
        appt("gone", "2026-10-08", "09:00", "cancelled"),
      ],
    });

    const result = await deleteOwnData({ ops, now: NOW });

    expect(ops.cancelAppointment).toHaveBeenCalledTimes(1);
    expect(ops.cancelAppointment).toHaveBeenCalledWith("later");
    expect(result.released).toBe(1);
    expect(result.kept).toContain("appointments/soon");
  });

  it("deletes check-ins with all four photo ids, without listing the photos", async () => {
    const ops = makeOps({ owned: { measurements: ["u_2026-10-01"] } });
    await deleteOwnData({ ops, now: NOW });

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
  });

  it("deletes everything she owns in every client collection", async () => {
    const owned = Object.fromEntries(
      CLIENT_COLLECTIONS.map((name) => [name, [`${name}-1`, `${name}-2`]]),
    );
    const ops = makeOps({ owned });
    await deleteOwnData({ ops, now: NOW });

    for (const name of CLIENT_COLLECTIONS) {
      expect(ops.remove).toHaveBeenCalledWith(name, `${name}-1`);
      expect(ops.remove).toHaveBeenCalledWith(name, `${name}-2`);
    }
  });

  // Until the profile is gone the rules still know who she is; and if any
  // step fails she must be able to run it again from a working account.
  it("removes the profile last", async () => {
    const ops = makeOps({
      owned: { measurements: ["m"], weekly_review: ["r"] },
      appointments: [appt("later", "2026-10-09", "09:00")],
    });
    await deleteOwnData({ ops, now: NOW });
    expect(ops.calls.at(-1)).toEqual(["removeProfile"]);
  });

  it("keeps the profile when deleting her data fails, so she can retry", async () => {
    const ops = makeOps({
      owned: { weekly_review: ["r"] },
      failRemove: (name) => name === "weekly_review",
    });
    await expect(deleteOwnData({ ops, now: NOW })).rejects.toThrow("denied");
    expect(ops.removeProfile).not.toHaveBeenCalled();
  });

  // A week holding a session inside the cutoff cannot be deleted by her —
  // that is expected, not a failure.
  it("tolerates a week list the rules keep", async () => {
    const ops = makeOps({
      owned: { booking_weeks: ["u_2026-10-05", "u_2026-09-28"] },
      failRemove: (name, id) =>
        name === "booking_weeks" && id === "u_2026-10-05",
    });
    const result = await deleteOwnData({ ops, now: NOW });
    expect(result.kept).toEqual(["booking_weeks/u_2026-10-05"]);
    expect(ops.removeProfile).toHaveBeenCalled();
  });

  // An online client may not read the calendar at all.
  it("carries on when the calendar cannot be read", async () => {
    const ops = makeOps();
    ops.listAppointments.mockRejectedValue(new Error("permission-denied"));
    const result = await deleteOwnData({ ops, now: NOW });
    expect(result.released).toBe(0);
    expect(ops.removeProfile).toHaveBeenCalled();
  });
});

describe("deleteClientDataAsTrainer", () => {
  it("deletes every booking (past ones too), all her data, then the profile", async () => {
    const ops = makeOps({
      appointments: [
        appt("past", "2026-09-01", "09:00"),
        appt("soon", "2026-10-07", "09:00"),
      ],
      owned: {
        booking_weeks: ["w"],
        measurements: ["m"],
        exercise_logs: ["l"],
        weekly_review: ["r"],
        workouts: ["p"],
      },
    });

    const result = await deleteClientDataAsTrainer({ ops });

    expect(ops.remove).toHaveBeenCalledWith("appointments", "past");
    expect(ops.remove).toHaveBeenCalledWith("appointments", "soon");
    expect(ops.cancelAppointment).not.toHaveBeenCalled();
    for (const [name, id] of [
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
    expect(result.appointments).toBe(2);
  });
});
