import { describe, expect, it } from 'vitest';
import { FREE_ATTEMPTS, lockSecondsForAttempts, remainingLockSeconds } from './lockout.js';

describe('lockout policy', () => {
  it('allows the free attempts without any lock', () => {
    for (let i = 0; i <= FREE_ATTEMPTS; i++) {
      expect(lockSecondsForAttempts(i)).toBe(0);
    }
  });

  it('doubles the lock each failure past the allowance', () => {
    expect(lockSecondsForAttempts(FREE_ATTEMPTS + 1)).toBe(30);
    expect(lockSecondsForAttempts(FREE_ATTEMPTS + 2)).toBe(60);
    expect(lockSecondsForAttempts(FREE_ATTEMPTS + 3)).toBe(120);
  });

  it('caps the lock at one hour', () => {
    expect(lockSecondsForAttempts(FREE_ATTEMPTS + 50)).toBe(3600);
  });

  it('counts down remaining lock time', () => {
    const now = 1_000_000;
    // 6 failures => 30s lock; 10s elapsed => 20s remain
    expect(remainingLockSeconds(6, now - 10_000, now)).toBe(20);
    // fully elapsed
    expect(remainingLockSeconds(6, now - 40_000, now)).toBe(0);
    // within free allowance => never locked
    expect(remainingLockSeconds(3, now, now)).toBe(0);
  });
});
