import { calculateRecipe } from './recipe.js';

export const keralaRecipeStarters = [
  {
    id: 'kerala-puttu',
    name: 'Puttu (starter estimate)',
    servings: 2,
    ingredients: [
      { foodId: 'usda-rice-flour-white', amount: 158, unit: 'g' },
      { foodId: 'ifct-H007', amount: 42.5, unit: 'g' },
    ],
    recipeUrl: 'https://www.keralatourism.org/kerala-food/puttu-kadala/43/',
    nutritionSources: [
      { label: 'Kerala Tourism · puttu', url: 'https://www.keralatourism.org/kerala-food/puttu-kadala/43/' },
      { label: 'USDA FoodData Central · rice flour', url: 'https://fdc.nal.usda.gov/food-details/790214/nutrients' },
      { label: 'IFCT 2017 · fresh coconut', url: 'https://www.nin.res.in/ebooks/IFCT2017.pdf' },
      { label: 'Ingredient cup-weight estimates', url: 'https://cookbookmanager.com/tools/ingredient-weights' },
    ],
    recipeSource: 'Kerala Tourism lists 1 cup coarse rice flour and ½ cup grated coconut; the recipe yield is not stated, so this estimate assumes 2 servings.',
    note: 'Cup amounts are converted using US-cup reference weights (158 g rice flour; about 43 g shredded coconut). Coarse puttu flour is represented by white rice flour data; cup packing, flour type and your serving size can change the result. Water and salt are omitted. Edit ingredients and servings to match your batch.',
  },
  {
    id: 'kerala-idiyappam',
    name: 'Idiyappam (starter estimate)',
    servings: 4,
    ingredients: [
      { foodId: 'usda-rice-flour-white', amount: 400, unit: 'g' },
      { foodId: 'ifct-H007', amount: 10.6, unit: 'g' },
    ],
    recipeUrl: 'https://www.pachakam.com/recipes/kerala-style-idiappam',
    nutritionSources: [
      { label: 'Pachakam recipe', url: 'https://www.pachakam.com/recipes/kerala-style-idiappam' },
      { label: 'USDA FoodData Central · rice flour', url: 'https://fdc.nal.usda.gov/food-details/790214/nutrients' },
      { label: 'IFCT 2017 · fresh coconut', url: 'https://www.nin.res.in/ebooks/IFCT2017.pdf' },
      { label: 'Coconut weight estimate', url: 'https://cookingcalculator.app/ingredients/shredded-coconut' },
    ],
    recipeSource: 'Pachakam’s Kerala-style recipe lists 400 g rice flour, 2 tbsp grated coconut and 4 servings. The 2 tbsp is estimated as 10.6 g.',
    note: 'Starter estimate only: water and salt are omitted; the source says “a little” oil without an amount, so it is not counted. Flour and coconut vary; edit ingredients and servings to match yours.',
  },
];

const known = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));

export function isStarterRecipeSaved(customFoods, starterId) {
  return (Array.isArray(customFoods) ? customFoods : []).some(food => food.starterId === starterId);
}

export function buildStarterRecipe(starter, foods, recipeId) {
  if (!starter || !Array.isArray(starter.ingredients) || !Array.isArray(foods)) throw new Error('Starter recipe data is unavailable.');
  const ingredients = starter.ingredients.map(item => {
    const food = foods.find(candidate => candidate.id === item.foodId);
    if (!food) throw new Error(`Missing food reference: ${item.foodId}`);
    return {
      id: food.id,
      foodId: food.id,
      name: food.name,
      amount: item.amount,
      unit: item.unit,
      basis: food.basis || '100 g',
      kcal: Number(food.kcal), p: Number(food.p), c: Number(food.c), f: Number(food.f), fiber: Number(food.fiber),
      sugar: known(food.sugar) ? Number(food.sugar) : null,
    };
  });
  const nutrition = calculateRecipe(ingredients, starter.servings);
  return {
    id: recipeId,
    starterId: starter.id,
    name: starter.name,
    category: 'Kerala recipe estimate',
    basis: '1 serving',
    isRecipe: true,
    servings: nutrition.servings,
    ingredients,
    recipeUrl: starter.recipeUrl,
    recipeSource: starter.recipeSource,
    note: starter.note,
    nutritionSources: starter.nutritionSources,
    ...nutrition.perServing,
  };
}
