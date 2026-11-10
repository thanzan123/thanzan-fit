import { describe, expect, it } from 'vitest';
import { getActivityMetricTrend } from '../src/activityTrend.js';

describe('getActivityMetricTrend', () => {
  it('keeps missing values blank and returns only recorded metric days', () => {
    const trend = getActivityMetricTrend([
      { date: '2026-11-01', steps: 4000 },
      { date: '2026-11-02', steps: null },
      { date: '2026-11-03', steps: 6500 },
    ]);
    expect(trend.entries.map(point => [point.date, point.value])).toEqual([
      ['2026-11-01', 4000], ['2026-11-03', 6500],
    ]);
    expect(trend.average).toBe(5250);
  });

  it('uses only the most recent record for each date', () => {
    const trend = getActivityMetricTrend([
      { date: '2026-11-01', steps: 4000, createdAt: 1 },
      { date: '2026-11-01', steps: 7000, createdAt: 2 },
    ]);
    expect(trend.entries).toHaveLength(1);
    expect(trend.entries[0].value).toBe(7000);
  });

  it('ignores malformed dates and invalid values', () => {
    const trend = getActivityMetricTrend([
      { date: 'bad-date', steps: 3000 },
      { date: '2026-11-01', steps: -1 },
      { date: '2026-11-02', steps: 2.5 },
      { date: '2026-11-03', steps: 9000 },
    ]);
    expect(trend.entries.map(point => point.date)).toEqual(['2026-11-03']);
  });

  it('supports distance and active-minute trends', () => {
    expect(getActivityMetricTrend([{date:'2026-11-01', distanceKm:2.4}], 'distanceKm').unit).toBe('km');
    expect(getActivityMetricTrend([{date:'2026-11-01', activeMinutes:35}], 'activeMinutes').average).toBe(35);
  });

  it('limits the trend to the latest saved dates and handles empty data', () => {
    const entries = Array.from({length:16}, (_, i) => ({ date:`2026-10-${String(i+1).padStart(2,'0')}`, steps:i+1 }));
    expect(getActivityMetricTrend(entries).entries).toHaveLength(14);
    expect(getActivityMetricTrend([]).average).toBeNull();
  });
});
