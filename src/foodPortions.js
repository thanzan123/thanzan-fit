// Reference household portions taken from USDA FoodData Central SR Legacy food_portion.csv.
// They are convenience estimates, not universal serving recommendations.
const portions = {
  egg: {label:'1 large egg', amount:50, unit:'g', source:'FDC 171287'},
  rice: {label:'1 cup cooked rice', amount:158, unit:'g', source:'FDC 168878'},
  banana: {label:'1 medium banana', amount:118, unit:'g', source:'FDC 173944'},
  spinach: {label:'1 cup raw spinach', amount:30, unit:'g', source:'FDC 168462'},
  'usda-whey-protein-powder': {label:'⅓ cup whey powder', amount:32, unit:'g', source:'FDC 173180'},
  'usda-beef-top-round-lean-raw': {label:'4 oz raw beef', amount:113, unit:'g', source:'FDC 173996'},
  'usda-shrimp-cooked': {label:'3 oz cooked shrimp', amount:85, unit:'g', source:'FDC 175180'},
  'usda-broccoli-raw': {label:'1 cup chopped broccoli', amount:91, unit:'g', source:'FDC 170379'},
  'usda-almonds-raw': {label:'1 oz almonds (23 kernels)', amount:28.35, unit:'g', source:'FDC 170567'},
  'usda-walnuts-english': {label:'1 oz walnuts (14 halves)', amount:28.35, unit:'g', source:'FDC 170187'},
  'usda-chia-seeds-dried': {label:'1 oz chia seeds', amount:28.35, unit:'g', source:'FDC 170554'},
  'usda-chicken-thigh-roasted': {label:'1 thigh, meat only, no skin', amount:116, unit:'g', source:'FDC 172388'},
  'usda-whole-wheat-bread': {label:'1 slice whole-wheat bread', amount:32, unit:'g', source:'FDC 172688'},
  'usda-olive-oil': {label:'1 tablespoon olive oil', amount:13.5, unit:'g', source:'FDC 171413'},
  'usda-coconut-oil': {label:'1 tablespoon coconut oil', amount:13.6, unit:'g', source:'FDC 171412'},
};

export const getStandardFoodPortion = (food) => {
  if (!food || food.isRecipe || food.basis !== '100 g') return null;
  return portions[food.id] || null;
};
