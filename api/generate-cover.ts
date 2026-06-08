/**
 * api/generate-cover.ts
 * Vercel-compatible serverless function (mock — no real API calls).
 *
 * Receives:  POST { story, provider }
 * Returns:   { imageUrl, prompt, status, provider }
 *
 * To connect a real image provider:
 *   1. Install the provider SDK server-side only.
 *   2. Read keys from process.env — NEVER from the request body.
 *   3. Replace the switch cases below with real API calls.
 *   4. Return { imageUrl: "https://...", status: "ready" } on success.
 *
 * Environment variables (set in Vercel dashboard / .env.local — never commit):
 *   OPENAI_API_KEY
 *   GOOGLE_API_KEY
 *   STABILITY_API_KEY
 */

type Provider =
  | 'openai'
  | 'gemini'
  | 'imagen'
  | 'stability'
  | 'midjourneyLike'
  | 'none';

interface RequestBody {
  story?: {
    id?: string;
    title?: string;
    category?: string;
    moodTags?: string[];
    dilemma?: string;
    currentNode?: string;
    tags?: string[];
  };
  provider?: Provider;
}

interface ResponseBody {
  imageUrl: string | null;
  prompt: string;
  status: 'mock' | 'generating' | 'ready' | 'failed';
  provider: Provider;
}

function buildPrompt(story: RequestBody['story']): string {
  if (!story) return 'A beautiful story cover card in Loverse editorial style.';
  const category = story.category ?? story.tags?.[0] ?? '现代爱情';
  const mood     = story.moodTags?.join(', ') ?? story.tags?.[0] ?? 'emotional';
  const dilemma  = (story.dilemma ?? story.currentNode ?? '').slice(0, 50);
  return [
    `Loverse story cover card for "${story.title ?? 'Untitled'}".`,
    `Category: ${category}. Mood: ${mood}.`,
    dilemma ? `Theme: ${dilemma}.` : '',
    'Vintage editorial illustration, painterly, no faces, no text, story card border.',
    'Portrait 3:4 ratio.',
  ].filter(Boolean).join(' ');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function handler(req: any, res: any): void {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const body: RequestBody = req.body ?? {};
  const provider: Provider = body.provider ?? 'none';
  const prompt = buildPrompt(body.story);

  // Provider routing — all mock for now; replace with real calls when ready
  switch (provider) {
    case 'openai':
      // TODO: call OpenAI Images API via process.env.OPENAI_API_KEY
      break;
    case 'gemini':
    case 'imagen':
      // TODO: call Google Imagen via process.env.GOOGLE_API_KEY
      break;
    case 'stability':
      // TODO: call Stability AI via process.env.STABILITY_API_KEY
      break;
    case 'midjourneyLike':
      // TODO: call fal.ai / Replicate proxy
      break;
    case 'none':
    default:
      break;
  }

  const response: ResponseBody = {
    imageUrl: null,
    prompt,
    status: 'mock',
    provider,
  };

  res.status(200).json(response);
}
