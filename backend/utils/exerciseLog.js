/**
 * Per-set working weights a client logs against the exercises her trainer
 * assigned.
 *
 * One document per client per exercise — `exercise_logs/{userId}_{exerciseId}`
 * — so the weight follows the exercise, not the week: whenever the trainer puts
 * the same exercise into a new training, the client sees what she lifted last
 * time and adjusts from there.
 *
 * Everything here is pure so the edge cases (comma decimals, a set count that
 * changed since last time, re-saving the same session) are unit-tested.
 */

export const MAX_SETS = 10;
export const MAX_WEIGHT_KG = 500;
export const HISTORY_CAP = 20;
export const DEFAULT_SETS = 3;
export const WEIGHT_STEP_KG = 2.5;

export function logDocId(userId, exerciseId) {
  return `${userId}_${exerciseId}`;
}

/**
 * "22,5" / "22.5" / " 20 " → 22.5 / 20. Blank → null (set not logged).
 * Anything else → NaN, so the UI can flag it instead of saving garbage.
 */
export function parseWeight(input) {
  if (input === null || input === undefined) return null;
  const text = String(input).trim().replace(",", ".");
  if (text === "") return null;
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(text)) return NaN;
  const value = Number(text);
  if (value <= 0 || value > MAX_WEIGHT_KG) return NaN;
  return value;
}

/** 22.5 → "22,5", 20 → "20". Blank for null. */
export function formatWeight(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return String(Math.round(value * 100) / 100).replace(".", ",");
}

/** Nudges a weight by ±step, never below zero, rounded to the step grid. */
export function stepWeight(value, direction, step = WEIGHT_STEP_KG) {
  const base = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  const next = Math.round((base + direction * step) / step) * step;
  if (next <= 0) return null;
  return Math.min(next, MAX_WEIGHT_KG);
}

/**
 * How many weight inputs an exercise gets. The trainer types sets as free
 * text ("3", "3-4", "4 serije"), so take the largest number in it — a range
 * should leave room to log every set — clamped to a sane range.
 */
export function setCountFor(sets) {
  const numbers = String(sets ?? "")
    .match(/\d+/g)
    ?.map(Number)
    .filter((n) => n > 0);
  if (!numbers?.length) return DEFAULT_SETS;
  return Math.min(Math.max(...numbers), MAX_SETS);
}

/**
 * Starting values for this session's inputs, from what was logged last time.
 * If the trainer added a set since, the extra set starts from the last one.
 */
export function prefillSets(log, count) {
  const last = Array.isArray(log?.lastSets) ? log.lastSets : [];
  const lastLogged = [...last].reverse().find((v) => typeof v === "number");
  return Array.from({ length: count }, (_, i) =>
    typeof last[i] === "number" ? last[i] : (lastLogged ?? null),
  );
}

/** True when nothing in the session was actually filled in. */
export function isEmptySession(sets) {
  return !Array.isArray(sets) || sets.every((v) => typeof v !== "number");
}

const sessionKey = (s) => `${s.weekStart}#${s.trainingNumber}`;

/**
 * Adds a session to the history. Saving the same training twice (a
 * correction) replaces the earlier entry instead of duplicating it. Kept in
 * chronological order and capped, newest last.
 */
export function mergeSession(history, session, cap = HISTORY_CAP) {
  const kept = (Array.isArray(history) ? history : []).filter(
    (h) => h && sessionKey(h) !== sessionKey(session),
  );
  kept.push(session);
  kept.sort((a, b) =>
    a.weekStart !== b.weekStart
      ? a.weekStart < b.weekStart
        ? -1
        : 1
      : a.trainingNumber - b.trainingNumber,
  );
  return kept.slice(-cap);
}

/** The document to write for one exercise after a session. */
export function buildLogUpdate(existing, entry) {
  const sets = entry.sets
    .slice(0, MAX_SETS)
    .map((v) => (typeof v === "number" && !Number.isNaN(v) ? v : null));
  const session = {
    weekStart: entry.weekStart,
    trainingNumber: entry.trainingNumber,
    date: entry.date,
    sets,
  };
  return {
    userId: entry.userId,
    exerciseId: String(entry.exerciseId),
    exerciseName: String(entry.exerciseName ?? "").slice(0, 120),
    lastSets: sets,
    lastWeekStart: entry.weekStart,
    lastTrainingNumber: entry.trainingNumber,
    history: mergeSession(existing?.history, session),
  };
}

/** "20 · 22,5 · 22,5 kg" for compact display; blanks shown as a dash. */
export function summarizeSets(sets) {
  if (isEmptySession(sets)) return "";
  return `${sets.map((v) => (typeof v === "number" ? formatWeight(v) : "–")).join(" · ")} kg`;
}

/**
 * Heaviest set of the latest session versus the one before — the number the
 * trainer glances at to see whether a client is progressing.
 */
export function topSetTrend(history) {
  const sessions = (Array.isArray(history) ? history : []).filter(
    (h) => !isEmptySession(h.sets),
  );
  if (sessions.length < 2) return null;
  const top = (h) => Math.max(...h.sets.filter((v) => typeof v === "number"));
  const current = top(sessions[sessions.length - 1]);
  const previous = top(sessions[sessions.length - 2]);
  return {
    current,
    previous,
    delta: Math.round((current - previous) * 100) / 100,
  };
}
