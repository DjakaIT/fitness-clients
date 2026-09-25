import {
  HISTORY_CAP,
  MAX_SETS,
  buildLogUpdate,
  formatWeight,
  isEmptySession,
  logDocId,
  mergeSession,
  parseWeight,
  prefillSets,
  setCountFor,
  stepWeight,
  summarizeSets,
  topSetTrend,
} from "../backend/utils/exerciseLog";
import { saveTrainingLogsInTransaction } from "../backend/services/exerciseLogService";
import { describeProgress } from "../src/utils/weightProgress";

describe("parseWeight", () => {
  it.each([
    ["20", 20],
    ["22,5", 22.5],
    ["22.5", 22.5],
    [" 17,25 ", 17.25],
    ["500", 500],
    ["0,5", 0.5],
  ])("reads %p as %p", (input, expected) => {
    expect(parseWeight(input)).toBe(expected);
  });

  it.each(["", "   ", null, undefined])(
    "treats %p as a set not logged",
    (v) => {
      expect(parseWeight(v)).toBeNull();
    },
  );

  // Invalid input must be distinguishable from blank, so the UI can flag it
  // instead of silently saving nothing.
  it.each(["abc", "-5", "0", "501", "22,555", "1e3", "2 0", "22,5kg"])(
    "rejects %p",
    (v) => {
      expect(parseWeight(v)).toBeNaN();
    },
  );
});

describe("formatWeight", () => {
  it("uses the Croatian decimal comma and drops trailing zeros", () => {
    expect(formatWeight(22.5)).toBe("22,5");
    expect(formatWeight(20)).toBe("20");
    expect(formatWeight(17.25)).toBe("17,25");
  });

  it("renders nothing for a blank or invalid value", () => {
    expect(formatWeight(null)).toBe("");
    expect(formatWeight(undefined)).toBe("");
    expect(formatWeight(NaN)).toBe("");
  });

  it("round-trips with parseWeight", () => {
    for (const w of [2.5, 20, 22.5, 100, 137.5]) {
      expect(parseWeight(formatWeight(w))).toBe(w);
    }
  });
});

describe("stepWeight", () => {
  it("moves by 2,5 kg in either direction", () => {
    expect(stepWeight(20, 1)).toBe(22.5);
    expect(stepWeight(20, -1)).toBe(17.5);
  });

  it("snaps an off-grid weight onto the 2,5 grid", () => {
    expect(stepWeight(21, 1)).toBe(22.5);
  });

  it("never goes to zero or below", () => {
    expect(stepWeight(2.5, -1)).toBeNull();
    expect(stepWeight(1, -1)).toBeNull();
  });

  it("caps at the maximum", () => {
    expect(stepWeight(499, 1)).toBe(500);
  });
});

describe("setCountFor", () => {
  it.each([
    ["3", 3],
    [4, 4],
    ["3-4", 4],
    ["4 serije", 4],
    ["2 x", 2],
  ])("gives %p → %p inputs", (sets, expected) => {
    expect(setCountFor(sets)).toBe(expected);
  });

  it.each([undefined, null, "", "puno", "0"])(
    "falls back to 3 for %p",
    (sets) => {
      expect(setCountFor(sets)).toBe(3);
    },
  );

  it(`never asks for more than ${MAX_SETS} inputs`, () => {
    expect(setCountFor("50")).toBe(MAX_SETS);
  });
});

describe("prefillSets", () => {
  it("starts from what was lifted last time", () => {
    expect(prefillSets({ lastSets: [20, 22.5, 22.5] }, 3)).toEqual([
      20, 22.5, 22.5,
    ]);
  });

  // The trainer added a set since last time — the new set starts where the
  // last one ended rather than blank.
  it("fills an added set from the last logged value", () => {
    expect(prefillSets({ lastSets: [20, 22.5] }, 4)).toEqual([
      20, 22.5, 22.5, 22.5,
    ]);
  });

  it("drops extra values when the trainer cut a set", () => {
    expect(prefillSets({ lastSets: [20, 22.5, 25] }, 2)).toEqual([20, 22.5]);
  });

  it("is blank with no history", () => {
    expect(prefillSets(undefined, 3)).toEqual([null, null, null]);
    expect(prefillSets({ lastSets: "junk" }, 2)).toEqual([null, null]);
  });

  it("keeps a skipped set's position and fills it from the last value", () => {
    expect(prefillSets({ lastSets: [20, null, 25] }, 3)).toEqual([20, 25, 25]);
  });
});

