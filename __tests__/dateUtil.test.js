import formatDate from "../backend/utils/dateUtil";

/**
 * Relative timestamps in Croatian. The tricky part is the accusative singular:
 * "1 minutu", not "1 minuta" — and the same for 21, 31, 101, while 11 keeps
 * the plural.
 */
const minutesAgo = (n) => new Date(Date.now() - n * 60_000);

describe("formatDate", () => {
  it("returns an empty string for a missing timestamp", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate(0)).toBe("");
  });

  it("accepts a Firestore Timestamp via toDate()", () => {
    const date = minutesAgo(5);
    expect(formatDate({ toDate: () => date })).toBe(formatDate(date));
  });

  it("accepts a Date and a millisecond number alike", () => {
    const date = minutesAgo(5);
    expect(formatDate(date.getTime())).toBe(formatDate(date));
  });

  it("strips the approximation hedges date-fns adds", () => {
    const out = formatDate(minutesAgo(60 * 3));
    expect(out).not.toMatch(/\boko\b/);
    expect(out).not.toMatch(/manje od/);
  });

  // The date-fns hr locale already emits the genitive "1 minute" here, so the
  // rewrite below never fires for n = 1. Pinned as-is rather than changed —
  // "prije 1 minute" is the grammatical form after "prije".
  it("leaves the locale's genitive for exactly one minute", () => {
    expect(formatDate(minutesAgo(1))).toBe("prije 1 minute");
  });

  it.each([21, 31])("uses the accusative singular for %i minutes", (n) => {
    expect(formatDate(minutesAgo(n))).toContain("minutu");
  });

  // 11 ends in 1 but takes the plural — the classic exception the rewrite
  // has to avoid touching.
  it("keeps the plural for 11 minutes", () => {
    expect(formatDate(minutesAgo(11))).toContain("minuta");
    expect(formatDate(minutesAgo(11))).not.toContain("minutu");
  });

  it.each([5, 12, 20])("keeps the plural for %i minutes", (n) => {
    expect(formatDate(minutesAgo(n))).toContain("minuta");
  });

  // date-fns rounds to the nearest unit, so the minute wording stops well
  // before 60 — worth pinning so a locale bump cannot change it silently.
  it("rounds up to hours from 45 minutes", () => {
    expect(formatDate(minutesAgo(45))).toBe("prije 1 sat");
  });

  it("marks the value as being in the past", () => {
    expect(formatDate(minutesAgo(30))).toMatch(/prije/);
  });

  it("switches to larger units as the gap grows", () => {
    expect(formatDate(minutesAgo(60 * 5))).toMatch(/sat/);
    expect(formatDate(minutesAgo(60 * 24 * 3))).toMatch(/dan/);
  });

  // The rewrite uses a lookbehind, which older JS engines reject at parse time.
  it("parses and runs its lookbehind rule on this engine", () => {
    expect(() => formatDate(minutesAgo(21))).not.toThrow();
  });
});
