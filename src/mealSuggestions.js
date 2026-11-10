const finiteNonnegative = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0;

/** Build transparent protein-focused dinner ingredient ideas from the saved food library and today's log. */
export function getDinnerSuggestions({ foods = [], meals = [], today, calorieTarget = null, proteinTarget = null, limit = 3 } = {}) {
  const entries = Array.isArray(meals) ? meals.filter(item => item.date === today) : [];
  const logged = entries.reduce((totals, item) => ({
    kcal: totals.kcal + (finiteNonnegative(item.kcal) ? Number(item.kcal) : 0),
    protein: totals.protein + (finiteNonnegative(item.p) ? Number(item.p) : 0),
  }), { kcal: 0, protein: 0 });
  const hasCalorieTarget = finiteNonnegative(calorieTarget) && Number(calorieTarget) > 0;
  const hasProteinTarget = finiteNonnegative(proteinTarget) && Number(proteinTarget) > 0;
  // When today's log is empty, do not call its absent entries zero intake or claim a remaining amount.
  const caloriesLeft = entries.length && hasCalorieTarget ? Math.max(0, Number(calorieTarget) - logged.kcal) : null;
  const proteinLeft = entries.length && hasProteinTarget ? Math.max(0, Number(proteinTarget) - logged.protein) : null;
  const desiredProtein = Math.max(12, Math.min(25, proteinLeft ?? 20));
  const ideas = (Array.isArray(foods) ? foods : []).flatMap(food => {
    if (!food || !finiteNonnegative(food.p) || Number(food.p) < 8 || !finiteNonnegative(food.kcal) || Number(food.kcal) <= 0) return [];
    const recipe = Boolean(food.isRecipe);
    const unitProtein = Number(food.p);
    const unitKcal = Number(food.kcal);
    const kcalPerProtein = unitKcal / unitProtein;
    if (kcalPerProtein > 20) return [];
    let amount = recipe ? desiredProtein / unitProtein : desiredProtein / unitProtein * 100;
    if (!recipe) amount = Math.round(amount / 10) * 10;
    else amount = Math.round(amount * 4) / 4;
    if (amount <= 0 || (!recipe && amount > 250) || (recipe && amount > 3)) return [];
    const scale = recipe ? amount : amount / 100;
    const kcal = Math.round(unitKcal * scale);
    const protein = +(unitProtein * scale).toFixed(1);
    return [{ food, amount, recipe, kcal, protein, caloriesLeft, fitsCalorieEstimate: caloriesLeft === null ? null : kcal <= caloriesLeft, kcalPerProtein }];
  });
  return ideas
    .sort((a, b) => Number(b.fitsCalorieEstimate === true) - Number(a.fitsCalorieEstimate === true) || a.kcalPerProtein - b.kcalPerProtein || a.food.name.localeCompare(b.food.name))
    .slice(0, Math.max(0, Number.isInteger(limit) ? limit : 3));
}
