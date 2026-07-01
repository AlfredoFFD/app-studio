/**
 * Shared config for the generation proxy (Vercel functions).
 * Files prefixed with `_` are NOT turned into routes by Vercel.
 */
import { fal } from '@fal-ai/client';

fal.config({ credentials: process.env.FAL_KEY });

// Kling image-to-video: ~55s/clip, `image_url` field. Async → we use the fal
// QUEUE (submit + poll), never a single long request (Vercel caps function time
// well under a 55s render).
export const MODEL = 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video';

export const STYLE_PROMPTS: Record<string, string> = {
  sway: 'the person in the photo performs a smooth, viral TikTok sway dance, full-body rhythmic motion, energetic and looping',
  hiphop: 'the person in the photo performs an energetic hip-hop dance routine with sharp confident moves',
  kpop: 'the person in the photo performs a synchronized, polished K-pop dance choreography',
  ballet: 'the person in the photo performs an elegant ballet dance with graceful spins and poses',
  anime: 'the person in the photo performs a stylized anime-style dance with exaggerated expressive motion',
  zombie: 'the person in the photo performs a funny, stiff zombie dance, lurching and shambling to a beat',
};

export function cors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}
