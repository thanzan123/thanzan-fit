import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultRestTimerState, restoreRestTimerState } from '../src/restTimerState.js';

const now = 1_800_000_000_000;

test('restores an active rest interval using its absolute end time', () => {
  const state = restoreRestTimerState(JSON.stringify({ duration: 90, endsAt: now + 42_100, remaining: 90, started: true }), now);
  assert.deepEqual(state, { duration: 90, endsAt: now + 42_100, remaining: 43, started: true });
});

test('restores paused and just-completed timers without restarting them', () => {
  assert.deepEqual(restoreRestTimerState({ duration: 120, endsAt: null, remaining: 55, started: true }, now), {
    duration: 120, endsAt: null, remaining: 55, started: true,
  });
  assert.deepEqual(restoreRestTimerState({ duration: 45, endsAt: now - 2_000, remaining: 1, started: true }, now), {
    duration: 45, endsAt: null, remaining: 0, started: true,
  });
});

test('discards stale, implausible, malformed, and unsupported saved states', () => {
  const fallback = createDefaultRestTimerState();
  assert.deepEqual(restoreRestTimerState({ duration: 60, endsAt: now - 11 * 60_000, remaining: 0, started: true }, now), fallback);
  assert.deepEqual(restoreRestTimerState({ duration: 30, endsAt: now + 240_000, remaining: 30, started: true }, now), fallback);
  assert.deepEqual(restoreRestTimerState('{not json', now), fallback);
  assert.deepEqual(restoreRestTimerState({ duration: 75, endsAt: null, remaining: 20, started: true }, now), fallback);
  assert.deepEqual(restoreRestTimerState({ duration: 90, endsAt: null, remaining: 90, started: false }, now), fallback);
});
