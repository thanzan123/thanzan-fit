export const REST_TIMER_STORAGE_KEY = 'thanzan-fit-rest-timer-v1';

const ALLOWED_DURATIONS = new Set([30, 45, 60, 90, 120, 180]);
const MAX_COMPLETION_AGE_MS = 10 * 60 * 1000;
const DEFAULT_DURATION = 90;

export function createDefaultRestTimerState() {
  return { duration: DEFAULT_DURATION, endsAt: null, remaining: DEFAULT_DURATION, started: false };
}

export function restoreRestTimerState(saved, now = Date.now()) {
  let value = saved;
  try {
    if (typeof value === 'string') value = JSON.parse(value);
  } catch {
    return createDefaultRestTimerState();
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return createDefaultRestTimerState();

  const duration = Number(value.duration);
  if (!ALLOWED_DURATIONS.has(duration) || value.started !== true) return createDefaultRestTimerState();

  const endAt = Number(value.endsAt);
  if (Number.isFinite(endAt) && endAt > 0) {
    if (endAt > now) {
      if (endAt - now > Math.max(...ALLOWED_DURATIONS) * 1000 + 10_000) return createDefaultRestTimerState();
      return { duration, endsAt: endAt, remaining: Math.ceil((endAt - now) / 1000), started: true };
    }
    if (now - endAt <= MAX_COMPLETION_AGE_MS) return { duration, endsAt: null, remaining: 0, started: true };
    return createDefaultRestTimerState();
  }

  const remaining = Number(value.remaining);
  if (Number.isInteger(remaining) && remaining >= 0 && remaining <= duration) {
    return { duration, endsAt: null, remaining, started: true };
  }
  return createDefaultRestTimerState();
}
