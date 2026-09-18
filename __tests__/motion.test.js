import { PRESS_SCALE, SPRINGS, spring } from "../src/styles/motion";
import { type } from "../src/styles/clientTheme";

describe("spring()", () => {
  // Apple states springs as (damping ratio, response); Animated wants
  // (stiffness, damping, mass). The conversion is the whole point of the
  // helper, so it is pinned here.
  it("converts response into stiffness", () => {
    const omega = (2 * Math.PI) / 0.5;
    expect(spring(0.5).stiffness).toBe(Math.round(omega * omega));
  });

  it("converts the damping ratio into a damping coefficient", () => {
    const omega = (2 * Math.PI) / 0.5;
    expect(spring(0.5, 1).damping).toBeCloseTo(2 * omega, 1);
    expect(spring(0.5, 0.5).damping).toBeCloseTo(omega, 1);
  });

  it("scales both terms with mass", () => {
    const light = spring(0.4, 1, 1);
    const heavy = spring(0.4, 1, 2);
    expect(heavy.stiffness).toBeCloseTo(light.stiffness * 2, -1);
    expect(heavy.damping).toBeCloseTo(light.damping * 2, 1);
  });

  it("makes a shorter response stiffer", () => {
    expect(spring(0.2).stiffness).toBeGreaterThan(spring(0.6).stiffness);
  });

  it("is critically damped by default, so nothing overshoots unasked", () => {
    const { stiffness, damping, mass } = spring(0.35);
    // ratio = damping / (2 * sqrt(stiffness * mass))
    expect(damping / (2 * Math.sqrt(stiffness * mass))).toBeCloseTo(1, 1);
  });
});

describe("SPRINGS tokens", () => {
  const ratio = ({ stiffness, damping, mass }) =>
    damping / (2 * Math.sqrt(stiffness * mass));

  it("keeps the standard and press springs free of overshoot", () => {
    expect(ratio(SPRINGS.standard)).toBeCloseTo(1, 1);
    expect(ratio(SPRINGS.press)).toBeCloseTo(1, 1);
  });

  // Bounce is reserved for motion that follows a gesture or celebrates a
  // result; it would read as noise on ordinary UI.
  it("reserves bounce for the sheet and the success pop", () => {
    expect(ratio(SPRINGS.sheet)).toBeLessThan(1);
    expect(ratio(SPRINGS.pop)).toBeLessThan(1);
  });

  it("makes press feedback the fastest spring in the set", () => {
    expect(SPRINGS.press.stiffness).toBeGreaterThan(SPRINGS.standard.stiffness);
    expect(SPRINGS.press.stiffness).toBeGreaterThan(SPRINGS.sheet.stiffness);
  });

  it("keeps the press scale subtle enough not to shift the layout", () => {
    expect(PRESS_SCALE).toBeGreaterThan(0.9);
    expect(PRESS_SCALE).toBeLessThan(1);
  });
});

describe("type scale", () => {
  const order = [
    "display",
    "title",
    "heading",
    "body",
    "callout",
    "caption",
    "overline",
  ];

  it("descends monotonically in size", () => {
    for (let i = 1; i < order.length; i += 1) {
      expect(type[order[i]].fontSize).toBeLessThanOrEqual(
        type[order[i - 1]].fontSize,
      );
    }
  });

  // Large text reads too loose at default tracking; small text reads too tight.
  it("tightens tracking as text grows and opens it as text shrinks", () => {
    expect(type.display.letterSpacing).toBeLessThan(0);
    expect(type.title.letterSpacing).toBeLessThan(0);
    expect(type.body.letterSpacing).toBe(0);
    expect(type.overline.letterSpacing).toBeGreaterThan(0);
  });

  it("gives body copy looser leading than display text, proportionally", () => {
    const leading = (t) => t.lineHeight / t.fontSize;
    expect(leading(type.body)).toBeGreaterThan(leading(type.display));
  });

  it("never sets a line height below its font size", () => {
    for (const key of order) {
      expect(type[key].lineHeight).toBeGreaterThanOrEqual(type[key].fontSize);
    }
  });
});
