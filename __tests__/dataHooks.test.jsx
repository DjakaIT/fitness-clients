import { renderHook, act, waitFor } from "@testing-library/react-native";

const listeners = [];
const mockGetDocs = jest.fn();
const mockSetDoc = jest.fn().mockResolvedValue(undefined);
const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
const mockAddDoc = jest.fn().mockResolvedValue({ id: "new" });

jest.mock("firebase/firestore", () => ({
  addDoc: (...args) => mockAddDoc(...args),
  collection: jest.fn((_db, name) => ({ name })),
  doc: jest.fn((_db, name, id) => ({ name, id, path: `${name}/${id}` })),
  query: jest.fn((...args) => args),
  where: jest.fn((field, op, value) => ({ field, op, value })),
  onSnapshot: jest.fn((_q, onNext, onError) => {
    listeners.push({ onNext, onError });
    return jest.fn();
  }),
  getDocs: (...args) => mockGetDocs(...args),
  setDoc: (...args) => mockSetDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  serverTimestamp: () => "SERVER_TS",
  writeBatch: jest.fn(),
}));

const useAppointments = require("../src/hooks/useAppointments").default;
const useClientMeasurements =
  require("../src/hooks/useClientMeasurements").default;
const useClientWorkouts = require("../src/hooks/useClientWorkouts").default;
const useSaveWorkout = require("../src/hooks/useSaveWorkout").default;
const useUpdateUserStatus = require("../src/hooks/useUpdateUserStatus").default;
const useDeleteWorkout = require("../src/hooks/useDeleteWorkout").default;
const useTrainerSchedule = require("../src/hooks/useTrainerSchedule").default;
const useBookedSlots = require("../src/hooks/useBookedSlots").default;
const useFetchUsers = require("../src/hooks/useFetchUsers").default;
const usePendingUsersModule = require("../src/hooks/usePendingUsers");
const usePendingUsers = usePendingUsersModule.default;
const { isAwaitingApproval } = usePendingUsersModule;
const { usePostReviews } = require("../src/hooks/usePostReviews");
const { useCheckInPhotos } = require("../src/hooks/useCheckIn");

const snap = (docs) => ({
  docs: docs.map((d) => ({ id: d.id, data: () => d })),
});

const emit = async (docs) => {
  await act(async () => {
    listeners.at(-1).onNext(snap(docs));
  });
};

const emitError = async (error) => {
  await act(async () => {
    listeners.at(-1).onError(error);
  });
};

beforeEach(() => {
  listeners.length = 0;
  jest.clearAllMocks();
  mockGetDocs.mockResolvedValue({ docs: [] });
  mockSetDoc.mockResolvedValue(undefined);
  mockUpdateDoc.mockResolvedValue(undefined);
  mockAddDoc.mockResolvedValue({ id: "new" });
});

