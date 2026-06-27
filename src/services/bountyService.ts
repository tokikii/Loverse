import type { Bounty, BountyAllocation, BountyResponse, Story } from '../types';

export const DEMO_VIEWER_ID = 'viewer-local-demo';
export const SAFETY_MESSAGE = '这段关系可能涉及需要优先保护自己的情况。此时比起征集判断，更重要的是寻求可信赖的支持与安全帮助。';

const HIGH_RISK_PATTERN = /暴力|威胁|控制|跟踪|尾随|监视|自伤|伤害自己|伤害他人|殴打|勒索|强迫/;

export function createEmptyBounty(amount = 0): Bounty {
  return {
    amount,
    status: amount > 0 ? 'open' : 'none',
    settledAt: null,
    responses: [],
    winners: [],
    allocations: [],
  };
}

export function isHighRiskStory(story: {
  title?: string;
  description?: string;
  dilemma?: string;
  tags?: string[];
  moodTags?: string[];
  options?: Array<{ label: string }>;
}): boolean {
  const corpus = [
    story.title,
    story.description,
    story.dilemma,
    ...(story.tags ?? []),
    ...(story.moodTags ?? []),
    ...(story.options ?? []).map(option => option.label),
  ].filter(Boolean).join(' ');
  return HIGH_RISK_PATTERN.test(corpus);
}

export function isEligibleReason(reason: string): boolean {
  return (reason.match(/[\u3400-\u9fff]/g) ?? []).length >= 10;
}

export function upsertBountyResponse(
  responses: BountyResponse[],
  response: Omit<BountyResponse, 'isEligibleForReward'>,
): BountyResponse[] {
  const next = {
    ...response,
    isEligibleForReward: isEligibleReason(response.reason),
  };
  return [...responses.filter(item => item.voterId !== response.voterId), next];
}

export function getAllocationPercentages(count: number): number[] {
  if (count === 1) return [1];
  if (count === 2) return [0.6, 0.4];
  if (count === 3) return [0.5, 0.3, 0.2];
  return [];
}

export function buildAllocations(
  amount: number,
  selectedVoterIds: string[],
  responses: BountyResponse[],
): BountyAllocation[] {
  const percentages = getAllocationPercentages(selectedVoterIds.length);
  return selectedVoterIds.map((voterId, index) => {
    const response = responses.find(item => item.voterId === voterId);
    return {
      voterId,
      nickname: response?.nickname ?? '匿名回应者',
      amount: Math.round(amount * percentages[index]),
      rank: index + 1,
    };
  });
}

export function bountyStatusLabel(story: Story): string {
  if (story.bounty?.status === 'settled') return '赏金已结算';
  if (story.storyStatus === 'ended' || story.bounty?.status === 'settling') return '赏金待结算';
  return '投票中';
}
