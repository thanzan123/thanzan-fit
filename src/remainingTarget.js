export function formatRemainingTarget({ logged, target, hasLogs, unit }) {
  if (!hasLogs) return 'Log food to see what is left';
  const consumed = Number(logged);
  const goal = Number(target);
  if (!Number.isFinite(consumed) || consumed < 0) return 'Logged amount unavailable';
  if (!Number.isFinite(goal) || goal <= 0) return 'Target unavailable';
  const difference = goal - consumed;
  if (difference === 0) return 'At target';
  const amount = unit === 'kcal' ? Math.round(Math.abs(difference)) : Number(Math.abs(difference).toFixed(1));
  if (difference > 0) return `${amount} ${unit} left`;
  return `${amount} ${unit} over estimate`;
}
