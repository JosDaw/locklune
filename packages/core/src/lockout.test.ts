import { describe, expect, it } from 'vitest';
import {
  attemptsRemaining,
  lockSecondsForAttempts,
  MAX_PIN_ATTEMPTS,
  remainingLockSeconds,
  shouldWipe,
} from './lockout.js';

describe('lockout policy', () => {
  it('counts down remaining attempts before erase', () => {
    expect(attemptsRemaining(0)).toBe(MAX_PIN_ATTEMPTS);
    expect(attemptsRemaining(4)).toBe(1);
    expect(attemptsRemaining(5)).toBe(0);
    expect(attemptsRemaining(6)).toBe(0);
  });

  it('wipes only after more than the allowed attempts', () => {
    for (let i = 0; i <= MAX_PIN_ATTEMPTS; i++) expect(shouldWipe(i)).toBe(false);
    expect(shouldWipe(MAX_PIN_ATTEMPTS + 1)).toBe(true);
  });

  it('escalates the delay as failures mount', () => {
    expect(lockSecondsForAttempts(0)).toBe(0);
    expect(lockSecondsForAttempts(2)).toBe(0);
    expect(lockSecondsForAttempts(3)).toBe(5);
    expect(lockSecondsForAttempts(4)).toBe(15);
    expect(lockSecondsForAttempts(5)).toBe(60);
  });

  it('counts down remaining lock time', () => {
    const now = 1_000_000;
    // 5 failures => 60s lock; 20s elapsed => 40s remain
    expect(remainingLockSeconds(5, now - 20_000, now)).toBe(40);
    expect(remainingLockSeconds(5, now - 61_000, now)).toBe(0);
    // within the first attempts => never locked
    expect(remainingLockSeconds(2, now, now)).toBe(0);
  });
});
