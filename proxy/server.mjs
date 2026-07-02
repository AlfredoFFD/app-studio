/**
 * App Studio generation proxy — hides the fal.ai key, runs a two-stage pipeline:
 *
 *   APPEARANCE styles (anime, zombie): STYLIZE the photo (nano-banana edit,
 *     likeness-preserving) → then ANIMATE the stylized image (Kling).
 *   MOTION styles (sway, hiphop, kpop, ballet): ANIMATE the photo directly.
 *
 * The stylize step is fast (~10s) so it runs synchronously inside POST
 * /api/generate (well within Vercel's 300s Fluid-Compute limit); the slow
 * Kling animate (~55s) stays a QUEUE job the app polls via GET /api/status.
 * So the app client is unchanged: POST { imageBase64, styleId } -> { jobId },
 * then poll /api/status?jobId=… -> processing | done { videoUrl } | error.
 *
 * Runs identically locally (`FAL_KEY=… node server.mjs`) and on Vercel.
 */
import http from 'node:http';
import { fal } from '@fal-ai/client';

const KEY = process.env.FAL_KEY;
if (!KEY) {
  console.error('FAL_KEY not set — start with: FAL_KEY=... node server.mjs');
  process.exit(1);
}
fal.config({ credentials: KEY });

// Kling 2.6 Pro: better face fidelity than turbo at the same $0.35/5s. NOTE the
// field is `start_image_url` (v2.6/v3 renamed it from `image_url`).
const ANIMATE_MODEL = 'fal-ai/kling-video/v2.6/pro/image-to-video';
// nano-banana edit (Gemini 2.5 Flash Image): likeness-preserving restyle, one
// model covers every appearance style via the prompt. Takes `image_urls` (array).
const STYLIZE_MODEL = 'fal-ai/nano-banana/edit';
const PORT = Number(process.env.PORT) || 8787;

// Per style: `motion` = the Kling dance prompt (always). `stylize` = an optional
// appearance transform run first (nano-banana). Appearance styles are where the
// "turn into X" wow lives; motion styles keep the user photorealistic.
const STYLES = {
  // ---- motion styles (photo stays photorealistic) ----
  sway:   { motion: 'the person performs a smooth, viral TikTok sway dance, full-body rhythmic motion, energetic and looping' },
  hiphop: { motion: 'the person performs an energetic hip-hop dance routine with sharp, confident moves' },
  kpop:   { motion: 'the person performs a synchronized, polished K-pop dance choreography' },
  ballet: { motion: 'the person performs an elegant ballet dance with graceful spins and poses' },
  salsa:  { motion: 'the person performs a passionate salsa dance with quick hip movement, spins and latin rhythm' },
  breakdance: { motion: 'the person performs an impressive breakdance routine with spins, freezes and fast footwork' },
  robot:  { motion: 'the person performs a precise robot dance with mechanical, isolated popping movements' },
  disco:  { motion: 'the person performs a groovy 1970s disco dance with pointing moves, hip sways and flair' },
  // ---- makeover styles (stylize first, then animate) ----
  anime: {
    stylize: 'Restyle this person as a vibrant cel-shaded anime character with big expressive eyes, clean anime linework and rich color, while keeping their face, hairstyle and identity clearly recognizable as the same person.',
    motion: 'the anime character performs an energetic, expressive dance with lively full-body motion',
  },
  zombie: {
    stylize: 'Transform this person into a realistic zombie with decayed greyish skin, sunken bloodshot eyes, subtle wounds and tattered clothing, while keeping their facial structure and identity recognizable.',
    motion: 'the zombie performs a funny, stiff, lurching zombie shuffle dance to a beat',
  },
  toon: {
    stylize: 'Restyle this person as a polished 3D animated movie character with large expressive eyes, soft studio lighting and smooth stylized features, while keeping their face, hairstyle and identity clearly recognizable.',
    motion: 'the 3D cartoon character performs a joyful, bouncy dance full of energy',
  },
  painting: {
    stylize: 'Repaint this person as a classical Renaissance oil painting portrait with rich visible brushstrokes, dramatic lighting and canvas texture, while keeping their face and identity clearly recognizable.',
    motion: 'the painted figure performs an elegant, theatrical dance with smooth flowing movement',
  },
};

function send(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true });

  // GET /api/status?jobId=… — poll the Kling animate job (fal queue).
  if (req.method === 'GET' && url.pathname === '/api/status') {
    (async () => {
      const jobId = url.searchParams.get('jobId');
      if (!jobId) return send(res, 400, { error: 'jobId required' });
      try {
        const status = await fal.queue.status(ANIMATE_MODEL, { requestId: jobId });
        if (status?.status === 'COMPLETED') {
          const result = await fal.queue.result(ANIMATE_MODEL, { requestId: jobId });
          const videoUrl = result?.data?.video?.url ?? null;
          if (!videoUrl) return send(res, 502, { status: 'error', error: 'no video in result' });
          console.log(`[status] ${jobId} done → ${videoUrl}`);
          return send(res, 200, { status: 'done', videoUrl });
        }
        return send(res, 200, { status: 'processing', queue: status?.status ?? 'UNKNOWN' });
      } catch (e) {
        console.error('[status] error', e?.message || e);
        send(res, 500, { status: 'error', error: String(e?.message || e) });
      }
    })();
    return;
  }

  // POST /api/generate — stylize (if appearance style) then submit the animate job.
  if (req.method !== 'POST' || !url.pathname.startsWith('/api/generate')) {
    return send(res, 404, { error: 'not found' });
  }
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', async () => {
    try {
      const { imageBase64, styleId } = JSON.parse(body || '{}');
      if (!imageBase64) return send(res, 400, { error: 'imageBase64 required' });
      const style = STYLES[styleId] ?? STYLES.sway;

      // Stage 1 (appearance styles only): restyle the photo, keeping likeness.
      let animateImage = imageBase64;
      if (style.stylize) {
        console.log(`[generate] style=${styleId} → stylize (nano-banana)…`);
        const styled = await fal.subscribe(STYLIZE_MODEL, {
          input: { image_urls: [imageBase64], prompt: style.stylize, num_images: 1 },
        });
        const styledUrl = styled?.data?.images?.[0]?.url ?? null;
        if (!styledUrl) return send(res, 502, { error: 'stylize returned no image' });
        console.log(`[generate] stylized → ${styledUrl}`);
        animateImage = styledUrl;
      }

      // Stage 2: submit the Kling animate job (polled via /api/status).
      const submitted = await fal.queue.submit(ANIMATE_MODEL, {
        input: {
          start_image_url: animateImage,
          prompt: style.motion,
          duration: '5',
          generate_audio: false,
        },
      });
      const jobId = submitted?.request_id ?? null;
      console.log(`[generate] style=${styleId} animate submitted → ${jobId}`);
      if (!jobId) return send(res, 502, { error: 'no request_id from fal' });
      send(res, 202, { jobId });
    } catch (e) {
      console.error('[generate] error', e?.message || e);
      send(res, 500, { error: String(e?.message || e) });
    }
  });
});

server.listen(PORT, '0.0.0.0', () =>
  console.log(`fal proxy on :${PORT} — animate=${ANIMATE_MODEL} stylize=${STYLIZE_MODEL}`),
);
