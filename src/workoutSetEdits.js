export const validateWorkoutSetEdit = ({ exercise, reps, kg }) => {
  const name = String(exercise ?? '').trim();
  const repCount = Number(reps);
  const loadKg = Number(kg);
  if (!name || !Number.isInteger(repCount) || repCount < 1 || repCount > 100 || !Number.isFinite(loadKg) || loadKg < 0 || loadKg > 1000) return null;
  return { exercise: name, reps: repCount, kg: loadKg };
};

export const updateWorkoutSetRecords = ({ sets, setId, changes }) => {
  if (!sets.some(set => set.id === setId)) return { sets, updated: false };
  return { sets: sets.map(set => set.id === setId ? { ...set, ...changes } : set), updated: true };
};

export const deleteWorkoutSetRecords = ({ sets, workouts, setId }) => {
  const removed = sets.find(set => set.id === setId);
  if (!removed) return { sets, workouts, deleted: false };
  const remainingSets = sets.filter(set => set.id !== setId);
  const sessionStillExists = workouts.some(workout => workout.id === removed.sessionId);
  return {
    sets: remainingSets,
    workouts: sessionStillExists
      ? workouts.map(workout => workout.id === removed.sessionId
        ? { ...workout, sets: remainingSets.filter(set => set.sessionId === workout.id).length }
        : workout)
      : workouts,
    deleted: true,
  };
};
