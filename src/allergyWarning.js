const normalize = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const aliases = {
  peanut: ['peanut', 'peanuts', 'groundnut', 'groundnuts'],
  peanuts: ['peanut', 'peanuts', 'groundnut', 'groundnuts'],
  groundnut: ['peanut', 'peanuts', 'groundnut', 'groundnuts'],
  groundnuts: ['peanut', 'peanuts', 'groundnut', 'groundnuts'],
  dairy: ['dairy', 'milk', 'cheese', 'yogurt', 'curd', 'paneer', 'ghee'],
  milk: ['milk', 'dairy', 'cheese', 'yogurt', 'curd', 'paneer', 'ghee'],
  'tree nuts': ['cashew', 'almond', 'walnut', 'pistachio', 'hazelnut', 'pecan', 'macadamia'],
  'gluten': ['gluten', 'wheat', 'atta', 'barley', 'rye'],
  wheat: ['wheat', 'gluten', 'atta'],
  soy: ['soy', 'soya'],
  soya: ['soy', 'soya'],
  fish: ['fish', 'sardine', 'mackerel', 'tuna', 'salmon'],
  shellfish: ['shellfish', 'shrimp', 'prawn', 'crab', 'lobster', 'mollusk', 'mussel', 'clam'],
};

const splitNotes = value => String(value ?? '')
  .split(/[,;\n/]+/)
  .map(part => normalize(part.replace(/\ballerg(?:y|ic(?:\s+to)?)\b/gi, ' ')))
  .filter(Boolean);

const containsPhrase = (haystack, phrase) => ` ${haystack} `.includes(` ${phrase} `);

/**
 * Returns user-entered allergy terms that resemble a food/recipe ingredient name.
 * This is only a name match: an empty result does not mean the food is safe.
 */
export function findAllergyNameMatches(food, allergyNote) {
  const terms = [...new Set(splitNotes(allergyNote))];
  if (!terms.length || !food) return [];
  const names = [food.name, ...(Array.isArray(food.ingredients) ? food.ingredients.map(item => item?.name) : [])]
    .filter(Boolean).map(normalize).filter(Boolean);
  if (!names.length) return [];

  return terms.filter(term => {
    const candidates = aliases[term] || [term];
    return names.some(name => candidates.some(candidate => containsPhrase(name, normalize(candidate))));
  });
}
