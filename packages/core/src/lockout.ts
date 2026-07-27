/**
 * Pure PIN brute-force policy. Persisted state (attempt count + timestamp) lives
 * on the device; this module decides the delay and when to erase everything.
 *
 * The device allows {@link MAX_PIN_ATTEMPTS} wrong attempts (with escalating
 * delays); any further wrong attempt wipes all data.
 */

/** Wrong attempts allowed before the vault self-erases. */
export const MAX_PIN_ATTEMPTS = 5;

/** Wrong attempts left before an erase. */
export function attemptsRemaining(failedAttempts: number): number {
  return Math.max(0, MAX_PIN_ATTEMPTS - failedAttempts);
}

/** Whether this many consecutive failures should trigger a full data wipe. */
export function shouldWipe(failedAttempts: number): boolean {
  return failedAttempts > MAX_PIN_ATTEMPTS;
}

/**
 * Seconds the user must wait before the next attempt, escalating as failures
 * mount so brute-forcing is slow and there is a pause before the final wipe.
 */
export function lockSecondsForAttempts(failedAttempts: number): number {
  if (failedAttempts >= 5) return 60;
  if (failedAttempts === 4) return 15;
  if (failedAttempts === 3) return 5;
  return 0;
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
