/**
 * The admin allowlist is the client-side half of the privilege check. It is not
 * a security boundary on its own — firestore.rules is — but a bug here would
 * either lock the trainer out or show a client the admin shell, so it gets the
 * same scrutiny.
 */
describe("isAdminEmail", () => {
  const load = (value) => {
    jest.resetModules();
    if (value === undefined) delete process.env.EXPO_PUBLIC_ADMIN_EMAIL;
    else process.env.EXPO_PUBLIC_ADMIN_EMAIL = value;
    return require("../backend/config/tenant");
  };

  afterEach(() => {
    process.env.EXPO_PUBLIC_ADMIN_EMAIL = "trainer@example.com";
    jest.resetModules();
  });

  it("matches the configured trainer", () => {
    const { isAdminEmail } = load("trainer@example.com");
    expect(isAdminEmail("trainer@example.com")).toBe(true);
  });

  it("ignores case and surrounding whitespace", () => {
    const { isAdminEmail } = load("Trainer@Example.com");
    expect(isAdminEmail("  TRAINER@example.COM  ")).toBe(true);
  });

  it("rejects everybody else", () => {
    const { isAdminEmail } = load("trainer@example.com");
    expect(isAdminEmail("client@example.com")).toBe(false);
    expect(isAdminEmail("trainer@example.com.evil.com")).toBe(false);
    expect(isAdminEmail("xtrainer@example.com")).toBe(false);
  });

  // A missing env var must fail closed: no admin, rather than everyone.
  it("grants nobody admin when the variable is unset or blank", () => {
    expect(load(undefined).isAdminEmail("anyone@example.com")).toBe(false);
    expect(load("").ADMIN_EMAILS).toEqual([]);
    expect(load("   ").isAdminEmail("")).toBe(false);
    expect(load(", ,").ADMIN_EMAILS).toEqual([]);
  });

  it("never treats an empty or non-string e-mail as a match", () => {
    const { isAdminEmail } = load("trainer@example.com");
    for (const bad of ["", null, undefined, 0, {}, []]) {
      expect(isAdminEmail(bad)).toBe(false);
    }
  });

  it("supports a comma-separated list for co-trainers", () => {
    const { isAdminEmail, ADMIN_EMAILS } = load("a@x.com, b@x.com");
    expect(ADMIN_EMAILS).toEqual(["a@x.com", "b@x.com"]);
    expect(isAdminEmail("b@x.com")).toBe(true);
    expect(isAdminEmail("c@x.com")).toBe(false);
  });
});

describe("BOOKING_POLICY", () => {
  const { BOOKING_POLICY } = require("../backend/config/tenant");

  it("keeps the session length a whole multiple of the grid", () => {
    expect(BOOKING_POLICY.sessionMinutes % BOOKING_POLICY.slotGridMinutes).toBe(
      0,
    );
  });

  it("leaves room for at least one session inside the day", () => {
    const [sh, sm] = BOOKING_POLICY.dayStart.split(":").map(Number);
    const [eh, em] = BOOKING_POLICY.dayEnd.split(":").map(Number);
    expect(eh * 60 + em - (sh * 60 + sm)).toBeGreaterThanOrEqual(
      BOOKING_POLICY.sessionMinutes,
    );
  });

  it("keeps the trainer's block window at least as wide as the client day", () => {
    expect(BOOKING_POLICY.blockDayStart <= BOOKING_POLICY.dayStart).toBe(true);
    expect(BOOKING_POLICY.blockDayEnd >= BOOKING_POLICY.dayEnd).toBe(true);
  });

  it("keeps the weekly minimum at or below the maximum", () => {
    expect(BOOKING_POLICY.minSlotsPerWeek).toBeLessThanOrEqual(
      BOOKING_POLICY.maxSlotsPerWeek,
    );
    expect(BOOKING_POLICY.maxSlotsPerWeek).toBeLessThanOrEqual(
      BOOKING_POLICY.workDayNumbers.length,
    );
  });
});
