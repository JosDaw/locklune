/**
 * Device-side vault: binds the pure crypto envelope from `@locklune/core` to the
 * OS keystore (expo-secure-store) and biometric hardware (expo-local-authentication).
 *
 * Nothing here ever leaves the device. The vault descriptor is stored in the
 * hardware-backed keystore and is useless without the PIN. Biometric unlock keeps
 * a second copy of the raw key behind an OS authentication gate.
 */
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import {
  changePin as changePinCore,
  createVault,
  dekToHex,
  FREE_ATTEMPTS,
  openVault,
  remainingLockSeconds,
  VaultAuthError,
  type VaultMeta,
} from '@locklune/core';
import { deviceRng } from './rng';

const META_KEY = 'locklune.vault.v1';
const BIO_KEY = 'locklune.vault.bioKey.v1';
const BIO_FLAG_KEY = 'locklune.vault.bioEnabled.v1';
const ATTEMPTS_KEY = 'locklune.vault.attempts.v1';

/** Keep secrets device-local (never synced to iCloud Keychain / cloud backup). */
const secureOpts: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

interface AttemptState {
  count: number;
  lastFailedAt: number;
}

async function loadAttempts(): Promise<AttemptState> {
  const raw = await SecureStore.getItemAsync(ATTEMPTS_KEY, secureOpts);
  if (!raw) return { count: 0, lastFailedAt: 0 };
  try {
    return JSON.parse(raw) as AttemptState;
  } catch {
    return { count: 0, lastFailedAt: 0 };
  }
}

async function saveAttempts(state: AttemptState): Promise<void> {
  await SecureStore.setItemAsync(ATTEMPTS_KEY, JSON.stringify(state), secureOpts);
}

async function resetAttempts(): Promise<void> {
  await SecureStore.deleteItemAsync(ATTEMPTS_KEY, secureOpts);
}

async function loadMeta(): Promise<VaultMeta | null> {
  const raw = await SecureStore.getItemAsync(META_KEY, secureOpts);
  return raw ? (JSON.parse(raw) as VaultMeta) : null;
}

/** Whether a PIN/vault has already been created on this device. */
export async function hasVault(): Promise<boolean> {
  return (await SecureStore.getItemAsync(META_KEY, secureOpts)) !== null;
}

/** Create a brand-new vault for a first-time PIN. Returns the DB key (hex). */
export async function initVault(pin: string): Promise<string> {
  const { meta, dek } = createVault(pin, { rng: deviceRng });
  await SecureStore.setItemAsync(META_KEY, JSON.stringify(meta), secureOpts);
  await resetAttempts();
  return dekToHex(dek);
}

export type UnlockResult =
  | { ok: true; dekHex: string }
  | { ok: false; lockedForSeconds: number; attemptsRemaining: number };

/** How long (seconds) the user must currently wait before trying a PIN. */
export async function currentLockSeconds(): Promise<number> {
  const s = await loadAttempts();
  return remainingLockSeconds(s.count, s.lastFailedAt, Date.now());
}

/** Attempt to unlock with a PIN, applying brute-force throttling. */
export async function unlockWithPin(pin: string): Promise<UnlockResult> {
  const meta = await loadMeta();
  if (!meta) throw new Error('No vault exists');

  const state = await loadAttempts();
  const waiting = remainingLockSeconds(state.count, state.lastFailedAt, Date.now());
  if (waiting > 0) return { ok: false, lockedForSeconds: waiting, attemptsRemaining: 0 };

  try {
    const dek = openVault(pin, meta);
    await resetAttempts();
    return { ok: true, dekHex: dekToHex(dek) };
  } catch (err) {
    if (err instanceof VaultAuthError) {
      const count = state.count + 1;
      const now = Date.now();
      await saveAttempts({ count, lastFailedAt: now });
      return {
        ok: false,
        lockedForSeconds: remainingLockSeconds(count, now, now),
        attemptsRemaining: Math.max(0, FREE_ATTEMPTS - count),
      };
    }
    throw err;
  }
}

/** Re-wrap the DEK under a new PIN. Returns false if the old PIN is wrong. */
export async function changeVaultPin(oldPin: string, newPin: string): Promise<boolean> {
  const meta = await loadMeta();
  if (!meta) throw new Error('No vault exists');
  try {
    const next = changePinCore(oldPin, newPin, meta, { rng: deviceRng });
    await SecureStore.setItemAsync(META_KEY, JSON.stringify(next), secureOpts);
    await resetAttempts();
    return true;
  } catch (err) {
    if (err instanceof VaultAuthError) return false;
    throw err;
  }
}

// --- Biometric unlock -------------------------------------------------------

export async function isBiometricSupported(): Promise<boolean> {
  const [hasHardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hasHardware && enrolled;
}

export async function isBiometricEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(BIO_FLAG_KEY, secureOpts)) === '1';
}

/** Store the DEK behind an OS authentication gate (Face ID / fingerprint / passcode). */
export async function enableBiometric(dekHex: string): Promise<void> {
  await SecureStore.setItemAsync(BIO_KEY, dekHex, {
    ...secureOpts,
    requireAuthentication: true,
  });
  await SecureStore.setItemAsync(BIO_FLAG_KEY, '1', secureOpts);
}

export async function disableBiometric(): Promise<void> {
  await SecureStore.deleteItemAsync(BIO_KEY, secureOpts);
  await SecureStore.deleteItemAsync(BIO_FLAG_KEY, secureOpts);
}

/** Unlock via biometrics. Returns the DB key, or null if authentication failed. */
export async function unlockWithBiometric(): Promise<string | null> {
  try {
    const dekHex = await SecureStore.getItemAsync(BIO_KEY, {
      ...secureOpts,
      requireAuthentication: true,
      authenticationPrompt: 'Unlock Locklune',
    });
    return dekHex ?? null;
  } catch {
    return null;
  }
}

/** Irreversibly delete the vault and all key material. The DB file is removed separately. */
export async function wipeVault(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(META_KEY, secureOpts),
    SecureStore.deleteItemAsync(BIO_KEY, secureOpts),
    SecureStore.deleteItemAsync(BIO_FLAG_KEY, secureOpts),
    SecureStore.deleteItemAsync(ATTEMPTS_KEY, secureOpts),
  ]);
}
