const metricConfig = {
  steps: { label: 'Steps', unit: 'steps', max: 200000, integer: true },
  distanceKm: { label: 'Walking distance', unit: 'km', max: 300 },
  activeMinutes: { label: 'Active minutes', unit: 'min', max: 1440, integer: true },
};

export function getActivityMetricTrend(entries, metric = 'steps', limit = 14) {
  const config = metricConfig[metric] || metricConfig.steps;
  const byDate = new Map();
  (Array.isArray(entries) ? entries : [])
    .filter(item => /^\d{4}-\d{2}-\d{2}$/.test(String(item.date || '')))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0))
    .forEach(item => byDate.set(item.date, item));
  const recent = [...byDate.values()].slice(-Math.max(1, Math.floor(Number(limit) || 14)));
  const points = recent.filter(item => {
    const value = item[metric];
    return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= config.max && (!config.integer || Number.isInteger(Number(value)));
  }).map(item => ({ ...item, value: Number(item[metric]) }));
  return {
    label: config.label,
    unit: config.unit,
    entries: points,
    average: points.length ? points.reduce((sum, point) => sum + point.value, 0) / points.length : null,
    max: points.length ? Math.max(...points.map(point => point.value)) : null,
  };
}
