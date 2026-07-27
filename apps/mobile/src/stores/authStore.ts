import { create } from 'zustand';
import { FREE_ATTEMPTS } from '@locklune/core';
import { closeDb, deleteDb, openEncryptedDb } from '../lib/db';
import { cancelAllReminders } from '../lib/notifications';
import {
  changeVaultPin,
  disableBiometric as disableBio,
  enableBiometric as enableBio,
  hasVault,
  initVault,
  isBiometricEnabled,
  isBiometricSupported,
  unlockWithBiometric,
  unlockWithPin,
  wipeVault,
} from '../lib/vault';
import { useDataStore } from './dataStore';

type Status = 'loading' | 'onboarding' | 'locked' | 'unlocked';

interface AuthState {
  status: Status;
  dekHex: string | null;
  biometricSupported: boolean;
  biometricEnabled: boolean;
  /** Seconds remaining on an active brute-force lockout. */
  lockedForSeconds: number;
  /** PIN attempts left before throttling begins. */
  attemptsRemaining: number;

  init: () => Promise<void>;
  createPin: (pin: string) => Promise<void>;
  unlockPin: (pin: string) => Promise<boolean>;
  unlockBiometric: () => Promise<boolean>;
  lock: () => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  wipe: () => Promise<void>;
}

async function afterUnlock(dekHex: string): Promise<void> {
  await openEncryptedDb(dekHex);
  await useDataStore.getState().load();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  dekHex: null,
  biometricSupported: false,
  biometricEnabled: false,
  lockedForSeconds: 0,
  attemptsRemaining: FREE_ATTEMPTS,

  init: async () => {
    const [exists, bioSupported, bioEnabled] = await Promise.all([
      hasVault(),
      isBiometricSupported(),
      isBiometricEnabled(),
    ]);
    set({
      biometricSupported: bioSupported,
      biometricEnabled: bioEnabled && bioSupported,
      status: exists ? 'locked' : 'onboarding',
    });
  },

  createPin: async (pin) => {
    const dekHex = await initVault(pin);
    await afterUnlock(dekHex);
    set({ status: 'unlocked', dekHex, attemptsRemaining: FREE_ATTEMPTS, lockedForSeconds: 0 });
  },

  unlockPin: async (pin) => {
    const res = await unlockWithPin(pin);
    if (res.ok) {
      await afterUnlock(res.dekHex);
      set({ status: 'unlocked', dekHex: res.dekHex, lockedForSeconds: 0 });
      return true;
    }
    set({ lockedForSeconds: res.lockedForSeconds, attemptsRemaining: res.attemptsRemaining });
    return false;
  },

  unlockBiometric: async () => {
    const dekHex = await unlockWithBiometric();
    if (!dekHex) return false;
    await afterUnlock(dekHex);
    set({ status: 'unlocked', dekHex, lockedForSeconds: 0 });
    return true;
  },

  lock: async () => {
    await closeDb();
    useDataStore.getState().reset();
    set({ status: 'locked', dekHex: null });
  },

  changePin: (oldPin, newPin) => changeVaultPin(oldPin, newPin),

  enableBiometric: async () => {
    const dekHex = get().dekHex;
    if (!dekHex) return false;
    await enableBio(dekHex);
    set({ biometricEnabled: true });
    return true;
  },

  disableBiometric: async () => {
    await disableBio();
    set({ biometricEnabled: false });
  },

  wipe: async () => {
    await cancelAllReminders();
    await deleteDb();
    await wipeVault();
    useDataStore.getState().reset();
    set({
      status: 'onboarding',
      dekHex: null,
      biometricEnabled: false,
      attemptsRemaining: FREE_ATTEMPTS,
      lockedForSeconds: 0,
    });
  },
}));
