const normalizedName = (value) => String(value || '').trim().toLocaleLowerCase();

export function getRoutineEquipmentOverview(routines, guides) {
  const guideByName = new Map((Array.isArray(guides) ? guides : []).map(guide => [normalizedName(guide.name), guide]));
  return (Array.isArray(routines) ? routines : []).map(routine => {
    const exercises = (Array.isArray(routine.exercises) ? routine.exercises : []).map(name => {
      const guide = guideByName.get(normalizedName(name));
      return { name, equipment: guide?.equipment || null };
    });
    const equipment = [...new Set(exercises.map(item => item.equipment).filter(Boolean))];
    return {
      key: routine.id || routine.day || routine.name,
      day: routine.day || 'Custom routine',
      name: routine.name || 'Routine',
      equipment,
      unknownExercises: exercises.filter(item => !item.equipment).map(item => item.name),
    };
  });
}
