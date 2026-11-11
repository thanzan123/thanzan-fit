const validNumber = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));

/** Answers a small set of coach prompts from saved local records only. */
export function answerLocalQuestion(question, {
  today,
  meals = [],
  waters = [],
  proteinTarget = null,
  fiberTarget = null,
  waterTarget = null,
  startingWeight = null,
  currentWeight = null,
  weightUnit = 'kg',
  steps = null,
  stepTarget = null,
} = {}) {
  if (question === 'calories') {
    const entries = meals.filter(item => item.date === today);
    if (!entries.length) return 'There are no food entries saved for today, so I can’t total today’s intake yet.';
    const kcal = entries.reduce((sum, item) => sum + (validNumber(item.kcal) && Number(item.kcal) >= 0 ? Number(item.kcal) : 0), 0);
    return `Your saved food log totals ${Math.round(kcal).toLocaleString()} kcal across ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} today. This only reflects what’s been logged.`;
  }
  if (question === 'protein') {
    if (!validNumber(proteinTarget) || Number(proteinTarget) <= 0) return 'A protein target isn’t available yet; add a target weight in your profile to estimate one.';
    const entries = meals.filter(item => item.date === today);
    const logged = entries.reduce((sum, item) => sum + (validNumber(item.p) && Number(item.p) >= 0 ? Number(item.p) : 0), 0);
    const remaining = Math.max(0, Number(proteinTarget) - logged);
    return entries.length
      ? `${logged.toFixed(1)} g protein is logged today. That leaves about ${remaining.toFixed(1)} g to your profile estimate of ${Math.round(Number(proteinTarget))} g; it’s an estimate, not a prescription.`
      : `No food is logged today yet. Your profile-based protein estimate is ${Math.round(Number(proteinTarget))} g, but logged intake is still unknown.`;
  }
  if (question === 'fiber') {
    const entries = meals.filter(item => item.date === today);
    if (!entries.length) return 'There is no food logged today yet, so fibre intake is unknown.';
    const known = entries.filter(item => validNumber(item.fiber) && Number(item.fiber) >= 0);
    if (!known.length) return `Fibre values aren’t recorded for today’s ${entries.length} food ${entries.length === 1 ? 'entry' : 'entries'}, so intake is unknown.`;
    const grams = known.reduce((sum, item) => sum + Number(item.fiber), 0);
    const partial = known.length < entries.length ? ` across ${known.length} of ${entries.length} entries with fibre data` : '';
    if (!validNumber(fiberTarget) || Number(fiberTarget) <= 0) return `${grams.toFixed(1)} g fibre is recorded today${partial}; a profile-based estimate isn’t available.`;
    const remaining = Math.max(0, Number(fiberTarget) - grams);
    return `${grams.toFixed(1)} g fibre is recorded today${partial}. That leaves about ${remaining.toFixed(1)} g to your estimated ${Math.round(Number(fiberTarget))} g target; it’s an estimate, not a prescription.`;
  }
  if (question === 'water') {
    const entries = waters.filter(item => item.date === today);
    const ml = entries.reduce((sum, item) => sum + (validNumber(item.ml) && Number(item.ml) >= 0 ? Number(item.ml) : 0), 0);
    const amount = `${(ml / 1000).toFixed(2)} L`;
    if (!entries.length) return waterTarget ? `There are no water entries saved today. Your current goal or starting estimate is ${(Number(waterTarget) / 1000).toFixed(1)} L.` : 'There are no water entries saved today, and no goal or estimate is available.';
    return waterTarget ? `${amount} is logged today, against a ${((Number(waterTarget) || 0) / 1000).toFixed(1)} L goal or starting estimate.` : `${amount} is logged today.`;
  }
  if (question === 'steps') {
    if (!validNumber(steps) || !Number.isInteger(Number(steps)) || Number(steps) < 0) return 'There is no manual step entry saved for today, so today’s steps are unknown.';
    const count = Number(steps);
    if (!validNumber(stepTarget) || !Number.isInteger(Number(stepTarget)) || Number(stepTarget) < 1) return `${count.toLocaleString()} steps are saved today; no personal step goal is set.`;
    const remaining = Math.max(0, Number(stepTarget) - count);
    return count >= Number(stepTarget)
      ? `${count.toLocaleString()} manual steps are saved today; your personal goal of ${Number(stepTarget).toLocaleString()} is reached.`
      : `${count.toLocaleString()} manual steps are saved today; ${remaining.toLocaleString()} to your personal goal of ${Number(stepTarget).toLocaleString()}.`;
  }
  if (question === 'weight') {
    if (!validNumber(startingWeight) || Number(startingWeight) <= 0 || !validNumber(currentWeight) || Number(currentWeight) <= 0) return 'Add both starting and current weight in your profile to compare them.';
    const change = Number(startingWeight) - Number(currentWeight);
    const label = change > 0 ? 'lower' : change < 0 ? 'higher' : 'unchanged';
    return `Your profile’s current weight is ${Math.abs(change).toFixed(1)} ${weightUnit} ${label} than its starting weight. This compares profile values, not a smoothed weigh-in trend.`;
  }
  return 'Choose one of the questions to see what your saved records show.';
}


/** Routes only clearly supported, single-topic questions to local record summaries. */
export function classifyLocalQuestion(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  const value = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (/\b(why|should|recommend|suggest|predict|forecast|diagnos|safe|recipe|meal plan|workout|exercise|trend)\b/.test(value)) return null;

  const matches = [
    ['calories', /\b(calories?|kcal|energy)\b/],
    ['protein', /\bprotein\b/],
    ['fiber', /\b(fiber|fibre)\b/],
    ['water', /\b(water|hydration)\b/],
    ['steps', /\bsteps?\b/],
    ['weight', /\bweight\b/],
    ['weekly', /\b(last|past)\s+(?:7|seven)\s+days?\b|\b(last|past)\s+week\b|\bweekly\s+(?:review|summary)\b|\bweek\s+summary\b/],
  ].filter(([, pattern]) => pattern.test(value));
  if (matches.length !== 1) return null;

  const [question] = matches[0];
  if (question === 'calories') {
    if (!/\b(today|logged|log|intake|eaten)\b/.test(value) || /\b(left|remain(?:ing)?|target|goal|budget)\b/.test(value)) return null;
  } else if (question === 'protein' || question === 'fiber') {
    if (!/\b(today|left|remaining|logged|log|target|goal|estimate|intake)\b/.test(value)) return null;
  } else if (question === 'water') {
    if (!/\b(today|logged|log|goal|target|progress)\b/.test(value) || /\b(left|remaining)\b/.test(value)) return null;
  } else if (question === 'steps') {
    if (!/\b(today|logged|saved|goal|target|remaining|progress|count)\b/.test(value)) return null;
  } else if (question === 'weight') {
    if (!/\bstarting\b/.test(value) || !/\bcurrent\b/.test(value) || !/\b(change|difference|compare|comparison)\b/.test(value)) return null;
  }
  return question;
}
