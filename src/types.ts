export type View = 'home' | 'detail' | 'camp' | 'result' | 'create' | 'camps' | 'profile';

export type StoryStatus = '投票中' | '已完结';

export interface Chapter {
  title: string;
  content: string;
  phase: 'previous' | 'current' | 'generated';
}

export interface Option {
  id: string;
  label: string;
  percentage: number;
  votes: string;
  previewText: string;
  campName: string;
}

export interface Story {
  id: string;
  title: string;
  // Loverse relationship fields (optional for backward-compat with CreateView)
  category?: string;
  moodTags?: string[];
  dilemma?: string;
  userChoice?: string;
  crowdChoice?: string;
  opening?: string;
  status?: StoryStatus;
  healingAvailable?: boolean;
  // Cover fields — new primary field is coverUrl; cover kept for legacy compat
  coverUrl?: string;
  cover?: string;
  coverSource?: 'css' | 'upload' | 'ai';
  coverProvider?: 'openai' | 'gemini' | 'imagen' | 'stability' | 'midjourneyLike' | 'none';
  coverPrompt?: string;
  coverStatus?: 'idle' | 'pending' | 'generating' | 'ready' | 'failed' | 'mock';
  // Legacy cover fields (kept for backward compat)
  generatedCover?: string;
  fallbackCover?: string;
  tags: string[];
  currentNode: string;
  description: string;
  chapters: Chapter[];
  options: Option[];
  endTime: string;
  totalVotes: string;
  trend: string;
  hotness: number;
}
