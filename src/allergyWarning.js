const normalize = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Common label and regional ingredient names are grouped conservatively: a match prompts
// the person to inspect the full label; it never certifies a food as safe.
const allergenGroups = [
  ['peanut', 'peanuts', 'groundnut', 'groundnuts', 'arachis'],
  ['dairy', 'milk', 'cheese', 'yogurt', 'curd', 'paneer', 'ghee', 'butter', 'cream', 'whey', 'casein', 'lactose', 'milk powder', 'milk solids'],
  ['nut', 'nuts', 'tree nut', 'tree nuts', 'cashew', 'almond', 'walnut', 'pistachio', 'hazelnut', 'pecan', 'macadamia'],
  ['gluten', 'wheat', 'atta', 'maida', 'barley', 'rye', 'semolina', 'suji', 'rava', 'durum', 'spelt', 'malt'],
  ['soy', 'soya', 'soybean', 'soybeans', 'soy protein', 'soya chunks', 'tofu', 'tempeh', 'edamame'],
  ['egg', 'eggs', 'egg white', 'egg yolk', 'albumin', 'ovalbumin'],
  ['fish', 'sardine', 'mackerel', 'tuna', 'salmon', 'anchovy', 'cod', 'pollock'],
  ['shellfish', 'crustacean', 'shrimp', 'prawn', 'crab', 'lobster', 'mollusk', 'mussel', 'clam', 'oyster', 'scallop', 'squid', 'cuttlefish'],
  ['sesame', 'sesame seed', 'sesame seeds', 'til', 'ellu', 'gingelly'],
  ['mustard', 'mustard seed', 'rai', 'sarson'],
];

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
    const group = allergenGroups.find(aliases => aliases.some(alias => containsPhrase(term, normalize(alias))));
    const candidates = group || [term];
    return names.some(name => candidates.some(candidate => containsPhrase(name, normalize(candidate))));
  });
}
