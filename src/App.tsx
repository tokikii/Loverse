import React, { useState, useMemo } from 'react';
import {
  Search, Plus, User, ChevronRight, Clock, Users, TrendingUp,
  Share2, MessageSquare, Trophy, ArrowLeft, Zap, Sparkles,
  Flame, LayoutGrid, X, Send, ChevronDown, BookOpen, Heart,
  Star, Activity, Brain,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { View, Story } from './types';
import { MOCK_STORIES, CATEGORIES, SECONDARY_CATEGORIES } from './data/mockData';
import { CATEGORY_GRADIENTS, getFallbackCover } from './services/imageProvider';
import { initStoryCover } from './services/coverService';

// ─── constants ───────────────────────────────────────────────────────
const DEFAULT_GRADIENT = 'linear-gradient(145deg, #F5EFE7 0%, #EEDAD1 100%)';
const SQUIRREL_AVATAR = 'https://cdn.midjourney.com/ca1a7534-8078-4ea5-99a6-fcd23e92a9de/0_3.png';

// ─── SquirrelAvatar ──────────────────────────────────────────────────
const SquirrelAvatar: React.FC<{ className?: string }> = ({ className }) => {
  const [err, setErr] = useState(false);
  return err ? (
    <div
      className={`flex items-center justify-center ${className ?? ''}`}
      style={{ background: 'linear-gradient(135deg, #EDE0F5, #F5D0E8)' }}
    >
      <span className="font-display font-bold text-sm" style={{ color: '#b07090' }}>S</span>
    </div>
  ) : (
    <img
      src={SQUIRREL_AVATAR}
      alt="avatar"
      className={`object-cover ${className ?? ''}`}
      onError={() => setErr(true)}
      referrerPolicy="no-referrer"
    />
  );
};

const MOCK_AI_COACH = [
  {
    emotionalNeeds: {
      primary: '被确认感',
      analysis: '你选择继续等待，可能不是因为你不知道答案，而是因为你仍然需要一个被认真确认的时刻。你真正想要的也许不是关系立刻升级，而是对方能清楚地回应你的存在。',
      tags: [
        { label: '被确认感', score: 85 },
        { label: '关系确定性', score: 78 },
        { label: '被理解感', score: 72 },
        { label: '安全感', score: 65 },
        { label: '边界感', score: 45 },
      ],
    },
    personality: {
      label: '偏 Fi-Ni 倾向',
      analysis: '从这个选择看，你更像是在用 Fi 式的内在价值感判断关系：你在意这件事是否忠于自己的感受，而不只是它在别人看来是否合理。同时带有一些 Ni 倾向——你会在不确定中持续感知对方行为背后的深层意图。',
      disclaimer: '这不是正式心理测评，只是基于当前选择生成的关系倾向观察。',
    },
    suggestions: [
      { type: '可以说', content: '"我有时候不确定你怎么看我们。" 这句话不需要答案，只是让对方知道你有这个不确定感。' },
      { type: '可以观察', content: '对方在非重要时刻的回应速度和质量——这往往比他说什么更说明问题。' },
      { type: '先不做', content: '不必急着把这件事推向明确的结论，关系的节奏也是关系本身的一部分。' },
    ],
  },
  {
    emotionalNeeds: {
      primary: '关系确定性',
      analysis: '你回复了"在"，背后可能是一种还没放下的牵挂，也可能是你需要给这段关系一个真正意义上的句号。你寻找的不是复合，而是一个对你来说足够清晰的结局。',
      tags: [
        { label: '关系确定性', score: 88 },
        { label: '被确认感', score: 74 },
        { label: '亲密感', score: 68 },
        { label: '自主感', score: 60 },
        { label: '安全感', score: 55 },
      ],
    },
    personality: {
      label: '偏 Si-Fe 倾向',
      analysis: '这个选择里呈现出一种 Si 式的记忆倾向：你对曾经的关系有较强的情感存档，不容易轻易清除。同时有 Fe 的面向——你在意对方的感受，也在意这件事在关系语境中是否说得通。',
      disclaimer: '这不是正式心理测评，只是基于当前选择生成的关系倾向观察。',
    },
    suggestions: [
      { type: '可以说', content: '"我不是来复合的，我只是想知道你现在还好。" 如果这是真实的，说出来会减轻双方的压力。' },
      { type: '可以观察', content: '你在对话中的感受——是释然还是更乱？这会告诉你接下来要不要继续。' },
      { type: '先不做', content: '不必在这次对话里解决所有问题，先听他说什么，再决定你想回应什么。' },
    ],
  },
  {
    emotionalNeeds: {
      primary: '被理解感',
      analysis: '你在观察他是否真的喜欢你，而不只是在利用这个小小的互动维持一种舒适感。你想知道的不是"他喜不喜欢我"，而是"他有没有认真看见我"。',
      tags: [
        { label: '被理解感', score: 82 },
        { label: '被确认感', score: 75 },
        { label: '亲密感', score: 70 },
        { label: '安全感', score: 68 },
        { label: '自主感', score: 55 },
      ],
    },
    personality: {
      label: '偏 Fi-Ne 倾向',
      analysis: '这个选择里有明显的 Fi 特质：你不愿意在没有内心确认的情况下行动。同时带有 Ne 式的多种可能性探索——你在这件事上想过很多种解读，而不是只盯着一个答案。',
      disclaimer: '这不是正式心理测评，只是基于当前选择生成的关系倾向观察。',
    },
    suggestions: [
      { type: '可以说', content: '"下次你来借笔，我可以问你一个小问题吗？" 这不是表白，只是建立真实对话的一个开口。' },
      { type: '可以观察', content: '他在其他人身边的状态和在你身边的状态有没有明显不同——这个差异很说明问题。' },
      { type: '先不做', content: '不必急着给这段关系贴标签，先确认对方值不值得你多想，再决定下一步。' },
    ],
  },
];

// ─── helpers ────────────────────────────────────────────────────────
function getGradient(category?: string): string {
  return CATEGORY_GRADIENTS[category ?? ''] ?? DEFAULT_GRADIENT;
}

function getStoriesForTab(tab: string, all: Story[]): Story[] {
  if (tab === '推荐') return all.filter(s => (s.hotness ?? 0) >= 80 && !SECONDARY_CATEGORIES.includes(s.category ?? ''));
  if (tab === '其它宇宙') return all.filter(s => SECONDARY_CATEGORIES.includes(s.category ?? ''));
  return all.filter(s => s.category === tab);
}

function getMockAICoach(story: Story) {
  return MOCK_AI_COACH[parseInt(story.id) % MOCK_AI_COACH.length] ?? MOCK_AI_COACH[0];
}

// ─── CoverCell ───────────────────────────────────────────────────────
// Priority: story.coverUrl → story.cover (legacy) → CSS fallback
const CoverCell: React.FC<{
  story: Story;
  className?: string;
  children?: React.ReactNode;
}> = ({ story, className, children }) => {
  const [imgErr, setImgErr] = useState(false);
  const fallback = getFallbackCover(story);
  // coverUrl takes priority; fall back to legacy cover field
  const imgSrc   = story.coverUrl || story.cover || null;
  const showImg  = !!imgSrc && !imgErr;

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{ background: fallback.gradient }}
    >
      {/* CSS fallback overlay — visible when no image is loaded */}
      {!showImg && (
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none gap-1">
          <span
            className="text-3xl leading-none"
            style={{ color: fallback.accentColor, opacity: 0.28 }}
          >
            {fallback.symbol}
          </span>
          <span
            className="text-[7px] font-bold tracking-[0.18em] uppercase"
            style={{ color: fallback.accentColor, opacity: 0.18 }}
          >
            {fallback.fileNumber}
          </span>
        </div>
      )}
      {showImg && (
        <img
          src={imgSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgErr(true)}
          referrerPolicy="no-referrer"
        />
      )}
      {children}
    </div>
  );
};

