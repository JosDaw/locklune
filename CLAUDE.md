# CLAUDE.md — Locklune

Privacy-first, **offline**, encrypted period tracker (Expo) + its static privacy site (Next.js), in a Turborepo monorepo.

## Non-negotiable constraints

- **No network in the app, ever.** The mobile app must contain zero networking/analytics/telemetry code. Privacy is the whole product. Do not add any SDK that phones home.
- **Data is bound to the PIN.** No recovery path exists by design; don't add "reset PIN" that bypasses re-deriving the key. Encrypted backup/export is a deferred, opt-in feature (not implemented yet).
- **SQLCipher needs a native build.** The app cannot run in Expo Go; use `expo prebuild` + dev client / EAS.

## Layout & where things live

- `packages/core` — **pure TS, no React Native.** Prediction engine (`prediction.ts`), crypto envelope (`crypto/envelope.ts`), epoch-day date utils (`dates.ts`), lockout policy (`lockout.ts`), domain types (`types.ts`), brand (`brand.ts`). Unit-tested with **Vitest** (`*.test.ts`). Consumed by the app via its **compiled `dist/`** (run `npm run build` in core after changing it).
- `apps/mobile` — Expo SDK 57, `expo-router` (routes in `src/app`), **NativeWind v4** styling (`tailwind.config.js`, `src/global.css`). Key modules: `src/lib/vault.ts` (secure-store + core crypto + biometrics + lockout), `src/lib/db.ts` (SQLCipher), `src/lib/notifications.ts`, Zustand stores in `src/stores/`, UI primitives in `src/components/ui/`.
- `apps/web` — Next.js App Router, **static export** (`output: 'export'`), Tailwind, **system fonts / no external requests**, no analytics/cookies. Brand mirrored in `apps/web/lib/site.ts` (kept dependency-free — do NOT import `@locklune/core` here, to avoid pulling crypto into the site).

## Commands

Root (Turbo): `npm run test` · `npm run typecheck` · `npm run build` · `npm run format`.
Core: `npm run build` emits `dist/` (the app imports this). Vitest tests run against `src/`.
Mobile: `npm run typecheck`; `npx expo prebuild` then `npm run ios|android`.
Web: `npm run dev` / `npm run build` (exports to `apps/web/out/`).

## Conventions

- Dates are **integer epoch-days** everywhere; convert to `Date` only at the UI boundary via `dates.ts`.
- Storage is compact: one row per cycle; day-logs are **sparse** (row only when something is logged); predictions are computed, never stored.
- Prediction changes must keep the pure functions in `core` and stay covered by tests.
- Randomness on-device is injected via `expo-crypto` (`src/lib/rng.ts`) into core — core never calls a platform RNG itself.
- Brand name lives once in `packages/core/src/brand.ts` (app) / `apps/web/lib/site.ts` (site).

## Gluestack

UI uses **gluestack-ui v2** on NativeWind v4 / Tailwind v3. Provider is wired in `src/app/_layout.tsx`. Vendored gluestack components live in `src/components/gs/**` and are marked `// @ts-nocheck` (generated code) — Metro still transpiles them; do not try to make them pass strict tsc. App primitives in `src/components/ui/` (`Button`, `Card`, `Screen`, `Txt`) wrap gluestack and carry the Locklune theme; screens import these. `tailwind.config.js` merges gluestack's token scales (`@gluestack-ui/nativewind-utils/tailwind-plugin` + CSS-var color scales) with the Locklune palette.

The gluestack CLI does **not** work in this monorepo (npm workspace + no TTY). To add a component, copy it from the gluestack repo branch `feat/nativewind-4.1-support` (`example/storybook-nativewind/src/core-components/nativewind/<component>`) into `src/components/gs/`, prepend `// @ts-nocheck`, and install the dep from that component's `dependencies.json`. Use the stable `@gluestack-ui/*` versions (v1.x / 0.1.x), NOT the v5 alpha.
