const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
const chronological = (a, b) => String(a.date || '').localeCompare(String(b.date || '')) || Number(a.createdAt || 0) - Number(b.createdAt || 0);
const newestFirst = (a, b) => chronological(b, a);
const limitFor = range => range === 'all' ? Infinity : Math.max(1, Number(range) || 8);

export function getMeasurementHistory(entries, range = '8') {
  return [...(Array.isArray(entries) ? entries : [])]
    .filter(item => item && validDate(item.date))
    .sort(newestFirst)
    .slice(0, limitFor(range));
}

export function getMeasurementTrend(entries, metric, range = '8') {
  return (Array.isArray(entries) ? entries : [])
    .filter(item => item && validDate(item.date) && item[metric] !== null && item[metric] !== undefined && item[metric] !== '' && Number.isFinite(Number(item[metric])) && Number(item[metric]) > 0)
    .sort(chronological)
    .slice(-limitFor(range));
}
