/**
 * coverService.ts — Story cover lifecycle helpers.
 *
 * Cover priority (highest to lowest):
 *   1. story.coverUrl   — user-uploaded or AI-generated URL
 *   2. story.cover      — legacy field (backward compat)
 *   3. CSS fallback     — getFallbackCover() from imageProvider
 *
 * To integrate real image generation:
 *   - Implement POST /api/generate-cover server-side
 *   - That route reads provider keys from process.env (never frontend)
 *   - generateCoverImage() in imageProvider.ts calls that route
 */

import type { Story } from '../types';
import {
  generateCoverPrompt,
  generateCoverImage,
  getFallbackCover,
  type CoverProvider,
} from './imageProvider';

export { getFallbackCover };

/** Resolve the best available image URL for a story. Returns null if only CSS fallback applies. */
export function resolveStoryCover(story: Story): string | null {
  return story.coverUrl ?? story.cover ?? story.generatedCover ?? null;
}

/** Build a descriptive prompt from story metadata (wrapper kept for backward compat). */
export { generateCoverPrompt as buildCoverPrompt };

/**
 * Enrich a story with cover metadata at creation time.
 * Sets coverPrompt and coverSource; does NOT fire async generation (call triggerCoverGeneration separately).
 */
export function initStoryCover(story: Story): Story {
  return {
    ...story,
    coverPrompt:  generateCoverPrompt(story),
    coverStatus:  story.coverUrl ? 'idle' : 'idle',
    coverSource:  story.coverUrl ? 'upload' : 'css',
  };
}

/**
 * Kick off async cover generation for a story.
 * Returns an updated story once the result arrives (or the same story on failure).
 * Safe to call fire-and-forget; never throws.
 */
export async function triggerCoverGeneration(
  story: Story,
  provider: CoverProvider = 'none',
  onUpdate?: (updated: Story) => void,
): Promise<Story> {
  const generating: Story = { ...story, coverStatus: 'generating' };
  onUpdate?.(generating);

  const result = await generateCoverImage(story, provider);

  const updated: Story = {
    ...generating,
    coverUrl:      result.imageUrl ?? story.coverUrl,
    coverPrompt:   result.prompt,
    coverStatus:   result.imageUrl ? 'ready' : result.status === 'mock' ? 'mock' : 'failed',
    coverSource:   result.imageUrl ? 'ai' : story.coverSource ?? 'css',
    coverProvider: result.provider,
  };

  onUpdate?.(updated);
  return updated;
}
