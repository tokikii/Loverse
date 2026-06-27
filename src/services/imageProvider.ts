/**
 * imageProvider.ts — Loverse Cover Service
 *
 * Provides:
 *  - CATEGORY_GRADIENTS      CSS gradient map (used as fallback backgrounds)
 *  - FallbackCoverData       Rich CSS cover data (gradient + symbol + label + fileNumber)
 *  - getFallbackCover()      Returns FallbackCoverData for a story
 *  - generateCoverPrompt()   Builds a Loverse-style image prompt from story metadata
 *  - generateCoverImage()    Calls /api/generate-cover, silently falls back on error
 *
 * NEVER put API keys in this file. All provider keys must live server-side.
 * To integrate a real provider, implement POST /api/generate-cover on the server.
 */

import type { Story } from '../types';

// ─── CSS gradient palette per category ───────────────────────────────
export const CATEGORY_GRADIENTS: Record<string, string> = {
  '青春':  'linear-gradient(145deg, #EDE0F5 0%, #F9EFE6 55%, #E8F2EE 100%)',
  '失恋':  'linear-gradient(145deg, #C0CED8 0%, #B0BEC8 55%, #A0AEC0 100%)',
  'Crush': 'linear-gradient(145deg, #F5D8CC 0%, #F5EAE0 55%, #EDD8D0 100%)',
  '职场':  'linear-gradient(145deg, #D4B896 0%, #E8CCA8 55%, #F0DCC0 100%)',
  '复合':  'linear-gradient(145deg, #CFBED8 0%, #E9DCE5 48%, #D8C7BD 100%)',
  '现言':  'linear-gradient(145deg, #F5E8D0 0%, #EEDFC8 55%, #E5D5B8 100%)',
  '古言':  'linear-gradient(145deg, #1A2D4D 0%, #243660 55%, #1A2840 100%)',
  'LGBTQ': 'linear-gradient(145deg, #F5D0E8 0%, #E8D0F5 55%, #D0E8F5 100%)',
  '推荐':  'linear-gradient(145deg, #F5EFE7 0%, #EEDAD1 55%, #E8D5C8 100%)',
  '悬疑':  'linear-gradient(145deg, #2A2A3A 0%, #3A3A4A 55%, #2A2A3A 100%)',
  '科幻':  'linear-gradient(145deg, #1D2D4D 0%, #2D3D6D 55%, #1D3050 100%)',
  '童话':  'linear-gradient(145deg, #F0D8F0 0%, #E8D8F5 55%, #D8EAF5 100%)',
  '冒险':  'linear-gradient(145deg, #C8E0D0 0%, #D8ECD8 55%, #E8EED0 100%)',
  '家庭':  'linear-gradient(145deg, #F5E8D8 0%, #EDD8C8 55%, #E8D0C0 100%)',
  '成长':  'linear-gradient(145deg, #D8E8D8 0%, #E0EDD8 55%, #E8F0E0 100%)',
  '奇幻':  'linear-gradient(145deg, #E0D0F5 0%, #D0D8F5 55%, #C8D8EE 100%)',
};

const DEFAULT_GRADIENT = 'linear-gradient(145deg, #F5EFE7 0%, #EEDAD1 100%)';

// ─── Per-category visual identity for CSS fallback covers ─────────────
interface CategoryAccent {
  color: string;
  symbol: string;
  label: string;
}

const CATEGORY_ACCENTS: Record<string, CategoryAccent> = {
  '青春':  { color: '#9B7DB0', symbol: '◌',  label: 'Youth'     },
  '失恋':  { color: '#5A7890', symbol: '✉',  label: 'Heartbreak' },
  'Crush': { color: '#C07880', symbol: '◎',  label: 'Crush'     },
  '职场':  { color: '#A06840', symbol: '▣',  label: 'Work'      },
  '复合':  { color: '#8D6A91', symbol: '↺',  label: 'Again'     },
  '现言':  { color: '#8A7040', symbol: '❧',  label: 'Romance'   },
  '古言':  { color: '#C0A050', symbol: '☽',  label: 'Classic'   },
  'LGBTQ': { color: '#9060A0', symbol: '∞',  label: 'Love'      },
  '悬疑':  { color: '#A09080', symbol: '◈',  label: 'Mystery'   },
  '科幻':  { color: '#6080B0', symbol: '✦',  label: 'Sci-Fi'    },
  '童话':  { color: '#9080C0', symbol: '✿',  label: 'Fairy Tale' },
  '冒险':  { color: '#608060', symbol: '◬',  label: 'Adventure' },
};

const DEFAULT_ACCENT: CategoryAccent = { color: '#907060', symbol: '◌', label: 'Story' };

// ─── Public types ──────────────────────────────────────────────────────
export interface FallbackCoverData {
  gradient: string;
  accentColor: string;
  symbol: string;
  label: string;
  fileNumber: string;
  category: string;
  titleInitial: string;
}

export type CoverProvider =
  | 'openai'
  | 'gemini'
  | 'imagen'
  | 'stability'
  | 'midjourneyLike'
  | 'none';

