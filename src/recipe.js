export const RECIPE_NUTRIENT_KEYS = ['kcal', 'p', 'c', 'f', 'fiber'];

const rounded = (value, digits = 1) => Number(value.toFixed(digits));

export function calculateRecipe(ingredients, servings) {
  const servingsCount = Number(servings);
  if (!Array.isArray(ingredients) || ingredients.length === 0) throw new Error('Add at least one ingredient.');
  if (!Number.isFinite(servingsCount) || servingsCount <= 0 || servingsCount > 100) throw new Error('Servings must be between 0 and 100.');
  const total = Object.fromEntries(RECIPE_NUTRIENT_KEYS.map(key => [key, 0]));
  for (const ingredient of ingredients) {
    const amount = Number(ingredient.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) throw new Error('Ingredient amounts must be between 0 and 10,000 g/ml.');
    for (const key of RECIPE_NUTRIENT_KEYS) {
      const value = Number(ingredient[key]);
      if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid ${key} value for ${ingredient.name || 'an ingredient'}.`);
      total[key] += value * amount / 100;
    }
  }
  const perServing = Object.fromEntries(RECIPE_NUTRIENT_KEYS.map(key => [key, rounded(total[key] / servingsCount, key === 'kcal' ? 0 : 1)]));
  return {
    total: Object.fromEntries(RECIPE_NUTRIENT_KEYS.map(key => [key, rounded(total[key], key === 'kcal' ? 0 : 1)])),
    perServing,
    servings: servingsCount,
  };
}