describe("mergeSession", () => {
  const s = (weekStart, trainingNumber, sets = [20]) => ({
    weekStart,
    trainingNumber,
    date: weekStart,
    sets,
  });

  it("appends a new session", () => {
    expect(mergeSession([s("2026-09-14", 1)], s("2026-09-21", 1))).toHaveLength(
      2,
    );
  });

  // Correcting today's numbers must not make it look like two sessions.
  it("replaces a re-saved session instead of duplicating it", () => {
    const out = mergeSession(
      [s("2026-09-21", 1, [20])],
      s("2026-09-21", 1, [22.5]),
    );
    expect(out).toEqual([s("2026-09-21", 1, [22.5])]);
  });

  it("keeps chronological order even when a past week is logged late", () => {
    const out = mergeSession(
      [s("2026-09-07", 1), s("2026-09-21", 1)],
      s("2026-09-14", 2),
    );
    expect(out.map((h) => h.weekStart)).toEqual([
      "2026-09-07",
      "2026-09-14",
      "2026-09-21",
    ]);
  });

  it("orders two trainings in the same week by training number", () => {
    const out = mergeSession([s("2026-09-21", 2)], s("2026-09-21", 1));
    expect(out.map((h) => h.trainingNumber)).toEqual([1, 2]);
  });

  it(`keeps only the newest ${HISTORY_CAP}, so the document cannot grow forever`, () => {
    const many = Array.from({ length: 30 }, (_, i) =>
      s(
        `2026-${String(Math.floor(i / 4) + 1).padStart(2, "0")}-0${(i % 4) + 1}`,
        1,
      ),
    );
    const out = many.reduce((h, x) => mergeSession(h, x), []);
    expect(out).toHaveLength(HISTORY_CAP);
    expect(out.at(-1)).toEqual(many.at(-1));
  });

  it("tolerates a missing or corrupt history", () => {
    expect(mergeSession(undefined, s("2026-09-21", 1))).toHaveLength(1);
    expect(
      mergeSession([null, s("2026-09-14", 1)], s("2026-09-21", 1)),
    ).toHaveLength(2);
  });
});

describe("buildLogUpdate", () => {
  const entry = {
    userId: "u1",
    exerciseId: 35,
    exerciseName: "HIP THRUST šipka",
    weekStart: "2026-09-21",
    trainingNumber: 2,
    date: "2026-09-23",
    sets: [40, 45, NaN, 45],
  };

  it("records the session as both the latest sets and a history entry", () => {
    const out = buildLogUpdate(null, entry);
    expect(out).toMatchObject({
      userId: "u1",
      exerciseId: "35",
      lastSets: [40, 45, null, 45],
      lastWeekStart: "2026-09-21",
      lastTrainingNumber: 2,
    });
    expect(out.history).toHaveLength(1);
  });

  it("never stores NaN — Firestore would reject it", () => {
    expect(buildLogUpdate(null, entry).lastSets).not.toContain(NaN);
  });

  it("caps the number of sets and the name length", () => {
    const out = buildLogUpdate(null, {
      ...entry,
      sets: Array(40).fill(20),
      exerciseName: "x".repeat(500),
    });
    expect(out.lastSets).toHaveLength(MAX_SETS);
    expect(out.exerciseName).toHaveLength(120);
  });

  it("extends the existing history", () => {
    const first = buildLogUpdate(null, { ...entry, weekStart: "2026-09-14" });
    expect(buildLogUpdate(first, entry).history).toHaveLength(2);
  });
});

