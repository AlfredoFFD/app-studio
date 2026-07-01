/**
 * Local dev proxy — hides the fal.ai key and runs Kling image-to-video.
 * Run: FAL_KEY=... node server.mjs   (key via env, never in a file)
 * The app points EXPO_PUBLIC_API_URL at http://<LAN-IP>:8787
 *
 * For production, the same logic ships as the Vercel function in api/generate.ts.
 */
import http from 'node:http';
import { fal } from '@fal-ai/client';

const KEY = process.env.FAL_KEY;
if (!KEY) {
  console.error('FAL_KEY not set — start with: FAL_KEY=... node server.mjs');
  process.exit(1);
}
fal.config({ credentials: KEY });

const MODEL = 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video'; // ~55s/clip, image_url field
const PORT = Number(process.env.PORT) || 8787;

const STYLE_PROMPTS = {
  sway: 'the person in the photo performs a smooth, viral TikTok sway dance, full-body rhythmic motion, energetic and looping',
  hiphop: 'the person in the photo performs an energetic hip-hop dance routine with sharp confident moves',
  kpop: 'the person in the photo performs a synchronized, polished K-pop dance choreography',
  ballet: 'the person in the photo performs an elegant ballet dance with graceful spins and poses',
  anime: 'the person in the photo performs a stylized anime-style dance with exaggerated expressive motion',
  zombie: 'the person in the photo performs a funny, stiff zombie dance, lurching and shambling to a beat',
};

function send(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true });
  if (req.method !== 'POST' || !req.url.startsWith('/api/generate')) return send(res, 404, { error: 'not found' });

  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', async () => {
    try {
      const { imageBase64, styleId } = JSON.parse(body || '{}');
      if (!imageBase64) return send(res, 400, { error: 'imageBase64 required' });
      const prompt = STYLE_PROMPTS[styleId] ?? STYLE_PROMPTS.sway;
      console.log(`[generate] style=${styleId} imglen=${imageBase64.length}`);
      const result = await fal.subscribe(MODEL, {
        input: { image_url: imageBase64, prompt },
        logs: false,
      });
      const videoUrl = result?.data?.video?.url ?? null;
      console.log(`[generate] done → ${videoUrl}`);
      if (!videoUrl) return send(res, 502, { error: 'no video in fal response', raw: result?.data });
      send(res, 200, { videoUrl });
    } catch (e) {
      console.error('[generate] error', e?.message || e);
      send(res, 500, { error: String(e?.message || e) });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`fal proxy listening on :${PORT} (model ${MODEL})`));
