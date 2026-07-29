# Security Policy

Locklune is a privacy-first, fully on-device period tracker. This repository is
published so that its privacy and security claims can be independently verified.
See [Verifying the security claims](README.md#verifying-the-security-claims) in
the README for how to audit the code yourself.

## Reporting a vulnerability

If you believe you have found a security or privacy issue, please report it
**privately** rather than opening a public issue:

- Email: **<locklune@constatnlearning.org>**

Please include a description, steps to reproduce, and the affected version
(`apps/mobile/app.json` → `expo.version`). We aim to acknowledge reports
promptly and will keep you updated through to a fix.

Please do not publicly disclose the issue until it has been addressed.

## Design guarantees (what the code should uphold)

- The mobile app contains **no networking, analytics, or telemetry** code - no
  data ever leaves the device, and there is no account or cloud component.
- All user data lives in a **SQLCipher (AES-256)** database whose key is derived
  from the user's PIN: `scrypt` derives a key-encryption key that unwraps the
  database key via `AES-256-GCM`. Only `{salt, nonce, wrappedDEK}` is persisted,
  in the OS keystore (`expo-secure-store`, device-only).
- A wrong PIN fails GCM authentication; after repeated failures the vault
  self-erases. The key is cleared from memory when the app is backgrounded.

The cryptographic and prediction logic lives in `packages/core` and is
unit-tested (`packages/core/src/**/*.test.ts`).