describe("summaries", () => {
  it("summarizes sets for display", () => {
    expect(summarizeSets([20, 22.5, null])).toBe("20 · 22,5 · – kg");
    expect(summarizeSets([null, null])).toBe("");
    expect(isEmptySession(undefined)).toBe(true);
  });

  it("measures the change in the heaviest set between the last two sessions", () => {
    expect(
      topSetTrend([
        { sets: [20, 22.5] },
        { sets: [null, null] },
        { sets: [22.5, 25] },
      ]),
    ).toEqual({ current: 25, previous: 22.5, delta: 2.5 });
  });

  it("has no trend with fewer than two logged sessions", () => {
    expect(topSetTrend([{ sets: [20] }])).toBeNull();
    expect(topSetTrend(undefined)).toBeNull();
  });

  it("describes progress for the trainer with a direction", () => {
    expect(
      describeProgress({
        lastSets: [22.5, 25],
        history: [{ sets: [20, 22.5] }, { sets: [22.5, 25] }],
      }),
    ).toBe("Zadnje: 22,5 · 25 kg  ↑ 2,5");
    expect(
      describeProgress({
        lastSets: [20],
        history: [{ sets: [22.5] }, { sets: [20] }],
      }),
    ).toBe("Zadnje: 20 kg  ↓ 2,5");
    expect(
      describeProgress({ lastSets: [20], history: [{ sets: [20] }] }),
    ).toBe("Zadnje: 20 kg");
    expect(describeProgress(undefined)).toBe("");
  });
});

describe("saveTrainingLogsInTransaction", () => {
  function fakeTx(initial = {}) {
    const store = { ...initial };
    const calls = [];
    return {
      store,
      calls,
      tx: {
        get: async (ref) => {
          calls.push(["get", ref.id]);
          return {
            exists: () => ref.id in store,
            data: () => store[ref.id],
          };
        },
        set: (ref, data) => {
          calls.push(["set", ref.id]);
          store[ref.id] = data;
        },
      },
      logRef: (id) => ({ id }),
    };
  }

  const base = {
    userId: "u1",
    weekStart: "2026-09-21",
    trainingNumber: 1,
    date: "2026-09-22",
    timestamp: () => "TS",
  };

  it("keys each log by client and exercise", async () => {
    const f = fakeTx();
    await saveTrainingLogsInTransaction({
      ...base,
      tx: f.tx,
      logRef: f.logRef,
      entries: [
        { exerciseId: "35", exerciseName: "Hip thrust", sets: [40, 45] },
      ],
    });
    expect(Object.keys(f.store)).toEqual([logDocId("u1", "35")]);
    expect(f.store["u1_35"].updatedAt).toBe("TS");
  });

  // An exercise left blank this time must keep last time's weights, or the
  // client would lose them the next time the trainer assigns it.
  it("leaves an exercise the client did not fill in untouched", async () => {
    const f = fakeTx({ u1_36: { lastSets: [30], history: [] } });
    const result = await saveTrainingLogsInTransaction({
      ...base,
      tx: f.tx,
      logRef: f.logRef,
      entries: [
        { exerciseId: "35", sets: [40] },
        { exerciseId: "36", sets: [null, null] },
      ],
    });
    expect(f.store.u1_36.lastSets).toEqual([30]);
    expect(result).toEqual({ saved: ["35"], skipped: 1 });
  });

  it("reads everything before writing anything, as Firestore requires", async () => {
    const f = fakeTx();
    await saveTrainingLogsInTransaction({
      ...base,
      tx: f.tx,
      logRef: f.logRef,
      entries: [
        { exerciseId: "1", sets: [10] },
        { exerciseId: "2", sets: [20] },
      ],
    });
    const ops = f.calls.map(([op]) => op);
    expect(ops.lastIndexOf("get")).toBeLessThan(ops.indexOf("set"));
  });

  it("builds on the stored history", async () => {
    const f = fakeTx({
      u1_35: {
        history: [{ weekStart: "2026-09-14", trainingNumber: 1, sets: [40] }],
      },
    });
    await saveTrainingLogsInTransaction({
      ...base,
      tx: f.tx,
      logRef: f.logRef,
      entries: [{ exerciseId: "35", sets: [42.5] }],
    });
    expect(f.store.u1_35.history).toHaveLength(2);
  });
});
