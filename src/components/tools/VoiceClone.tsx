import { useState, useRef } from 'react';
import { Fingerprint, Upload, Mic, Play, Pause, Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import NeonCard from '../NeonCard';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

type Stage = 'upload' | 'analyzing' | 'ready' | 'generating' | 'done';

export default function VoiceClone() {
  const [stage, setStage] = useState<Stage>('upload');
  const [fileName, setFileName] = useState('');
  const [ttsText, setTtsText] = useState('');
  const [playing, setPlaying] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatingText, setGeneratingText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('कृपया एक ऑडियो फाइल चुनें');
      return;
    }

    setFileName(file.name);
    setStage('analyzing');
    setAnalysisProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setAnalysisProgress(p => {
        if (p >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return p + Math.random() * 8;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('name', `Clone-${Date.now()}`);
      formData.append('description', 'AI voice clone from uploaded audio');

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/voice-clone?action=create-voice`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Voice cloning failed');
      }

      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setVoiceId(data.voiceId);
      setStage('ready');
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'कुछ गलत हो गया');
      setStage('upload');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const generateCloned = async () => {
    if (!ttsText.trim() || !voiceId) return;

    setStage('generating');
    setGeneratingText(ttsText);
    setError(null);

    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/voice-clone?action=generate-speech`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: ttsText,
            voiceId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Speech generation failed');
      }

      setAudioDataUrl(data.audio);
      setStage('done');

      if (audioRef.current && data.audio) {
        audioRef.current.src = data.audio;
        audioRef.current.play();
        setPlaying(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speech generation error');
      setStage('ready');
    }
  };

  const playPreview = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const reset = () => {
    setStage('upload');
    setFileName('');
    setTtsText('');
    setPlaying(false);
    setAnalysisProgress(0);
    setVoiceId(null);
    setAudioDataUrl(null);
    setError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  return (
    <NeonCard title="AI वॉयस क्लोन" subtitle="ElevenLabs से उच्च-गुणवत्ता वाली आवाज़ क्लोनिंग" icon={Fingerprint} iconColor="#ffe600">
      <div className="space-y-4">
        <audio
          ref={audioRef}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />

        {stage === 'upload' && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`rounded-xl p-6 text-center cursor-pointer transition-all border-2 border-dashed ${
              dragOver ? 'border-neon-yellow bg-yellow-400/10' : 'border-yellow-400/30 hover:border-yellow-400/60 hover:bg-yellow-400/5'
            }`}
          >
            <Upload size={32} className="mx-auto mb-3" style={{ color: '#ffe600' }} />
            <p className="font-semibold text-white/80 text-sm">ऑडियो क्लिप अपलोड करें</p>
            <p className="text-xs text-white/40 mt-1">MP3, WAV, M4A • 5-30 सेकंड</p>
            <p className="text-xs text-white/30 mt-3">या यहाँ फाइल ड्रैग करें</p>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {stage === 'analyzing' && (
          <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(255,230,0,0.05)', border: '1px solid rgba(255,230,0,0.2)' }}>
            <div className="flex justify-center mb-3">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20" />
                <div
                  className="absolute inset-0 rounded-full border-2 border-transparent transition-all"
                  style={{
                    borderTopColor: '#ffe600',
                    transform: `rotate(${analysisProgress * 3.6}deg)`,
                    boxShadow: '0 0 15px rgba(255,230,0,0.5)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold" style={{ color: '#ffe600' }}>{Math.round(analysisProgress)}%</span>
                </div>
              </div>
            </div>
            <p className="font-semibold text-white/80 text-sm">ElevenLabs में आवाज़ का विश्लेषण हो रहा है...</p>
            <p className="text-xs text-white/40 mt-1">{fileName}</p>
            <div className="mt-3 h-1.5 bg-midnight-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${analysisProgress}%`, background: 'linear-gradient(90deg, #ffe600, #ffaa00)' }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/40">
              {['Pitch', 'Tone', 'Timbre'].map((f, i) => (
                <div key={f} className={`py-1 rounded ${analysisProgress > (i + 1) * 25 ? 'text-yellow-400' : ''}`}>
                  {analysisProgress > (i + 1) * 25 ? '✓' : '...'} {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {(stage === 'ready' || stage === 'generating' || stage === 'done') && (
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.3)' }}>
            <CheckCircle size={18} style={{ color: '#39ff14' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80">आवाज़ क्लोन तैयार है!</p>
              <p className="text-xs text-white/40 truncate">{fileName}</p>
            </div>
            <button onClick={reset} className="text-xs text-white/40 hover:text-white/70 transition-colors">रीसेट</button>
          </div>
        )}

        {error && (
          <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.3)' }}>
            <AlertCircle size={16} style={{ color: '#ff2d78' }} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/70">{error}</p>
          </div>
        )}

        {(stage === 'ready' || stage === 'generating' || stage === 'done') && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">क्लोन्ड वॉयस में बोलवाएं</label>
            <textarea
              className="neon-input w-full rounded-xl p-3 text-sm resize-none h-24"
              style={{ borderColor: 'rgba(255,230,0,0.3)' }}
              placeholder="यहाँ हिंदी में वह टेक्स्ट लिखें जो क्लोन्ड आवाज़ में बोला जाए..."
              value={ttsText}
              onChange={e => setTtsText(e.target.value)}
            />
          </div>
        )}

        {stage === 'ready' && (
          <button
            onClick={generateCloned}
            disabled={!ttsText.trim()}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #cc9900, #ffe600)', color: '#0f051d' }}
          >
            <Zap size={18} />
            उच्च-गुणवत्ता वॉयस जेनरेट करें
          </button>
        )}

        {stage === 'generating' && (
          <button
            disabled
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 opacity-70"
            style={{ background: 'linear-gradient(135deg, #cc9900, #ffe600)', color: '#0f051d' }}
          >
            <Loader2 size={18} className="animate-spin" />
            ElevenLabs में ऑडियो बन रहा है...
          </button>
        )}

        {stage === 'done' && (
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,230,0,0.05)', border: '1px solid rgba(255,230,0,0.3)' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={playPreview}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #cc9900, #ffe600)' }}
              >
                {playing
                  ? <Pause size={16} className="text-midnight" />
                  : <Play size={16} className="ml-0.5 text-midnight" fill="#0f051d" />
                }
              </button>
              <div className="flex-1 flex items-end gap-0.5 h-8">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full ${playing ? 'waveform-bar' : ''}`}
                    style={{
                      height: playing ? undefined : `${4 + Math.sin(i * 0.9) * 10 + 4}px`,
                      background: 'linear-gradient(180deg, #ffe600, #ff8800)',
                      animationDelay: `${i * 0.04}s`,
                      minHeight: '3px',
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Zap size={12} style={{ color: '#ffe600' }} />
              <span>Stability: 0.5 | Similarity Boost: 0.75 — उच्च-गुणवत्ता क्लोनिंग</span>
            </div>
            <button
              onClick={() => setStage('ready')}
              className="w-full py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background: 'rgba(255,230,0,0.15)', color: '#ffe600', border: '1px solid rgba(255,230,0,0.3)' }}
            >
              दूसरा टेक्स्ट जेनरेट करें
            </button>
          </div>
        )}
      </div>
    </NeonCard>
  );
}
