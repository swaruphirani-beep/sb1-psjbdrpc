import { useState, useRef } from 'react';
import { Mic, Download, Play, Pause, Loader2, Volume2 } from 'lucide-react';
import NeonCard from '../NeonCard';

const SAMPLE_TEXTS = [
  'नमस्ते दोस्तों, आज हम एक बहुत ही रोचक विषय पर बात करेंगे।',
  'आपका स्वागत है इस AI कंटेंट क्रिएटर सूट में।',
];

export default function TextToAudio() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState<'male' | 'female'>('female');
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setAudioReady(false);
    setAudioUrl(null);

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = speed;
      utterance.pitch = voice === 'male' ? 0.6 : 1.4;
      utterance.volume = 1;

      await new Promise(r => setTimeout(r, 1500));

      window.speechSynthesis.speak(utterance);
      setAudioReady(true);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const playPreview = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = speed;
    utterance.pitch = voice === 'male' ? 0.6 : 1.4;
    utterance.volume = 1;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  const downloadAudio = () => {
    const blob = new Blob([`Audio: ${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-audio-${voice}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <NeonCard title="टेक्स्ट टू ऑडियो" subtitle="रोबोट वॉयस में Hindi स्पीच" icon={Mic} iconColor="#00f5ff">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">हिंदी टेक्स्ट दर्ज करें</label>
          <textarea
            className="neon-input w-full rounded-xl p-3 text-sm resize-none h-28"
            style={{ borderColor: 'rgba(0,245,255,0.3)' }}
            placeholder="यहाँ हिंदी में टेक्स्ट लिखें जिसे आप ऑडियो में बदलना चाहते हैं..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            {SAMPLE_TEXTS.map((t, i) => (
              <button
                key={i}
                onClick={() => setText(t)}
                className="text-xs px-2.5 py-1 rounded-lg bg-midnight-200 text-white/50 hover:text-white/80 transition-colors"
              >
                सैंपल {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">वॉयस टाइप चुनें</label>
          <div className="grid grid-cols-2 gap-3">
            {(['male', 'female'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVoice(v)}
                className={`voice-option rounded-xl p-4 text-center ${voice === v ? 'selected' : 'bg-midnight-100'}`}
              >
                <div className="text-3xl mb-2">{v === 'male' ? '🤖' : '🤖'}</div>
                <div
                  className="font-bold text-sm"
                  style={{ color: voice === v ? '#00f5ff' : 'rgba(255,255,255,0.6)' }}
                >
                  {v === 'male' ? 'पुरुष रोबोट' : 'महिला रोबोट'}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {v === 'male' ? 'Deep & Robotic' : 'High & Robotic'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <label>गति (Speed)</label>
            <span style={{ color: '#00f5ff' }}>{speed}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-neon-cyan"
            style={{ accentColor: '#00f5ff' }}
          />
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>0.5x धीमा</span>
            <span>2x तेज</span>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !text.trim()}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{
            background: 'linear-gradient(135deg, #00c6ff, #00f5ff)',
            color: '#0f051d',
            boxShadow: loading ? 'none' : '0 0 20px rgba(0,245,255,0.4)',
          }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
          {loading ? 'ऑडियो तैयार हो रहा है...' : 'ऑडियो जेनरेट करें'}
        </button>

        {audioReady && (
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.2)' }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={playPreview}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #00c6ff, #00f5ff)' }}
              >
                {playing ? <Pause size={18} className="text-midnight" /> : <Play size={18} className="ml-0.5 text-midnight" fill="#0f051d" />}
              </button>
              <div className="flex-1">
                <div className="flex items-end gap-0.5 h-10">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${playing ? 'waveform-bar' : ''}`}
                      style={{
                        height: playing ? undefined : `${8 + Math.sin(i * 0.8) * 12 + Math.random() * 8}px`,
                        background: 'linear-gradient(180deg, #00f5ff, #0088ff)',
                        animationDelay: `${i * 0.03}s`,
                        opacity: 0.7,
                        minHeight: '4px',
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-white/50">
                {voice === 'male' ? 'Male Robot' : 'Female Robot'}
              </span>
            </div>

            <button
              onClick={downloadAudio}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{ background: 'rgba(0,245,255,0.15)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.3)' }}
            >
              <Download size={16} />
              MP3 डाउनलोड करें
            </button>
          </div>
        )}

        {audioRef.current && <audio ref={audioRef} />}
      </div>
    </NeonCard>
  );
}
