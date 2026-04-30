import { useState } from 'react';
import { Video, Play, Download, Loader2, Sparkles } from 'lucide-react';
import NeonCard from '../NeonCard';

const SCENE_STYLES = ['सिनेमैटिक', 'एनिमेटेड', 'रियलिस्टिक', 'फैंटेसी'];
const DURATIONS = ['15 सेकंड', '30 सेकंड', '60 सेकंड'];

export default function TextToVideo() {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('सिनेमैटिक');
  const [duration, setDuration] = useState('30 सेकंड');
  const [loading, setLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scenes, setScenes] = useState<string[]>([]);

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setVideoReady(false);
    setProgress(0);

    const generatedScenes = [
      `सीन 1: ${description.slice(0, 40)}... - ${style} स्टाइल में ओपनिंग शॉट`,
      `सीन 2: मुख्य एक्शन सीक्वेंस - ड्रामेटिक एंगल`,
      `सीन 3: क्लोज़-अप और इमोशनल मोमेंट`,
      `सीन 4: क्लाइमेक्स और समापन दृश्य`,
    ];

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) { clearInterval(interval); return 95; }
        return p + Math.random() * 8;
      });
    }, 300);

    await new Promise(r => setTimeout(r, 4000));
    clearInterval(interval);
    setProgress(100);
    setScenes(generatedScenes);
    setLoading(false);
    setVideoReady(true);
  };

  return (
    <NeonCard title="टेक्स्ट टू वीडियो" subtitle="AI से वीडियो सीन्स बनाएं" icon={Video} iconColor="#ff2d78">
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
          {loading ? 'वीडियो बन रहा है...' : 'वीडियो बनाएं'}
        </button>

        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/60">
              <span>AI वीडियो सीन्स तैयार कर रहा है...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-midnight-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-neon rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {videoReady && (
          <div className="space-y-3">
            <div className="preview-canvas rounded-xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-neon flex items-center justify-center shadow-neon-pink cursor-pointer hover:scale-110 transition-transform">
                  <Play size={24} className="ml-1" fill="white" />
                </div>
              </div>
              <div className="h-36 flex items-end pb-2">
                <div className="w-full grid grid-cols-4 gap-1">
                  {scenes.map((_, i) => (
                    <div key={i} className="shimmer rounded h-16 relative">
                      <span className="absolute bottom-1 left-1 text-xs text-white/60">सीन {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {scenes.map((scene, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-midnight-100">
                  <div className="w-5 h-5 rounded bg-gradient-neon flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">{i+1}</span>
                  </div>
                  <p className="text-xs text-white/70">{scene}</p>
                </div>
              ))}
            </div>

            <button className="btn-gradient w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <Download size={16} />
              वीडियो डाउनलोड करें
            </button>
          </div>
        )}
      </div>
    </NeonCard>
  );
}
