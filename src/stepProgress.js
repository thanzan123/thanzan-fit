export function getDailyStepProgress(steps, target) {
  if (target === '' || target === null || target === undefined) return null;
  const goal = Number(target);
  if (!Number.isInteger(goal) || goal < 1 || goal > 200000) return null;
  if (steps === '' || steps === null || steps === undefined) return { goal, steps: null, remaining: null, percent: null, complete: false };
  const count = Number(steps);
  if (!Number.isInteger(count) || count < 0 || count > 200000) return { goal, steps: null, remaining: null, percent: null, complete: false };
  return {
    goal,
    steps: count,
    remaining: Math.max(0, goal - count),
    percent: Math.min(100, count / goal * 100),
    complete: count >= goal,
  };
}
