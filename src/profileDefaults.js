export const blankProfile = () => ({ name: '', age: '', heightCm: '', startingWeightKg: '', currentWeightKg: '', targetWeightKg: '', gymStartDate: '', gender: '', activityLevel: '', goal: '', experience: '', workoutsPerWeek: '', workoutMinutes: '', sleepHours: '', dailySteps: '', dietaryPreferences: '', allergies: '', medicalConditions: '', exerciseRestrictions: '', previousInjuries: '', equipment: '' });

// Editable starter values from the owner's original brief; unknown health/profile fields stay blank.
export const starterProfile = () => ({
  ...blankProfile(),
  name: 'Thanzan Thari',
  age: '24',
  heightCm: '181',
  startingWeightKg: '132.4',
  targetWeightKg: '80',
  gymStartDate: '2026-10-26',
  goal: 'Fat loss + muscle building',
  experience: 'Beginner',
  workoutsPerWeek: '6',
  workoutMinutes: '60',
});
