import { useState } from 'react';
import { Video, Play, Download, Loader2, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';
import NeonCard from '../NeonCard';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const SCENE_STYLES = ['सिनेमैटिक', 'एनिमेटेड', 'रियलिस्टिक', 'फैंटेसी'];
const DURATIONS = ['15 सेकंड', '30 सेकंड', '60 सेकंड'];

interface Scene {
  index: number;
  description: string;
  imageUrl: string;
}

export default function TextToVideo() {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('सिनेमैटिक');
  const [duration, setDuration] = useState('30 सेकंड');
  const [loading, setLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeScene, setActiveScene] = useState(0);

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setVideoReady(false);
    setError(null);
    setScenes([]);
    setProgress(0);
    setActiveScene(0);

    const progressInterval = setInterval(() => {
      setProgress(p => (p >= 90 ? 90 : p + Math.random() * 5));
    }, 600);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-video`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: description,
          style,
          duration: duration.replace(/[^0-9]/g, ''),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'वीडियो जेनरेशन फेल हो गई');
      }

      clearInterval(progressInterval);
      setProgress(100);
      setScenes(data.scenes ?? []);
      setVideoReady(true);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'कुछ गलत हो गया, दोबारा कोशिश करें');
    } finally {
      setLoading(false);
    }
  };

  const downloadScene = (imageUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `scene-${index}-${Date.now()}.png`;
    a.target = '_blank';
    a.click();
  };

  return (
    <NeonCard title="टेक्स्ट टू वीडियो" subtitle="Replicate AI से वीडियो सीन्स बनाएं" icon={Video} iconColor="#ff2d78">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">वीडियो विवरण लिखें</label>
          <textarea
            className="neon-input w-full rounded-xl p-3 text-sm resize-none h-28"
            placeholder="जैसे: एक सूर्यास्त के समय समुद्र किनारे एक लड़की चल रही है..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">वीडियो स्टाइल</label>
            <div className="flex flex-wrap gap-2">
              {SCENE_STYLES.map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    style === s
                      ? 'bg-gradient-neon text-white shadow-neon-pink'
                      : 'bg-midnight-200 text-white/60 hover:bg-midnight-300 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">अवधि</label>
            <div className="flex flex-col gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                    duration === d
                      ? 'bg-gradient-neon text-white'
                      : 'bg-midnight-200 text-white/60 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !description.trim()}
          className="btn-gradient w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'AI वीडियो बना रहा है...' : 'वीडियो बनाएं'}
        </button>

        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/60">
              <span>Replicate AI सीन्स रेंडर कर रहा है...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-midnight-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-neon rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-white/30 text-center">
              lucataco/sdxl-lcm-loras — प्रत्येक सीन ~4 सेकंड में
            </p>
          </div>
        )}

        {error && (
          <div
            className="rounded-xl p-3 flex items-start gap-3"
            style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.3)' }}
          >
            <AlertCircle size={16} style={{ color: '#ff2d78' }} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/70">{error}</p>
          </div>
        )}

        {videoReady && scenes.length > 0 && (
          <div className="space-y-4">
            {/* Main scene viewer */}
            <div
              className="relative rounded-xl overflow-hidden group cursor-pointer"
              style={{ border: '1px solid rgba(255,45,120,0.25)' }}
            >
              <img
                src={scenes[activeScene]?.imageUrl}
                alt={`Scene ${activeScene + 1}`}
                className="w-full object-cover rounded-xl"
                style={{ maxHeight: '240px', minHeight: '160px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,45,120,0.85)', boxShadow: '0 0 30px rgba(255,45,120,0.6)' }}
                >
                  <Play size={22} fill="white" className="ml-1 text-white" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span
                  className="text-xs font-bold text-white/90 px-2 py-1 rounded-lg"
                  style={{ background: 'rgba(0,0,0,0.55)' }}
                >
                  सीन {activeScene + 1} / {scenes.length}
                </span>
                <button
                  onClick={() => downloadScene(scenes[activeScene].imageUrl, activeScene + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(255,45,120,0.85)' }}
                >
                  <Download size={14} className="text-white" />
                </button>
              </div>
            </div>

            {/* Scene thumbnails */}
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${scenes.length}, 1fr)` }}
            >
              {scenes.map((scene, i) => (
                <button
                  key={scene.index}
                  onClick={() => setActiveScene(i)}
                  className="relative rounded-xl overflow-hidden transition-all"
                  style={{
                    border: activeScene === i
                      ? '2px solid #ff2d78'
                      : '2px solid rgba(255,255,255,0.08)',
                    boxShadow: activeScene === i ? '0 0 14px rgba(255,45,120,0.5)' : 'none',
                  }}
                >
                  <img
                    src={scene.imageUrl}
                    alt={scene.description}
                    className="w-full object-cover"
                    style={{ height: '60px' }}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-1 left-1">
                    <span
                      className="font-bold text-white/90 px-1 rounded"
                      style={{ background: 'rgba(0,0,0,0.6)', fontSize: '9px' }}
                    >
                      सीन {scene.index}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Scene list */}
            <div className="space-y-2">
              {scenes.map((scene, i) => (
                <button
                  key={scene.index}
                  onClick={() => setActiveScene(i)}
                  className="w-full flex items-start gap-2 p-2.5 rounded-lg transition-all text-left"
                  style={{
                    background: activeScene === i ? 'rgba(255,45,120,0.12)' : 'rgba(26,11,48,0.6)',
                    border: activeScene === i ? '1px solid rgba(255,45,120,0.3)' : '1px solid transparent',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: activeScene === i ? '#ff2d78' : 'rgba(255,45,120,0.2)' }}
                  >
                    <ImageIcon size={12} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white/80">{scene.description}</p>
                    <p className="text-xs text-white/35 mt-0.5 truncate">
                      {description.slice(0, 55)}{description.length > 55 ? '...' : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                scenes.forEach((s, i) => {
                  setTimeout(() => downloadScene(s.imageUrl, i + 1), i * 300);
                });
              }}
              className="btn-gradient w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Download size={16} />
              सभी सीन्स डाउनलोड करें ({scenes.length} इमेज)
            </button>
          </div>
        )}
      </div>
    </NeonCard>
  );
}
