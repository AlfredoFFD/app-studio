/**
 * POST /api/generate — submit a Kling image-to-video job to the fal QUEUE and
 * return immediately with a jobId. Does NOT wait for the render (that would
 * exceed Vercel's function time limit). The app then polls GET /api/status.
 *
 * Body: { imageBase64: dataURI, styleId }  →  202 { jobId }
 * The fal queue holds the job server-side, so this proxy stays stateless.
 */
import { fal } from '@fal-ai/client';
import { MODEL, STYLE_PROMPTS, cors } from './_shared';

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.FAL_KEY) return res.status(500).json({ error: 'FAL_KEY not configured' });

  try {
    const { imageBase64, styleId } = req.body ?? {};
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });
    const prompt = STYLE_PROMPTS[styleId] ?? STYLE_PROMPTS.sway;
    const submitted: any = await fal.queue.submit(MODEL, {
      input: { image_url: imageBase64, prompt },
    });
    const jobId = submitted?.request_id ?? null;
    if (!jobId) return res.status(502).json({ error: 'no request_id from fal' });
    return res.status(202).json({ jobId });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? 'submit failed' });
  }
}
