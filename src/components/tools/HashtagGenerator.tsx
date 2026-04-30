import { useState } from 'react';
import { Hash, Loader2, Copy, CheckCheck, TrendingUp, Youtube, Instagram } from 'lucide-react';
import NeonCard from '../NeonCard';

const PLATFORMS = ['Instagram', 'YouTube', 'दोनों'] as const;
type Platform = typeof PLATFORMS[number];

const HASHTAG_DB: Record<string, string[]> = {
  fitness: ['#fitness', '#fitnessmotivation', '#workout', '#gym', '#healthylifestyle', '#fitfam', '#exercise', '#bodybuilding', '#fitnessgoals', '#health'],
  food: ['#food', '#foodie', '#foodphotography', '#delicious', '#homemade', '#indianfood', '#recipe', '#cooking', '#yummy', '#tasty'],
  travel: ['#travel', '#travelgram', '#wanderlust', '#traveling', '#adventure', '#explore', '#travelphotography', '#trip', '#vacation', '#beautiful'],
  fashion: ['#fashion', '#style', '#ootd', '#fashionblogger', '#outfit', '#trending', '#clothes', '#fashionista', '#streetstyle', '#look'],
  tech: ['#technology', '#tech', '#gadgets', '#innovation', '#coding', '#programming', '#ai', '#digitalindia', '#startup', '#techreview'],
  default: ['#viral', '#trending', '#reels', '#explore', '#instagood', '#like4like', '#follow', '#content', '#creator', '#india'],
};

const REACH_LABELS = ['🔥 Ultra Viral', '📈 High Reach', '✨ Trending', '💫 Popular'];

function getHashtags(topic: string, platform: Platform): string[] {
  const lower = topic.toLowerCase();
  let base: string[] = [...HASHTAG_DB.default];

  Object.keys(HASHTAG_DB).forEach(key => {
    if (lower.includes(key)) base = [...base, ...HASHTAG_DB[key]];
  });

  const topicWords = topic.trim().split(/\s+/).slice(0, 3);
  const topicTags = topicWords.flatMap(w => [
    `#${w.toLowerCase()}`,
    `#${w.toLowerCase()}reels`,
    `#${w.toLowerCase()}india`,
    `#viral${w.toLowerCase()}`,
    `#${w.toLowerCase()}content`,
  ]);

  const platformTags: Record<Platform, string[]> = {
    Instagram: ['#instareels', '#instadaily', '#instagramreels', '#reelsindia', '#instafamous', '#instatrending'],
    YouTube: ['#youtube', '#youtubeindia', '#youtuber', '#subscribe', '#youtubevideos', '#youtubechannel'],
    दोनों: ['#instareels', '#youtube', '#reelsindia', '#youtubeindia', '#viral', '#trending2025'],
  };

  const all = [...new Set([...topicTags, ...base, ...platformTags[platform]])];
  return all.slice(0, 30);
}

export default function HashtagGenerator() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('दोनों');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setHashtags([]);
    await new Promise(r => setTimeout(r, 1200));
    setHashtags(getHashtags(topic, platform));
    setLoading(false);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(hashtags.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <NeonCard title="वायरल हैशटैग जेनरेटर" subtitle="30 ट्रेंडिंग हैशटैग एक क्लिक में" icon={Hash} iconColor="#ff7a00">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">टॉपिक लिखें</label>
          <input
            className="neon-input w-full rounded-xl p-3 text-sm"
            style={{ borderColor: 'rgba(255,122,0,0.3)' }}
            placeholder="जैसे: fitness, travel, food, technology..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/60 mb-2">प्लेटफॉर्म</label>
          <div className="flex gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  platform === p ? 'text-white' : 'bg-midnight-200 text-white/60 hover:text-white'
                }`}
                style={platform === p ? { background: 'linear-gradient(135deg, #ff5500, #ff7a00)', boxShadow: '0 0 15px rgba(255,122,0,0.4)' } : {}}
              >
                {p === 'Instagram' && <Instagram size={13} />}
                {p === 'YouTube' && <Youtube size={13} />}
                {p === 'दोनों' && <TrendingUp size={13} />}
                {p}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !topic.trim()}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          style={{ background: 'linear-gradient(135deg, #cc5500, #ff7a00)', boxShadow: loading ? 'none' : '0 0 20px rgba(255,122,0,0.4)' }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Hash size={18} />}
          {loading ? 'हैशटैग ढूंढे जा रहे हैं...' : '30 हैशटैग जेनरेट करें'}
        </button>

        {hashtags.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} style={{ color: '#ff7a00' }} />
                <span className="text-sm font-semibold text-white">{hashtags.length} हैशटैग मिले</span>
              </div>
              <button
                onClick={copyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: copied ? 'rgba(57,255,20,0.15)' : 'rgba(255,122,0,0.15)',
                  color: copied ? '#39ff14' : '#ff7a00',
                  border: `1px solid ${copied ? 'rgba(57,255,20,0.3)' : 'rgba(255,122,0,0.3)'}`,
                }}
              >
                {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                {copied ? 'कॉपी हो गया!' : 'सभी कॉपी करें'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
              {hashtags.map((tag, i) => (
                <button
                  key={tag}
                  onClick={() => navigator.clipboard.writeText(tag)}
                  className="hashtag-chip px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  title="क्लिक करें कॉपी करने के लिए"
                >
                  <span className="opacity-50 mr-1 text-xs">{REACH_LABELS[Math.floor(i / 8)]?.split(' ')[0]}</span>
                  {tag}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.2)' }}>
                <div className="font-bold" style={{ color: '#ff7a00' }}>~2.5M+</div>
                <div className="text-white/40">औसत रीच</div>
              </div>
              <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.2)' }}>
                <div className="font-bold" style={{ color: '#ff7a00' }}>Top 5%</div>
                <div className="text-white/40">एंगेजमेंट</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </NeonCard>
  );
}
