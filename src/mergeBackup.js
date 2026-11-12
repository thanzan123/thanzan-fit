const MERGE_ARRAYS = [
  'weights', 'meals', 'mealTemplates', 'waters', 'workouts', 'sets', 'measurements',
  'recovery', 'activityLogs', 'favorites', 'customFoods', 'customExercises', 'customRoutines',
];

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
  }
  return value;
};

const identity = (item) => {
  if (item && typeof item === 'object' && !Array.isArray(item) && (typeof item.id === 'string' || typeof item.id === 'number')) {
    return `id:${typeof item.id}:${item.id}`;
  }
  return `value:${JSON.stringify(stableValue(item))}`;
};

/** Merge portable records without overwriting the current profile or app preferences. */
export function mergeBackupState(current, incoming) {
  if (!current || typeof current !== 'object' || Array.isArray(current) || !incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
    throw new Error('Invalid backup');
  }

  const state = { ...current };
  let added = 0;
  const byCollection = {};

  for (const key of MERGE_ARRAYS) {
    const existing = Array.isArray(current[key]) ? current[key] : [];
    const imported = Array.isArray(incoming[key]) ? incoming[key] : [];
    const seen = new Set(existing.map(identity));
    const merged = [...existing];
    let count = 0;
    for (const item of imported) {
      const itemIdentity = identity(item);
      if (seen.has(itemIdentity)) continue;
      seen.add(itemIdentity);
      merged.push(item);
      count += 1;
    }
    state[key] = merged;
    byCollection[key] = count;
    added += count;
  }

  const currentEdits = current.routineEdits && typeof current.routineEdits === 'object' && !Array.isArray(current.routineEdits) ? current.routineEdits : {};
  const importedEdits = incoming.routineEdits && typeof incoming.routineEdits === 'object' && !Array.isArray(incoming.routineEdits) ? incoming.routineEdits : {};
  const newEdits = Object.fromEntries(Object.entries(importedEdits).filter(([key]) => !Object.hasOwn(currentEdits, key)));
  state.routineEdits = { ...newEdits, ...currentEdits };
  byCollection.routineEdits = Object.keys(newEdits).length;
  added += byCollection.routineEdits;

  return { state, added, byCollection };
}
