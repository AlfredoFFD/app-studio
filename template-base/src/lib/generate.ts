/**
 * Generation client — the single seam between the app and the AI backend.
 *
 * TODAY: no EXPO_PUBLIC_API_URL set → mock latency, returns { mock: true }.
 * The UI then animates the user's own photo as a "preview" (Expo-Go-safe, $0).
 *
 * REAL: deploy the proxy in `app-studio/proxy/` (fal.ai Kling image-to-video),
 * set EXPO_PUBLIC_API_URL to its URL, and this returns a real { videoUrl }.
 * The rest of the app does not change.
 *
 * Kling is async (~30s–2min), so the proxy is a JOB + POLL pair:
 *   POST /api/generate → { jobId }        (returns instantly)
 *   GET  /api/status?jobId=… → processing | done { videoUrl } | error
 * This client submits once, then polls until done or a hard timeout.
 */
export type GenResult = { videoUrl: string | null; mock: boolean };

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const POLL_INTERVAL_MS = 4000;
const MAX_WAIT_MS = 480000; // Kling 3.0 renders ~2-5 min via the fal queue; allow slack

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateDance(photoUri: string, styleId: string): Promise<GenResult> {
  if (!API_URL) {
    await sleep(2600); // simulate render time
    return { videoUrl: null, mock: true };
  }
  const imageBase64 = await uriToBase64(photoUri);

  // 1) Submit the job.
  const submitRes = await fetch(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, styleId }),
  });
  const submitData = (await submitRes.json().catch(() => ({}))) as { jobId?: string; error?: string };
  if (!submitRes.ok || !submitData.jobId) {
    throw new Error(submitData.error || `submit failed: ${submitRes.status}`);
  }
  const jobId = submitData.jobId;

  // 2) Poll until done, error, or timeout.
  const deadline = Date.now() + MAX_WAIT_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    const statusRes = await fetch(`${API_URL}/api/status?jobId=${encodeURIComponent(jobId)}`);
    const statusData = (await statusRes.json().catch(() => ({}))) as {
      status?: string;
      videoUrl?: string;
      error?: string;
    };
    if (statusData.status === 'done' && statusData.videoUrl) {
      return { videoUrl: statusData.videoUrl, mock: false };
    }
    if (statusData.status === 'error') {
      throw new Error(statusData.error || 'generation failed');
    }
    // otherwise 'processing' → keep polling
  }
  throw new Error('Timed out — try again');
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
