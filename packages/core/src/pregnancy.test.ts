import { describe, expect, it } from 'vitest';
import {
  dueDayFromWeeksAlong,
  estimateDueDay,
  GESTATION_DAYS,
  pregnancyProgress,
} from './pregnancy.js';

describe('pregnancy', () => {
  it('estimates a due date 280 days after the last period', () => {
    expect(estimateDueDay(1000)).toBe(1280);
  });

  it('computes progress and trimester from a due date', () => {
    const due = 1280;
    const lmp = due - GESTATION_DAYS;
    expect(pregnancyProgress(due, lmp)).toMatchObject({
      week: 0,
      daysPregnant: 0,
      trimester: 1,
      daysRemaining: 280,
    });
    const t2 = pregnancyProgress(due, lmp + 98); // 14 weeks
    expect(t2.week).toBe(14);
    expect(t2.trimester).toBe(2);
    expect(t2.daysRemaining).toBe(280 - 98);
    expect(pregnancyProgress(due, lmp + 196).trimester).toBe(3); // 28 weeks
  });

  it('derives a due date from weeks along', () => {
    const today = 5000;
    const due = dueDayFromWeeksAlong(10, today);
    expect(due).toBe(today - 70 + GESTATION_DAYS);
    expect(pregnancyProgress(due, today).week).toBe(10);
  });
});
