import { MAX_PIN_ATTEMPTS } from '@locklune/core';
import { create } from 'zustand';
import { closeDb, deleteDb, openEncryptedDb } from '../lib/db';
import { cancelAllReminders } from '../lib/notifications';
import * as toast from '../lib/toast';
import {
  changeVaultPin,
  clearLegacyDestructPin,
  hasVault,
  initVault,
  unlockWithPin,
  wipeVault,
} from '../lib/vault';
import { useDataStore } from './dataStore';

/** The vault's lifecycle status, driving which screen the router shows. */
export const AUTH_STATUS = {
  Loading: 'loading',
  Onboarding: 'onboarding',
  Locked: 'locked',
  Unlocked: 'unlocked',
} as const;

type Status = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];

interface AuthState {
  status: Status;
  dekHex: string | null;
  /** Seconds remaining on an active brute-force lockout. */
  lockedForSeconds: number;
  /** PIN attempts left before the vault self-erases. */
  attemptsRemaining: number;

  init: () => Promise<void>;
  createPin: (pin: string) => Promise<void>;
  unlockPin: (pin: string) => Promise<boolean>;
  lock: () => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  wipe: () => Promise<void>;
}

async function afterUnlock(dekHex: string): Promise<void> {
  await openEncryptedDb(dekHex);
  await useDataStore.getState().load();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: AUTH_STATUS.Loading,
  dekHex: null,
  lockedForSeconds: 0,
  attemptsRemaining: MAX_PIN_ATTEMPTS,

  init: async () => {
    // One-time cleanup of any self-destruct PIN from an older build (feature removed).
    void clearLegacyDestructPin().catch(() => undefined);
    try {
      const exists = await hasVault();
      set({ status: exists ? AUTH_STATUS.Locked : AUTH_STATUS.Onboarding });
    } catch {
      // Keystore read failed - safest is to present the lock screen rather than
      // wrongly offering onboarding (which could overwrite an existing vault).
      toast.error('Could not read secure storage.');
      set({ status: AUTH_STATUS.Locked });
    }
  },

  createPin: async (pin) => {
    // Delete any stale DB from a previous failed onboarding so the new vault
    // and DB are always encrypted with the same key.
    await deleteDb().catch(() => undefined);
    const dekHex = await initVault(pin).catch((err: unknown) => {
      throw new Error(`vault:${err instanceof Error ? err.message : String(err)}`);
    });
    await afterUnlock(dekHex).catch((err: unknown) => {
      throw new Error(`db:${err instanceof Error ? err.message : String(err)}`);
    });
    set({
      status: AUTH_STATUS.Unlocked,
      dekHex,
      attemptsRemaining: MAX_PIN_ATTEMPTS,
      lockedForSeconds: 0,
    });
  },

  unlockPin: async (pin) => {
    const res = await unlockWithPin(pin);
    if (res.ok) {
      try {
        await afterUnlock(res.dekHex);
      } catch {
        // Correct PIN but DB is corrupt or key-mismatched - unrecoverable.
        // Wipe everything so the user can start fresh rather than being locked out.
        toast.error('Your data appears corrupted and has been reset. Sorry for the inconvenience.');
        await get().wipe();
        return false;
      }
      set({ status: AUTH_STATUS.Unlocked, dekHex: res.dekHex, lockedForSeconds: 0 });
      return true;
    }
    if (res.wiped) {
      // Too many wrong PINs - erase everything and return to onboarding.
      await get().wipe();
      return false;
    }
    set({ lockedForSeconds: res.lockedForSeconds, attemptsRemaining: res.attemptsRemaining });
    return false;
  },

  lock: async () => {
    await closeDb();
    useDataStore.getState().reset();
    set({ status: AUTH_STATUS.Locked, dekHex: null });
  },

  changePin: (oldPin, newPin) => changeVaultPin(oldPin, newPin),

  wipe: async () => {
    // Best-effort: attempt every step even if an earlier one fails, so we erase
    // as much as possible and always return to a clean onboarding state.
    let failed = false;
    for (const step of [cancelAllReminders, deleteDb, wipeVault]) {
      try {
        await step();
      } catch {
        failed = true;
      }
    }
    if (failed) toast.error('Some data could not be fully erased.');
    useDataStore.getState().reset();
    set({
      status: AUTH_STATUS.Onboarding,
      dekHex: null,
      attemptsRemaining: MAX_PIN_ATTEMPTS,
      lockedForSeconds: 0,
    });
  },
}));
