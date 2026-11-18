const FIELDS = [
  ['Medical conditions', 'medicalConditions'],
  ['Exercise restrictions', 'exerciseRestrictions'],
  ['Previous injuries', 'previousInjuries'],
];

export function getTrainingNotes(profile = {}) {
  return FIELDS.flatMap(([label, key]) => {
    const value = typeof profile?.[key] === 'string' ? profile[key].trim() : '';
    return value ? [{ label, value }] : [];
  });
}
