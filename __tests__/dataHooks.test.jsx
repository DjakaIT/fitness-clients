import { renderHook, act, waitFor } from "@testing-library/react-native";

const listeners = [];
const mockGetDocs = jest.fn();
const mockSetDoc = jest.fn().mockResolvedValue(undefined);
const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);

jest.mock("firebase/firestore", () => ({
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
}));

const useAppointments = require("../src/hooks/useAppointments").default;
const useClientMeasurements =
  require("../src/hooks/useClientMeasurements").default;
const useClientWorkouts = require("../src/hooks/useClientWorkouts").default;
const useSaveMeasurement = require("../src/hooks/useSaveMeasurement").default;
const useSaveWorkout = require("../src/hooks/useSaveWorkout").default;
const useUpdateUserStatus = require("../src/hooks/useUpdateUserStatus").default;
const useDeleteWorkout = require("../src/hooks/useDeleteWorkout").default;
const useTrainerSchedule = require("../src/hooks/useTrainerSchedule").default;
const useBookedSlots = require("../src/hooks/useBookedSlots").default;

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
});

describe("useAppointments", () => {
  it("sorts by date, then by time within a date", async () => {
    const { result } = renderHook(() => useAppointments("me"));

    await emit([
      { id: "c", appointmentDate: "2025-03-18", time: "09:00" },
      { id: "b", appointmentDate: "2025-03-17", time: "14:00" },
      { id: "a", appointmentDate: "2025-03-17", time: "09:00" },
    ]);

    expect(result.current.appointments.map((a) => a.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(result.current.loading).toBe(false);
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

describe("useSaveMeasurement", () => {
  it("keys the document by client and date so re-saving corrects the entry", async () => {
    const { result } = renderHook(() => useSaveMeasurement());

    await act(async () => {
      await result.current.saveMeasurement({
        userId: "u1",
        date: "2025-03-17",
        weight: " 62.5 ",
      });
    });

    expect(mockSetDoc.mock.calls[0][0].id).toBe("u1_2025-03-17");
    expect(mockSetDoc.mock.calls[0][1]).toMatchObject({ weight: "62.5" });
  });

  it("trims every field, so a stray space is not stored as a value", async () => {
    const { result } = renderHook(() => useSaveMeasurement());

    await act(async () => {
      await result.current.saveMeasurement({
        userId: "u1",
        date: "2025-03-17",
        waist: "  ",
        hips: " 90 ",
      });
    });

    const written = mockSetDoc.mock.calls[0][1];
    expect(written.waist).toBe("");
    expect(written.hips).toBe("90");
  });

  it("refuses without a client or a date", async () => {
    const { result } = renderHook(() => useSaveMeasurement());

    await act(async () => {
      expect(
        await result.current.saveMeasurement({ date: "2025-03-17" }),
      ).toEqual({ success: false });
      expect(await result.current.saveMeasurement({ userId: "u1" })).toEqual({
        success: false,
      });
    });

    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it("reports failure rather than throwing into the screen", async () => {
    mockSetDoc.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useSaveMeasurement());

    let outcome;
    await act(async () => {
      outcome = await result.current.saveMeasurement({
        userId: "u1",
        date: "2025-03-17",
      });
    });

    expect(outcome).toEqual({ success: false });
    await waitFor(() => expect(result.current.isSaving).toBe(false));
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
