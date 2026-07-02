/**
 * Generation client — the single seam between the app and the AI backend.
 *
 * TODAY: no EXPO_PUBLIC_API_URL set → mock latency, returns { mock: true }.
 * The UI then animates the user's own photo as a "preview" (Expo-Go-safe, $0).
 *
 * REAL: the proxy renders TWO tiers in parallel and this client reports
 * progress as it lands, so the user never stares at a dead spinner:
 *   ~20s  onProgress { stage:'makeover', imageUrl }  (makeover styles only)
 *   ~90s  onProgress { stage:'fast', videoUrl }      (Kling 2.6 first cut)
 *   2-5m  resolves   { videoUrl, tier:'studio' }     (Kling 3.0 hot-swap)
 * If the studio render fails or times out, the fast cut is returned as final.
 */
export type GenProgress =
  | { stage: 'makeover'; imageUrl: string }
  | { stage: 'fast'; videoUrl: string };

export type GenResult = { videoUrl: string | null; mock: boolean; tier?: 'studio' | 'fast' };

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const POLL_INTERVAL_MS = 4000;
const MAX_WAIT_MS = 480000; // studio tier can take ~2-5 min via the fal queue

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateDance(
  photoUri: string,
  styleId: string,
  onProgress?: (p: GenProgress) => void,
): Promise<GenResult> {
  if (!API_URL) {
    await sleep(2600); // simulate render time
    return { videoUrl: null, mock: true };
  }
  const imageBase64 = await uriToBase64(photoUri);

  // 1) Submit — the proxy queues both tiers and returns instantly.
  const submitRes = await fetch(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, styleId }),
  });
  const submitData = (await submitRes.json().catch(() => ({}))) as {
    jobId?: string | null;
    fastJobId?: string | null;
    stylizedUrl?: string | null;
    error?: string;
  };
  if (!submitRes.ok || (!submitData.jobId && !submitData.fastJobId)) {
    throw new Error(submitData.error || `submit failed: ${submitRes.status}`);
  }
  if (submitData.stylizedUrl) onProgress?.({ stage: 'makeover', imageUrl: submitData.stylizedUrl });

  // 2) Poll both tiers until the studio cut lands (or fall back to the fast cut).
  let studioId = submitData.jobId ?? null;
  let fastId = submitData.fastJobId ?? null;
  let fastUrl: string | null = null;
  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    if (fastId) {
      const fast = await pollStatus(fastId, 'fast');
      if (fast.status === 'done' && fast.videoUrl) {
        fastUrl = fast.videoUrl;
        fastId = null;
        onProgress?.({ stage: 'fast', videoUrl: fastUrl });
        if (!studioId) return { videoUrl: fastUrl, mock: false, tier: 'fast' };
      } else if (fast.status === 'error') {
        fastId = null; // fast tier failed; studio continues
      }
    }

    if (studioId) {
      const studio = await pollStatus(studioId, 'studio');
      if (studio.status === 'done' && studio.videoUrl) {
        return { videoUrl: studio.videoUrl, mock: false, tier: 'studio' };
      }
      if (studio.status === 'error') {
        studioId = null;
        if (fastUrl) return { videoUrl: fastUrl, mock: false, tier: 'fast' };
        if (!fastId) throw new Error(studio.error || 'generation failed');
      }
    }

    if (!studioId && !fastId) {
      if (fastUrl) return { videoUrl: fastUrl, mock: false, tier: 'fast' };
      throw new Error('generation failed');
    }
  }

  if (fastUrl) return { videoUrl: fastUrl, mock: false, tier: 'fast' };
  throw new Error('Timed out. Try again.');
}

async function pollStatus(jobId: string, tier: 'fast' | 'studio') {
  try {
    const res = await fetch(
      `${API_URL}/api/status?jobId=${encodeURIComponent(jobId)}&tier=${tier}`,
    );
    return (await res.json()) as { status?: string; videoUrl?: string; error?: string };
  } catch {
    return { status: 'processing' } as { status: string; videoUrl?: string; error?: string };
  }
}

async function uriToBase64(uri: string): Promise<string> {
  const resp = await fetch(uri);
  const blob = await resp.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
