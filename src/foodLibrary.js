const normalize = value => String(value ?? '').toLocaleLowerCase();

export function getFoodCategory(food) {
  if (food?.isRecipe || /recipe/i.test(food?.category ?? '')) return 'Recipes';
  const text = `${food?.name ?? ''} ${food?.category ?? ''}`.toLocaleLowerCase();
  if (/dairy|milk|yogurt|paneer|curd/.test(text)) return 'Dairy';
  if (/protein|egg|chicken|beef|fish|sardine|mackerel|prawn|shrimp|whey/.test(text)) return 'Protein';
  if (/nuts? and seeds|nuts?|almond|walnut|cashew|groundnut|peanut|chia|sesame|coconut kernel/.test(text)) return 'Nuts & seeds';
  if (/olive oil|coconut oil|oil,/.test(text)) return 'Fats & oils';
  if (/fruit|banana|apple|mango|guava|papaya|jackfruit/.test(text)) return 'Fruit';
  if (/vegetable|spinach|broccoli|carrot|cucumber|pumpkin|bitter gourd|bottle gourd|ash gourd|brinjal|drumstick|fenugreek|amaranth|tomato|tapioca|sweet potato/.test(text)) return 'Vegetables';
  if (/grain|pulse|carbohydrate|oat|rice|wheat|atta|chapati|roti|bread|semolina|ragi|sugar|puffed rice|rice flakes/.test(text)) return 'Grains & starches';
  if (/fat|oil/.test(text)) return 'Fats & oils';
  return 'Other';
}

export function getFoodCategories(foods) {
  const order = ['Protein', 'Dairy', 'Grains & starches', 'Fruit', 'Vegetables', 'Nuts & seeds', 'Fats & oils', 'Recipes', 'Other'];
  const present = new Set((foods ?? []).map(getFoodCategory));
  return ['All categories', ...order.filter(category => present.has(category))];
}

export function filterFoods(foods, { query = '', category = 'All categories' } = {}) {
  const needle = normalize(query).trim();
  return (foods ?? []).filter(food =>
    (!needle || normalize(food.name).includes(needle)) &&
    (category === 'All categories' || getFoodCategory(food) === category)
  );
}
