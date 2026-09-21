# PLAN — App Studio

## The factory
A reusable **template** (`template-base/`) where only a thin per-app layer changes. Clone → swap feature → reskin → ship.

### What's SHARED (build once, in `template-base/src/`)
- `lib/app-state.tsx` — onboarding + subscription state (swap to AsyncStorage + RevenueCat later)
- `components/ui/` — design system: `Button` (brand-gradient CTA), `Card`, `Screen`
- `features/onboarding/` — config-driven onboarding **engine** (`onboarding.config.ts` = copy/icons)
- `features/paywall/` — config-driven paywall (`paywall.config.ts` = pricing/perks); RevenueCat-ready, stubbed today
- `features/settings/` — settings + Restore + legal links (Apple-required)
- `constants/theme.ts` — design tokens; **`Brand` + `Gradients` = the reskin point**
- `app/` — Expo Router stack: `index` (gate) → `onboarding` → `home` → `paywall` (modal) + `settings`

### What SWAPS per app
1. `src/features/<app>/` — **the unique core feature** (this is where 4.3 originality lives)
2. `src/app/home.tsx` — points at the new feature
3. `constants/theme.ts` — `Brand` + `Gradients` reskin
4. `onboarding.config.ts` + `paywall.config.ts` — copy/pricing
5. `app.json` — unique name, slug, scheme, bundleIdentifier, icon, splash
6. RevenueCat offering ID + App Store metadata/screenshots

> To make app #002: copy `template-base/` → `apps/app-002-<slug>/`, replace items 1–6.

## Stack (decided)
Expo SDK 56 (New Arch on) · Expo Router · expo-image-picker · expo-linear-gradient · @expo/vector-icons · built-in theme tokens (NativeWind deferred). RevenueCat + EAS added at dev-build stage. AI via fal.ai through a Vercel serverless proxy.

## Today's build order — DONE ✅
1. ✅ Scaffold `template-base` (Expo + expo-router), expo-doctor 21/21
2. ✅ Design system (Button/Card/Screen) + brand theme tokens
3. ✅ Onboarding engine (3 slides) + config
4. ✅ Paywall (stub, Expo-Go-safe) + config (price/period/perks/Restore/legal — review-compliant)
5. ✅ App #001 core: Future Baby (two photo slots → mock generate → paywall-gated result)
6. ✅ Settings (Restore + legal + reset)
7. ✅ Verified: `tsc --noEmit` clean + `expo export --platform ios` builds (4MB bundle)

**Result:** a polished, navigable app that runs in Expo Go on a real iPhone, $0 spent.

