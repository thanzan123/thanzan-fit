const MEASUREMENT_FIELDS = [
  ['waist', 'Waist'],
  ['chest', 'Chest'],
  ['arms', 'Arms'],
  ['hips', 'Hips'],
  ['thighs', 'Thighs'],
  ['neck', 'Neck'],
];

const validValue = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) > 0;

export function compareMeasurementEntries(earlier, later) {
  return MEASUREMENT_FIELDS.map(([key, label]) => {
    const earlierValue = validValue(earlier?.[key]) ? Number(earlier[key]) : null;
    const laterValue = validValue(later?.[key]) ? Number(later[key]) : null;
    return {
      key,
      label,
      earlierValue,
      laterValue,
      change: earlierValue !== null && laterValue !== null ? laterValue - earlierValue : null,
    };
  });
}
