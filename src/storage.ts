import { MOCK_STORIES } from './data/mockData';
import { createEmptyBounty, DEMO_VIEWER_ID } from './services/bountyService';
import type { BountyLedgerEntry, PersistedLoverseData, Story, VoteMap } from './types';

export const STORAGE_KEY = 'loverse:data:v1';

function isStory(value: unknown): value is Story {
  if (!value || typeof value !== 'object') return false;
  const story = value as Partial<Story>;
  return typeof story.id === 'string'
    && typeof story.title === 'string'
    && Array.isArray(story.options);
}

function normalizeStory(story: Story, viewerId: string): Story {
  const currentMock = MOCK_STORIES.find(mock => mock.id === story.id);
  const sourceBounty = story.bounty ?? currentMock?.bounty;
  return {
    ...story,
    ownerId: story.ownerId
      ?? currentMock?.ownerId
      ?? (Number(story.id) > 1_000_000_000_000 ? viewerId : `demo-author-${story.id}`),
    storyStatus: story.storyStatus ?? (story.status === '已完结' ? 'ended' : 'voting'),
    bounty: sourceBounty
      ? {
          amount: sourceBounty.amount ?? 0,
          status: sourceBounty.status ?? (sourceBounty.amount > 0 ? 'open' : 'none'),
          settledAt: sourceBounty.settledAt ?? null,
          responses: Array.isArray(sourceBounty.responses) ? sourceBounty.responses : [],
          winners: Array.isArray(sourceBounty.winners) ? sourceBounty.winners : [],
          allocations: Array.isArray(sourceBounty.allocations) ? sourceBounty.allocations : [],
        }
      : createEmptyBounty(),
    coverUrl: currentMock?.coverUrl ?? story.coverUrl,
    coverSource: currentMock?.coverSource ?? story.coverSource,
  };
}

export function loadLoverseData(): PersistedLoverseData {
  const viewerId = DEMO_VIEWER_ID;
  const fallback: PersistedLoverseData = {
    version: 1,
    viewerId,
    stories: MOCK_STORIES.map(story => normalizeStory(story, viewerId)),
    votes: {},
    bountyLedger: [],
  };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<PersistedLoverseData>;
    if (
      parsed.version !== 1
      || !Array.isArray(parsed.stories)
      || !parsed.stories.every(isStory)
      || !parsed.votes
      || typeof parsed.votes !== 'object'
    ) {
      return fallback;
    }

    const normalizedViewerId = typeof parsed.viewerId === 'string' && parsed.viewerId
      ? parsed.viewerId
      : DEMO_VIEWER_ID;

    return {
      version: 1,
      viewerId: normalizedViewerId,
      stories: parsed.stories.map(story => normalizeStory(story, normalizedViewerId)),
      votes: parsed.votes as VoteMap,
      bountyLedger: Array.isArray(parsed.bountyLedger) ? parsed.bountyLedger : [],
    };
  } catch {
    return fallback;
  }
}

export function saveLoverseData(
  stories: Story[],
  votes: VoteMap,
  viewerId: string,
  bountyLedger: BountyLedgerEntry[],
): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      viewerId,
      stories,
      votes,
      bountyLedger,
    } satisfies PersistedLoverseData));
  } catch {
    // The demo remains usable in memory when storage is unavailable or full.
  }
}
