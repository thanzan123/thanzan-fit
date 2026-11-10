export function getPersonalRecords(workouts = [], sets = []) {
  const completedById = new Map(
    (Array.isArray(workouts) ? workouts : [])
      .filter(workout => workout && !workout.active && workout.id != null)
      .map(workout => [workout.id, workout])
  );
  const records = new Map();

  for (const set of Array.isArray(sets) ? sets : []) {
    const session = completedById.get(set?.sessionId);
    const exercise = String(set?.exercise || '').trim();
    const kg = Number(set?.kg);
    const reps = Number(set?.reps);
    if (!session || !exercise || !Number.isFinite(kg) || kg <= 0 || !Number.isInteger(reps) || reps < 1) continue;

    const candidate = { exercise, kg, reps, date: String(session.date || ''), sessionId: session.id };
    const current = records.get(exercise);
    const stronger = !current || kg > current.kg || (kg === current.kg && reps > current.reps);
    const sameRecordLater = current && kg === current.kg && reps === current.reps && candidate.date > current.date;
    if (stronger || sameRecordLater) records.set(exercise, candidate);
  }

  return [...records.values()].sort((a, b) => a.exercise.localeCompare(b.exercise));
}
