import { MOCK_STORIES } from './data/mockData';
import type { PersistedLoverseData, Story, VoteMap } from './types';

export const STORAGE_KEY = 'loverse:data:v1';

function isStory(value: unknown): value is Story {
  if (!value || typeof value !== 'object') return false;
  const story = value as Partial<Story>;
  return typeof story.id === 'string'
    && typeof story.title === 'string'
    && Array.isArray(story.options);
}

export function loadLoverseData(): PersistedLoverseData {
  const fallback: PersistedLoverseData = {
    version: 1,
    stories: MOCK_STORIES,
    votes: {},
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

    return {
      version: 1,
      stories: parsed.stories.map(story => {
        const currentMock = MOCK_STORIES.find(mock => mock.id === story.id);
        if (!currentMock) return story;
        return {
          ...story,
          coverUrl: currentMock.coverUrl,
          coverSource: currentMock.coverSource,
        };
      }),
      votes: parsed.votes as VoteMap,
    };
  } catch {
    return fallback;
  }
}

export function saveLoverseData(stories: Story[], votes: VoteMap): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      stories,
      votes,
    } satisfies PersistedLoverseData));
  } catch {
    // The demo remains usable in memory when storage is unavailable or full.
  }
}
