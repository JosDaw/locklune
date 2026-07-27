/**
 * Pure brute-force throttling policy for PIN entry. The persisted state (attempt
 * count + timestamp) lives on the device; this module just decides the delay.
 */

/** Wrong attempts allowed before any lockout begins. */
export const FREE_ATTEMPTS = 5;
/** Base lockout once throttling kicks in. */
const BASE_LOCK_SECONDS = 30;
/** Cap so a determined mistyper isn't locked out forever. */
const MAX_LOCK_SECONDS = 60 * 60; // 1 hour

/**
 * Seconds the user must wait before the next attempt, given how many
 * consecutive failures have occurred. Doubles each failure past the free
 * allowance, capped at {@link MAX_LOCK_SECONDS}.
 */
export function lockSecondsForAttempts(failedAttempts: number): number {
  const over = failedAttempts - FREE_ATTEMPTS;
  if (over <= 0) return 0;
  const seconds = BASE_LOCK_SECONDS * 2 ** (over - 1);
  return Math.min(seconds, MAX_LOCK_SECONDS);
}

/**
 * Remaining seconds of an active lockout, or 0 if the user may try now.
 * @param failedAttempts consecutive failures so far
 * @param lastFailedAtMs epoch ms of the most recent failure
 * @param nowMs current epoch ms
 */
export function remainingLockSeconds(
  failedAttempts: number,
  lastFailedAtMs: number,
  nowMs: number,
): number {
  const lock = lockSecondsForAttempts(failedAttempts);
  if (lock === 0) return 0;
  const elapsed = (nowMs - lastFailedAtMs) / 1000;
  return Math.max(0, Math.ceil(lock - elapsed));
}