describe("useAppointments", () => {
  it("sorts by date, then by time within a date", async () => {
    const { result } = renderHook(() => useAppointments("me"));

    await emit([
      { id: "c", appointmentDate: "2099-03-18", time: "09:00" },
      { id: "b", appointmentDate: "2099-03-17", time: "14:00" },
      { id: "a", appointmentDate: "2099-03-17", time: "09:00" },
    ]);

    expect(result.current.appointments.map((a) => a.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(result.current.loading).toBe(false);
  });

  // The query can only cut at today's date; a session that ended this
  // morning is not "upcoming" and its cancel button could only fail.
  it("drops a session that is already over", async () => {
    const { result } = renderHook(() => useAppointments("me"));
    const pad = (n) => String(n).padStart(2, "0");
    const ago = new Date(Date.now() - 3 * 3600000);
    const ahead = new Date(Date.now() + 26 * 3600000);
    const day = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    await emit([
      { id: "done", appointmentDate: day(ago), time: hhmm(ago) },
      { id: "next", appointmentDate: day(ahead), time: hhmm(ahead) },
    ]);

    expect(result.current.appointments.map((a) => a.id)).toEqual(["next"]);
  });

  it("keeps a session that is under way", async () => {
    const { isNotOver } = require("../src/hooks/useAppointments");
    const now = new Date(2026, 9, 6, 10, 30).getTime();
    expect(
      isNotOver({ appointmentDate: "2026-10-06", time: "10:00" }, now),
    ).toBe(true);
    expect(
      isNotOver({ appointmentDate: "2026-10-06", time: "09:00" }, now),
    ).toBe(false);
  });

  // Regression: an early return left `loading` true forever, so the screen
  // spun on a blank list.
  it("settles immediately with no user instead of spinning", () => {
    const { result } = renderHook(() => useAppointments(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.appointments).toEqual([]);
  });

  it("stops loading and surfaces the error when the listener fails", async () => {
    const { result } = renderHook(() => useAppointments("me"));
    await emitError(new Error("permission-denied"));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useBookedSlots", () => {
  it("groups active bookings by date", async () => {
    const { result } = renderHook(() =>
      useBookedSlots("2025-03-17", "2025-03-21"),
    );

    await emit([
      {
        id: "2025-03-17_09:00",
        appointmentDate: "2025-03-17",
        time: "09:00",
        userId: "a",
        status: "active",
      },
      {
        id: "2025-03-17_10:00",
        appointmentDate: "2025-03-17",
        time: "10:00",
        userId: "b",
        status: "active",
      },
      {
        id: "2025-03-18_09:00",
        appointmentDate: "2025-03-18",
        time: "09:00",
        userId: "a",
        status: "active",
      },
    ]);

    expect(Object.keys(result.current.bookedSlots)).toEqual([
      "2025-03-17",
      "2025-03-18",
    ]);
    expect(result.current.bookedSlots["2025-03-17"]).toHaveLength(2);
  });

  it("keeps the status on each slot so availability can be recomputed", async () => {
    const { result } = renderHook(() =>
      useBookedSlots("2025-03-17", "2025-03-21"),
    );
    await emit([
      {
        id: "x",
        appointmentDate: "2025-03-17",
        time: "09:00",
        userId: "a",
        status: "active",
      },
    ]);

    expect(result.current.bookedSlots["2025-03-17"][0]).toEqual({
      id: "x",
      time: "09:00",
      userId: "a",
      status: "active",
    });
  });

  it("settles without a week range", () => {
    const { result } = renderHook(() => useBookedSlots(null, null));
    expect(result.current.loading).toBe(false);
  });
});

describe("useClientMeasurements", () => {
  it("orders newest first", async () => {
    const { result } = renderHook(() => useClientMeasurements("me"));

    await emit([
      { id: "old", date: "2025-01-05" },
      { id: "new", date: "2025-03-01" },
      { id: "mid", date: "2025-02-01" },
    ]);

    expect(result.current.measurements.map((m) => m.id)).toEqual([
      "new",
      "mid",
      "old",
    ]);
  });

  it("settles with no user", () => {
    const { result } = renderHook(() => useClientMeasurements(undefined));
    expect(result.current.loading).toBe(false);
  });
});

describe("useClientWorkouts", () => {
  it("orders by training number", async () => {
    const { result } = renderHook(() => useClientWorkouts("me", "2025-03-17"));

    await emit([
      { id: "t3", trainingNumber: 3 },
      { id: "t1", trainingNumber: 1 },
      { id: "t2", trainingNumber: 2 },
    ]);

    expect(result.current.workouts.map((w) => w.id)).toEqual([
      "t1",
      "t2",
      "t3",
    ]);
  });

  // Without the reset, last week's program flashed on screen while the new
  // week's query was still in flight.
  it("clears the previous week before the new one arrives", async () => {
    const { result, rerender } = renderHook(
      ({ week }) => useClientWorkouts("me", week),
      { initialProps: { week: "2025-03-17" } },
    );

    await emit([{ id: "t1", trainingNumber: 1 }]);
    expect(result.current.workouts).toHaveLength(1);

    rerender({ week: "2025-03-24" });
    expect(result.current.workouts).toEqual([]);
    expect(result.current.loading).toBe(true);
  });
});

describe("useSaveWorkout", () => {
  it("keys the document by week, client and training number", async () => {
    const { result } = renderHook(() => useSaveWorkout());

    await act(async () => {
      await result.current.saveWorkout({
        userId: "u1",
        weekStart: "2025-03-17",
        trainingNumber: 2,
        sessionsPerWeek: 3,
        exercises: [],
      });
    });

    expect(mockSetDoc.mock.calls[0][0].id).toBe("2025-03-17_u1_2");
  });

  it("merges, so saving one training does not wipe the rest of the document", async () => {
    const { result } = renderHook(() => useSaveWorkout());

    await act(async () => {
      await result.current.saveWorkout({
        userId: "u1",
        weekStart: "2025-03-17",
        trainingNumber: 1,
        exercises: [],
      });
    });

    expect(mockSetDoc.mock.calls[0][2]).toEqual({ merge: true });
  });
});

describe("useSaveWorkout — saveWeek", () => {
  const batch = { set: jest.fn(), delete: jest.fn(), commit: jest.fn() };
  beforeEach(() => {
    batch.set.mockClear();
    batch.delete.mockClear();
    batch.commit.mockReset().mockResolvedValue(undefined);
    require("firebase/firestore").writeBatch.mockReturnValue(batch);
  });

  // Training by training could fail halfway and leave a mixed program.
  it("writes the whole week in one batch", async () => {
    const { result } = renderHook(() => useSaveWorkout());
    let outcome;
    await act(async () => {
      outcome = await result.current.saveWeek({
        userId: "u1",
        weekStart: "2026-10-05",
        sessionsPerWeek: 2,
        trainings: { 0: [{ exerciseId: "1" }], 1: [] },
      });
    });
    expect(outcome.success).toBe(true);
    expect(batch.set).toHaveBeenCalledTimes(2);
    expect(batch.set.mock.calls[0][0].id).toBe("2026-10-05_u1_1");
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });

  // Going from 4 trainings a week to 3 used to leave training 4 behind.
  it("removes trainings beyond a reduced count", async () => {
    const { result } = renderHook(() => useSaveWorkout());
    await act(async () => {
      await result.current.saveWeek({
        userId: "u1",
        weekStart: "2026-10-05",
        sessionsPerWeek: 3,
        trainings: {},
        existingNumbers: [1, 2, 3, 4],
      });
    });
    expect(batch.delete).toHaveBeenCalledTimes(1);
    expect(batch.delete.mock.calls[0][0].id).toBe("2026-10-05_u1_4");
  });

  it("reports a failed commit", async () => {
    batch.commit.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useSaveWorkout());
    let outcome;
    await act(async () => {
      outcome = await result.current.saveWeek({
        userId: "u1",
        weekStart: "2026-10-05",
        sessionsPerWeek: 2,
        trainings: {},
      });
    });
    expect(outcome.success).toBe(false);
  });
});

describe("useUpdateUserStatus", () => {
  it("writes only the status field", async () => {
    const { result } = renderHook(() => useUpdateUserStatus());

    await act(async () => {
      await result.current.updateStatus("u1", "active");
    });

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: "users", id: "u1" }),
      { status: "active" },
    );
  });

  it("reports failure instead of throwing", async () => {
    mockUpdateDoc.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useUpdateUserStatus());

    let outcome;
    await act(async () => {
      outcome = await result.current.updateStatus("u1", "active");
    });

    expect(outcome).toEqual({ success: false });
  });
});

