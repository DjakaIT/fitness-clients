/**
 * The client's goal, asked once in the survey that follows her approval and
 * changeable later from her progress screen. It decides what "progress"
 * means for her: for weight loss the numbers going down are the win, for
 * gaining mass it is the numbers going up, and for toning the scale standing
 * still is exactly right while strength and shape change (see
 * progressInsights.js).
 *
 * Stored on users/{uid} as `goal` (one of GOAL_KEYS) and `targetWeight`
 * (a number in kg, or null). firestore.rules accepts exactly these values.
 */

export const GOALS = [
  {
    key: "lose",
    label: "Mršavljenje",
    description: "Manje kilograma i centimetara, više energije.",
  },
  {
    key: "gain",
    label: "Dobivanje mase",
    description: "Više snage i mišića, čvršće obline.",
  },
  {
    key: "tone",
    label: "Zatezanje i održavanje",
    description: "Kilaža ostaje, tijelo postaje čvršće i jače.",
  },
];

export const GOAL_KEYS = GOALS.map((g) => g.key);

export const MIN_TARGET_WEIGHT = 35;
export const MAX_TARGET_WEIGHT = 200;

export function isGoal(value) {
  return GOAL_KEYS.includes(value);
}

export function goalLabel(key) {
  return GOALS.find((g) => g.key === key)?.label ?? "";
}

/** Whether a target weight is worth asking for: toning keeps the weight. */
export function goalHasTargetWeight(key) {
  return key === "lose" || key === "gain";
}

/**
 * "62,5" / "62.5" / " 62 " → 62.5 / 62. Blank → null (no target).
 * Anything else, or a value outside the sane range → NaN.
 */
export function parseTargetWeight(input) {
  const text = String(input ?? "")
    .trim()
    .replace(",", ".");
  if (text === "") return null;
  if (!/^\d{2,3}(\.\d)?$/.test(text)) return NaN;
  const value = Number(text);
  if (value < MIN_TARGET_WEIGHT || value > MAX_TARGET_WEIGHT) return NaN;
  return value;
}

/**
 * Whether a target points the way the goal does. Someone losing weight whose
 * target is above where she started has typed it wrong (or picked the wrong
 * goal) — the progress maths would count every kilo lost as moving away.
 */
export function targetMatchesGoal(goal, startWeight, targetWeight) {
  if (targetWeight == null || !(startWeight > 0)) return true;
  if (goal === "lose") return targetWeight < startWeight;
  if (goal === "gain") return targetWeight > startWeight;
  return true;
}
