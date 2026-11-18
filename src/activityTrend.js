const metricConfig = {
  steps: { label: 'Steps', unit: 'steps', max: 200000, integer: true },
  distanceKm: { label: 'Walking distance', unit: 'km', max: 300 },
  activeMinutes: { label: 'Active minutes', unit: 'min', max: 1440, integer: true },
};

function dateStamp(value) {
  const text = String(value || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const stamp = Date.parse(`${text}T00:00:00Z`);
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === text ? stamp : null;
}

export function getActivityMetricTrend(entries, metric = 'steps', limit = 14, endDate = null) {
  const config = metricConfig[metric] || metricConfig.steps;
  const rangeDays = Math.max(1, Math.floor(Number(limit) || 14));
  const endStamp = dateStamp(endDate);
  const startStamp = endStamp === null ? null : endStamp - (rangeDays - 1) * 86400000;
  const byDate = new Map();
  (Array.isArray(entries) ? entries : [])
    .filter(item => dateStamp(item.date) !== null)
    .filter(item => startStamp === null || (dateStamp(item.date) >= startStamp && dateStamp(item.date) <= endStamp))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0))
    .forEach(item => byDate.set(item.date, item));
  const recent = [...byDate.values()].slice(endStamp === null ? -rangeDays : 0);
  const points = recent.filter(item => {
    const value = item[metric];
    return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= config.max && (!config.integer || Number.isInteger(Number(value)));
  }).map((item, index) => ({
    ...item,
    value: Number(item[metric]),
    ...(startStamp === null ? {} : { dateOffset: (dateStamp(item.date) - startStamp) / 86400000 }),
  }));
  return {
    label: config.label,
    rangeDays,
    rangeStartDate: startStamp === null ? null : new Date(startStamp).toISOString().slice(0, 10),
    rangeEndDate: endStamp === null ? null : new Date(endStamp).toISOString().slice(0, 10),
    unit: config.unit,
    entries: points,
    average: points.length ? points.reduce((sum, point) => sum + point.value, 0) / points.length : null,
    max: points.length ? Math.max(...points.map(point => point.value)) : null,
  };
}
