import * as Crypto from 'expo-crypto';
import type { Rng } from '@locklune/core';

/**
 * Cryptographically-secure random bytes from the device, injected into the
 * pure `@locklune/core` crypto so the core stays platform-agnostic.
 */
export const deviceRng: Rng = (length: number): Uint8Array => Crypto.getRandomBytes(length);
