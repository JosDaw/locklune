# Locklune

**A 100% on-device, encrypted, zero-tracking period tracker** — plus its privacy/marketing site, in one monorepo.

_"lock" (privacy/security) + "lune" (moon/cycle)._

Locklune keeps everything on your phone: no account, no cloud, no analytics, no network code at all. The only credential is a PIN, which derives the key that encrypts your data. It logs periods and symptoms and predicts upcoming periods, fertile windows and ovulation with an adaptive, on-device model.

> **Important:** Predictions are estimates for awareness only — **not** medical or contraceptive advice. Because data is encrypted with your PIN and never leaves the device, **a forgotten PIN means the data is unrecoverable** (by design).

## Monorepo layout

```
locklune/
├─ packages/core   # Pure TS: prediction engine + crypto envelope + types (Vitest-tested)
├─ apps/mobile     # Expo (SDK 57) app: expo-router, NativeWind, SQLCipher, secure-store, biometrics
└─ apps/web        # Next.js static site: landing + privacy policy (no tracking)
```

Tooling: npm workspaces + Turborepo, shared `tsconfig.base.json`, Prettier.

## Security architecture

Envelope encryption bound to the PIN, with hardware-backed storage:

1. A random 256-bit **DEK** encrypts the whole SQLite database via **SQLCipher** (AES-256).
2. The DEK is wrapped by a **KEK** derived from the PIN with **scrypt** (`@noble/hashes`), sealed with AES-256-GCM (`@noble/ciphers`).
3. Only `{salt, nonce, wrappedDEK}` is stored, in the OS keystore (`expo-secure-store`, device-only).
4. Unlock = PIN → KEK → unwrap DEK → open DB. A wrong PIN fails GCM authentication (with lockout/backoff).
5. Optional biometric unlock keeps a second copy of the DEK behind an OS auth gate. Auto-lock clears the key on background.

The pure crypto + prediction logic lives in `packages/core` and is unit-tested (`packages/core/src/*.test.ts`).

## Prerequisites

- Node ≥ 22.11
- For the mobile app on a device/simulator: Xcode (iOS) and/or Android Studio. **SQLCipher requires a dev/prebuild build — the app does not run in Expo Go.**

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

## License

Private / all rights reserved (update as needed).
