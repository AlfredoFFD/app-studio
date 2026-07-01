/**
 * GET /api/status?jobId=... — poll a fal queue job. Fast (one status check),
 * so it never hits the Vercel function time limit.
 *
 *   { status: 'processing', queue: 'IN_QUEUE'|'IN_PROGRESS' }
 *   { status: 'done', videoUrl }
 *   { status: 'error', error }
 */
import { fal } from '@fal-ai/client';
import { MODEL, cors } from './_shared';

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  if (!process.env.FAL_KEY) return res.status(500).json({ error: 'FAL_KEY not configured' });

  const jobId = req.query?.jobId;
  if (!jobId || typeof jobId !== 'string') {
    return res.status(400).json({ error: 'jobId required' });
  }

  try {
    const status: any = await fal.queue.status(MODEL, { requestId: jobId });
    if (status?.status === 'COMPLETED') {
      const result: any = await fal.queue.result(MODEL, { requestId: jobId });
      const videoUrl = result?.data?.video?.url ?? null;
      if (!videoUrl) return res.status(502).json({ status: 'error', error: 'no video in result' });
      return res.status(200).json({ status: 'done', videoUrl });
    }
    return res.status(200).json({ status: 'processing', queue: status?.status ?? 'UNKNOWN' });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', error: err?.message ?? 'status failed' });
  }
}
