import test from 'node:test';
import assert from 'node:assert/strict';
import { getProgressionCue } from '../src/progression.js';

const guide = { sets: '2–3', reps: '8–12' };
const session = (sets) => ({ sets });
const set = (reps, kg = 20) => ({ reps, kg });

test('requires the top of the range in two completed sessions at the same load before suggesting an increase', () => {
  const cue = getProgressionCue({ guide, sessions: [session([set(12), set(12)]), session([set(12), set(12)])] });
  assert.equal(cue.kind, 'suggestion');
  assert.match(cue.body, /last two completed sessions/);
  assert.match(cue.body, /controlled and pain-free/);
  assert.match(cue.body, /repeating this load is fine/);
});

test('one top-range session recommends repeating the load rather than increasing it', () => {
  const cue = getProgressionCue({ guide, sessions: [session([set(12), set(12)])] });
  assert.equal(cue.kind, 'steady');
  assert.match(cue.body, /repeat this load/);
  assert.doesNotMatch(cue.body, /could consider the smallest available load increase/);
});

test('does not suggest an increase when the previous session missed the top range or used a different load', () => {
  const latest = session([set(12), set(12)]);
  assert.equal(getProgressionCue({ guide, sessions: [latest, session([set(12), set(11)])] }).kind, 'steady');
  assert.equal(getProgressionCue({ guide, sessions: [latest, session([set(12, 18), set(12, 18)])] }).kind, 'steady');
});

test('does not suggest increasing load when same-day recovery flags are present', () => {
  const cue = getProgressionCue({ guide, sessions: [session([set(12), set(12)]), session([set(12), set(12)])], recoverySignals: ['high soreness rating'] });
  assert.equal(cue.kind, 'caution');
  assert.match(cue.body, /Skip load increases today/);
});

test('defers to any saved injury or restriction note', () => {
  const cue = getProgressionCue({ guide, sessions: [session([set(12), set(12)]), session([set(12), set(12)])], exerciseRestrictions: 'avoid overhead loading' });
  assert.equal(cue.kind, 'caution');
  assert.match(cue.body, /Follow that guidance/);
});

test('does not cue progression from too few sets, mixed loads, bodyweight, or timed ranges', () => {
  assert.notEqual(getProgressionCue({ guide, sessions: [session([set(12)]), session([set(12), set(12)])] }).kind, 'suggestion');
  assert.notEqual(getProgressionCue({ guide, sessions: [session([set(12, 20), set(12, 22)]), session([set(12, 20), set(12, 20)])] }).kind, 'suggestion');
  assert.notEqual(getProgressionCue({ guide, sessions: [session([set(12, 0), set(12, 0)]), session([set(12, 0), set(12, 0)])] }).kind, 'suggestion');
  assert.notEqual(getProgressionCue({ guide: {sets:'2', reps:'10–30 sec'}, sessions: [session([set(30), set(30)]), session([set(30), set(30)])] }).kind, 'suggestion');
});

test('keeps the same-load cue unless every latest set reaches the range top', () => {
  const cue = getProgressionCue({ guide, sessions: [session([set(12), set(10)]), session([set(12), set(12)])] });
  assert.equal(cue.kind, 'steady');
  assert.match(cue.body, /No increase is indicated/);
});