describe("useDeleteWorkout", () => {
  it("deletes every training document for that week", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [{ id: "w1" }, { id: "w2" }, { id: "w3" }],
    });
    const { result } = renderHook(() => useDeleteWorkout());

    await act(async () => {
      await result.current.deleteWeek("u1", "2025-03-17");
    });

    expect(mockDeleteDoc).toHaveBeenCalledTimes(3);
  });

  it("refuses a call missing the client or the week", async () => {
    const { result } = renderHook(() => useDeleteWorkout());

    await act(async () => {
      expect(await result.current.deleteWeek(null, "2025-03-17")).toEqual({
        success: false,
      });
      expect(await result.current.deleteWeek("u1", null)).toEqual({
        success: false,
      });
    });

    expect(mockGetDocs).not.toHaveBeenCalled();
  });
});

describe("useFetchUsers", () => {
  // Regression: the list had no status filter, so pending and rejected
  // clients showed up as clients (pending ones twice, next to the requests).
  it("asks only for approved clients of the given type", () => {
    renderHook(() => useFetchUsers("online"));
    const { where } = require("firebase/firestore");
    expect(where).toHaveBeenCalledWith("role", "==", "user");
    expect(where).toHaveBeenCalledWith("status", "==", "active");
    expect(where).toHaveBeenCalledWith("trainingType", "==", "online");
  });

  // It used to be a one-off read: a client approved a moment ago did not
  // appear until the trainer left the screen and came back.
  it("updates live", async () => {
    const { result } = renderHook(() => useFetchUsers("online"));
    await emit([{ id: "a", displayName: "Ana" }]);
    expect(result.current.users.map((u) => u.id)).toEqual(["a"]);

    await emit([
      { id: "a", displayName: "Ana" },
      { id: "b", displayName: "Bea" },
    ]);
    expect(result.current.users.map((u) => u.id)).toEqual(["a", "b"]);
    expect(result.current.loading).toBe(false);
  });

  it("stops loading and reports a failed listener", async () => {
    const { result } = renderHook(() => useFetchUsers("online"));
    await emitError(new Error("denied"));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("usePendingUsers", () => {
  // Everyone the app holds in the waiting room must reach the trainer:
  // a status-equals-pending query missed a missing status and "inactive".
  it.each([
    [{ status: "pending" }, true],
    [{}, true],
    [{ status: "inactive" }, true],
    [{ status: "active" }, false],
    [{ status: "rejected" }, false],
  ])("isAwaitingApproval(%p) is %p", (user, expected) => {
    expect(isAwaitingApproval(user)).toBe(expected);
  });

  it("lists every client still waiting, whatever the legacy status", async () => {
    const { result } = renderHook(() => usePendingUsers());
    await emit([
      { id: "p", status: "pending" },
      { id: "legacy" },
      { id: "old", status: "inactive" },
      { id: "ok", status: "active" },
      { id: "no", status: "rejected" },
    ]);
    expect(result.current.pendingUsers.map((u) => u.id)).toEqual([
      "p",
      "legacy",
      "old",
    ]);
  });
});

describe("usePostReviews", () => {
  const rated = { training: 4, eating: 3, communication: 5 };

  it("refuses an incomplete rating without touching the database", async () => {
    const { result } = renderHook(() => usePostReviews());
    let outcome;
    await act(async () => {
      outcome = await result.current.submitReview(
        "u1",
        "Ana",
        { ...rated, eating: 0 },
        "",
      );
    });
    expect(outcome).toEqual({ success: false, incomplete: true });
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it("stores exactly the fields the rules accept, with the server's time", async () => {
    const { result } = renderHook(() => usePostReviews());
    await act(async () => {
      await result.current.submitReview("u1", null, rated, "  Super.  ");
    });
    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: "weekly_review" }),
      {
        userId: "u1",
        userName: null,
        ratings: rated,
        reflection: "Super.",
        createdAt: "SERVER_TS",
      },
    );
  });
});

describe("useCheckInPhotos", () => {
  const photoSnap = (docs) => ({ docs: docs.map((d) => ({ data: () => d })) });

  it("loads the photos of one check-in by angle", async () => {
    mockGetDocs.mockResolvedValue(
      photoSnap([{ angle: "front", data: "/9j/front" }]),
    );
    const { result } = renderHook(() => useCheckInPhotos("u1", "2026-10-01"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.photos).toEqual({ front: "/9j/front" });
  });

  // Regression: after switching dates, the previous date's photos were
  // reported (as loaded) until the new query landed — and a save in that
  // window would have written them under the new date.
  it("never reports the previous date's photos for a new date", async () => {
    mockGetDocs.mockResolvedValueOnce(
      photoSnap([{ angle: "front", data: "/9j/old" }]),
    );
    const { result, rerender } = renderHook(
      ({ date }) => useCheckInPhotos("u1", date),
      { initialProps: { date: "2026-10-01" } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    let resolveNext;
    mockGetDocs.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveNext = resolve;
      }),
    );
    rerender({ date: "2026-10-02" });

    expect(result.current.loading).toBe(true);
    expect(result.current.photos).toEqual({});

    await act(async () => {
      resolveNext(photoSnap([]));
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.photos).toEqual({});
  });

  it("reports a failed load instead of an empty set of photos", async () => {
    mockGetDocs.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useCheckInPhotos("u1", "2026-10-01"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useTrainerSchedule", () => {
  it("returns null until a schedule exists, rather than an empty object", async () => {
    const { result } = renderHook(() => useTrainerSchedule());

    await act(async () => {
      listeners.at(-1).onNext({ exists: () => false });
    });

    expect(result.current.schedule).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("passes the stored schedule through", async () => {
    const { result } = renderHook(() => useTrainerSchedule());
    const stored = { monday: [{ start: "08:00", end: "12:00" }] };

    await act(async () => {
      listeners.at(-1).onNext({ exists: () => true, data: () => stored });
    });

    expect(result.current.schedule).toEqual(stored);
  });

  it("stops loading when the listener errors", async () => {
    const { result } = renderHook(() => useTrainerSchedule());
    await emitError(new Error("denied"));
    expect(result.current.loading).toBe(false);
  });
});
