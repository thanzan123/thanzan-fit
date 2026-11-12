export function toggleExerciseCompletion(completed, exercise, checked) {
  const name = String(exercise || '').trim();
  const names = Array.isArray(completed)
    ? [...new Set(completed.map(value => String(value || '').trim()).filter(Boolean))]
    : [];
  if (!name) return names;
  const exists = names.includes(name);
  if (checked && !exists) names.push(name);
  if (!checked && exists) return names.filter(value => value !== name);
  return names;
}
