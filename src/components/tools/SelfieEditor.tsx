import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Download, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import NeonCard from '../NeonCard';

const FILTERS = [
  { id: 'natural', label: 'नेचुरल', css: 'none', desc: 'बिना फिल्टर' },
  { id: 'glamour', label: 'ग्लैमर', css: 'brightness(1.15) contrast(1.1) saturate(1.2)', desc: 'सुंदर लुक' },
  { id: 'cinematic', label: 'सिनेमैटिक', css: 'contrast(1.2) saturate(0.8) sepia(0.2)', desc: 'फिल्मी अंदाज़' },
  { id: 'vintage', label: 'विंटेज', css: 'sepia(0.5) contrast(1.1) brightness(0.95)', desc: 'पुराना एहसास' },
  { id: 'cool', label: 'कूल', css: 'hue-rotate(30deg) saturate(1.2) brightness(1.05)', desc: 'ठंडा टोन' },
  { id: 'warm', label: 'वार्म', css: 'hue-rotate(-15deg) saturate(1.3) brightness(1.1)', desc: 'गर्म टोन' },
  { id: 'bw', label: 'B&W', css: 'grayscale(1) contrast(1.1)', desc: 'ब्लैक एंड वाइट' },
  { id: 'glow', label: 'ग्लो', css: 'brightness(1.2) contrast(0.9) saturate(1.4)', desc: 'स्किन ग्लो' },
];

const BACKGROUNDS = [
  { id: 'none', label: 'ओरिजिनल', color: '' },
  { id: 'blur', label: 'बोके ब्लर', color: 'rgba(100,50,200,0.3)' },
  { id: 'office', label: 'ऑफिस', color: 'rgba(50,100,150,0.4)' },
  { id: 'studio', label: 'स्टूडियो', color: 'rgba(30,30,30,0.6)' },
  { id: 'gradient', label: 'ग्रेडिएंट', color: 'linear-gradient(135deg, #1a0533, #0f3060)' },
];

export default function SelfieEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [filter, setFilter] = useState('natural');
  const [background, setBackground] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      setImage(e.target?.result as string);
      setEnhanced(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const selectedFilter = FILTERS.find(f => f.id === filter);
  const selectedBg = BACKGROUNDS.find(b => b.id === background);

  const getFilterCSS = () => {
    const base = selectedFilter?.css === 'none' ? '' : selectedFilter?.css || '';
    return `${base} brightness(${brightness}%) contrast(${contrast}%)`.trim();
  };

  const applyEnhancement = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setEnhanced(true);
    setBrightness(110);
    setContrast(108);
  };

  const download = () => {
    if (!image) return;
    const a = document.createElement('a');
    a.href = image;
    a.download = `ai-selfie-${Date.now()}.jpg`;
    a.click();
  };

  return (
    <NeonCard title="सेल्फी AI एडिटर" subtitle="AI फिल्टर और बैकग्राउंड एडिटिंग" icon={Camera} iconColor="#ff2d78">
      <div className="space-y-4">
        {!image ? (
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="rounded-xl p-6 text-center cursor-pointer transition-all border-2 border-dashed border-pink-400/30 hover:border-pink-400/60 hover:bg-pink-400/5"
          >
            <Camera size={32} className="mx-auto mb-3" style={{ color: '#ff2d78' }} />
            <p className="font-semibold text-white/80 text-sm">सेल्फी या फोटो अपलोड करें</p>
            <p className="text-xs text-white/40 mt-1">JPG, PNG • Max 10MB</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden" style={{ height: '200px' }}>
            {background !== 'none' && selectedBg?.color && (
              <div
                className="absolute inset-0"
                style={{ background: selectedBg.color, backdropFilter: background === 'blur' ? 'blur(8px)' : undefined }}
              />
            )}
            <img
              src={image}
              alt="Selfie"
              className="w-full h-full object-cover relative z-10"
              style={{ filter: getFilterCSS() }}
            />
            {enhanced && (
              <div className="absolute top-2 left-2 z-20 px-2 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(57,255,20,0.8)', color: '#0f051d' }}>
                AI Enhanced
              </div>
            )}
            <button
              onClick={() => { setImage(null); setEnhanced(false); setBrightness(100); setContrast(100); }}
              className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:bg-black/80 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {image && (
          <>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">AI फिल्टर</label>
              <div className="grid grid-cols-4 gap-2">
                {FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`py-2 rounded-xl text-center transition-all ${filter === f.id ? '' : 'bg-midnight-200 hover:bg-midnight-300'}`}
                    style={filter === f.id ? {
                      background: 'linear-gradient(135deg, rgba(255,45,120,0.3), rgba(255,45,120,0.1))',
                      border: '1px solid rgba(255,45,120,0.6)',
                    } : {}}
                  >
                    <div className={`text-xs font-bold ${filter === f.id ? 'text-neon-pink' : 'text-white/70'}`}>{f.label}</div>
                    <div className="text-xs text-white/30 mt-0.5 leading-tight">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">बैकग्राउंड</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {BACKGROUNDS.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBackground(b.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      background === b.id ? 'text-neon-pink' : 'bg-midnight-200 text-white/60 hover:text-white'
                    }`}
                    style={background === b.id ? {
                      background: 'rgba(255,45,120,0.15)',
                      border: '1px solid rgba(255,45,120,0.5)',
                    } : {}}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>ब्राइटनेस</span>
                  <span style={{ color: '#ff2d78' }}>{brightness}%</span>
                </div>
                <input type="range" min={50} max={150} value={brightness} onChange={e => setBrightness(+e.target.value)}
                  className="w-full" style={{ accentColor: '#ff2d78' }} />
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>कंट्रास्ट</span>
                  <span style={{ color: '#ff2d78' }}>{contrast}%</span>
                </div>
                <input type="range" min={50} max={150} value={contrast} onChange={e => setContrast(+e.target.value)}
                  className="w-full" style={{ accentColor: '#ff2d78' }} />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={applyEnhancement}
                disabled={processing}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                style={{ background: 'rgba(255,45,120,0.15)', color: '#ff2d78', border: '1px solid rgba(255,45,120,0.3)' }}
              >
                {processing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {processing ? 'AI एन्हांस हो रहा है...' : 'AI एन्हांस'}
              </button>
              <button
                onClick={() => { setBrightness(100); setContrast(100); setFilter('natural'); setBackground('none'); setEnhanced(false); }}
                className="px-4 py-2.5 rounded-xl transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={download}
                className="btn-gradient px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold"
              >
                <Download size={16} />
                सेव
              </button>
            </div>
          </>
        )}
      </div>
    </NeonCard>
  );
}
