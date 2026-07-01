# RESEARCH — iOS App Studio (2026-06-30)

Two parallel research sweeps: **(A) how to build/ship fast with no Mac** and **(B) what to build right now**. Full source links at the bottom of each section.

---

## A. How to build & ship disposable subscription iOS apps fast (no Mac)

**Verdict: the proposed stack is correct and current — it's exactly what indie app-studio operators run in 2026. The real risk is not technical; it's surviving Apple Guideline 4.3 (spam/duplicate).**

### Stack — validated
| Layer | Pick | Note (2026) |
|---|---|---|
| Framework | React Native + **Expo (managed)** | Official RN recommendation. Use managed + **dev client**, not bare. |
| Cloud builds | **EAS Build** | *The* reason no-Mac works — iOS builds run on Expo's macOS servers. EAS ships Xcode 26 / iOS 26 SDK, **mandatory for all submissions from April 2026**. |
| Preview | **Expo Go** | Day-1 prototyping only. Fixed set of native libs. |
| Subscriptions | **RevenueCat** | Never hand-build StoreKit. `react-native-purchases` + `react-native-purchases-ui`. |
| Nav | **Expo Router** | File-based, default in templates. |
| Styling | **NativeWind** OR the built-in theme system | NativeWind fine but pin versions; we used the template's native theme tokens to avoid New-Arch setup friction. |
| Backend | **Supabase** only if needed | Most of these apps need **no backend** — just a thin serverless proxy to hide the AI key. |

### The critical gotcha: dev client vs Expo Go
**RevenueCat is a native module → it does NOT load in Expo Go.** Two paths:
- RevenueCat **Test Store** key runs in Expo Go → wire paywall logic early.
- Real sandbox purchases need an **EAS development build** (own bundle ID, built once, reused for all JS changes).
> Implication for our template: the paywall today is a **pure-UI stub** so the whole app stays Expo-Go-previewable. RevenueCat native goes in at the dev-build step.

