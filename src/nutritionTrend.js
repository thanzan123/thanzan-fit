const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const nutrientKeys = new Set(['kcal', 'p', 'c', 'f', 'fiber', 'sugar']);

const isValidDate = value => {
  if (!datePattern.test(String(value || ''))) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
};
const hasRecordedSugar = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));

export function getNutritionTrend(entries, metric = 'kcal', endDate, rangeDays = 14) {
  const requestedDays = Number(rangeDays);
  const days = Math.max(1, Math.floor(Number.isFinite(requestedDays) ? requestedDays : 14));
  if (!isValidDate(endDate)) return { rangeDays: days, entries: [] };
  const end = Date.parse(`${endDate}T00:00:00Z`);
  const start = end - (days - 1) * 86400000;
  const byDate = new Map();
  (Array.isArray(entries) ? entries : []).forEach(item => {
    if (!isValidDate(item?.date)) return;
    const timestamp = Date.parse(`${item.date}T00:00:00Z`);
    if (timestamp < start || timestamp > end) return;
    const group = byDate.get(item.date) || [];
    group.push(item);
    byDate.set(item.date, group);
  });
  const key = nutrientKeys.has(metric) ? metric : 'kcal';
  const points = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).flatMap(([date, items]) => {
    if (key === 'sugar' && items.some(item => !hasRecordedSugar(item.sugar))) return [];
    const value = items.reduce((sum, item) => {
      const number = Number(item[key]);
      return sum + (Number.isFinite(number) ? number : 0);
    }, 0);
    return [{ date, value, count: items.length, dateOffset: (Date.parse(`${date}T00:00:00Z`) - start) / 86400000 }];
  });
  return { rangeDays: days, entries: points };
}