// ─── Header ─────────────────────────────────────────────────────────
const Header = ({ onAction }: { onAction: (v: View) => void }) => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-sand">
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onAction('home')}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8D0F5, #F5D0E8)' }}>
        <Heart className="w-4 h-4" style={{ color: '#b07090' }} />
      </div>
      <h1 className="font-display font-bold text-lg tracking-tight">Loverse</h1>
    </div>
    <div className="flex items-center gap-2">
      <button className="w-9 h-9 rounded-full bg-sand/60 flex items-center justify-center hover:bg-sand transition-colors">
        <Search className="w-4 h-4 text-charcoal/60" />
      </button>
      <button
        onClick={() => onAction('create')}
        className="w-9 h-9 rounded-full bg-charcoal flex items-center justify-center hover:bg-charcoal/80 transition-colors"
      >
        <Plus className="w-4 h-4 text-cream" />
      </button>
      <button
        onClick={() => onAction('profile')}
        className="w-9 h-9 rounded-full bg-sand/60 flex items-center justify-center"
      >
        <User className="w-4 h-4 text-charcoal/60" />
      </button>
    </div>
  </header>
);

// ─── StoryCard ───────────────────────────────────────────────────────
const StoryCard = ({ story, onClick }: { story: Story; onClick: () => void }) => {
  const topOptions = story.options.slice(0, 3);
  const isSecondary = SECONDARY_CATEGORIES.includes(story.category ?? '');
  const numId = parseInt(story.id) || story.id.charCodeAt(0);
  const fileNum = `L-${String((numId % 8999) + 1000)}`;

  return (
    <motion.div
      layoutId={`card-${story.id}`}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border border-sand market-card-shadow cursor-pointer active:scale-[0.99] transition-transform"
    >
      {/* Cover */}
      <CoverCell story={story} className="h-36">
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 bg-white/25 backdrop-blur-sm border border-white/30 rounded-full text-white font-semibold">
            {story.category}
          </span>
          {story.moodTags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white/90">
              {tag}
            </span>
          ))}
        </div>
        {!isSecondary && story.status === '投票中' && (
          <div className="absolute top-3 right-3">
            <span
              className="stamp-badge text-orange-200 bg-orange-900/50 border-orange-300/60"
              style={{ transform: 'rotate(2deg)' }}
            >
              <Flame className="w-2 h-2 mr-0.5" /> 投票中
            </span>
          </div>
        )}
        {story.status === '已完结' && (
          <div className="absolute top-3 right-3">
            <span
              className="stamp-badge text-emerald-200 bg-emerald-900/50 border-emerald-300/60"
              style={{ transform: 'rotate(-2deg)' }}
            >
              已完结
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display font-bold text-white text-sm leading-snug drop-shadow-sm line-clamp-2">{story.title}</h3>
          <span className="text-[8px] font-bold tracking-[0.15em] text-white/40 mt-0.5 block">{fileNum}</span>
        </div>
      </CoverCell>

      <div className="p-4">
        {/* Dilemma & Choice comparison — core Loverse feature */}
        {story.dilemma && !isSecondary && (
          <div className="mb-3 bg-sand/30 rounded-xl p-3 border border-sand/60">
            <p className="text-[11px] text-charcoal/60 leading-relaxed italic mb-2">"{story.dilemma}"</p>
            <div className="flex gap-2 text-[10px]">
              <div className="flex-1 bg-white/70 rounded-lg px-2 py-1.5 border border-sand/50 text-center">
                <div className="text-charcoal/35 font-bold mb-0.5">发布者选择</div>
                <div className="text-charcoal/25 italic">投票后可见</div>
              </div>
              <div className="flex-1 bg-white/70 rounded-lg px-2 py-1.5 border border-sand/50 text-center">
                <div className="text-charcoal/35 font-bold mb-0.5">群体选择</div>
                <div className="text-charcoal/25 italic">投票后可见</div>
              </div>
            </div>
          </div>
        )}

        {isSecondary && (
          <p className="text-xs font-medium text-charcoal/60 mb-3 leading-snug italic line-clamp-2">
            "{story.currentNode}"
          </p>
        )}

        <div className="flex items-center gap-3 mb-3 text-[11px] text-charcoal/40 font-medium">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {story.endTime}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {story.totalVotes}</span>
          <span className="flex items-center gap-1 ml-auto text-charcoal/30"><TrendingUp className="w-3 h-3" /> {story.trend}</span>
        </div>

        <div className="space-y-1.5">
          {topOptions.map(opt => (
            <div key={opt.id} className="relative h-7 rounded-lg bg-sand/40 overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-clay/40 transition-all duration-700" style={{ width: `${opt.percentage}%` }} />
              <div className="absolute inset-0 px-3 flex items-center justify-between text-[10px] font-semibold">
                <span className="text-charcoal/75 truncate pr-2">{opt.label}</span>
                <span className="text-charcoal/50 flex-shrink-0">{opt.percentage}%</span>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-3 py-2.5 flex items-center justify-center text-xs font-bold text-charcoal/50 tracking-wide bg-sand/30 rounded-xl hover:bg-sand/60 transition-colors group">
          {isSecondary ? '进入故事' : '参与投票'}
          <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── HomeView ────────────────────────────────────────────────────────
const HomeView = ({ stories, onSelectStory }: { stories: Story[]; onSelectStory: (s: Story) => void }) => {
  const [activeTab, setActiveTab] = useState('推荐');

  const displayed = useMemo(
    () => getStoriesForTab(activeTab, stories),
    [activeTab, stories]
  );

  return (
    <div className="pt-20 pb-24 px-4">
      {/* Hero */}
      <section className="mb-5 px-1 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal/30 mb-2">Loverse · 关系档案馆</p>
        <h2 className="font-display font-bold text-3xl tracking-tight leading-tight mb-2">
          把你的故事
          <br />
          <span className="italic" style={{ color: '#b07090' }}>交给别人</span>
        </h2>
        <p className="text-charcoal/50 text-xs leading-relaxed">
          上传你在一段关系里的迟疑，让他人投票。投票结束后，你会看见自己的答案、大多数别人的答案，以及故事共同走向的结局。
        </p>
      </section>

      {/* Stats */}
      <div className="flex gap-3 mb-5 px-1">
        {[
          { label: '正在投票', value: `${stories.filter(s => s.status === '投票中').length + 120}` },
          { label: '参与人数', value: '38.4k' },
          { label: '故事完结', value: `${stories.filter(s => s.status === '已完结').length + 47}` },
        ].map(s => (
          <div key={s.label} className="flex-1 bg-white rounded-xl p-3 border border-sand text-center">
            <div className="font-display font-bold text-base">{s.value}</div>
            <div className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wide mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === cat
                ? 'bg-charcoal text-cream'
                : 'bg-white text-charcoal/50 border border-sand hover:border-charcoal/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeTab === '其它宇宙' && (
        <div className="mb-3 px-1">
          <p className="text-[10px] text-charcoal/35 font-medium">其它故事宇宙 — 悬疑 · 科幻 · 童话 · 冒险 · 奇幻</p>
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-charcoal/30">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">该类别暂无故事，快来上传你的关系岔路</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(story => (
            <StoryCard key={story.id} story={story} onClick={() => onSelectStory(story)} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── DetailView ──────────────────────────────────────────────────────
const DetailView = ({
  story, onBack, onJoinCamp,
}: {
  story: Story;
  onBack: () => void;
  onJoinCamp: (camp: string, story: Story) => void;
}) => {
  const [votedId, setVotedId] = useState<string | null>(null);
  const [chaptersExpanded, setChaptersExpanded] = useState(true);
  const isSecondary = SECONDARY_CATEGORIES.includes(story.category ?? '');

  const hasVoted = votedId !== null;
  const votedOption = story.options.find(o => o.id === votedId);
  const isMatchCrowd = hasVoted && votedOption?.label === story.crowdChoice;

  const prevChapters = story.chapters.filter(c => c.phase === 'previous');
  const curChapter  = story.chapters.find(c => c.phase === 'current');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-0 pb-28 bg-cream min-h-screen">
      {/* Cover */}
      <CoverCell story={story} className="h-56">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-14 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-1.5 mb-2 flex-wrap">
            <span className="text-[10px] text-white/90 border border-white/40 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm font-semibold">
              {story.category}
            </span>
            {story.moodTags?.map(t => (
              <span key={t} className="text-[10px] text-white/70 border border-white/20 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm">
                {t}
              </span>
            ))}
          </div>
          <h1 className="text-white font-display font-bold text-xl leading-tight">{story.title}</h1>
        </div>
      </CoverCell>

      <div className="px-4">
        {/* Stats */}
        <div className="flex gap-3 py-3.5 border-b border-sand/60 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-charcoal/50">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-semibold">{story.endTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-charcoal/50">
            <Users className="w-3.5 h-3.5" />
            <span>{story.totalVotes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs ml-auto" style={{ color: '#b57c3c' }}>
            <Flame className="w-3.5 h-3.5" />
            <span className="font-bold">{story.trend}</span>
          </div>
        </div>

        {/* Dilemma box — for relationship stories */}
        {!isSecondary && story.dilemma && (
          <div className="mb-4 rounded-2xl p-4 border border-sand/60" style={{ background: getGradient(story.category), opacity: 0.9 }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-2">上传者的迟疑</p>
            <p className="text-sm text-charcoal/85 leading-relaxed italic">{`"${story.dilemma}"`}</p>
            {!hasVoted && (
              <p className="text-[10px] text-charcoal/35 mt-3">投票后可查看发布者原本选择 · 群体对比 · AI 分析</p>
            )}
          </div>
        )}

        {/* Chapter Reader */}
        {(prevChapters.length > 0 || curChapter) && (
          <div className="mb-5">
            {prevChapters.length > 0 && (
              <div className="mb-3">
                <button
                  onClick={() => setChaptersExpanded(v => !v)}
                  className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-charcoal/40 hover:text-charcoal/60 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  故事开端
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${chaptersExpanded ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {chaptersExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      {prevChapters.map((ch, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-sand p-4 mb-3">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="w-5 h-5 rounded-full bg-sand flex items-center justify-center text-[10px] font-bold text-charcoal/40">{i + 1}</span>
                            <span className="text-xs font-bold text-charcoal/50">{ch.title}</span>
                          </div>
                          <p className="text-sm text-charcoal/75 leading-relaxed">{ch.content}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {curChapter && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-charcoal/40" />
                  <span className="text-xs font-bold uppercase tracking-widest text-charcoal/40">现在的处境</span>
                </div>
                <div className="bg-white rounded-2xl border-2 border-charcoal/10 p-4 mb-1" style={{ background: 'rgba(253,251,247,0.85)' }}>
                  <p className="text-xs font-bold text-charcoal/40 mb-2.5">{curChapter.title}</p>
                  <p className="text-sm text-charcoal/85 leading-relaxed">{curChapter.content}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vote panel */}
        <div className="bg-white rounded-2xl p-4 border border-sand market-card-shadow mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              <Zap className="w-3 h-3 fill-current" /> {isSecondary ? 'Critical Node' : '故事岔路口'}
            </span>
            <span className="text-[10px] text-charcoal/40 font-medium">{story.endTime}</span>
          </div>
          <p className="font-display font-bold text-base leading-snug italic text-charcoal/90 mb-4">
            "{story.currentNode}"
          </p>

          <div className="space-y-2.5">
            {story.options.map((opt, optIdx) => {
              const stripColors = ['#2D2D2D', '#C4724A', '#8BA5B5'];
              const stripColor = stripColors[optIdx % stripColors.length];
              return (
              <div key={opt.id}>
                <button
                  onClick={() => setVotedId(opt.id)}
                  className={`w-full relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                    votedId === opt.id ? 'border-charcoal/30 bg-charcoal/5' : 'border-sand bg-white hover:border-charcoal/20'
                  }`}
                >
                  {/* Left color strip */}
                  <div className="absolute left-0 inset-y-0 w-[3px]" style={{ background: stripColor, opacity: votedId === opt.id ? 0.7 : 0.35 }} />
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-700"
                    style={{
                      width: `${opt.percentage}%`,
                      background: votedId === opt.id ? 'rgba(45,45,45,0.08)' : 'rgba(229,218,206,0.4)',
                    }}
                  />
                  <div className="relative pl-5 pr-4 py-3 flex items-center justify-between">
                    <div className="text-left flex-1 mr-3">
                      <div className="font-semibold text-sm text-charcoal/90">{opt.label}</div>
                      <div className="text-[10px] text-charcoal/40 mt-0.5">{opt.votes} votes · {opt.campName}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-sm text-charcoal/60">{opt.percentage}%</span>
                      {votedId === opt.id
                        ? <div className="w-6 h-6 rounded-sm border-2 border-charcoal/50 flex items-center justify-center bg-charcoal/5" style={{ transform: 'rotate(-2deg)' }}><span className="text-[11px] font-black text-charcoal/70">✓</span></div>
                        : <div className="w-6 h-6 rounded-full border-2 border-sand flex items-center justify-center"><Plus className="w-3 h-3 text-charcoal/30" /></div>
                      }
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {votedId === opt.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-sand/20 border border-sand border-t-0 rounded-b-2xl px-4 pb-4 pt-3 space-y-2.5">
                        <p className="text-xs text-charcoal/60 leading-relaxed italic">走向预览：{opt.previewText}</p>
                        <div className="bg-white rounded-xl p-3 border border-sand/60 text-xs text-charcoal/60 leading-relaxed">
                          ✓ 你已支持这个走向 · 投票结束后可查看群体选择与自己的对比
                        </div>
                        <button
                          onClick={() => onJoinCamp(opt.campName, story)}
                          className="w-full bg-charcoal text-cream py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                        >
                          加入 {opt.campName} <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          </div>
        </div>

        {/* Post-vote: comparison + AI Coach — shown only after voting */}
        <AnimatePresence>
          {hasVoted && !isSecondary && (
            <motion.div
              key="post-vote"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-4 border border-sand market-card-shadow mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-3">投票对比</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-xl px-2.5 py-2.5 border text-[10px] relative overflow-hidden bg-ink-black/5 border-ink-black/15">
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-xl" style={{ background: '#2D2D2D', opacity: 0.35 }} />
                    <div className="text-charcoal/40 font-bold mb-1 mt-0.5">我的选择</div>
                    <div className="text-charcoal/75 leading-snug font-semibold">{votedOption?.label}</div>
                  </div>
                  <div className="rounded-xl px-2.5 py-2.5 border text-[10px] relative overflow-hidden bg-amber-50/70 border-amber-200/60">
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-xl" style={{ background: '#C4724A', opacity: 0.45 }} />
                    <div className="text-charcoal/40 font-bold mb-1 mt-0.5">发布者选</div>
                    <div className="text-charcoal/65 leading-snug">{story.userChoice}</div>
                  </div>
                  <div className="rounded-xl px-2.5 py-2.5 border text-[10px] relative overflow-hidden border-sage/60" style={{ background: 'rgba(208,226,212,0.25)' }}>
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-xl bg-sage" />
                    <div className="text-charcoal/40 font-bold mb-1 mt-0.5">群体多数</div>
                    <div className="text-charcoal/65 leading-snug">{story.crowdChoice}</div>
                  </div>
                </div>
                {isMatchCrowd
                  ? <span className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full font-bold">与多数一致</span>
                  : <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-full font-bold">与多数不同</span>
                }
              </div>
              <AICoachPanel story={story} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── CampView ────────────────────────────────────────────────────────
const CampView = ({
  campName, story, onBack, onShowResult,
}: {
  campName: string; story: Story; onBack: () => void; onShowResult: () => void;
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { user: 'shushu02', text: '这个走向感情张力最强，应该会赢！' },
    { user: 'shushu03', text: '结局我已经猜到了，就是这个走向没跑' },
    { user: 'shushu04', text: '加入了！一起守护这个选择 ✊' },
  ]);

  const opt  = story.options.find(o => o.campName === campName);
  const pct  = opt?.percentage ?? 0;
  const rank = story.options.findIndex(o => o.campName === campName) + 1;

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(m => [...m, { user: 'You', text: message.trim() }]);
    setMessage('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pt-0 pb-28 bg-cream min-h-screen">
      <div className="bg-charcoal px-4 pt-16 pb-6">
        <button onClick={onBack} className="mb-4 flex items-center gap-2 text-cream/60 text-sm">
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] text-cream/40 uppercase font-bold tracking-widest mb-1">{story.title}</div>
            <h1 className="text-2xl font-display font-bold text-cream">{campName}</h1>
            <p className="text-cream/50 text-xs italic mt-1">"{opt?.previewText?.slice(0, 40)}…"</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold text-clay">{pct}%</div>
            <div className="text-[9px] text-cream/30 uppercase font-bold tracking-widest mt-0.5">当前支持</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: '支持人数', value: opt?.votes ?? '—' },
            { label: '状态', value: pct >= 35 ? '领先' : pct >= 20 ? '紧追' : '落后' },
            { label: '排名', value: `#${rank}` },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <div className="text-[9px] text-cream/30 uppercase font-bold tracking-widest mb-1">{s.label}</div>
              <div className="font-bold text-cream text-sm">{s.value}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onShowResult}
          className="w-full mt-4 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-clay/20 text-clay border border-clay/30"
        >
          查看投票结果 <Sparkles className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pt-5 space-y-5">
        <div>
          <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-600" /> 贡献榜
          </h3>
          <div className="bg-white rounded-2xl border border-sand divide-y divide-sand">
            {['shushu02', 'shushu03', 'shushu04'].map((u, i) => (
              <div key={u} className="flex items-center gap-3 p-3.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-sand text-charcoal/40'}`}>{i + 1}</div>
                <SquirrelAvatar className="w-8 h-8 rounded-full flex-shrink-0 border border-sand" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{u}</div>
                  <div className="text-[10px] text-charcoal/40">参与贡献: {(3 - i) * 4120 + 800}</div>
                </div>
                {i === 0 && <span className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-100 px-2 py-0.5 rounded-full font-bold">TOP</span>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" style={{ color: '#b5956a' }} /> 选择讨论
          </h3>
          <div className="bg-white rounded-2xl border border-sand overflow-hidden">
            <div className="p-4 space-y-3 max-h-52 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.user === 'You' ? 'flex-row-reverse' : ''}`}>
                  {m.user !== 'You' ? <SquirrelAvatar className="w-7 h-7 rounded-full flex-shrink-0" /> : <div className="w-7 h-7 rounded-full bg-charcoal/20 flex-shrink-0" />}
                  <div className="max-w-[75%]">
                    <div className={`text-[10px] text-charcoal/40 mb-0.5 font-medium ${m.user === 'You' ? 'text-right' : ''}`}>{m.user}</div>
                    <div className={`text-xs px-3 py-2 rounded-xl leading-relaxed ${m.user === 'You' ? 'bg-charcoal text-cream' : 'bg-sand/40 text-charcoal/80'}`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-sand p-3 flex gap-2">
              <input
                type="text" value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="说说你支持这个走向的理由…"
                className="flex-1 bg-sand/20 rounded-xl px-3 py-2.5 text-xs border border-sand focus:ring-1 focus:ring-charcoal/20 outline-none"
              />
              <button onClick={sendMessage} className="w-10 h-10 rounded-xl bg-charcoal text-cream flex items-center justify-center flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── AICoachPanel ────────────────────────────────────────────────────
const AICoachPanel = ({ story }: { story: Story }) => {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<typeof MOCK_AI_COACH[0] | null>(null);

  const handleOpen = async () => {
    if (result) { setOpen(true); return; }
    setOpen(true);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setResult(getMockAICoach(story));
    setLoading(false);
  };

  return (
    <div className="mb-5">
      {!open ? (
        <button
          onClick={handleOpen}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-dashed transition-colors"
          style={{ borderColor: '#d0b0c0', color: '#b07090', background: 'rgba(240,215,230,0.15)' }}
        >
          <Brain className="w-4 h-4" />
          AI Coach — 关系心理分析
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-sand market-card-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" style={{ color: '#b07090' }} />
              <span className="font-bold text-sm">AI Coach</span>
              <span className="text-[10px] text-charcoal/40 bg-sand/40 px-2 py-0.5 rounded-full">关系心理分析</span>
            </div>
            <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-sand/50 flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-charcoal/40" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[80, 60, 70].map((w, i) => (
                <div key={i} className="animate-pulse-soft">
                  <div className="h-2.5 bg-sand rounded-full mb-1.5" style={{ width: `${w}%` }} />
                  <div className="h-2 bg-sand/60 rounded-full" style={{ width: `${w - 15}%` }} />
                </div>
              ))}
              <p className="text-[10px] text-charcoal/30 text-center mt-3">正在分析你的关系模式…</p>
            </div>
          ) : result && (
            <div className="space-y-5">
              {/* Module 1: Emotional Needs */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#b07090' }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">情感需求分析</p>
                </div>
                <span
                  className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border mb-2.5"
                  style={{ borderColor: '#d0b0c0', color: '#b07090', background: 'rgba(240,215,230,0.2)' }}
                >
                  核心需求：{result.emotionalNeeds.primary}
                </span>
                <p className="text-sm text-charcoal/75 leading-relaxed mb-3">{result.emotionalNeeds.analysis}</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.emotionalNeeds.tags.map(tag => (
                    <span key={tag.label} className="text-[10px] px-2.5 py-1 rounded-full bg-sand/40 border border-sand text-charcoal/55 font-medium">
                      {tag.label} <span className="text-charcoal/35">{tag.score}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Module 2: Personality Tendency */}
              <div className="border-t border-sand pt-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-charcoal/25" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">关系人格倾向</p>
                </div>
                <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full border border-charcoal/15 bg-white text-charcoal/65 mb-2.5">
                  {result.personality.label}
                </span>
                <p className="text-sm text-charcoal/70 leading-relaxed mb-2.5">{result.personality.analysis}</p>
                <p className="text-[10px] text-charcoal/30 italic leading-relaxed border-l-2 border-sand pl-2.5">
                  {result.personality.disclaimer}
                </p>
              </div>

              {/* Module 3: Action Suggestions */}
              <div className="border-t border-sand pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-charcoal/25" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">行动建议</p>
                </div>
                <div className="space-y-2.5">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="bg-sand/20 rounded-xl p-3 border border-sand/50">
                      <span className="text-[10px] font-bold text-charcoal/45 uppercase tracking-wide">{s.type}</span>
                      <p className="text-xs text-charcoal/65 leading-relaxed mt-1">{s.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── ResultView ──────────────────────────────────────────────────────
const ResultView = ({ story, onBack, onNextRound }: { story: Story; onBack: () => void; onNextRound: () => void }) => {
  const winner = story.options[0];
  const isSecondary = SECONDARY_CATEGORIES.includes(story.category ?? '');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-0 pb-28 bg-cream min-h-screen">
      <div className="relative h-32" style={{ background: 'linear-gradient(135deg, #2D2D2D, #4D4D4D)' }}>
        <button onClick={onBack} className="absolute top-14 left-4 flex items-center gap-2 text-cream/60 text-sm">
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
      </div>

      <div className="px-4 -mt-6">
        {/* Result summary */}
        <div className="bg-white rounded-2xl border border-sand market-card-shadow p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
              <TrendingUp className="w-3 h-3" /> 投票结果
            </span>
          </div>
          <h1 className="font-display font-bold text-xl mb-1">{winner.campName} 胜出</h1>
          <p className="text-sm text-charcoal/50">获胜比例 {winner.percentage}% · {winner.votes}</p>

          {/* User vs Crowd comparison — Loverse core */}
          {!isSecondary && story.userChoice && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-sand/30 rounded-xl p-3 text-xs">
                <div className="text-charcoal/40 font-bold mb-1">上传者倾向</div>
                <div className="text-charcoal/70 leading-snug">{story.userChoice}</div>
              </div>
              <div className="bg-sand/30 rounded-xl p-3 text-xs">
                <div className="text-charcoal/40 font-bold mb-1">群体多数选</div>
                <div className="text-charcoal/70 leading-snug">{story.crowdChoice}</div>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-2">
            {story.options.map((opt, i) => (
              <div key={opt.id} className="relative h-8 rounded-lg overflow-hidden bg-sand/30">
                <div className="absolute inset-y-0 left-0 transition-all duration-700" style={{ width: `${opt.percentage}%`, background: i === 0 ? 'rgba(100,150,80,0.25)' : 'rgba(229,218,206,0.6)' }} />
                <div className="absolute inset-0 px-3 flex items-center justify-between text-[11px] font-semibold">
                  <span className={`truncate pr-2 ${i === 0 ? 'text-green-800' : 'text-charcoal/60'}`}>{opt.label}</span>
                  <span className={i === 0 ? 'text-green-700 font-bold' : 'text-charcoal/40'}>{opt.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Generated next chapter */}
        <div className="bg-white rounded-2xl border border-sand market-card-shadow p-5 mb-5 relative overflow-hidden">
          <div className="absolute top-3 right-3"><Sparkles className="w-6 h-6 text-clay/40" /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 px-2.5 py-1 bg-sand/40 rounded-full inline-block mb-4">
            AI Generated · 故事续写
          </span>
          <p className="text-xs font-bold text-charcoal/40 uppercase tracking-widest mb-3">{story.title}</p>
          <div className="text-sm text-charcoal/80 leading-relaxed italic space-y-3">
            <p>"{winner.previewText}"</p>
            <p>故事在这里没有停止。它只是以最多人选择的方式，往前走了一步。</p>
          </div>
          <div className="mt-4 text-[10px] text-charcoal/30 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> AI 根据获胜走向生成下一章节
          </div>
        </div>

        {/* AI Coach — Loverse exclusive */}
        {!isSecondary && <AICoachPanel story={story} />}

        <div className="rounded-2xl p-5 border-2 border-dashed border-sand mb-5" style={{ background: 'rgba(229,218,206,0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 fill-current text-amber-600" />
            <span className="font-bold text-sm">下一个岔路口</span>
          </div>
          <p className="text-sm font-medium text-charcoal/80 leading-snug mb-4">
            故事还在继续。群体已经做出了选择，接下来的路口等待着新的投票。
          </p>
          <button onClick={onNextRound} className="w-full bg-charcoal text-cream py-3.5 rounded-xl font-bold text-sm">
            进入下一轮投票
          </button>
        </div>

        <button className="w-full border border-sand py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-white">
          <Share2 className="w-4 h-4" /> 分享这个故事
        </button>
      </div>
    </motion.div>
  );
};

// ─── CreateView ──────────────────────────────────────────────────────
const CreateView = ({ onBack, onPublish }: { onBack: () => void; onPublish: (story: Story) => void }) => {
  const [title, setTitle]         = useState('');
  const [dilemma, setDilemma]     = useState('');
  const [userChoice, setUserChoice] = useState('');
  const [category, setCategory]   = useState('青春');
  const [duration, setDuration]   = useState('24h');
  const [options, setOptions]     = useState(['', '', '']);
  const [published, setPublished] = useState(false);
  const [coverMode, setCoverMode] = useState<'css' | 'url'>('css');
  const [coverUrlInput, setCoverUrlInput] = useState('');

  const updateOption = (i: number, v: string) => setOptions(options.map((o, idx) => idx === i ? v : o));

  const handlePublish = () => {
    const valid = options.filter(o => o.trim());
    if (!title.trim() || valid.length < 2) return;
    const pctBase = Math.floor(100 / valid.length);
    const resolvedCoverUrl = coverMode === 'url' && coverUrlInput.trim() ? coverUrlInput.trim() : undefined;
    const newStory: Story = {
      id: Date.now().toString(),
      title,
      category,
      moodTags: [],
      dilemma,
      userChoice,
      crowdChoice: valid[0] ?? '',
      opening: dilemma,
      status: '投票中',
      healingAvailable: true,
      tags: [category],
      currentNode: dilemma || '你会怎么选？',
      description: dilemma,
      chapters: [{ title: '故事开端', content: dilemma || '正在展开…', phase: 'previous' }],
      endTime: duration,
      totalVotes: '0',
      trend: '+0%',
      hotness: 0,
      coverUrl: resolvedCoverUrl,
      coverSource: resolvedCoverUrl ? 'upload' : 'css',
      options: valid.map((label, i) => ({
        id: `new_${i}`,
        label,
        percentage: i === 0 ? 100 - pctBase * (valid.length - 1) : pctBase,
        votes: '0',
        previewText: '走向待揭晓…',
        campName: `方向 ${String.fromCharCode(65 + i)}`,
      })),
    };
    onPublish(newStory);
    setPublished(true);
  };

  if (published) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-0 pb-28 bg-cream min-h-screen flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #E8D0F5, #F5D0E8)' }}>
          <Heart className="w-8 h-8" style={{ color: '#b07090' }} />
        </div>
        <h2 className="font-display font-bold text-2xl mb-3">已放入 Loverse</h2>
        <p className="text-charcoal/60 text-sm leading-relaxed mb-8">
          你的故事岔路已被放入 Loverse，等待他人投票。<br />投票结束后，你会看见自己的选择和群体的答案。
        </p>
        <button onClick={onBack} className="bg-charcoal text-cream px-8 py-3.5 rounded-2xl font-bold text-sm">
          返回首页
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="pt-0 pb-28 bg-cream min-h-screen">
      <div className="flex items-center gap-3 px-4 pt-16 pb-5 border-b border-sand bg-cream">
        <button onClick={onBack} className="w-9 h-9 rounded-full border border-sand bg-white flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-display font-bold text-lg">上传你的关系岔路</h2>
          <p className="text-[10px] text-charcoal/40 mt-0.5">让他人帮你投票，看见你的选择和群体的差异</p>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">给这段关系困惑起个名字</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="用一句话描述这个故事，让人想点进来…"
            className="w-full bg-white rounded-xl p-3.5 border border-sand focus:ring-2 focus:ring-charcoal/20 outline-none text-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">简单说说你正在犹豫什么</label>
          <textarea value={dilemma} onChange={e => setDilemma(e.target.value)} rows={3}
            placeholder="描述你的处境和迟疑，真实最重要…"
            className="w-full bg-white rounded-xl p-3.5 border border-sand focus:ring-2 focus:ring-charcoal/20 outline-none text-sm resize-none" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">你原本更想选择什么</label>
          <input value={userChoice} onChange={e => setUserChoice(e.target.value)}
            placeholder="你心里倾向的方向是什么？"
            className="w-full bg-white rounded-xl p-3.5 border border-sand focus:ring-2 focus:ring-charcoal/20 outline-none text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">关系处境</label>
            <div className="relative">
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-white rounded-xl p-3.5 border border-sand outline-none text-sm appearance-none pr-8">
                {['青春', '失恋', 'Crush', '职场', '现言', '古言', 'LGBTQ'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-charcoal/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">投票时长</label>
            <div className="grid grid-cols-2 gap-1.5">
              {['1h','6h','12h','24h'].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`py-3 rounded-xl text-xs font-bold transition-all ${duration === d ? 'bg-charcoal text-cream' : 'bg-white border border-sand text-charcoal/50'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-sand p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-sm">你希望大家帮你投票的三个方向</h4>
          </div>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-sand flex items-center justify-center text-[11px] font-bold text-charcoal/50 flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <input value={opt} onChange={e => updateOption(i, e.target.value)}
                placeholder={`方向 ${String.fromCharCode(65 + i)}…`}
                className="flex-1 bg-sand/20 rounded-xl px-3 py-2.5 text-sm border border-sand outline-none focus:ring-1 focus:ring-charcoal/20" />
            </div>
          ))}
        </div>

        {/* Cover source selector */}
        <div className="bg-white rounded-2xl border border-sand p-4 space-y-3">
          <h4 className="font-display font-bold text-sm">故事封面</h4>
          <div className="flex gap-2">
            {(['css', 'url'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setCoverMode(mode)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  coverMode === mode
                    ? 'bg-charcoal text-cream border-charcoal'
                    : 'bg-white text-charcoal/50 border-sand hover:border-charcoal/20'
                }`}
              >
                {mode === 'css' ? '系统卡牌封面' : '输入图片 URL'}
              </button>
            ))}
          </div>
          {coverMode === 'url' ? (
            <input
              value={coverUrlInput}
              onChange={e => setCoverUrlInput(e.target.value)}
              placeholder="https://… 图片直链"
              className="w-full bg-sand/20 rounded-xl px-3 py-2.5 text-sm border border-sand outline-none focus:ring-1 focus:ring-charcoal/20"
            />
          ) : (
            <p className="text-[10px] text-charcoal/35 leading-relaxed">
              系统将根据故事分类自动生成卡牌风格封面。未来可接入 AI 图像生成。
            </p>
          )}
        </div>

        <div className="flex items-start gap-2.5 px-1 py-2 text-[11px] text-charcoal/40 leading-relaxed">
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>投票结束后，上传者可以看到自己的选择与群体选择的对比，以及 AI Coach 关系复盘。</span>
        </div>

        <button
          onClick={handlePublish}
          disabled={!title.trim() || options.filter(o => o.trim()).length < 2}
          className="w-full bg-charcoal text-cream py-4 rounded-2xl font-display font-bold text-base shadow-lg shadow-charcoal/10 disabled:opacity-40"
        >
          放入 Loverse
        </button>
      </div>
    </motion.div>
  );
};

// ─── CampsView ───────────────────────────────────────────────────────
const CampsView = ({ onSelectStory, stories }: { onSelectStory: (s: Story) => void; stories: Story[] }) => {
  const mockChoices = [
    { storyId: '101', myChoice: '反问：你去哪里？', crowdChoice: '反问：你去哪里？', match: true, status: '投票中' as const },
    { storyId: '501', myChoice: '给他几天，看他主动提不提', crowdChoice: '给他几天，看他主动提不提', match: true, status: '投票中' as const },
    { storyId: '201', myChoice: '回复"在"，等他说下去', crowdChoice: '不回复', match: false, status: '投票中' as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 pb-24 px-4 bg-cream min-h-screen">
      <section className="mb-5 px-1 pt-2">
        <h2 className="font-display font-bold text-2xl tracking-tight mb-1">我参与过的关系选择</h2>
        <p className="text-charcoal/50 text-sm">你投过的票，和群体的答案</p>
      </section>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: '参与故事', value: '3' },
          { label: '与多数相同', value: '2' },
          { label: '与多数不同', value: '1' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-sand text-center">
            <div className="font-display font-bold text-xl">{s.value}</div>
            <div className="text-[9px] text-charcoal/40 uppercase font-bold tracking-wide mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4 text-charcoal/60" /> 我的投票记录
      </h3>
      <div className="space-y-3 mb-6">
        {mockChoices.map((choice, i) => {
          const story = stories.find(s => s.id === choice.storyId);
          if (!story) return null;
          return (
            <div
              key={i}
              onClick={() => onSelectStory(story)}
              className="bg-white rounded-2xl border border-sand p-4 cursor-pointer hover:border-charcoal/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <CoverCell story={story} className="w-12 h-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-charcoal/80 line-clamp-1">{story.title}</span>
                    {choice.match
                      ? <span className="text-[9px] bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ml-1">与多数一致</span>
                      : <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ml-1">与多数不同</span>
                    }
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex gap-1">
                      <span className="text-charcoal/35 flex-shrink-0">我选择</span>
                      <span className="text-charcoal/65 truncate">{choice.myChoice}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-charcoal/35 flex-shrink-0">多数选</span>
                      <span className="text-charcoal/65 truncate">{choice.crowdChoice}</span>
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${choice.status === '投票中' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-sand text-charcoal/50'}`}>
                      {choice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-sand p-5 text-center">
        <p className="text-xs text-charcoal/40 leading-relaxed">参与更多故事投票，<br />在这里看见你的选择和大多数人的距离</p>
        <button className="mt-3 px-5 py-2 bg-charcoal text-cream text-xs font-bold rounded-xl">去首页探索</button>
      </div>
    </motion.div>
  );
};

// ─── ProfileView ─────────────────────────────────────────────────────
const ProfileView = ({ stories, onSelectStory }: { stories: Story[]; onSelectStory: (s: Story) => void }) => {
  const [activeTab, setActiveTab] = useState<'uploads' | 'portrait' | 'votes' | 'saved'>('uploads');
  const savedPhrases = [
    '你值得一段不需要猜测的感情。',
    '不是每段感情都需要一个结论。',
    '先开口的人，不一定输。',
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 pb-24 px-4 bg-cream min-h-screen">
      {/* Avatar block */}
      <div className="bg-white rounded-2xl border border-sand p-5 mb-5 flex items-center gap-4">
        <SquirrelAvatar className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <h2 className="font-display font-bold text-lg">shushu01</h2>
          <p className="text-xs text-charcoal/50 mt-0.5">在关系里总是等对方先开口的人</p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {['青春', '现言', '失恋'].map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 border border-sand rounded-full text-charcoal/50">#{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: '上传', value: '2' },
          { label: '投票', value: '14' },
          { label: '收藏', value: '6' },
          { label: '打卡', value: '12天' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-sand text-center">
            <div className="font-display font-bold text-lg leading-none">{s.value}</div>
            <div className="text-[9px] text-charcoal/40 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-sand/40 rounded-xl p-1">
        {(['uploads', 'portrait', 'votes', 'saved'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${activeTab === tab ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal/40'}`}
          >
            {tab === 'uploads' ? '我的档案' : tab === 'portrait' ? '我的自画像' : tab === 'votes' ? '我的投票' : '我的收藏'}
          </button>
        ))}
      </div>

      {activeTab === 'portrait' && (
        <div className="bg-white rounded-2xl border border-sand p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: '#b07090' }} />
              <h3 className="font-display font-bold text-base">我的自画像</h3>
            </div>
            <span className="text-[10px] text-charcoal/30 bg-sand/40 px-2 py-0.5 rounded-full">基于投票行为</span>
          </div>

          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/35 mb-2.5">情感需求分布</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '被确认感', score: 82 },
                { label: '安全感', score: 76 },
                { label: '亲密感', score: 71 },
                { label: '边界感', score: 64 },
                { label: '自主感', score: 58 },
              ].map(need => (
                <div key={need.label} className="flex items-center gap-1.5 bg-sand/30 rounded-full px-3 py-1.5 border border-sand/50">
                  <span className="text-xs font-medium text-charcoal/65">{need.label}</span>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: need.score >= 80 ? '#b07090' : need.score >= 70 ? '#b5956a' : '#8a8a8a' }}
                  >
                    {need.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 border-t border-sand pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/35 mb-2">关系人格观察</p>
            <p className="text-xs text-charcoal/65 leading-relaxed">
              你在关系选择中更容易先确认自己的真实感受，再决定是否表达。你的选择呈现出较强的内在价值判断倾向，也会在不确定关系中反复寻找对方是否认真回应你的证据。
            </p>
          </div>

          <div className="mb-4 border-t border-sand pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/35 mb-2">关系倾向风格</p>
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-charcoal/5 border border-charcoal/10 text-charcoal/65 mb-2">
              当前关系倾向：偏 Fi-Ni
            </span>
            <p className="text-xs text-charcoal/60 leading-relaxed mt-2">
              你更在意关系是否真诚、是否符合内心感受，而不只是外部关系标签。面对不确定性时，你倾向于先感知对方的深层意图，再决定自己的态度。
            </p>
            <p className="text-[10px] text-charcoal/25 italic mt-2 leading-relaxed border-l-2 border-sand pl-2.5">
              这不是正式心理测评，只是基于你的投票行为生成的关系倾向观察。
            </p>
          </div>

          <div className="border-t border-sand pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/35 mb-2">星盘观察</p>
            <div className="bg-sand/20 rounded-xl p-3 border border-dashed border-sand/60">
              <p className="text-[11px] text-charcoal/40 leading-relaxed text-center">
                可在未来版本接入出生时间与星盘分析，<br />生成亲密关系中的表达方式、依恋需求与冲突模式。
              </p>
              <button className="w-full mt-3 py-2 border border-sand rounded-lg text-[10px] text-charcoal/35 font-medium hover:bg-sand/30 transition-colors">
                完善个人资料（年龄 · 性别 · 出生时间）
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'uploads' && (
        <div className="space-y-3">
          {stories.filter(s => ['101', '501'].includes(s.id)).map(story => (
            <div
              key={story.id}
              onClick={() => onSelectStory(story)}
              className="bg-white rounded-xl border border-sand p-3 flex items-center gap-3 cursor-pointer hover:border-charcoal/20 transition-colors"
            >
              <CoverCell story={story} className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{story.title}</div>
                <div className="text-[10px] text-charcoal/40 mt-0.5 flex items-center gap-2">
                  <span>{story.category}</span>
                  <span className="text-charcoal/25">·</span>
                  <Clock className="w-2.5 h-2.5" /> {story.endTime}
                  <span className="text-charcoal/25">·</span>
                  <span>{story.totalVotes}</span>
                </div>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${story.status === '投票中' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {story.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-3">
          {savedPhrases.map((phrase, i) => (
            <div key={i} className="bg-white rounded-xl border border-sand p-4">
              <p className="font-display font-bold text-sm leading-relaxed" style={{ color: '#b07090' }}>"{phrase}"</p>
              <p className="text-[10px] text-charcoal/35 mt-2">来自 AI Coach · 已收藏</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'votes' && (
        <div className="space-y-3">
          {[
            { title: '分手三个月后，他发来了"在吗"', myChoice: '回复"在"，等他说下去', crowdChoice: '不回复', match: false },
            { title: '暗恋了三年，他问我毕业后去哪里', myChoice: '反问：你去哪里？', crowdChoice: '反问：你去哪里？', match: true },
          ].map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-sand p-4">
              <p className="font-semibold text-xs text-charcoal/80 mb-2">{r.title}</p>
              <div className="space-y-1 text-[10px]">
                <div className="flex gap-1"><span className="text-charcoal/35 w-12 flex-shrink-0">我选择</span><span className="text-charcoal/65">{r.myChoice}</span></div>
                <div className="flex gap-1"><span className="text-charcoal/35 w-12 flex-shrink-0">多数选</span><span className="text-charcoal/65">{r.crowdChoice}</span></div>
              </div>
              <div className="mt-2">
                {r.match
                  ? <span className="text-[9px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-bold">与多数一致</span>
                  : <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full font-bold">与多数不同</span>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────
export default function App() {
  const [currentView, setCurrentView]     = useState<View>('home');
  const [selectedStory, setSelectedStory] = useState<Story>(MOCK_STORIES[0]);
  const [selectedCamp, setSelectedCamp]   = useState('真实营');
  const [stories, setStories]             = useState<Story[]>(MOCK_STORIES);

  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    setCurrentView('detail');
  };
  const handleJoinCamp = (camp: string, story: Story) => {
    setSelectedCamp(camp);
    setSelectedStory(story);
    setCurrentView('camp');
  };
  const handlePublish = (story: Story) => {
    setStories(prev => [story, ...prev]);
    setCurrentView('home');
  };

  const navItems: { view: View; icon: React.ReactNode; label: string }[] = [
    { view: 'home',    icon: <LayoutGrid className="w-5 h-5" />, label: 'Market' },
    { view: 'create',  icon: <Plus className="w-5 h-5" />,       label: 'Create' },
    { view: 'camps',   icon: <Users className="w-5 h-5" />,      label: 'Camps' },
    { view: 'profile', icon: <User className="w-5 h-5" />,       label: 'Profile' },
  ];

  return (
    <div className="max-w-[480px] mx-auto bg-cream min-h-screen relative shadow-2xl">
      <Header onAction={setCurrentView} />

      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
              <HomeView stories={stories} onSelectStory={handleSelectStory} />
            </motion.div>
          )}
          {currentView === 'detail' && (
            <motion.div key="detail" exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <DetailView story={selectedStory} onBack={() => setCurrentView('home')} onJoinCamp={handleJoinCamp} />
            </motion.div>
          )}
          {currentView === 'camp' && (
            <motion.div key="camp" exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <CampView campName={selectedCamp} story={selectedStory} onBack={() => setCurrentView('detail')} onShowResult={() => setCurrentView('result')} />
            </motion.div>
          )}
          {currentView === 'result' && (
            <motion.div key="result" exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <ResultView story={selectedStory} onBack={() => setCurrentView('home')} onNextRound={() => setCurrentView('detail')} />
            </motion.div>
          )}
          {currentView === 'create' && (
            <motion.div key="create" exit={{ x: '100%' }} transition={{ duration: 0.25 }}>
              <CreateView onBack={() => setCurrentView('home')} onPublish={handlePublish} />
            </motion.div>
          )}
          {currentView === 'camps' && (
            <motion.div key="camps" exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <CampsView stories={stories} onSelectStory={handleSelectStory} />
            </motion.div>
          )}
          {currentView === 'profile' && (
            <motion.div key="profile" exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <ProfileView stories={stories} onSelectStory={handleSelectStory} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur-md border-t border-sand px-6 py-2 flex justify-between items-center z-50">
        {navItems.map(item => {
          const active = currentView === item.view ||
            (item.view === 'home' && ['detail', 'camp', 'result'].includes(currentView));
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${active ? 'text-charcoal' : 'text-charcoal/30 hover:text-charcoal/50'}`}
            >
              {item.icon}
              <span className={`text-[9px] font-bold uppercase tracking-wide ${active ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
