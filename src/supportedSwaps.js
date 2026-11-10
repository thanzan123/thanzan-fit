export const supportedMovementSwaps = [
  {
    from: 'Seated cable row',
    to: 'Chest-supported row',
    explanation: 'The chest pad supports your torso during the row. Setup and comfort still vary by machine and person.',
  },
  {
    from: 'Romanian deadlift variation',
    to: 'Seated leg curl',
    explanation: 'This removes the loaded hip hinge and focuses on knee-flexion hamstrings; it does not train the glutes or hinge in the same way.',
  },
  {
    from: 'Supported squat variation',
    to: 'Leg extension',
    explanation: 'This is a seated, quad-focused option, not an equivalent squat: it gives up much of the hip and whole-leg work.',
  },
  {
    from: 'Plank',
    to: 'Dead bug',
    explanation: 'This offers a floor-based core movement with a small controlled range; it can still be uncomfortable for some people.',
  },
];

export function getSupportedSwaps(routines) {
  return routines.flatMap((routine) => routine.exercises.flatMap((exercise, exerciseIndex) => {
    const rule = supportedMovementSwaps.find((item) => item.from.toLowerCase() === String(exercise).toLowerCase());
    if (!rule) return [];
    const routineKey = routine.id || routine.day;
    return [{
      key: `${routineKey}:${exerciseIndex}:${rule.from}`,
      routineKey,
      routineName: routine.name,
      day: routine.day || 'Custom routine',
      exerciseIndex,
      ...rule,
    }];
  }));
}

export function replaceRoutineExercise(exercises, index, expectedExercise, replacement) {
  if (!Array.isArray(exercises) || !Number.isInteger(index) || index < 0 || index >= exercises.length) {
    throw new RangeError('Choose an exercise in the saved routine.');
  }
  if (String(exercises[index]).toLowerCase() !== String(expectedExercise).toLowerCase()) {
    throw new Error('The selected routine changed. Choose the movement again.');
  }
  if (typeof replacement !== 'string' || !replacement.trim()) {
    throw new TypeError('Choose a supported replacement.');
  }
  const updated = [...exercises];
  updated[index] = replacement.trim();
  return updated;
}
