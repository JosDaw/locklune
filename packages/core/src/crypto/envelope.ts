import { gcm } from '@noble/ciphers/aes';
import { scrypt } from '@noble/hashes/scrypt';
import { bytesToHex, hexToBytes, randomBytes, utf8ToBytes } from '@noble/hashes/utils';

/**
 * Envelope encryption for Locklune.
 *
 * The database is encrypted (by SQLCipher) with a random 256-bit **Data
 * Encryption Key (DEK)**. The DEK is never stored in the clear: it is wrapped
 * with a **Key Encryption Key (KEK)** derived from the user's PIN via scrypt,
 * and only the wrapped form + salt + nonce is persisted (in the OS keystore via
 * expo-secure-store on device). Unlocking = PIN → KEK → unwrap DEK.
 *
 * Properties:
 *  - Data is cryptographically bound to the PIN (no PIN ⇒ no DEK ⇒ no data).
 *  - A wrong PIN fails AES-GCM authentication, so it is detectable without ever
 *    comparing/storing the PIN itself.
 *  - Changing the PIN only re-wraps the DEK — the database is never re-encrypted.
 *
 * This module is pure and has no device dependencies; randomness is injectable
 * so it is fully deterministic under test.
 */

/** scrypt parameters. Stored with the vault so they can be tuned over time. */
export interface KdfParams {
  algo: 'scrypt';
  /** CPU/memory cost (power of two). */
  N: number;
  r: number;
  p: number;
  /** Derived key length in bytes. */
  dkLen: number;
}

export const DEFAULT_KDF: KdfParams = { algo: 'scrypt', N: 2 ** 14, r: 8, p: 1, dkLen: 32 };

const SALT_BYTES = 16;
const NONCE_BYTES = 12;
const DEK_BYTES = 32;
const VAULT_VERSION = 1;

/**
 * The persisted, non-secret vault descriptor. Safe to store in secure-store;
 * useless without the PIN. All binary fields are hex strings for portability.
 */
export interface VaultMeta {
  v: number;
  kdf: KdfParams;
  /** scrypt salt. */
  salt: string;
  /** AES-GCM nonce used to wrap the DEK. */
  nonce: string;
  /** AES-256-GCM(KEK, DEK) — ciphertext with appended auth tag. */
  wrappedDek: string;
}

/** Thrown when a PIN fails to unwrap the DEK (wrong PIN or tampered vault). */
export class VaultAuthError extends Error {
  constructor(message = 'Incorrect PIN') {
    super(message);
    this.name = 'VaultAuthError';
  }
}

/** Source of secure random bytes; overridable for tests / device RNG. */
export type Rng = (length: number) => Uint8Array;

const defaultRng: Rng = (length) => randomBytes(length);

function deriveKek(pin: string, salt: Uint8Array, params: KdfParams): Uint8Array {
  return scrypt(utf8ToBytes(pin), salt, {
    N: params.N,
    r: params.r,
    p: params.p,
    dkLen: params.dkLen,
  });
}

/**
 * Create a brand-new vault for a first-time PIN.
 * Returns the persistable {@link VaultMeta} and the raw DEK (to open the DB now).
 */
export function createVault(
  pin: string,
  opts: { params?: KdfParams; rng?: Rng } = {},
): { meta: VaultMeta; dek: Uint8Array } {
  const params = opts.params ?? DEFAULT_KDF;
  const rng = opts.rng ?? defaultRng;

  const salt = rng(SALT_BYTES);
  const dek = rng(DEK_BYTES);
  const nonce = rng(NONCE_BYTES);

  const kek = deriveKek(pin, salt, params);
  const wrappedDek = gcm(kek, nonce).encrypt(dek);

  return {
    meta: {
      v: VAULT_VERSION,
      kdf: params,
      salt: bytesToHex(salt),
      nonce: bytesToHex(nonce),
      wrappedDek: bytesToHex(wrappedDek),
    },
    dek,
  };
}

/**
 * Unlock an existing vault with a PIN, returning the raw DEK.
 * @throws {VaultAuthError} if the PIN is incorrect.
 */
export function openVault(pin: string, meta: VaultMeta): Uint8Array {
  const kek = deriveKek(pin, hexToBytes(meta.salt), meta.kdf);
  try {
    return gcm(kek, hexToBytes(meta.nonce)).decrypt(hexToBytes(meta.wrappedDek));
  } catch {
    throw new VaultAuthError();
  }
}

/**
 * Re-wrap the existing DEK under a new PIN (fresh salt + nonce). The DEK — and
 * therefore the encrypted database — is unchanged, so no data is re-encrypted.
 * @throws {VaultAuthError} if `oldPin` is incorrect.
 */
export function changePin(
  oldPin: string,
  newPin: string,
  meta: VaultMeta,
  opts: { params?: KdfParams; rng?: Rng } = {},
): VaultMeta {
  const dek = openVault(oldPin, meta);
  const params = opts.params ?? meta.kdf;
  const rng = opts.rng ?? defaultRng;

  const salt = rng(SALT_BYTES);
  const nonce = rng(NONCE_BYTES);
  const kek = deriveKek(newPin, salt, params);
  const wrappedDek = gcm(kek, nonce).encrypt(dek);

  return {
    v: VAULT_VERSION,
    kdf: params,
    salt: bytesToHex(salt),
    nonce: bytesToHex(nonce),
    wrappedDek: bytesToHex(wrappedDek),
  };
}

/** Hex form of the DEK for SQLCipher: `PRAGMA key = "x'<hex>'"`. */
export function dekToHex(dek: Uint8Array): string {
  return bytesToHex(dek);
}
