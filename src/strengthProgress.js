const validNumber = (value) => Number.isFinite(Number(value));

export function getStrengthProgress(workouts = [], sets = [], startDate, endDate) {
  const completed = new Map(
    (Array.isArray(workouts) ? workouts : [])
      .filter(session => session && !session.active && session.id != null
        && typeof session.date === 'string' && session.date >= startDate && session.date <= endDate)
      .map(session => [session.id, session])
  );
  const byExercise = new Map();

  for (const set of Array.isArray(sets) ? sets : []) {
    const session = completed.get(set?.sessionId);
    const exercise = String(set?.exercise || '').trim();
    const kg = Number(set?.kg);
    const reps = Number(set?.reps);
    if (!session || !exercise || !validNumber(set?.kg) || kg <= 0 || !Number.isInteger(reps) || reps < 1) continue;

    const current = byExercise.get(exercise) || new Map();
    const best = current.get(session.id);
    if (!best || kg > best.kg || (kg === best.kg && reps > best.reps)) {
      current.set(session.id, { date: session.date, startedAt: Number(session.startedAt) || 0, kg, reps });
      byExercise.set(exercise, current);
    }
  }

  return [...byExercise.entries()]
    .map(([exercise, sessions]) => {
      const ordered = [...sessions.values()].sort((a, b) => a.date.localeCompare(b.date) || a.startedAt - b.startedAt);
      if (ordered.length < 2) return null;
      return { exercise, sessions: ordered.length, first: ordered[0], latest: ordered[ordered.length - 1] };
    })
    .filter(Boolean)
    .sort((a, b) => a.exercise.localeCompare(b.exercise));
}
