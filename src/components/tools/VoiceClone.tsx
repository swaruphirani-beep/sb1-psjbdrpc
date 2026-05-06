import { useState, useRef } from 'react';
import { Fingerprint, Upload, Mic, Play, Pause, Loader2, CheckCircle, AlertCircle, Zap, RotateCcw } from 'lucide-react';
import NeonCard from '../NeonCard';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

type Stage = 'upload' | 'cloning' | 'ready' | 'synthesizing' | 'done';

export default function VoiceClone() {
  const [stage, setStage] = useState<Stage>('upload');
  const [fileName, setFileName] = useState('');
  const [ttsText, setTtsText] = useState('');
  const [playing, setPlaying] = useState(false);
  const [cloningProgress, setCloningProgress] = useState(0);
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
    setStage('cloning');
    setCloningProgress(0);
    setError(null);

    // Simulate progress while cloning happens
    const progressInterval = setInterval(() => {
      setCloningProgress(p => (p >= 85 ? 85 : p + Math.random() * 7));
    }, 400);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('voiceName', `Clone-${Date.now()}`);

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/voice-clone?action=clone`,
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
      setCloningProgress(100);
      setVoiceId(data.voiceId);

      // Brief delay before transitioning to ready state
      await new Promise(r => setTimeout(r, 600));
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

    setStage('synthesizing');
    setGeneratingText(ttsText);
    setError(null);

    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/voice-clone?action=synthesize`,
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
        throw new Error(data.error ?? 'Speech synthesis failed');
      }

      setAudioDataUrl(data.audio);
      setStage('done');

      // Auto-play the generated audio
      if (audioRef.current && data.audio) {
        audioRef.current.src = data.audio;
        audioRef.current.play();
        setPlaying(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speech synthesis error');
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
    setCloningProgress(0);
    setVoiceId(null);
    setAudioDataUrl(null);
    setError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  const downloadAudio = () => {
    if (!audioDataUrl) return;
    const a = document.createElement('a');
    a.href = audioDataUrl;
    a.download = `cloned-voice-${Date.now()}.mp3`;
    a.click();
  };

  return (
    <NeonCard title="AI वॉयस क्लोन" subtitle="ElevenLabs Instant Voice Cloning" icon={Fingerprint} iconColor="#ffe600">
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

        {stage === 'cloning' && (
          <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(255,230,0,0.05)', border: '1px solid rgba(255,230,0,0.2)' }}>
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-3 border-yellow-400/20" />
                <div
                  className="absolute inset-0 rounded-full border-3 border-transparent transition-all"
                  style={{
                    borderTopColor: '#ffe600',
                    borderRightColor: '#ffaa00',
                    transform: `rotate(${cloningProgress * 3.6}deg)`,
                    boxShadow: '0 0 20px rgba(255,230,0,0.6)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold" style={{ color: '#ffe600' }}>{Math.round(cloningProgress)}%</span>
                </div>
              </div>
            </div>
            <p className="font-semibold text-white/80 text-sm mb-1">आवाज़ को क्लोन किया जा रहा है...</p>
            <p className="text-xs text-white/50 mb-3">ElevenLabs Instant Voice Cloning</p>
            <p className="text-xs text-white/40 truncate">{fileName}</p>
            <div className="mt-4 h-1.5 bg-midnight-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${cloningProgress}%`, background: 'linear-gradient(90deg, #ffe600, #ffaa00)' }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/50">
              {['Analyzing', 'Processing', 'Training'].map((label, i) => (
                <div key={label} className={`py-1.5 rounded transition-colors ${cloningProgress > (i + 1) * 30 ? 'text-yellow-400 font-medium' : ''}`}>
                  {cloningProgress > (i + 1) * 30 ? '✓' : '●'} {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {(stage === 'ready' || stage === 'synthesizing' || stage === 'done') && voiceId && (
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.3)' }}>
            <CheckCircle size={18} style={{ color: '#39ff14' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80">आवाज़ क्लोन तैयार है!</p>
              <p className="text-xs text-white/40 truncate">{fileName} • ID: {voiceId.slice(0, 8)}...</p>
            </div>
            <button onClick={reset} className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
              <RotateCcw size={12} />
              नया
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.3)' }}>
            <AlertCircle size={16} style={{ color: '#ff2d78' }} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/70">{error}</p>
          </div>
        )}

        {(stage === 'ready' || stage === 'synthesizing' || stage === 'done') && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">क्लोन्ड वॉयस में बोलवाएं</label>
            <textarea
              className="neon-input w-full rounded-xl p-3 text-sm resize-none h-24"
              style={{ borderColor: 'rgba(255,230,0,0.3)' }}
              placeholder="यहाँ हिंदी में वह टेक्स्ट लिखें जो क्लोन्ड आवाज़ में बोला जाए..."
              value={ttsText}
              onChange={e => setTtsText(e.target.value)}
              disabled={stage === 'synthesizing'}
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
            वॉयस जेनरेट करें
          </button>
        )}

        {stage === 'synthesizing' && (
          <button
            disabled
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 opacity-70"
            style={{ background: 'linear-gradient(135deg, #cc9900, #ffe600)', color: '#0f051d' }}
          >
            <Loader2 size={18} className="animate-spin" />
            वॉयस सिंथेसाइज़ हो रहा है...
          </button>
        )}

        {stage === 'done' && (
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,230,0,0.05)', border: '1px solid rgba(255,230,0,0.3)' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={playPreview}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110"
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
            <div className="grid grid-cols-2 gap-2 text-xs text-white/50">
              <div className="flex items-center gap-1">
                <span style={{ color: '#ffe600' }}>●</span>
                <span>Stability: 0.5</span>
              </div>
              <div className="flex items-center gap-1">
                <span style={{ color: '#ffe600' }}>●</span>
                <span>Similarity: 0.8</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStage('ready')}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'rgba(255,230,0,0.15)', color: '#ffe600', border: '1px solid rgba(255,230,0,0.3)' }}
              >
                दूसरा टेक्स्ट जेनरेट करें
              </button>
              <button
                onClick={downloadAudio}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'rgba(255,230,0,0.2)', color: '#ffe600', border: '1px solid rgba(255,230,0,0.3)' }}
              >
                डाउनलोड करें
              </button>
            </div>
          </div>
        )}
      </div>
    </NeonCard>
  );
}
