import type { CoachInsight, Story, StoryCoachReview, VoteMap } from '../types';

const PATTERNS = {
  communicate: /问|说|沟通|确认|解释|对质|开口|谈/,
  wait: /等|观察|不做|装作|沉默|暂时|看看/,
  protect: /不回|删|离开|暂停|拒绝|边界|放弃/,
  express: /承认|主动|告诉|坦白|表白|直接/,
  reunion: /前任|复合|重逢|再一次|放下/,
};

function selectedStories(stories: Story[], votes: VoteMap) {
  return Object.entries(votes).flatMap(([storyId, optionId]) => {
    const story = stories.find(item => item.id === storyId);
    const option = story?.options.find(item => item.id === optionId);
    return story && option ? [{ story, option }] : [];
  });
}

function countMatches(values: string[], pattern: RegExp) {
  return values.filter(value => pattern.test(value)).length;
}

export function buildCoachInsight(stories: Story[], votes: VoteMap): CoachInsight {
  const selections = selectedStories(stories, votes);
  const ownStories = stories.filter(story => Number(story.id) > 1_000_000_000_000);
  const choiceTexts = selections.map(({ option }) => option.label);
  const corpus = [
    ...choiceTexts,
    ...selections.flatMap(({ story }) => [story.title, story.category ?? '', ...(story.moodTags ?? [])]),
    ...ownStories.flatMap(story => [story.title, story.dilemma ?? '', ...(story.moodTags ?? [])]),
  ];

  const scores = {
    communicate: countMatches(choiceTexts, PATTERNS.communicate),
    wait: countMatches(choiceTexts, PATTERNS.wait),
    protect: countMatches(choiceTexts, PATTERNS.protect),
    express: countMatches(choiceTexts, PATTERNS.express),
    reunion: countMatches(corpus, PATTERNS.reunion),
  };

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topKey = ranked[0]?.[1] ? ranked[0][0] : 'communicate';
  const patternLabels: Record<string, string> = {
    communicate: '先沟通确认',
    wait: '等待更多信号',
    protect: '先保护自己',
    express: '主动表达感受',
    reunion: '保留复合可能',
  };

  const profileTags = [
    scores.communicate > 0 ? '重视确定感' : '正在理解自己',
    scores.protect >= scores.express && scores.protect > 0 ? '边界探索中' : '正在学习表达',
    scores.wait > 0 ? '容易等待回应' : '愿意面对答案',
  ];
  if (scores.reunion > 0) profileTags.push('在意关系延续');

  const insights: CoachInsight['insights'] = [];
  if (scores.communicate > 0) insights.push({ title: '你更在意关系中的确定感', detail: '你常选择通过提问或对话减少猜测，希望关系有清晰的回应。' });
  if (scores.wait > 0) insights.push({ title: '你会为关系保留观察时间', detail: '你不急于把暧昧推向结论，但等待过久也可能消耗自己的感受。' });
  if (scores.protect > 0) insights.push({ title: '你比较重视边界清晰度', detail: '面对风险时，你倾向先稳住自己，再决定是否继续靠近。' });
  if (scores.express > 0) insights.push({ title: '你正在练习更直接地表达', detail: '你愿意让真实感受进入关系，而不是只留在心里反复推演。' });
  if (scores.reunion > 0) insights.push({ title: '你容易注意关系延续的可能', detail: '重逢和未完成的关系会吸引你的注意，也值得同步确认现实是否已经改变。' });
  if (insights.length === 0) insights.push({ title: '你的关系画像正在形成', detail: '再参与几次故事选择，Coach 会从你的真实倾向里找到更清晰的线索。' });

  const themeCounts = new Map<string, number>();
  selections.forEach(({ story }) => {
    [story.category, ...(story.moodTags ?? [])].filter(Boolean).forEach(theme => {
      themeCounts.set(theme as string, (themeCounts.get(theme as string) ?? 0) + 1);
    });
  });
  const themes = [...themeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([theme]) => theme);

  return {
    profileTags,
    insights: insights.slice(0, 4),
    weekly: {
      voteCount: selections.length,
      topPattern: patternLabels[topKey],
      themes,
      summary: selections.length
        ? `你最近更常选择“${patternLabels[topKey]}”。这不是固定性格，而是你当下保护关系与保护自己的方式。`
        : '这一周还没有新的选择记录。可以从一个真正让你犹豫的故事开始，不必急着得到标准答案。',
    },
    advice: [
      scores.protect > scores.communicate ? '本周建议：先确认边界，再投入更多情绪。' : '本周建议：把猜测改写成一个低压力的问题。',
      scores.wait > 0 ? '沟通提醒：给等待设置一个自己可以接受的期限。' : '沟通提醒：少猜测，多澄清。',
      scores.reunion > 0 ? '自我照顾：想念过去时，也检查现实是否真的发生了改变。' : '自我照顾：不要把回应延迟全部解释为拒绝。',
    ],
  };
}

export function buildStoryCoachReview(story: Story): StoryCoachReview {
  const originalChoice = story.userChoice || '发布者暂未公开';
  const crowdOption = [...story.options].sort((a, b) => b.percentage - a.percentage)[0];
  const crowdChoice = crowdOption?.label || story.crowdChoice || '暂未形成多数';
  const sameDirection = crowdChoice.includes(originalChoice) || originalChoice.includes(crowdChoice);
  const combined = `${originalChoice} ${story.dilemma ?? ''}`;
  const waiting = PATTERNS.wait.test(combined);
  const protecting = PATTERNS.protect.test(combined);

  return {
    originalChoice,
    crowdChoice,
    difference: sameDirection ? '你的直觉与当前多数方向接近。' : '你的原始倾向和当前多数并不完全相同。',
    reflection: waiting
      ? '你似乎更愿意为关系保留希望与观察空间。这说明你重视关系的延续，但也要留意自己是否停留在没有期限的不确定里。'
      : protecting
        ? '你会先确保自己不被进一步消耗，再决定是否靠近。这是一种边界意识，也可以给真实沟通留一个小入口。'
        : '你愿意让关系往前走一步，同时也在寻找足够安全的表达方式。答案不必一次说完，清晰可以从一句小问题开始。',
    advice: [
      '把最担心的结果写下来，区分事实和猜测。',
      '用一句低压力的话确认对方的真实态度。',
      '为下一次观察或等待设定一个明确时间点。',
    ],
  };
}
