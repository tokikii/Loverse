export type View = 'home' | 'detail' | 'camp' | 'result' | 'create' | 'camps' | 'profile' | 'coach';

export type StoryStatus = '投票中' | '已完结';
export type StoryLifecycleStatus = 'voting' | 'ended';
export type BountyStatus = 'none' | 'open' | 'settling' | 'settled';

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
  voteCount?: number;
  previewText: string;
  campName: string;
}

export interface BountyResponse {
  voterId: string;
  nickname: string;
  optionId: string;
  reason: string;
  createdAt: string;
  isEligibleForReward: boolean;
}

export interface BountyAllocation {
  voterId: string;
  nickname: string;
  amount: number;
  rank: number;
}

export interface Bounty {
  amount: number;
  status: BountyStatus;
  settledAt: string | null;
  responses: BountyResponse[];
  winners: string[];
  allocations: BountyAllocation[];
}

export interface BountyLedgerEntry {
  id: string;
  storyId: string;
  viewerId: string;
  type: 'issued' | 'received';
  amount: number;
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  ownerId?: string;
  storyStatus?: StoryLifecycleStatus;
  bounty?: Bounty;
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

export type VoteMap = Record<string, string>;

export interface PersistedLoverseData {
  version: 1;
  viewerId: string;
  stories: Story[];
  votes: VoteMap;
  bountyLedger: BountyLedgerEntry[];
}

export interface CoachInsight {
  profileTags: string[];
  insights: Array<{ title: string; detail: string }>;
  weekly: {
    voteCount: number;
    topPattern: string;
    themes: string[];
    summary: string;
  };
  advice: string[];
}

export interface StoryCoachReview {
  originalChoice: string;
  crowdChoice: string;
  difference: string;
  reflection: string;
  advice: string[];
}
