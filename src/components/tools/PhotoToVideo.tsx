import { useState, useRef } from 'react';
import { Film, Upload, Play, Pause, Download, Loader2, ZoomIn, Move } from 'lucide-react';
import NeonCard from '../NeonCard';

const EFFECTS = [
  { id: 'zoom-in', label: 'ज़ूम इन', icon: ZoomIn, desc: 'धीरे-धीरे ज़ूम', css: 'scale(1.3)' },
  { id: 'zoom-out', label: 'ज़ूम आउट', icon: ZoomIn, desc: 'दूर से पास', css: 'scale(0.8)' },
  { id: 'pan-right', label: 'पैन राइट', icon: Move, desc: 'बाएं से दाएं', css: 'translateX(5%)' },
  { id: 'pan-left', label: 'पैन लेफ्ट', icon: Move, desc: 'दाएं से बाएं', css: 'translateX(-5%)' },
  { id: 'ken-burns', label: 'Ken Burns', icon: Film, desc: 'क्लासिक मूवमेंट', css: 'scale(1.2) translateX(3%)' },
];

const DURATIONS = ['5 sec', '10 sec', '15 sec', '30 sec'];

export default function PhotoToVideo() {
  const [image, setImage] = useState<string | null>(null);
  const [effect, setEffect] = useState('zoom-in');
  const [duration, setDuration] = useState('10 sec');
  const [processing, setProcessing] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      setImage(e.target?.result as string);
      setVideoReady(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const process = async () => {
    setProcessing(true);
    setVideoReady(false);
    await new Promise(r => setTimeout(r, 3000));
    setProcessing(false);
    setVideoReady(true);
  };

  const preview = () => {
    setPreviewing(!previewing);
  };

  const selectedEffect = EFFECTS.find(e => e.id === effect);

  return (
    <NeonCard title="फोटो टू वीडियो" subtitle="फोटो में मोशन इफेक्ट जोड़ें" icon={Film} iconColor="#00f5ff">
      <div className="space-y-4">
        {!image ? (
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="rounded-xl p-6 text-center cursor-pointer transition-all border-2 border-dashed border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-400/5"
          >
            <Upload size={32} className="mx-auto mb-3" style={{ color: '#00f5ff' }} />
            <p className="font-semibold text-white/80 text-sm">फोटो अपलोड करें</p>
            <p className="text-xs text-white/40 mt-1">JPG, PNG, WEBP • Max 10MB</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden group" style={{ height: '180px' }}>
            <img
              src={image}
              alt="Uploaded"
              className="w-full h-full object-cover transition-all duration-[3000ms]"
              style={previewing ? { transform: selectedEffect?.css } : {}}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
            <button
              onClick={() => { setImage(null); setVideoReady(false); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:bg-black/80 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {image && (
          <>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">मोशन इफेक्ट चुनें</label>
              <div className="grid grid-cols-3 gap-2">
                {EFFECTS.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setEffect(e.id)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all text-center ${
                      effect === e.id ? 'text-midnight' : 'bg-midnight-200 text-white/60 hover:text-white'
                    }`}
                    style={effect === e.id ? {
                      background: 'linear-gradient(135deg, #006677, #00f5ff)',
                      boxShadow: '0 0 15px rgba(0,245,255,0.4)',
                    } : {}}
                  >
                    <div className="font-bold">{e.label}</div>
                    <div className={`mt-0.5 text-xs ${effect === e.id ? 'opacity-70' : 'text-white/30'}`}>{e.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">वीडियो अवधि</label>
              <div className="flex gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      duration === d ? 'text-midnight font-bold' : 'bg-midnight-200 text-white/60 hover:text-white'
                    }`}
                    style={duration === d ? { background: 'linear-gradient(135deg, #006677, #00f5ff)' } : {}}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={preview}
                className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                style={{ background: 'rgba(0,245,255,0.1)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.3)' }}
              >
                {previewing ? <Pause size={16} /> : <Play size={16} />}
                {previewing ? 'रोकें' : 'प्रीव्यू'}
              </button>
              <button
                onClick={process}
                disabled={processing}
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #006677, #00f5ff)', color: '#0f051d' }}
              >
                {processing ? <Loader2 size={18} className="animate-spin" /> : <Film size={18} />}
                {processing ? 'वीडियो बन रहा है...' : 'वीडियो बनाएं'}
              </button>
            </div>

            {videoReady && (
              <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.3)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(57,255,20,0.15)' }}>
                  <Film size={18} style={{ color: '#39ff14' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{effect}-video.mp4</p>
                  <p className="text-xs text-white/40">{duration} • {selectedEffect?.label} इफेक्ट</p>
                </div>
                <button
                  className="p-2 rounded-lg transition-all hover:opacity-80"
                  style={{ background: 'rgba(57,255,20,0.1)', color: '#39ff14' }}
                >
                  <Download size={16} />
                </button>
              </div>
            )}
          </>
        )}

        <div ref={previewRef} />
      </div>
    </NeonCard>
  );
}
