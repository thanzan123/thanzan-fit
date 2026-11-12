const TIMER_PRESETS = [30, 45, 60, 90, 120, 180];

export function parseGuideRestSeconds(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim().toLowerCase();
  const range = text.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|minutes?|mins?|m)\b/);
  const single = range ? null : text.match(/(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|minutes?|mins?|m)\b/);
  const match = range || single;
  if (!match) return null;
  const unit = match[3] || match[2];
  const multiplier = /^(m|min|mins|minute|minutes)$/.test(unit) ? 60 : 1;
  const first = Number(match[1]) * multiplier;
  const second = range ? Number(match[2]) * multiplier : first;
  if (!Number.isFinite(first) || !Number.isFinite(second) || first <= 0 || second < first || second > 600) return null;
  return { minSeconds: first, maxSeconds: second };
}

export function getGuideRestRecommendation(value) {
  const range = parseGuideRestSeconds(value);
  if (!range) return null;
  const midpoint = (range.minSeconds + range.maxSeconds) / 2;
  const seconds = TIMER_PRESETS.reduce((best, option) =>
    Math.abs(option - midpoint) < Math.abs(best - midpoint) ? option : best,
  TIMER_PRESETS[0]);
  return { ...range, seconds };
}
