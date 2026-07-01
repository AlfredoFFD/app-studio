# App Spec Template — fill this BEFORE building (the loop's control surface)

Copy this to `apps/app-XXX-<slug>/SPEC.md` and fill every field. A falsifiable spec is the #1 thing that makes the loop succeed; a vague spec is why loops spiral. "Make it good" is not a spec.

## Identity
- **App name (≤30 chars):**
- **Slug / bundleId:** `com.appstudio.<slug>`
- **One-line pitch:**
- **Trend evidence (dated, from the live sweep):** why this is RISING now, not peaked. Link + date.
- **Apple 4.3 distinctness:** what makes the CORE FEATURE genuinely different from existing apps (not a reskin). This is the gate that keeps the account alive.

## The 5-part framework (Maker School) — every app needs all five
1. **Core function** — the one thing that, if everything else were removed, is still the app:
2. **Core loop** — the action→reward cycle (target < 30s). Action: ___ → Reward (visual / sound / haptic): ___
3. **Accessory features** — what wraps/supports the loop without changing it (max 2–3):
4. **Surface-area check** — total screens (target **5–7**); one onboarding run teaches everything:
5. **Retention hook** — the unfinished state + notification that pulls the user back:

## Monetization (the course skips this — we don't)
- **Model:** Freemium hard paywall (default) · Paid upfront · Free
- **Paywall:** RevenueCat (custom UI on RC SDK — our `features/paywall/` template)
- **Products:** weekly $___ (3-day trial) · yearly $___ · entitlement id: ___
- **What's behind the paywall:** (the result/export/HD; free preview before it)
- **Unit economics:** AI cost per use ≈ $___ → price covers it at ___× margin

## AI feature (if any)
- **Capability:** image-gen / image-edit / image-to-video / voice / lipsync / LLM
- **API:** fal.ai model id `___` (verify latest at integration) · via the `proxy/` (key never on device)
- **Async?** video gen is slow → job + poll, not a blocking call

## Backend
- **Default: none** (on-device + the key-hiding proxy). Add Supabase ONLY if the app needs auth/persistence/sync (then: Data API on, Automatic RLS on, email-confirm off, local-cache-first).

## Falsifiable DONE criteria (the loop's stop conditions — must be machine-checkable)
- [ ] `tsc --noEmit` clean + `expo export --platform ios` builds
- [ ] Boots in Expo Go / web with no crash
- [ ] Screenshot gate: core screens render non-blank (vision-judge)
- [ ] `gsd:ui-review` ≥ __/24
- [ ] Security audit: 0 critical/high (2–3× fresh `/clear`)
- [ ] `APP-STORE-CHECKLIST.md` + `/ios-preflight`: 0 BLOCKING
- [ ] Distinct core feature confirmed (4.3) by an independent judge
