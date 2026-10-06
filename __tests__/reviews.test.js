import {
  MAX_NAME_LENGTH,
  MAX_REFLECTION_LENGTH,
  buildReviewDoc,
  isCompleteRatings,
  isStar,
  sortReviewsNewestFirst,
} from "../backend/utils/reviews";

const rated = { training: 4, eating: 3, communication: 5 };

describe("isStar", () => {
  it.each([1, 3, 5])("accepts %p", (v) => expect(isStar(v)).toBe(true));
  it.each([0, 6, 4.5, "5", null, undefined, NaN])("refuses %p", (v) =>
    expect(isStar(v)).toBe(false),
  );
});

describe("isCompleteRatings", () => {
  it("needs all three categories rated", () => {
    expect(isCompleteRatings(rated)).toBe(true);
    expect(isCompleteRatings({ ...rated, eating: 0 })).toBe(false);
    expect(isCompleteRatings({ training: 4, eating: 3 })).toBe(false);
    expect(isCompleteRatings(null)).toBe(false);
  });
});

describe("buildReviewDoc", () => {
  it("returns null until every category is rated", () => {
    expect(
      buildReviewDoc({ userId: "u", ratings: { ...rated, training: 0 } }),
    ).toBeNull();
  });

  it("returns null without a user", () => {
    expect(buildReviewDoc({ userId: null, ratings: rated })).toBeNull();
  });

  // firestore.rules accepts exactly these keys; anything else on the ratings
  // map would get the whole review refused.
  it("copies only the three known categories", () => {
    const doc = buildReviewDoc({
      userId: "u",
      ratings: { ...rated, mood: 5 },
      reflection: "ok",
    });
    expect(doc.ratings).toEqual(rated);
    expect(Object.keys(doc).sort()).toEqual(
      ["ratings", "reflection", "userId", "userName"].sort(),
    );
  });

  it("trims and caps the reflection at the rules' limit", () => {
    const doc = buildReviewDoc({
      userId: "u",
      ratings: rated,
      reflection: `  ${"x".repeat(MAX_REFLECTION_LENGTH + 50)}  `,
    });
    expect(doc.reflection).toHaveLength(MAX_REFLECTION_LENGTH);
  });

  it("stores a missing reflection as an empty string", () => {
    expect(buildReviewDoc({ userId: "u", ratings: rated }).reflection).toBe("");
  });

  // An Apple account can have no name at all.
  it("stores a missing or blank name as null, and caps a long one", () => {
    expect(
      buildReviewDoc({ userId: "u", ratings: rated, userName: null }).userName,
    ).toBeNull();
    expect(
      buildReviewDoc({ userId: "u", ratings: rated, userName: "   " }).userName,
    ).toBeNull();
    expect(
      buildReviewDoc({
        userId: "u",
        ratings: rated,
        userName: "A".repeat(MAX_NAME_LENGTH + 10),
      }).userName,
    ).toHaveLength(MAX_NAME_LENGTH);
  });
});

describe("sortReviewsNewestFirst", () => {
  const ts = (ms) => ({ toMillis: () => ms });

  it("orders by creation time, newest first", () => {
    const sorted = sortReviewsNewestFirst([
      { id: "old", createdAt: ts(1) },
      { id: "new", createdAt: ts(3) },
      { id: "mid", createdAt: ts(2) },
    ]);
    expect(sorted.map((r) => r.id)).toEqual(["new", "mid", "old"]);
  });

  it("copes with plain {seconds} values, Dates and a missing date", () => {
    const sorted = sortReviewsNewestFirst([
      { id: "none" },
      { id: "secs", createdAt: { seconds: 10 } },
      { id: "date", createdAt: new Date(20_000) },
    ]);
    expect(sorted.map((r) => r.id)).toEqual(["date", "secs", "none"]);
  });

  it("does not mutate its input", () => {
    const input = [{ createdAt: ts(1) }, { createdAt: ts(2) }];
    sortReviewsNewestFirst(input);
    expect(input[0].createdAt.toMillis()).toBe(1);
  });
});
