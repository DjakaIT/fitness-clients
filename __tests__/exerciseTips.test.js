import { EXERCISE_TIPS } from "../backend/data/exerciseTips";
import {
  MAX_TIPS,
  MAX_TIP_LENGTH,
  TIP_KINDS,
  normalizeTips,
} from "../src/utils/exerciseTips";

const entries = Object.entries(EXERCISE_TIPS);

describe("the tips catalogue", () => {
  it("covers the whole seeded catalogue, 1 to 78", () => {
    const ids = entries.map(([id]) => Number(id)).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 78 }, (_, i) => i + 1));
  });

  it.each(entries)("entry %s names the exercise it belongs to", (_id, e) => {
    // The seed script refuses to write when this does not match the stored
    // title, so an empty title would silently skip the entry.
    expect(typeof e.title).toBe("string");
    expect(e.title.trim().length).toBeGreaterThan(0);
  });

  it.each(entries)("entry %s has exactly one tip of each kind", (_id, e) => {
    expect(e.tips.map((t) => t.type).sort()).toEqual(
      Object.keys(TIP_KINDS).sort(),
    );
  });

  it.each(entries)("entry %s survives normalisation intact", (_id, e) => {
    // Anything normalizeTips would trim or drop would render differently from
    // what was written here.
    expect(normalizeTips(e.tips)).toHaveLength(e.tips.length);
    for (const t of e.tips) {
      expect(t.text.length).toBeLessThanOrEqual(MAX_TIP_LENGTH);
      expect(t.text).toBe(t.text.trim());
    }
  });

  it("keeps every tip short enough to read at a glance", () => {
    for (const [, e] of entries) {
      for (const t of e.tips) expect(t.text.length).toBeLessThanOrEqual(120);
    }
  });
});

describe("normalizeTips", () => {
  it("returns nothing for anything that is not an array", () => {
    for (const bad of [undefined, null, "tip", 3, {}]) {
      expect(normalizeTips(bad)).toEqual([]);
    }
  });

  // Tips are editable in the console, so malformed entries must not crash the
  // screen or render as empty rows.
  it("drops unknown kinds, blank text and non-objects", () => {
    expect(
      normalizeTips([
        null,
        "loose string",
        { type: "form", text: "   " },
        { type: "trivia", text: "Nije podržano" },
        { type: "form", text: 42 },
        { type: "mistake", text: "Pazi na koljena." },
      ]),
    ).toEqual([{ type: "mistake", text: "Pazi na koljena." }]);
  });

  it("orders tips form → mistake → alternative regardless of input order", () => {
    const out = normalizeTips([
      { type: "alternative", text: "C" },
      { type: "form", text: "A" },
      { type: "mistake", text: "B" },
    ]);
    expect(out.map((t) => t.type)).toEqual(["form", "mistake", "alternative"]);
  });

  it(`caps the list at ${MAX_TIPS}`, () => {
    const many = Array.from({ length: 6 }, (_, i) => ({
      type: "form",
      text: `Savjet ${i}`,
    }));
    expect(normalizeTips(many)).toHaveLength(MAX_TIPS);
  });

  it("trims whitespace and truncates runaway text", () => {
    const out = normalizeTips([
      { type: "form", text: `  ${"a".repeat(500)}  ` },
    ]);
    expect(out[0].text).toHaveLength(MAX_TIP_LENGTH);
    expect(out[0].text.startsWith("a")).toBe(true);
  });
});
