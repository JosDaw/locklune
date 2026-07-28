import { create } from 'zustand';
import { MAX_PIN_ATTEMPTS } from '@locklune/core';
import { closeDb, deleteDb, openEncryptedDb } from '../lib/db';
import { cancelAllReminders } from '../lib/notifications';
import * as toast from '../lib/toast';
import { changeVaultPin, checkDestructPin, hasVault, initVault, unlockWithPin, wipeVault } from '../lib/vault';
import { useDataStore } from './dataStore';

type Status = 'loading' | 'onboarding' | 'locked' | 'unlocked';

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
  status: 'loading',
  dekHex: null,
  lockedForSeconds: 0,
  attemptsRemaining: MAX_PIN_ATTEMPTS,

  init: async () => {
    try {
      const exists = await hasVault();
      set({ status: exists ? 'locked' : 'onboarding' });
    } catch {
      // Keystore read failed — safest is to present the lock screen rather than
      // wrongly offering onboarding (which could overwrite an existing vault).
      toast.error('Could not read secure storage.');
      set({ status: 'locked' });
    }
  },

  createPin: async (pin) => {
    const dekHex = await initVault(pin);
    await afterUnlock(dekHex);
    set({ status: 'unlocked', dekHex, attemptsRemaining: MAX_PIN_ATTEMPTS, lockedForSeconds: 0 });
  },

  unlockPin: async (pin) => {
    const res = await unlockWithPin(pin);
    if (res.ok) {
      try {
        await afterUnlock(res.dekHex);
      } catch {
        // Correct PIN, but the database could not be opened (e.g. corrupt file).
        toast.error('Unlocked, but your data could not be opened.');
        await closeDb().catch(() => undefined);
        set({ dekHex: null });
        return false;
      }
      set({ status: 'unlocked', dekHex: res.dekHex, lockedForSeconds: 0 });
      return true;
    }
    if (res.wiped) {
      // Too many wrong PINs — erase everything and return to onboarding.
      await get().wipe();
      return false;
    }
    // Wrong PIN — check for the self-destruct PIN before recording the failed attempt.
    if (await checkDestructPin(pin)) {
      await get().wipe();
      return false;
    }
    set({ lockedForSeconds: res.lockedForSeconds, attemptsRemaining: res.attemptsRemaining });
    return false;
  },

  lock: async () => {
    await closeDb();
    useDataStore.getState().reset();
    set({ status: 'locked', dekHex: null });
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
      status: 'onboarding',
      dekHex: null,
      attemptsRemaining: MAX_PIN_ATTEMPTS,
      lockedForSeconds: 0,
    });
  },
}));