export interface CoverGenerationResult {
  imageUrl: string | null;
  prompt: string;
  status: 'mock' | 'generating' | 'ready' | 'failed';
  provider: CoverProvider;
}

// ─── getFallbackCover ──────────────────────────────────────────────────
/** Returns rich CSS fallback cover data for a story. Never throws. */
export function getFallbackCover(story: Story): FallbackCoverData {
  const category = story.category ?? story.tags?.[0] ?? '';
  const accent    = CATEGORY_ACCENTS[category] ?? DEFAULT_ACCENT;
  const gradient  = CATEGORY_GRADIENTS[category] ?? DEFAULT_GRADIENT;
  const numId     = parseInt(story.id) || story.id.charCodeAt(0);
  return {
    gradient,
    accentColor:  accent.color,
    symbol:       accent.symbol,
    label:        accent.label,
    fileNumber:   `L-${String((numId % 8999) + 1000)}`,
    category,
    titleInitial: story.title?.[0] ?? '?',
  };
}

// ─── generateCoverPrompt ───────────────────────────────────────────────
/**
 * Builds a Loverse-style prompt for image generation APIs.
 * Visual identity: vintage editorial, card-like, painterly, no realistic faces, no text.
 */
export function generateCoverPrompt(story: Story): string {
  const category = story.category ?? story.tags?.[0] ?? '现代爱情';
  const mood     = story.moodTags?.join(', ') ?? story.tags[0] ?? 'emotional';
  const dilemma  = (story.dilemma ?? story.currentNode ?? '').slice(0, 50);

  const styleMap: Record<string, string> = {
    '古言':  'deep navy ink wash painting, gold foil moon and lantern accents, classical Chinese aesthetic, aged parchment',
    '失恋':  'misty blue-grey watercolor, torn letter motif, cracked glass lines, melancholic editorial card',
    'Crush': 'soft blush pink illustration, afternoon window light, small moon in corner, romantic editorial card style',
    '青春':  'warm cream paper texture, pressed flowers, notebook margin doodles, school corridor light',
    '职场':  'terracotta orange tones, newspaper clipping collage, wax seal stamp impression, typewriter era aesthetic',
    '复合':  'dusty mauve and warm taupe, two overlapping letters, restrained nostalgic editorial collage',
    '现言':  'creamy off-white background, loose ink brush strokes, flowering branch silhouette, elegant modern simplicity',
    'LGBTQ': 'prismatic soft light, delicate overlapping translucent color washes, quiet intimacy, tender abstract',
    '悬疑':  'dark charcoal and ash tones, single lamp casting shadows, noir silhouette figure, film noir card aesthetic',
    '科幻':  'deep ocean blue, subtle circuit board patterns, starfield backdrop, minimalist science fiction card',
    '童话':  'storybook gouache style, soft violet and turquoise palette, sugar-spun whimsy details, fairy tale card border',
    '冒险':  'forest green and earthy tones, map fragment texture, compass rose motif, adventure journal aesthetic',
  };

  const styleGuide =
    styleMap[category] ??
    'editorial illustration, warm muted tones, literary card aesthetic, soft grain texture';

  return [
    `Loverse story cover card for "${story.title}".`,
    `Category: ${category}. Emotional mood: ${mood}.`,
    dilemma ? `Narrative theme: ${dilemma}.` : '',
    `Art style: ${styleGuide}.`,
    'Vintage print grain texture. Small archive file number in corner. Decorative story card border frame.',
    'Muted cream or paper-tone background. No realistic human faces. No typography overlays. No horror or clown imagery.',
    'Portrait 3:4 ratio. Painterly illustration only.',
  ].filter(Boolean).join(' ');
}

// ─── generateCoverImage ────────────────────────────────────────────────
/**
 * Requests cover generation from the server proxy at POST /api/generate-cover.
 *
 * Gracefully falls back to { imageUrl: null, status: 'mock' } when:
 *  - Running locally without the API endpoint
 *  - The server returns a non-OK status
 *  - A network error occurs
 *
 * Future integration: implement /api/generate-cover server-side to call
 * the desired provider using environment variables (never frontend keys):
 *   process.env.OPENAI_API_KEY
 *   process.env.GOOGLE_API_KEY
 *   process.env.STABILITY_API_KEY
 */
export async function generateCoverImage(
  story: Story,
  provider: CoverProvider = 'none',
): Promise<CoverGenerationResult> {
  const prompt   = generateCoverPrompt(story);
  const fallback: CoverGenerationResult = { imageUrl: null, prompt, status: 'mock', provider };

  try {
    const res = await fetch('/api/generate-cover', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ story, provider }),
    });
    if (!res.ok) return fallback;
    const data = await res.json() as Partial<CoverGenerationResult>;
    return {
      imageUrl: data.imageUrl ?? null,
      prompt:   data.prompt   ?? prompt,
      status:   data.status   ?? 'mock',
      provider: data.provider ?? provider,
    };
  } catch {
    return fallback;
  }
}
