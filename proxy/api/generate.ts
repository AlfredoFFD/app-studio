/**
 * Serverless proxy (Vercel function) — hides the fal.ai key and runs Kling
 * image-to-video. Deploy this, set FAL_KEY in Vercel env, then set
 * EXPO_PUBLIC_API_URL in the app to this deployment's URL.
 *
 * The app POSTs { imageBase64, styleId }; this returns { videoUrl }.
 * `start_image_url` accepts a base64 data URI, so no separate upload step.
 * (Local dev equivalent: server.mjs.)
 */
import { fal } from '@fal-ai/client';

fal.config({ credentials: process.env.FAL_KEY });

const MODEL = 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video'; // ~55s/clip, image_url field

const STYLE_PROMPTS: Record<string, string> = {
  sway: 'the person in the photo performs a smooth, viral TikTok sway dance, full-body rhythmic motion, energetic and looping',
  hiphop: 'the person in the photo performs an energetic hip-hop dance routine with sharp confident moves',
  kpop: 'the person in the photo performs a synchronized, polished K-pop dance choreography',
  ballet: 'the person in the photo performs an elegant ballet dance with graceful spins and poses',
  anime: 'the person in the photo performs a stylized anime-style dance with exaggerated expressive motion',
  zombie: 'the person in the photo performs a funny, stiff zombie dance, lurching and shambling to a beat',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  if (!process.env.FAL_KEY) {
    res.status(500).json({ error: 'FAL_KEY not configured' });
    return;
  }
  try {
    const { imageBase64, styleId } = req.body ?? {};
    if (!imageBase64) {
      res.status(400).json({ error: 'imageBase64 required' });
      return;
    }
    const prompt = STYLE_PROMPTS[styleId] ?? STYLE_PROMPTS.sway;
    const result: any = await fal.subscribe(MODEL, {
      input: { image_url: imageBase64, prompt },
    });
    const videoUrl = result?.data?.video?.url ?? null;
    if (!videoUrl) {
      res.status(502).json({ error: 'no video in fal response' });
      return;
    }
    res.status(200).json({ videoUrl });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'generation failed' });
  }
}
