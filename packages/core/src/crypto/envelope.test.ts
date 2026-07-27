import { describe, expect, it } from 'vitest';
import {
  changePin,
  createVault,
  dekToHex,
  openVault,
  VaultAuthError,
  type KdfParams,
  type Rng,
} from './envelope.js';

/** Deterministic, distinct-per-call RNG so salt/dek/nonce differ but tests are stable. */
function seededRng(): Rng {
  let seed = 1;
  return (length: number) => {
    const out = new Uint8Array(length);
    for (let i = 0; i < length; i++) out[i] = (seed * 31 + i * 7) & 0xff;
    seed++;
    return out;
  };
}

// Cheap scrypt params keep the suite fast; production uses DEFAULT_KDF.
const fastParams: KdfParams = { algo: 'scrypt', N: 2 ** 8, r: 8, p: 1, dkLen: 32 };

describe('crypto envelope', () => {
  it('unwraps the DEK with the correct PIN', () => {
    const { meta, dek } = createVault('1234', { params: fastParams, rng: seededRng() });
    const opened = openVault('1234', meta);
    expect(dekToHex(opened)).toBe(dekToHex(dek));
    expect(dek).toHaveLength(32);
  });

  it('rejects an incorrect PIN with VaultAuthError', () => {
    const { meta } = createVault('1234', { params: fastParams, rng: seededRng() });
    expect(() => openVault('0000', meta)).toThrow(VaultAuthError);
  });

  it('never stores the DEK or PIN in the clear', () => {
    const { meta, dek } = createVault('987654', { params: fastParams, rng: seededRng() });
    const serialized = JSON.stringify(meta);
    expect(serialized).not.toContain(dekToHex(dek));
    expect(serialized).not.toContain('987654');
  });

  it('changePin re-wraps the same DEK (no DB re-encryption)', () => {
    const rng = seededRng(); // one continuous stream, as on a real device
    const { meta, dek } = createVault('1234', { params: fastParams, rng });
    const rotated = changePin('1234', '5678', meta, { rng });

    // old PIN no longer works, new PIN yields the SAME dek
    expect(() => openVault('1234', rotated)).toThrow(VaultAuthError);
    const opened = openVault('5678', rotated);
    expect(dekToHex(opened)).toBe(dekToHex(dek));
    // the wrapping actually changed
    expect(rotated.wrappedDek).not.toBe(meta.wrappedDek);
    expect(rotated.salt).not.toBe(meta.salt);
  });

  it('changePin fails when the old PIN is wrong', () => {
    const { meta } = createVault('1234', { params: fastParams, rng: seededRng() });
    expect(() => changePin('9999', '5678', meta, { rng: seededRng() })).toThrow(VaultAuthError);
  });

  it('produces a 64-char hex key suitable for SQLCipher', () => {
    const { dek } = createVault('1234', { params: fastParams, rng: seededRng() });
    expect(dekToHex(dek)).toMatch(/^[0-9a-f]{64}$/);
  });
});
