# Encryption Compliance Document — Locklune

**Product:** Locklune — Private Period Tracker  
**Platform:** iOS, Android  
**Developer:** Josie Daw  
**Contact:** locklune@constantlearning.org  
**Document purpose:** US Bureau of Industry and Security (BIS) annual self-classification filing; Apple App Store export compliance declaration

---

## 1. Overview

Locklune is a privacy-first, offline period tracking application. All user data is stored exclusively on the user's device. No data is transmitted to any server, cloud service, or third party. The app contains no networking code.

Encryption is used solely to protect user data at rest on the device. It is not used for communications, authentication against a remote service, or any purpose other than local data protection.

---

## 2. Encryption Used

### 2.1 Database Encryption — SQLCipher (AES-256-CBC)

| Property | Detail |
|---|---|
| Library | SQLCipher (open-source, Zetetic LLC) |
| Algorithm | AES-256-CBC |
| Key length | 256 bits |
| Purpose | Encrypts the entire on-device SQLite database containing the user's cycle data |
| Key derivation | PBKDF2-HMAC-SHA512, 256,000 iterations, random 32-byte salt |
| Key source | Derived from a user-chosen numeric PIN; never transmitted or stored in recoverable form |
| IV / Nonce | Per-page random IV managed by SQLCipher |
| Data in scope | Period dates, flow, mood, symptoms, notes, cycle history |

### 2.2 Secure Storage — iOS Keychain / Android Keystore

| Property | Detail |
|---|---|
| Mechanism | expo-secure-store, backed by iOS Keychain (iOS) and Android Keystore (Android) |
| Purpose | Stores the encrypted data envelope key (DEK) and lockout state |
| Encryption | Managed by the OS hardware security module; developer does not implement the encryption directly |

### 2.3 Key Envelope

| Property | Detail |
|---|---|
| Implemented in | `packages/core/src/crypto/envelope.ts` |
| Algorithm | AES-256-GCM |
| Key length | 256 bits |
| Purpose | Wraps the database DEK for storage; the envelope is sealed with the PIN-derived key |
| Authentication tag | 128-bit GCM authentication tag provides integrity verification |

---

## 3. Encryption Classification

| Classification | Value |
|---|---|
| **ECCN** | 5D992.c (mass-market software with encryption) |
| **Exemption basis** | EAR 740.17(b)(1) — retail / mass-market encryption product |
| **Key length** | 256-bit symmetric (AES) |
| **Use case** | Data protection at rest only; no communications encryption |
| **Source code** | Publicly available (open-source, GitHub: https://github.com/JosDaw/locklune) |
| **Export restrictions** | None beyond standard EAR mass-market encryption requirements |

---

## 4. What Is NOT Used

- No SSL/TLS or HTTPS within the app (no network connections)
- No proprietary or classified encryption algorithms
- No encryption for authentication against any remote server
- No key escrow, key recovery, or backdoor mechanism
- No cloud key management

---

## 5. Data Flow Summary

```
User PIN
   │
   ▼
PBKDF2-HMAC-SHA512 (256,000 iterations + random salt)
   │
   ▼
256-bit Key Encryption Key (KEK)
   │
   ├──► Seals DEK via AES-256-GCM → stored in iOS Keychain / Android Keystore
   │
   └──► (at unlock) Unseals DEK
              │
              ▼
        256-bit Data Encryption Key (DEK)
              │
              ▼
        SQLCipher opens encrypted SQLite database (AES-256-CBC)
              │
              ▼
        All reads/writes to cycle data occur inside the encrypted database
        ── Nothing ever leaves the device ──
```

---

## 6. Apple App Store Declaration

`ITSAppUsesNonExemptEncryption` is set to `true` in `apps/mobile/app.json`.

The app uses AES-256 encryption (via SQLCipher) beyond Apple's standard exempt encryption. This has been declared to Apple as required under the Export Administration Regulations.

---

## 7. Annual BIS Self-Classification Filing

Locklune qualifies for annual self-classification under EAR 740.17(b)(1) as a mass-market encryption product. The filing should be submitted via the BIS SNAP-R system (https://snapr.bis.doc.gov) before **February 1** each year, covering the prior calendar year.

**Required fields for SNAP-R submission:**

| Field | Value |
|---|---|
| Product name | Locklune |
| Product version | See current `apps/mobile/app.json` → `version` |
| ECCN | 5D992.c |
| Encryption algorithms | AES-256-CBC (SQLCipher), AES-256-GCM (key envelope), PBKDF2-HMAC-SHA512 (key derivation) |
| Maximum key length | 256 bits |
| Publicly available source | Yes |
| Distributor | Apple App Store, Google Play |

---

## 8. References

- SQLCipher: https://www.zetetic.net/sqlcipher/
- EAR Part 740.17 (encryption exemptions): https://www.ecfr.gov/current/title-15/part-740
- BIS SNAP-R filing portal: https://snapr.bis.doc.gov
- Apple export compliance guidance: https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations
