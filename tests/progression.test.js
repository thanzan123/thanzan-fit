import test from 'node:test';
import assert from 'node:assert/strict';
import { getProgressionCue } from '../src/progression.js';

const guide = { sets: '2–3', reps: '8–12' };
const session = (sets) => ({ sets });
const set = (reps, kg = 20) => ({ reps, kg });

test('offers only a conditional optional cue after all guide sets reach the upper rep bound', () => {
  const cue = getProgressionCue({ guide, session: session([set(12), set(12)]) });
  assert.equal(cue.kind, 'suggestion');
  assert.match(cue.body, /controlled and pain-free/);
  assert.match(cue.body, /Repeating this load is fine/);
});

test('does not suggest increasing load when same-day recovery flags are present', () => {
  const cue = getProgressionCue({ guide, session: session([set(12), set(12)]), recoverySignals: ['high soreness rating'] });
  assert.equal(cue.kind, 'caution');
  assert.match(cue.body, /Skip load increases today/);
});

test('defers to any saved injury or restriction note', () => {
  const cue = getProgressionCue({ guide, session: session([set(12), set(12)]), exerciseRestrictions: 'avoid overhead loading' });
  assert.equal(cue.kind, 'caution');
  assert.match(cue.body, /Follow that guidance/);
});

test('does not cue progression from too few sets, mixed loads, bodyweight, or timed ranges', () => {
  assert.notEqual(getProgressionCue({ guide, session: session([set(12)]) }).kind, 'suggestion');
  assert.notEqual(getProgressionCue({ guide, session: session([set(12, 20), set(12, 22)]) }).kind, 'suggestion');
  assert.notEqual(getProgressionCue({ guide, session: session([set(12, 0), set(12, 0)]) }).kind, 'suggestion');
  assert.notEqual(getProgressionCue({ guide: {sets:'2', reps:'10–30 sec'}, session: session([set(30), set(30)]) }).kind, 'suggestion');
});

test('keeps the same-load cue unless every prior set reaches the range top', () => {
  const cue = getProgressionCue({ guide, session: session([set(12), set(10)]) });
  assert.equal(cue.kind, 'steady');
  assert.match(cue.body, /No increase is indicated/);
});
