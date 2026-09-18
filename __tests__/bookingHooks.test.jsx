import { renderHook, act, waitFor } from "@testing-library/react-native";
import {
  NotOwnerError,
  SlotTakenError,
  TooLateToCancelError,
} from "../backend/services/appointmentService";

const mockRunTransaction = jest.fn();

jest.mock("firebase/firestore", () => ({
  doc: (_db, collection, id) => ({ path: `${collection}/${id}`, id }),
  runTransaction: (...args) => mockRunTransaction(...args),
  serverTimestamp: () => "SERVER_TS",
}));

const useSyncAppointments = require("../src/hooks/useSyncAppointments").default;
const useCancelAppointment =
  require("../src/hooks/useCancelAppointment").default;

beforeEach(() => jest.clearAllMocks());

describe("useSyncAppointments", () => {
  const slots = [
    { date: "2025-03-17", time: "09:00" },
    { date: "2025-03-18", time: "10:00" },
  ];

  it("commits the whole week in a single transaction", async () => {
    mockRunTransaction.mockResolvedValue({ booked: slots, cancelled: [] });
    const { result } = renderHook(() => useSyncAppointments());

    let outcome;
    await act(async () => {
      outcome = await result.current.syncWeek("me", slots, []);
    });

    expect(mockRunTransaction).toHaveBeenCalledTimes(1);
    expect(outcome.success).toBe(true);
    expect(outcome.booked).toEqual(slots);
  });

  it("refuses without a user rather than writing an ownerless booking", async () => {
    const { result } = renderHook(() => useSyncAppointments());

    let outcome;
    await act(async () => {
      outcome = await result.current.syncWeek(null, slots, []);
    });

    expect(mockRunTransaction).not.toHaveBeenCalled();
    expect(outcome.success).toBe(false);
  });

  it("names the contested slot when another client wins the race", async () => {
    mockRunTransaction.mockRejectedValue(
      new SlotTakenError({ date: "2025-03-17", time: "09:00" }),
    );
    const { result } = renderHook(() => useSyncAppointments());

    let outcome;
    await act(async () => {
      outcome = await result.current.syncWeek("me", slots, []);
    });

    expect(outcome.success).toBe(false);
    expect(outcome.code).toBe("slot-taken");
    expect(outcome.error).toContain("09:00");
    expect(outcome.error).toContain("Pon");
  });

  it("returns a generic, non-technical message for any other failure", async () => {
    mockRunTransaction.mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => useSyncAppointments());

    let outcome;
    await act(async () => {
      outcome = await result.current.syncWeek("me", slots, []);
    });

    expect(outcome.success).toBe(false);
    expect(outcome.error).not.toContain("network down");
  });

  it("clears the busy flag whether the write succeeds or fails", async () => {
    mockRunTransaction.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useSyncAppointments());

    await act(async () => {
      await result.current.syncWeek("me", slots, []);
    });

    await waitFor(() => expect(result.current.isSaving).toBe(false));
  });
});

describe("useCancelAppointment", () => {
  it("cancels through a transaction", async () => {
    mockRunTransaction.mockResolvedValue({ alreadyGone: false });
    const { result } = renderHook(() => useCancelAppointment());

    let outcome;
    await act(async () => {
      outcome = await result.current.cancelAppointment("2025-03-17_09:00", {
        userId: "me",
      });
    });

    expect(mockRunTransaction).toHaveBeenCalledTimes(1);
    expect(outcome).toEqual({ success: true });
  });

  it("does nothing without an appointment id", async () => {
    const { result } = renderHook(() => useCancelAppointment());

    let outcome;
    await act(async () => {
      outcome = await result.current.cancelAppointment(undefined, {
        userId: "me",
      });
    });

    expect(mockRunTransaction).not.toHaveBeenCalled();
    expect(outcome.success).toBe(false);
  });

  it("surfaces the cutoff as a distinct outcome so the UI can explain it", async () => {
    mockRunTransaction.mockRejectedValue(new TooLateToCancelError());
    const { result } = renderHook(() => useCancelAppointment());

    let outcome;
    await act(async () => {
      outcome = await result.current.cancelAppointment("id", { userId: "me" });
    });

    expect(outcome).toEqual({ success: false, tooLate: true });
  });

  it("surfaces an ownership violation separately from a generic failure", async () => {
    mockRunTransaction.mockRejectedValue(new NotOwnerError());
    const { result } = renderHook(() => useCancelAppointment());

    let outcome;
    await act(async () => {
      outcome = await result.current.cancelAppointment("id", { userId: "me" });
    });

    expect(outcome).toEqual({ success: false, notOwner: true });
  });

  it("reports a plain failure for anything else", async () => {
    mockRunTransaction.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useCancelAppointment());

    let outcome;
    await act(async () => {
      outcome = await result.current.cancelAppointment("id", { userId: "me" });
    });

    expect(outcome).toEqual({ success: false });
    await waitFor(() => expect(result.current.isCancelling).toBe(false));
  });
});
