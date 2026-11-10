export function getWaterProgress(totalMl, goalMl) {
  const goal = Number(goalMl);
  if (!Number.isFinite(goal) || goal <= 0) return null;
  const hasLogs = totalMl !== null && totalMl !== undefined && totalMl !== '';
  if (!hasLogs) return { goal, total: null, remaining: null, complete: false };
  const total = Number(totalMl);
  if (!Number.isFinite(total) || total < 0) return { goal, total: null, remaining: null, complete: false };
  return { goal, total, remaining: Math.max(0, goal - total), complete: total >= goal };
}
