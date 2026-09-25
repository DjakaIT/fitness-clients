import {
  formatWeight,
  summarizeSets,
  topSetTrend,
} from "../../backend/utils/exerciseLog";

/**
 * One line for the trainer: what the client lifted last time, and whether her
 * heaviest set went up or down since the session before.
 *
 *   "Zadnje: 20 · 22,5 · 22,5 kg  ↑ 2,5"
 */
export function describeProgress(log) {
  const last = summarizeSets(log?.lastSets);
  if (!last) return "";
  const trend = topSetTrend(log?.history);
  if (!trend || trend.delta === 0) return `Zadnje: ${last}`;
  const arrow = trend.delta > 0 ? "↑" : "↓";
  return `Zadnje: ${last}  ${arrow} ${formatWeight(Math.abs(trend.delta))}`;
}
