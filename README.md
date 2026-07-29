# Locklune

**A 100% on-device, encrypted, zero-tracking period tracker** - plus its basic landing website, in one monorepo.

_"lock" (privacy/security) + "lune" (moon/cycle)._

Locklune keeps everything on your phone: no account, no cloud, no analytics, no network code at all. The only credential is a PIN, which derives the key that encrypts your data. It logs periods and symptoms and predicts upcoming periods, fertile windows and ovulation with an adaptive, on-device model.

> **Important:** Predictions are estimates for awareness only - **not** medical or contraceptive advice. Because data is encrypted with your PIN and never leaves the device, **a forgotten PIN means the data is unrecoverable** (by design).

## Monorepo layout

```
locklune/
├─ packages/core   # Pure TS: prediction engine + crypto envelope + types (Vitest-tested)
├─ apps/mobile     # Expo (SDK 57) app: expo-router, gluestack-ui/NativeWind, SQLCipher, secure-store
└─ apps/web        # Next.js static site: landing + privacy policy (no tracking)
```

Tooling: npm workspaces + Turborepo, shared `tsconfig.base.json`, Prettier.

## Security architecture

Envelope encryption bound to the PIN, with hardware-backed storage:

1. A random 256-bit **DEK** encrypts the whole SQLite database via **SQLCipher** (AES-256).
2. The DEK is wrapped by a **KEK** derived from the PIN with **scrypt** (`@noble/hashes`), sealed with AES-256-GCM (`@noble/ciphers`).
3. Only `{salt, nonce, wrappedDEK}` is stored, in the OS keystore (`expo-secure-store`, device-only).
4. Unlock = PIN → KEK → unwrap DEK → open DB. A wrong PIN fails GCM authentication (with lockout/backoff).
5. Auto-lock clears the key from memory on background; after 5 wrong PINs the vault self-erases.

The pure crypto + prediction logic lives in `packages/core` and is unit-tested (`packages/core/src/*.test.ts`).

## Verifying the security claims

This repository is public specifically so the claims above can be checked, not
taken on trust. A few ways to audit them:

- **No network / no tracking.** The mobile app ships zero networking or analytics
  code. Confirm it yourself:

  ```bash
  # returns nothing: no HTTP client, sockets, or analytics SDKs in the app
  git grep -nE "fetch\(|XMLHttpRequest|new WebSocket|\baxios\b|Amplitude|Sentry|mixpanel|sendBeacon|firebase|googleapis" -- apps/mobile/src
  ```

  There is no account, sync, or backend for the app. The only outbound URL in the
  app is a user-tapped "support the developer" link opened in the system browser
  (`apps/mobile/src/lib/links.ts`) - the app itself never sends your data anywhere. All other links go to <https://locklune.com>, which is static and contains no tracking.

  This covers the app's own code. Locklune relies on a small set of audited native
  modules (`expo-secure-store`, `expo-sqlite`/SQLCipher, `expo-notifications`), each
  open source and independently reviewable; notifications are scheduled locally by
  the OS with no push service.

- **Encryption model.** Read the envelope implementation and its tests:
  `packages/core/src/crypto/envelope.ts` (scrypt → AES-256-GCM key wrapping) and
  `packages/core/src/crypto/*.test.ts`. Run them locally:

  ```bash
  npm run test
  ```

- **Build and run it.** Nothing is minified or hidden - build the app from this
  source (see below) and observe the behaviour on-device.

Found something concerning? See [`SECURITY.md`](SECURITY.md).

## License

Locklune is **source-available, not open source**. The code is published so the
privacy and security claims can be independently verified - see
[Verifying the security claims](#verifying-the-security-claims). Viewing and
auditing is permitted; use, copying, modification, and redistribution are not.
See [`LICENSE`](LICENSE) for the full terms, and [`SECURITY.md`](SECURITY.md) to
report a vulnerability.

## Contributing

This is a source-available project published for audit, not open source, so
external code contributions (pull requests, forks for reuse) are **not accepted**
and cannot be merged under the license. What is welcome:

- **Security or privacy findings** - report them privately per [`SECURITY.md`](SECURITY.md).
- **Correctness/audit observations** - open a GitHub issue describing what you found.

Forking is permitted only to build and run the code locally to verify its behaviour.

## Prerequisites

- Node ≥ 22.11
- For the mobile app on a device/simulator: Xcode (iOS) and/or Android Studio. **SQLCipher requires a dev/prebuild build - the app does not run in Expo Go.**

## Commands

From the repo root:

```bash
npm install          # install all workspaces
npm run test         # Vitest (packages/core) via Turbo
npm run typecheck    # tsc across all workspaces
npm run build        # build core (tsc) + web (static export)
npm run format       # Prettier
```

### Mobile (`apps/mobile`)

```bash
cd apps/mobile
npx expo prebuild                 # generate native projects (needed for SQLCipher)
npm run ios                       # or: npm run android  (device/simulator build)
# after the first native build you can iterate with:
npm run dev:client
```

### Web (`apps/web`)

```bash
cd apps/web
npm run dev          # local dev at http://localhost:3000
npm run build        # static export to apps/web/out/
```

## UI: gluestack-ui v2 + NativeWind

The mobile UI uses **gluestack-ui v2** on **NativeWind v4 / Tailwind v3**. The app is wrapped in `GluestackUIProvider` (`src/app/_layout.tsx`), and the gluestack components live (vendored) in `apps/mobile/src/components/gs/`. The app's own primitives in `src/components/ui/` (`Button`, `Card`, `Screen`, `Txt`) wrap gluestack and apply the Locklune theme, so screens import stable primitives while rendering through gluestack. `Switch` and `Textarea` are used directly from gluestack.

Vendored gluestack files are marked `// @ts-nocheck` (generated code, not written for strict TS) but are transpiled/bundled normally.

**Adding more gluestack components:** the gluestack CLI can't run inside an npm workspace / headless shell, so copy the component folder from the gluestack repo (branch `feat/nativewind-4.1-support`, path `example/storybook-nativewind/src/core-components/nativewind/<component>`) into `src/components/gs/<component>`, prepend `// @ts-nocheck`, and add its dependency listed in that folder's `dependencies.json`.

## Prod builds

From `apps/mobile/`:

```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production

# both at once
eas build --platform all --profile production
```
