import { useState } from 'react';
import { Image as ImageIcon, Download, RefreshCw, Loader2, Maximize2 } from 'lucide-react';
import NeonCard from '../NeonCard';

const ASPECT_RATIOS = [
  { label: 'Reels (9:16)', w: 432, h: 768, tag: 'reels' },
  { label: 'YouTube (16:9)', w: 768, h: 432, tag: 'youtube' },
  { label: 'Instagram (1:1)', w: 576, h: 576, tag: 'instagram' },
  { label: 'Portrait (3:4)', w: 480, h: 640, tag: 'portrait' },
];

const STYLES = ['फोटोरियलिस्टिक', 'एनिमे', 'डिजिटल आर्ट', 'ऑयल पेंटिंग', 'सिनेमैटिक'];

export default function TextToImage() {
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState(ASPECT_RATIOS[2]);
  const [style, setStyle] = useState('फोटोरियलिस्टिक');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [seed, setSeed] = useState(Math.floor(Math.random() * 999999));
  const [fullscreen, setFullscreen] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl(null);

    const styleMap: Record<string, string> = {
      'फोटोरियलिस्टिक': 'photorealistic, 8k, ultra detailed',
      'एनिमे': 'anime style, vibrant, studio ghibli',
      'डिजिटल आर्ट': 'digital art, concept art, trending on artstation',
      'ऑयल पेंटिंग': 'oil painting, classical, textured brushwork',
      'सिनेमैटिक': 'cinematic, movie still, dramatic lighting',
    };

    const newSeed = Math.floor(Math.random() * 999999);
    setSeed(newSeed);
    const enhancedPrompt = encodeURIComponent(`${prompt}, ${styleMap[style] || ''}`);
    const url = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=${ratio.w}&height=${ratio.h}&seed=${newSeed}&nologo=true`;

    const img = new Image();
    img.onload = () => {
      setImageUrl(url);
      setLoading(false);
    };
    img.onerror = () => {
      setImageUrl(url);
      setLoading(false);
    };
    img.src = url;
  };

  const download = async () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `ai-image-${Date.now()}.png`;
    a.target = '_blank';
    a.click();
  };

  const regenerate = () => {
    if (prompt.trim()) generate();
  };

  return (
    <>
      <NeonCard title="टेक्स्ट टू इमेज" subtitle="Pollinations.ai से AI इमेज बनाएं" icon={ImageIcon} iconColor="#39ff14">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">इमेज का विवरण लिखें</label>
            <textarea
              className="neon-input w-full rounded-xl p-3 text-sm resize-none h-24"
              style={{ borderColor: 'rgba(57,255,20,0.3)' }}
              placeholder="जैसे: एक खूबसूरत भारतीय महिला सूर्यास्त के पास खड़ी है..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">आस्पेक्ट रेशो</label>
            <div className="grid grid-cols-2 gap-2">
              {ASPECT_RATIOS.map(r => (
                <button
                  key={r.tag}
                  onClick={() => setRatio(r)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-left ${
                    ratio.tag === r.tag
                      ? 'text-white'
                      : 'bg-midnight-200 text-white/60 hover:text-white'
                  }`}
                  style={ratio.tag === r.tag ? {
                    background: 'linear-gradient(135deg, rgba(57,255,20,0.2), rgba(57,255,20,0.1))',
                    border: '1px solid rgba(57,255,20,0.5)',
                    color: '#39ff14',
                  } : {}}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">आर्ट स्टाइल</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    style === s ? 'text-midnight font-bold' : 'bg-midnight-200 text-white/60 hover:text-white'
                  }`}
                  style={style === s ? { background: '#39ff14' } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                background: 'linear-gradient(135deg, #00b300, #39ff14)',
                color: '#0f051d',
                boxShadow: loading ? 'none' : '0 0 20px rgba(57,255,20,0.3)',
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
              {loading ? 'इमेज बन रही है...' : 'इमेज बनाएं'}
            </button>
            {imageUrl && (
              <button
                onClick={regenerate}
                className="px-4 py-3 rounded-xl transition-all hover:opacity-80"
                style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)', color: '#39ff14' }}
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>

          {loading && (
            <div className="preview-canvas rounded-xl flex items-center justify-center" style={{ height: '200px' }}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center shimmer" style={{ background: 'rgba(57,255,20,0.1)' }}>
                  <ImageIcon size={24} style={{ color: '#39ff14' }} />
                </div>
                <p className="text-sm text-white/50">AI इमेज जेनरेट हो रही है...</p>
                <p className="text-xs text-white/30 mt-1">Seed: {seed}</p>
              </div>
            </div>
          )}

          {imageUrl && !loading && (
            <div className="space-y-3">
              <div className="relative group rounded-xl overflow-hidden cursor-pointer" onClick={() => setFullscreen(true)}>
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="w-full rounded-xl transition-transform duration-300 group-hover:scale-105"
                  style={{ maxHeight: '280px', objectFit: 'cover' }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <button
                onClick={download}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ background: 'rgba(57,255,20,0.15)', color: '#39ff14', border: '1px solid rgba(57,255,20,0.3)' }}
              >
                <Download size={16} />
                इमेज डाउनलोड करें
              </button>
            </div>
          )}
        </div>
      </NeonCard>

      {fullscreen && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreen(false)}
        >
          <img src={imageUrl} alt="Full" className="max-w-full max-h-full rounded-2xl object-contain" />
        </div>
      )}
    </>
  );
}