## Next steps (to ship for real — needs owner inputs)
| Step | Needs | Cost |
|---|---|---|
| Wire real AI | fal.ai key + a Vercel proxy function (`/api/generate`) | fal usage (~$0.15/img) |
| Wire RevenueCat | RC account + products; install `react-native-purchases`; **dev build** (Expo Go can't load it) | $0 |
| Real device IAP test | Apple Developer Program (UDID registration) | **$99/yr** |
| Ship | `eas build --platform ios` → `eas submit` → App Store Connect metadata | EAS free tier OK to start |

## Per-app checklist vs Apple 4.3 / 4.2 (every app)
- [ ] Genuinely distinct core feature (not a reskin of the last app)
- [ ] Original name, icon, screenshots, store description
- [ ] Real onboarding (not the template's default copy)
- [ ] Free usable preview before the paywall
- [ ] Restore button + Terms + Privacy on paywall/settings
- [ ] Enough depth (history/modes/customization) to justify a subscription
- [ ] Do NOT batch-submit near-identical apps under one account

## Open decisions
1. Confirm **Future Baby** as the first real ship, or pick from the ranked list (Hug/Reunite, single-effect).
2. fal.ai vs Replicate for the image model; who pays API usage.
3. RevenueCat pricing config (weekly $6.99 / yearly $39.99 are placeholders).
4. One Apple Developer account vs per-brand entities (4.3 exposure).

---

## UPDATE 2026-06-30 — app #001 pivoted: Future Baby → **AI Photo-Dance**
A live trend sweep (see `RESEARCH-LIVE.md`) showed Future Baby is saturated, not rising. The rising, not-yet-consolidated segment is **image-to-video / animate-a-photo** (catalyst: Kling 3.0 Turbo, 2026-06-17). App #001 is now **AI Photo-Dance**: drop a photo → it dances in a chosen style → HD/watermark-free behind the paywall.

What changed in the template (the shared engines were untouched — proof the factory works):
- `features/dance/dance-home.tsx` (new core; replaced `features/baby/`)
- `constants/theme.ts` reskin (neon magenta→violet) · `onboarding.config.ts` · `paywall.config.ts` · `app.json` (AI Dance identity)
- `lib/generate.ts` — generation seam (mock today; real fal.ai when `EXPO_PUBLIC_API_URL` set)
- `app-studio/proxy/` — fal.ai Kling image-to-video proxy scaffold + deploy README

Status: ✅ tsc clean · ✅ `expo export --platform ios` builds · running in Expo Go (mocked AI: animates the user's own photo as the "preview").

Next to make it REAL: fal.ai key → deploy `proxy/` → set `EXPO_PUBLIC_API_URL`. Because video gen is async/slow (~30s–2min, ~$0.05–0.20/clip), move the proxy to a job+poll pattern before production.

## UPDATE 2026-07-01 — AI is REAL, end to end ✅
The mock is gone; the pipeline is live and proven against a deployed backend.
- **Proxy deployed** to Vercel as a **Node server** (`server.mjs` on Fluid Compute), not `/api` serverless functions — a framework-less `/api/*.ts` folder gets misdetected ("No entrypoint"), so we run the server directly. `server.mjs` is now the single source of truth (local == prod). Live at **https://proxy-blush-nu.vercel.app**.
- **Async job+poll shipped**: `POST /api/generate → {jobId}` then `GET /api/status?jobId=…`. Client (`lib/generate.ts`) submits once, polls every 3s to a 180s cap.
- **Verified**: `tsc --noEmit` clean · `expo export --platform ios` builds · live `/health` 200 · **real e2e**: submitted a photo → polled `IN_PROGRESS` ~59s → got a 14MB `video/mp4`. Kling model id (`kling-video/v2.5-turbo/pro/image-to-video`) confirmed current.
- **App wired**: `template-base/.env` `EXPO_PUBLIC_API_URL` → deployed URL.
- **Key**: rotation deferred by decision — capped private testing, existing key works. **Rotate before public ship** (see `proxy/README.md` hardening TODO).
- **Next**: preview on iPhone via Expo Go (`npx expo start -c`) — first real `VideoView` render (mock never hit it; watch expo-video in Expo Go). Then RevenueCat dev build → EAS → TestFlight.

## UPDATE 2026-07-02 — speed solved: two-tier progressive render ✅
"2-5 min is too slow" answered without giving up Kling 3.0 quality: the proxy
submits FAST (Kling 2.6) + STUDIO (Kling 3.0) to the fal queue in parallel.
Verified live (anime, slowest path): makeover still at submit (~15s) → fast cut
+2:01 → studio hot-swap +5:19. Motion styles ~30s faster per stage. Client
survives transient network blips (submit retry + resilient polling). Cost
~$0.91/gen dual — gate STUDIO as the Pro perk before public launch.
Also today: 12 styles · real Save/Share · Afterglow design v1 + deep pass
(conversion onboarding, rebuilt paywall, EQ loading craft, HIG/a11y) ·
5-model bake-off (frames inspected) picked Kling 3.0 · toolchain installed
(expo, expo-toolkit, revenuecat, asc CLI+skills, sosumi, HIG skills, UI rubric).
Next: Owner on-device UI review → Apple enrollment flips → RevenueCat +
EAS dev build → TestFlight (stop before submit).
