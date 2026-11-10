import test from 'node:test';
import assert from 'node:assert/strict';
import { formatWeeklyReviewAnswer, getWeeklyReview } from '../src/weeklyReview.js';

const empty = { today: '2026-11-11', meals: [], waters: [], workouts: [], weights: [], recovery: [] };

test('Coach weekly answer summarizes recorded days and preserves missing data', () => {
  const review = getWeeklyReview({
    ...empty,
    meals: [{ date: '2026-11-10', kcal: 1800, p: 90 }],
    waters: [{ date: '2026-11-10', ml: 1500 }],
    workouts: [{ date: '2026-11-10', active: false }],
    weights: [{ date: '2026-11-10', kg: 80 }, { date: '2026-11-11', kg: 79.5 }],
    recovery: [{ date: '2026-11-11', sleepHours: 7 }],
  });
  const answer = formatWeeklyReviewAnswer(review, value => `${value.toFixed(1)} kg`);
  assert.match(answer, /1 completed workout/);
  assert.match(answer, /Food was logged on 1 day/);
  assert.match(answer, /1,800 kcal\/day and 90.0 g protein\/day/);
  assert.match(answer, /Water was logged on 1 day, averaging 1,500 ml on logged days/);
  assert.match(answer, /1 sleep check-in averaged 7.0 hours/);
  assert.match(answer, /2 weigh-ins: 80.0 kg on 2026-11-10 to 79.5 kg on 2026-11-11/);
  assert.match(answer, /Blank days stay unknown, not zero/);
});

test('Coach weekly answer does not invent activity when logs are empty', () => {
  const answer = formatWeeklyReviewAnswer(getWeeklyReview(empty));
  assert.match(answer, /No food entries were saved/);
  assert.match(answer, /No water entries were saved/);
  assert.match(answer, /No sleep check-ins were saved/);
  assert.match(answer, /No weigh-ins were saved/);
  assert.match(answer, /0 completed workouts/);
});
