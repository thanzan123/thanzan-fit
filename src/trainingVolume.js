const validDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const shiftDate = (date, days) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};
const normalizeName = value => String(value || '').trim().toLocaleLowerCase();

/** Counts saved working sets in completed sessions; it does not prescribe training volume. */
export function getWeeklyTrainingVolume({ today, workouts = [], sets = [], exerciseGuides = [] } = {}) {
  if (!validDate(today)) throw new Error('A valid review date is required.');
  const startDate = shiftDate(today, -6);
  const completed = new Map((Array.isArray(workouts) ? workouts : [])
    .filter(item => item && !item.active && validDate(item.date) && item.date >= startDate && item.date <= today)
    .map(item => [item.id, item]));
  const guideByName = new Map((Array.isArray(exerciseGuides) ? exerciseGuides : [])
    .filter(item => item && normalizeName(item.name))
    .map(item => [normalizeName(item.name), { muscle: String(item.muscle || '').split('·')[0].trim() || 'Other / unlisted', exercise: String(item.name).trim() }]));
  const byMuscle = new Map();
  const sessions = new Set();
  let totalSets = 0;
  for (const set of Array.isArray(sets) ? sets : []) {
    if (!set || !completed.has(set.sessionId)) continue;
    const reps = Number(set.reps);
    const load = Number(set.kg);
    if (!Number.isInteger(reps) || reps < 1 || reps > 100 || !Number.isFinite(load) || load < 0 || load > 1000) continue;
    const guide = guideByName.get(normalizeName(set.exercise));
    const muscle = guide?.muscle || 'Other / unlisted';
    const exerciseName = guide?.exercise || String(set.exercise || '').trim() || 'Unnamed exercise';
    const row = byMuscle.get(muscle) || { muscle, sets: 0, exercises: new Set(), sessions: new Set() };
    row.sets += 1;
    row.exercises.add(normalizeName(exerciseName));
    row.sessions.add(set.sessionId);
    byMuscle.set(muscle, row);
    sessions.add(set.sessionId);
    totalSets += 1;
  }
  const entries = [...byMuscle.values()]
    .map(item => ({ muscle: item.muscle, sets: item.sets, exercises: item.exercises.size, sessions: item.sessions.size }))
    .sort((a, b) => b.sets - a.sets || a.muscle.localeCompare(b.muscle));
  return { startDate, endDate: today, totalSets, sessionCount: sessions.size, entries };
}
