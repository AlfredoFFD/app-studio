# App Studio — Generation Proxy

A tiny Node HTTP server that keeps the fal.ai API key off the device and runs
image-to-video generation. One proxy serves every app in the studio.

## Why
Never call the AI API directly from the phone (the key would leak). The app
sends the photo here; this calls fal.ai and returns a video URL.

## Shape (async: job + poll)
Kling image-to-video takes ~30s–2min, so this is a **submit + poll** pair, not a
single long request:

| Route | Does |
|---|---|
| `POST /api/generate` `{ imageBase64, styleId }` | submits to the fal **queue**, returns `202 { jobId }` instantly |
| `GET /api/status?jobId=…` | polls: `{ status:'processing' }` \| `{ status:'done', videoUrl }` \| `{ status:'error' }` |
| `GET /health` | `{ ok:true }` liveness |

The fal queue holds the job server-side, so the proxy stays **stateless** — any
instance can answer a poll by `request_id`. `image_url` accepts a base64 data
URI, so there's no separate upload step.

`server.mjs` is the **single source of truth** — it runs both locally and on
Vercel (Fluid Compute Node server). No separate serverless-function copy to keep
in sync.

## Deploy (Vercel)
Already linked (`.vercel/`). Vercel runs `server.mjs` directly as a Node server
(package.json `main` + `start`), not as `/api` serverless functions — a bare,
framework-less `/api/*.ts` folder gets misdetected as a server and rejected
("No entrypoint found"), so we lean into server mode instead.

1. `cd app-studio/proxy && npm install`
2. Set the key (encrypted, server-side only): `npx vercel env add FAL_KEY` (Production).
3. `npx vercel --prod`.
4. Live prod alias (stable across deploys): **https://proxy-blush-nu.vercel.app**

Confirm without spending on a render:
```
curl https://proxy-blush-nu.vercel.app/health              # {"ok":true}
curl -X POST https://proxy-blush-nu.vercel.app/api/generate \
  -H 'content-type: application/json' -d '{}'              # 400 imageBase64 required
```
(`/health` 200 also proves FAL_KEY is set — the server exits on boot without it.)

## Point the app at it
`template-base/.env` (gitignored):
```
EXPO_PUBLIC_API_URL=https://proxy-blush-nu.vercel.app
```
Restart Metro with a clean cache (`npx expo start -c`) so Expo re-inlines the
var. The app then does REAL generation — `src/lib/generate.ts` submits + polls
automatically when the var is set (mock fallback when it isn't). No app code
change needed.

## Local dev (optional)
Same file, no cloud: `FAL_KEY=… node server.mjs` → point `EXPO_PUBLIC_API_URL`
at `http://<LAN-IP>:8787`. Phone must share the dev machine's WiFi. The deployed
URL avoids that (phone just needs internet).

## Hardening TODO (before a public ship)
- [ ] **Rotate FAL_KEY** — the current key was pasted in plaintext in a session
  transcript. Fine for capped private testing; rotate before the app is public
  and the exposure grows. (Confirm a fal **spend cap** is set as the backstop.)
- [ ] Add a per-device rate-limit / cap so a leaked endpoint can't burn credits.
- [ ] Cap request body size (Kling input is a base64 photo; reject oversized).
