# Factory Loop — how the autonomous app factory runs (orchestration spec)

The factory composes tools we already have + two adopted plugins. **Principle: prove the full path on ONE app manually, then automate.** You cannot automate a process you haven't run once — the spec/process is the control surface (Ralph: "if Ralph builds the wrong thing, your spec is wrong").

## Adopted externals (install once)
- **`expo/skills`** (official Expo) → `claude plugin install expo@claude-plugins-official`. Gives: `expo-deployment`, `expo-dev-client`, `building-native-ui`, `expo-tailwind-setup`, `upgrading-expo` + the Expo MCP (run/monitor EAS builds, TestFlight crashes).
- **`expo-toolkit`** (rahulkeerthi) → `/plugin marketplace add rahulkeerthi/expo-toolkit` then `/plugin install expo-toolkit`. Gives commands `/init` `/build` `/ios-preflight` `/screenshots` `/changelog` `/update`; skills `expo-eas` `revenuecat` `ios-submission` `fastlane`; agents `revenuecat-docs` `store-verification` `build-troubleshooter`. Requires Claude-in-Chrome MCP (have).

We DON'T hand-roll EAS orchestration or the App Store checklist — those two plugins own it. We own: trend research, the template, the 6 gates, the loop harness.

## Outer loop (factory level) — one app per iteration, Ralph-style, driven by `profit-loop`
Fresh context each app; durable state on disk (`apps/app-XXX/SPEC.md`, `template-base/`, `factory/ledger.md`, `fix_plan.md`).
1. **Trend pick** — run the live sweep (web/TikTok/App Store, see `RESEARCH-LIVE.md` method) → a RISING, 4.3-safe niche.
2. **Spec** — fill `factory/SPEC-TEMPLATE.md` → `apps/app-XXX/SPEC.md` (falsifiable DONE criteria).
3. **`/roast` gate** (profit-loop Stage 1) — adversarial panel kills the concept if saturated / 4.3-risky / no distinct core, BEFORE building.
4. **Build** (inner loop below).
5. **Ledger** — append outcome to `factory/ledger.md`; **feed any App Store rejection reason back into the spec library** so the next app avoids that class. Caps: `--max-turns`, retry ≤ 3, per-app token budget. On cap/stuck → STOP + escalate.

## Inner loop (per-app build) — `gsd:autonomous` + superpowers, worker/judge
Generator (`gsd-executor`) clones `template-base/` → `apps/app-XXX/`, swaps the core feature + reskins `theme.ts` + fills the 2 configs + `app.json`; atomic commits, worktree isolation. The builder may NOT approve its own work — an independent `gsd-verifier` + the gates do.

## The 6 hard gates (cannot bypass; in order)
| # | Gate | Tooling | Pass condition |
|---|------|---------|----------------|
| 1 | Build | `npx tsc --noEmit` + `npx expo export --platform ios` (later `/build` → `eas build`) | exit 0 |
| 2 | Boot | Expo web / Expo Go | runs, no crash, no red box |
| 3 | Screenshot-sanity | `factory/scripts/screenshot-gate` (Expo web → Chrome DevTools MCP / Playwright) + vision-judge | core screens non-blank, render the core UI |
| 4 | Design-quality | `frontend-design` rubric + `gsd:ui-review` | ≥ threshold /24 |
| 5 | Security audit | the reused prompt (hallucinated pkgs, missing server validation, default-open RLS, hard-coded secrets, inconsistent auth) → tiered + CWE | 0 critical/high; **run 2–3× each after a fresh `/clear`** |
| 6 | Metadata + Policy | `expo-toolkit /ios-preflight` + `APP-STORE-CHECKLIST.md` (our 4.3-disposable additions) | 0 BLOCKING |

## No-Mac test loop (replaces the course's Mac-only 3-prong)
Chrome/web (Chrome DevTools MCP screenshot gate — ~90% of iteration) → **Expo Go on the real iPhone** → device only for haptics/notifications. Bake **dev/testing buttons** into every app (reset onboarding, clear data, simulate states) so gates can drive states without manual setup.

## Build/ship substrate (no Mac)
Develop on Windows → preview Expo Go ($0) → RevenueCat real IAP needs an **EAS dev build** (`expo-dev-client`) → `/build production --ios` → `eas build` (cloud macOS) → TestFlight → `/ios-preflight` → submit. Skip XcodeBuildMCP (Mac-only) unless an app graduates to native-module depth.

## Human-gated seams (the ONLY human touches — Claude-in-Chrome drives to each boundary)
1. Apple Developer enroll + **$99** payment.
2. Logins + 2FA (Apple/EAS/RevenueCat/Supabase) — Claude navigates, Alfredo enters secrets.
3. Final **"Submit for Review"** click + a 1-screen taste glance.
4. Device test for haptics/notifications.

## Safety (walls, not requests)
A PreToolUse hook (`app-studio/.claude/`) returns "ask" on `Edit|Write` to secrets / `.env` / signing / `eas.json` / credentials — a hook can't be bypassed (CLAUDE.md is obeyed ~80%). API keys live only in the serverless `proxy/`, never on device.
