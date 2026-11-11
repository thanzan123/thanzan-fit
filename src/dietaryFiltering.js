const normalize = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const hasTerm = (text, terms) => {
  const haystack = ` ${normalize(text)} `;
  return terms.some(term => haystack.includes(` ${normalize(term)} `));
};

const meatTerms = ['chicken', 'beef', 'pork', 'lamb', 'mutton', 'goat meat', 'turkey', 'duck', 'meat', 'poultry', 'bacon', 'ham', 'sausage', 'gelatin'];
const seafoodTerms = ['fish', 'sardine', 'mackerel', 'ayala', 'prawn', 'shrimp', 'crab', 'lobster', 'anchovy', 'tuna', 'salmon', 'seafood', 'shellfish', 'mussel', 'clam', 'oyster', 'squid', 'cuttlefish'];
const eggTerms = ['egg', 'eggs', 'egg white', 'egg yolk', 'albumin'];
const dairyTerms = ['milk', 'yogurt', 'curd', 'paneer', 'whey', 'cheese', 'ghee', 'butter', 'cream', 'casein', 'dairy'];
const plantCategories = ['vegetable', 'fruit', 'carbohydrate', 'grain', 'pulse', 'legume', 'nut', 'seed', 'oil', 'plant'];
const plantTerms = [
  'rice', 'atta', 'maida', 'oats', 'ragi', 'dal', 'chana', 'urad', 'moong', 'masoor', 'toor',
  'banana', 'apple', 'spinach', 'coconut', 'vegetable', 'carrot', 'potato', 'tomato', 'beans',
  'almond', 'peanut', 'walnut', 'chia', 'olive oil', 'coconut oil', 'appam', 'puttu', 'idiyappam',
  'idli', 'dosa', 'chapati', 'rice flour', 'semolina', 'suji', 'rava', 'flour', 'lentil',
];

function classifyFood(food) {
  if (!food || typeof food !== 'object') return null;
  const ingredients = Array.isArray(food.ingredients) ? food.ingredients : null;
  if (ingredients?.length) {
    const parts = ingredients.map(item => classifyFood(item));
    if (parts.some(part => !part)) return null;
    return new Set(parts.flatMap(part => [...part]));
  }

  const text = String(food.name ?? '');
  if (!text.trim()) return null;
  const types = new Set();
  if (hasTerm(text, meatTerms)) types.add('meat');
  if (hasTerm(text, seafoodTerms)) types.add('seafood');
  if (hasTerm(text, eggTerms)) types.add('egg');
  if (hasTerm(text, dairyTerms)) types.add('dairy');
  if (types.size) return types;

  const category = normalize(food.category);
  if (plantCategories.some(term => category.includes(term)) || hasTerm(text, plantTerms)) return new Set(['plant']);
  return null;
}

function normalizePreference(value) {
  const normalized = normalize(value);
  if (!normalized) return null;
  if (/\bvegan\b/.test(normalized)) return 'vegan';
  if (/\bvegetarian\b/.test(normalized) && !/\bnon vegetarian\b/.test(normalized)) return 'vegetarian';
  if (/\bpescatarian\b/.test(normalized)) return 'pescatarian';
  return null;
}

function allowedFor(food, preference) {
  const types = classifyFood(food);
  if (!types) return false;
  const allowed = preference === 'vegan' ? new Set(['plant'])
    : preference === 'vegetarian' ? new Set(['plant', 'dairy'])
      : new Set(['plant', 'dairy', 'egg', 'seafood']);
  return [...types].every(type => allowed.has(type));
}

/**
 * Apply only clear vegan, vegetarian or pescatarian preferences. Unknown foods are omitted
 * for those preferences rather than assumed suitable. This is a name-based suggestion filter,
 * not ingredient, cross-contamination or food-safety verification.
 */
export function filterDinnerIdeasForDiet(ideas, preferenceText = '') {
  const preference = normalizePreference(preferenceText);
  if (!preference) return { ideas: Array.isArray(ideas) ? ideas : [], preference: null, filtered: false, excludedCount: 0 };
  const source = Array.isArray(ideas) ? ideas : [];
  const filtered = source.filter(idea => allowedFor(idea?.food, preference));
  return { ideas: filtered, preference, filtered: true, excludedCount: source.length - filtered.length };
}
