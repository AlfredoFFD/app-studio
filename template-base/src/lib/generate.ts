/**
 * Generation client — the single seam between the app and the AI backend.
 *
 * TODAY: no EXPO_PUBLIC_API_URL set → mock latency, returns { mock: true }.
 * The UI then animates the user's own photo as a "preview" (Expo-Go-safe, $0).
 *
 * REAL: deploy the proxy in `app-studio/proxy/` (fal.ai Kling image-to-video),
 * set EXPO_PUBLIC_API_URL to its URL, and this returns a real { videoUrl }.
 * The rest of the app does not change.
 */
export type GenResult = { videoUrl: string | null; mock: boolean };

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function generateDance(photoUri: string, styleId: string): Promise<GenResult> {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 2600)); // simulate render time
    return { videoUrl: null, mock: true };
  }
  const imageBase64 = await uriToBase64(photoUri);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000); // video gen ~1min; allow slack
  try {
    const res = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, styleId }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`generate failed: ${res.status}`);
    const data = (await res.json()) as { videoUrl?: string; error?: string };
    if (!data.videoUrl) throw new Error(data.error || 'no video returned');
    return { videoUrl: data.videoUrl, mock: false };
  } finally {
    clearTimeout(timeout);
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
