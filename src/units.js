export const UNIT_FACTORS = Object.freeze({ weightKgPerLb: 0.45359237, cmPerIn: 2.54, kmPerMi: 1.609344 });

export function toDisplay(value, kind, units = 'metric') {
  const n = Number(value);
  if (!Number.isFinite(n) || units !== 'imperial') return n;
  if (kind === 'weight') return n / UNIT_FACTORS.weightKgPerLb;
  if (kind === 'length') return n / UNIT_FACTORS.cmPerIn;
  if (kind === 'distance') return n / UNIT_FACTORS.kmPerMi;
  return n;
}

export function fromDisplay(value, kind, units = 'metric') {
  const n = Number(value);
  if (!Number.isFinite(n) || units !== 'imperial') return n;
  if (kind === 'weight') return n * UNIT_FACTORS.weightKgPerLb;
  if (kind === 'length') return n * UNIT_FACTORS.cmPerIn;
  if (kind === 'distance') return n * UNIT_FACTORS.kmPerMi;
  return n;
}

export function displayInput(value, kind, units = 'metric', digits = 1) {
  if (value === '' || value === null || value === undefined) return '';
  const converted = toDisplay(value, kind, units);
  return Number.isFinite(converted) ? String(Number(converted.toFixed(digits))) : '';
}

export function displayValue(value, kind, units = 'metric', digits = 1) {
  const converted = toDisplay(value, kind, units);
  return Number.isFinite(converted) ? converted.toFixed(digits) : '—';
}
