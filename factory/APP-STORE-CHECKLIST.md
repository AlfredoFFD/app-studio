# App Store gate — disposable-app additions (run alongside `/ios-preflight`)

`expo-toolkit /ios-preflight` already does the exhaustive mechanical App Store Connect audit (build attached, screenshots per size, IAP attached to version, RevenueCat cross-check, privacy labels, demo creds, URL reachability, restore-purchases in code). **Do not duplicate it — run it.** This file adds only what `/ios-preflight` does NOT cover: the disposable-app-factory-specific risks that actually get OUR apps rejected.

## A. Guideline 4.3 (spam / duplicate) — the #1 killer for an app factory
An independent judge (not the builder) must answer YES to all, with evidence:
- [ ] The CORE FEATURE is genuinely distinct from existing apps — not the previous app reskinned. Name the prior art and the difference.
- [ ] App name, icon, screenshots, and description are original to THIS app (no shared template copy).
- [ ] Onboarding copy is app-specific (not the template's default lines).
- [ ] Not in a category Apple is actively purging as saturated AI-wrapper spam (action figure, looksmaxxing, basic AI baby, generic AI photo editor) — unless the live sweep proves a fresh distinct angle.
- [ ] We are NOT batch-submitting near-identical apps under one account this cycle.

## B. Guideline 4.2 (minimum functionality)
- [ ] App has enough depth (history / modes / customization / dev-buttons removed) to justify a subscription — not a single-trick screen.

## C. Guideline 3.1.x (IAP/subscriptions) — beyond /ios-preflight's structural check
- [ ] Free, usable preview BEFORE the paywall (don't hard-gate with zero visible value).
- [ ] Restore Purchases button present and functional (also enforced by /ios-preflight).
- [ ] Price + billing period + what's unlocked shown before purchase.
- [ ] Terms (EULA) + Privacy links on the paywall/settings.

## D. Security audit (run 2–3× each after a fresh `/clear` — fix until all green)
Scan + tier (critical/high/med/low) + CWE for:
- [ ] Hallucinated / non-existent npm packages (slopsquatting risk)
- [ ] Missing server-side validation (proxy endpoints)
- [ ] Default-open database policies (Supabase RLS) if a backend exists
- [ ] Hard-coded secrets / API keys anywhere on-device (must be proxy-only)
- [ ] Inconsistent auth / unprotected API routes / token-burn DoS on the proxy
- [ ] `.env` in `.gitignore`; no keys in git history

## E. Metadata polish (cheap rejections)
- [ ] Privacy + Support pages generated (feed Apple guidelines → generate) and HOSTED (HTTPS, 200).
- [ ] App Store screenshots auto-generated for 6.5″ iPhone (+ iPad if universal) and show the app IN USE (not splash/login).
- [ ] No M-dashes / obvious AI tells in description or in-app copy.

## Verdict
Output: BLOCKING issues / WARNINGS / PASSED, then a single line: **Ready to submit** or **Fix N first**. Only after 0 BLOCKING here AND 0 BLOCKING from `/ios-preflight` does the human submit gate open.