### New Architecture
Default + mandatory going forward. **Pin to one Expo SDK and pin every native dep** — third-party New-Arch incompat is the main build-breaker. (We're on **SDK 56**, New Arch on.)

### RevenueCat setup traps (will bite)
Full native rebuild after install (no hot-reload-only) · crash on empty/undefined API key · **mandatory Restore Purchases button** (auto-reject without it) · never hardcode prices · `presentPaywallIfNeeded` so subscribers don't see paywalls.

### No-Mac cost ladder
| Item | Cost | When required |
|---|---|---|
| Expo Go preview | $0 | Day 1 — never required to pay |
| RevenueCat | $0 until ~$2.5k/mo/app | Free tier covers the whole early portfolio |
| EAS Build/Submit | Free tier exists; ~$19–99/mo at 4–6 apps/mo | When build throughput matters |
| **Apple Developer Program** | **$99/yr** | The moment you want real IAP on device **or** to submit. Defer until an app is validated. |

`eas build --platform ios` → `eas submit --platform ios` (uploads from Windows via App Store Connect API key — no Transporter/Mac needed).

### Pitfalls that cost weeks
1. **Guideline 4.3 (spam) — existential.** ~28% of all rejections. Apple hunts "10 apps from one codebase." Each app needs **genuinely distinct functionality**, not a reskin. Never resubmit a 4.3-flagged app under a new account (→ permanent ban). Consider separate dev entities per real brand.
2. **Guideline 4.2 (minimum functionality).** Single-trick novelty apps get rejected as too thin for a subscription — add history/customization/modes.
3. **Paywall review requirements (auto-reject if missing):** visible price + period + what it unlocks before purchase; functional Restore; Terms (EULA) + Privacy links.
4. **April 2026:** must build against Xcode 26 / iOS 26 SDK (EAS handles it). Age-rating questionnaire update due.

Sources: Expo [dev builds](https://docs.expo.dev/develop/development-builds/introduction/) · [New Arch](https://docs.expo.dev/guides/new-architecture/) · [EAS Submit iOS](https://docs.expo.dev/submit/ios/) · RevenueCat [Expo install](https://www.revenuecat.com/docs/getting-started/installation/expo) / [Expo IAP tutorial](https://www.revenuecat.com/blog/engineering/expo-in-app-purchase-tutorial/) · 4.3: [AlmostDone](https://almostdone.ai/blog/app-store-rejection-guide-2025), [molfar](https://www.molfar.io/blog/apple-review) · boilerplates: [Shipnative](https://www.shipnative.app/), [Launch](https://launchtoday.dev/)

---

## B. What to build right now (mid-2026)

**Verdict: single-purpose "AI photo/video novelty" apps that ride one TikTok effect, hard-paywall everything, and die in ~6 months by design.** Validated by data, not vibes:
- AI apps earn **41% more revenue per payer but churn ~30% faster** → the disposable-lifecycle thesis is real.
- **Hard paywalls convert 5× better than freemium (10.7% vs 2.1%)**; **55% of trial cancellations happen Day 0.** → the whole game is *first session + paywall*.
- Biggest constraint: **Guideline 4.3(b), expanded 2026**, explicitly targets "AI wrappers, simple content generators, duplicated utilities" in saturated categories.

### Concepts ranked (virality × build simplicity)
| Rank | Concept | Why now | Build | 4.3 risk |
|---|---|---|---|---|
| **S** | **AI Hug / Reunite** (photo→video, animate a lost loved one) | Highest-emotion shareable content on TikTok now | image-to-video API + proxy | Safe on 4.3 (not saturated); watch content-sensitivity/consent |
| **S** | **AI Future Baby** (two selfies → baby; + talking baby) | Evergreen + spiking; couples viral loop | single image-edit call (future-baby) | **SAFEST** — distinct, "complete" |
| **S** | **Single-effect novelty** (Cakeify / Squish / AI Dance) | Literal top TikTok effects 2026 | one image→video call | Safe if branded distinctly; shortest half-life |
| A | AI Action Figure / toyification | Peaked, cloned to death | trivial (1 prompt) | Risky (saturated) — 1-day cash grab only |
| A | AI Aura / Psychic / Manifestation | Rising format shift | **LLM-only, easiest stack** | Risky ("fortune telling" named saturated) |
| **B (avoid)** | Pose-style all-in-one AI photo | **SATURATED** (Pose, Gluely, Remini own it) | — | Clone = instant 4.3 |
| **B (avoid)** | **Looksmaxxing / face-rating** | **SATURATED + body-image scrutiny** | — | **Riskiest — do NOT lead with it** |

> Note: the client floated **looksmaxxing** — research says avoid as a flagship (saturated + review-risky). Reframe toward Future Baby / Hug / single-effect.

### Top picks — 1-day MVP (Expo + one AI API)
1. **AI Future Baby** — Expo + RevenueCat + **fal.ai Nano Banana** (image-edit, ~$0.15/img). Reference template exists ("Platano": Expo + Gemini/Nano Banana + RevenueCat). Flow: two selfies → composite baby → free low-res, HD/gender/age behind paywall.
2. **AI Hug/Reunite** — Expo + RevenueCat + fal.ai image-to-video (Kling/Veo). Flow: pick photo → 4s animated clip → blurred behind paywall.
3. **Single-effect novelty** — same skeleton, fixed effect prompt.

**Universal pattern:** never call the AI API from the device (key leak) — proxy through **one serverless function** (Vercel). That proxy is the only "backend."

### 4.3 safety ranking (safest → riskiest)
Future Baby → Single-effect (distinct branding) → Hug/Reunite → Aura/Psychic → Action figure → Looksmaxxing.

Sources: [RevenueCat State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps/) · [Apple 4.3 / WWDC26](https://applemagazine.com/app-review-rules-wwdc26/) · [eWeek AI photo trends](https://www.eweek.com/news/ai-photo-editing-trends-2026/) · [vidguru top effects](https://www.vidguru.ai/blog/2026-top6-video-effects.html) · [AI baby trend](https://www.aiai.com/blog/baby-ai-video-generator) · [fal Nano Banana](https://fal.ai/models/fal-ai/nano-banana/edit/api) · [Platano template](https://codewithbeto.dev/platano)

---

## Decision (today)
- **App #001 = AI Future Baby** — safest on 4.3, simplest (one image call), strong couples viral loop, demoable without an API key (mock generation today).
- **Follow-up = AI Hug/Reunite** — highest virality, build once the pipeline + proxy exist.
- **Drop looksmaxxing as a flagship.**
