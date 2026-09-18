import formatClientNumber from "../backend/utils/clientNumberUtil";

describe("formatClientNumber", () => {
  it("uses the singular-agreeing form for 1", () => {
    expect(formatClientNumber(1)).toBe("1 klijentica");
  });

  it.each([2, 3, 4, 22, 33, 104, 1002])("uses the paucal for %i", (n) => {
    expect(formatClientNumber(n)).toBe(`${n} klijentice`);
  });

  // The 12/13/14 exception is the classic trap in Slavic agreement.
  it.each([11, 12, 13, 14, 112, 113, 114, 1013])(
    "keeps the plural for the teens exception at %i",
    (n) => {
      expect(formatClientNumber(n)).toBe(`${n} klijentica`);
    },
  );

  it.each([0, 5, 6, 7, 8, 9, 10, 20, 25, 100])(
    "uses the plural for %i",
    (n) => {
      expect(formatClientNumber(n)).toBe(`${n} klijentica`);
    },
  );

  it("accepts a numeric string", () => {
    expect(formatClientNumber("3")).toBe("3 klijentice");
  });

  // Regression: this used to throw on undefined, taking the screen down with it.
  it.each([null, undefined, "", "abc", NaN, Infinity, {}])(
    "falls back to zero for %p instead of throwing",
    (input) => {
      expect(formatClientNumber(input)).toBe("0 klijentica");
    },
  );

  it("truncates a fractional count rather than rendering a decimal", () => {
    expect(formatClientNumber(2.7)).toBe("2 klijentice");
  });
});
