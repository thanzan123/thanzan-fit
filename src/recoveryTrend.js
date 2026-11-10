const metricConfig = {
  sleepHours: { label: 'Sleep duration', unit: 'hours', min: 0, max: 24 },
  sleepQuality: { label: 'Sleep quality', unit: '/ 5', min: 1, max: 5 },
  energy: { label: 'Energy', unit: '/ 5', min: 1, max: 5 },
  soreness: { label: 'Soreness', unit: '/ 5', min: 1, max: 5 },
  readiness: { label: 'Readiness', unit: '/ 5', min: 1, max: 5 },
};

export function getRecoveryMetricTrend(entries, metric = 'sleepHours', limit = 14) {
  const config = metricConfig[metric] || metricConfig.sleepHours;
  const recent = (Array.isArray(entries) ? entries : [])
    .filter(item => /^\d{4}-\d{2}-\d{2}$/.test(String(item.date || '')))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0))
    .slice(-Math.max(1, Math.floor(Number(limit) || 14)));
  const points = recent.filter(item => {
    const value = item[metric];
    return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) >= config.min && Number(value) <= config.max;
  }).map(item => ({ ...item, value: Number(item[metric]) }));
  return {
    label: config.label,
    unit: config.unit,
    min: config.min,
    max: metric === 'sleepHours' ? Math.max(8, Math.ceil(Math.max(config.min, ...points.map(point => point.value)))) : config.max,
    entries: points,
    average: points.length ? points.reduce((sum, point) => sum + point.value, 0) / points.length : null,
  };
}
