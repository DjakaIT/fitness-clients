import { renderHook, act } from "@testing-library/react-native";
import { LETTERBOX_CROP, heroFor, thumbnailFor } from "../src/utils/youtube";

const mockOnSnapshot = jest.fn();

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => ({})),
  orderBy: jest.fn(() => ({})),
  query: jest.fn(() => ({})),
  onSnapshot: (...args) => mockOnSnapshot(...args),
}));

const {
  default: useVideos,
  resetVideoStore,
} = require("../src/hooks/useVideos");

const snap = (docs) => ({
  docs: docs.map((d) => ({ id: d.id, data: () => d })),
});

let handlers;
beforeEach(() => {
  resetVideoStore();
  mockOnSnapshot.mockReset();
  handlers = [];
  mockOnSnapshot.mockImplementation((_q, onNext, onError) => {
    handlers.push({ onNext, onError });
    return jest.fn();
  });
});

describe("useVideos — shared catalogue", () => {
  it("opens one Firestore listener no matter how many screens read it", () => {
    renderHook(() => useVideos());
    renderHook(() => useVideos());
    renderHook(() => useVideos());
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
  });

  // Regression: every screen had its own listener, so going back into a
  // category started from empty and flashed a spinner.
  it("gives a newly mounted screen the data immediately, without loading", async () => {
    const first = renderHook(() => useVideos());
    await act(async () => {
      handlers[0].onNext(snap([{ id: "1", title: "A", category: "Noge" }]));
    });
    expect(first.result.current.loading).toBe(false);

    const second = renderHook(() => useVideos());
    expect(second.result.current.loading).toBe(false);
    expect(second.result.current.videos).toHaveLength(1);
  });

  it("keeps the listener alive after the last screen unmounts", () => {
    const { unmount } = renderHook(() => useVideos());
    unmount();
    renderHook(() => useVideos());
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
  });

  it("derives categories in order of first appearance", async () => {
    const { result } = renderHook(() => useVideos());
    await act(async () => {
      handlers[0].onNext(
        snap([
          { id: "1", category: "Trbušni mišići" },
          { id: "2", category: "Gluteus" },
          { id: "3", category: "Trbušni mišići" },
          { id: "4", category: "Noge" },
        ]),
      );
    });
    expect(result.current.categories).toEqual([
      "Trbušni mišići",
      "Gluteus",
      "Noge",
    ]);
  });

  it("indexes videos by id as a string, matching saved programs", async () => {
    const { result } = renderHook(() => useVideos());
    await act(async () => {
      handlers[0].onNext(snap([{ id: "12", title: "Plank" }]));
    });
    expect(result.current.byId.get("12").title).toBe("Plank");
  });

  it("restarts the listener after an error instead of waiting forever", async () => {
    renderHook(() => useVideos());
    await act(async () => {
      handlers[0].onError(new Error("permission-denied"));
    });
    renderHook(() => useVideos());
    expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
  });

  // A signed-out user must not keep a catalogue the next account reads.
  it("forgets everything on reset", async () => {
    const { result } = renderHook(() => useVideos());
    await act(async () => {
      handlers[0].onNext(snap([{ id: "1", category: "Noge" }]));
    });
    await act(async () => resetVideoStore());
    expect(result.current.videos).toEqual([]);
    expect(result.current.loading).toBe(true);
  });
});

describe("thumbnailFor", () => {
  it("uses the lighter sd image with the letterbox cropped away", () => {
    expect(thumbnailFor("abc")).toEqual({
      uri: "https://i.ytimg.com/vi/abc/sddefault.jpg",
      scale: LETTERBOX_CROP,
    });
  });

  it("scales exactly enough to push 4:3 letterbox bars out of a square", () => {
    // A 16:9 frame inside a 4:3 image fills 75% of its height.
    expect(LETTERBOX_CROP).toBeCloseTo(1 / 0.75);
  });

  it("switches to maxres when a category zooms in past what sd can hold", () => {
    expect(thumbnailFor("abc", 1.8)).toEqual({
      uri: "https://i.ytimg.com/vi/abc/maxresdefault.jpg",
      scale: 1.8,
    });
  });

  it("returns nothing without an id", () => {
    expect(thumbnailFor(undefined)).toBeNull();
    expect(heroFor("")).toBeNull();
  });

  it("uses the full-resolution image for the full-width hero", () => {
    expect(heroFor("abc")).toBe("https://i.ytimg.com/vi/abc/maxresdefault.jpg");
  });
});
