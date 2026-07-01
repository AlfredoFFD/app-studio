# App Studio — Generation Proxy

A tiny serverless function that keeps the fal.ai API key off the device and runs
the image-to-video generation. One proxy serves every app in the studio.

## Why
Never call the AI API directly from the phone (the key would leak). The app sends
the photo here; this calls fal.ai and returns a video URL.

## Deploy (Vercel, ~10 min)
1. `cd app-studio/proxy && npm install`
2. Get a fal.ai key: https://fal.ai/dashboard/keys (add ~$5 credit — covers many test renders at ~$0.05–0.20/clip).
3. `npx vercel` (first run links/creates the project).
4. Set the key: `npx vercel env add FAL_KEY` (paste the key) → then `npx vercel --prod`.
5. Copy the production URL (e.g. `https://app-studio-proxy.vercel.app`).

## Point the app at it
In `template-base/`, create a `.env` (or set in EAS) :
```
EXPO_PUBLIC_API_URL=https://app-studio-proxy.vercel.app
```
Restart `npx expo start`. The app now does REAL generation instead of the mock.
No app code changes — `src/lib/generate.ts` switches automatically when the var is set.

## Integration checklist
- [ ] Confirm the current Kling image-to-video model id + input params at https://fal.ai/models (update `MODEL` in `api/generate.ts`; research flagged Kling 3.0 Turbo, released 2026-06-17, as the freshest engine).
- [ ] Video gen is async and can take 30s–2min — consider returning a job id + polling, or a webhook, instead of a single long request, before production.
- [ ] Add a simple rate-limit / per-device cap so a leaked endpoint can't burn credits.
