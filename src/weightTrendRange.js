function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function getWeightTrendRange(points, range = '90', today) {
  if (!validDate(today)) return [];
  const all = Array.isArray(points) ? points.filter(point => validDate(point?.date) && point.date <= today) : [];
  const days = Number(range);
  if (!Number.isFinite(days) || days <= 0) return all;
  const start = new Date(`${today}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - Math.floor(days) + 1);
  const startDate = start.toISOString().slice(0, 10);
  return all.filter(point => point.date >= startDate);
}
