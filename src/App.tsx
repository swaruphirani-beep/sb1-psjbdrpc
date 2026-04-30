import { useState } from 'react';
import { Video, Mic, Image as ImageIcon, Fingerprint, Hash, Film, Camera, Sparkles, Menu, X, Zap } from 'lucide-react';
import TextToVideo from './components/tools/TextToVideo';
import TextToAudio from './components/tools/TextToAudio';
import TextToImage from './components/tools/TextToImage';
import VoiceClone from './components/tools/VoiceClone';
import HashtagGenerator from './components/tools/HashtagGenerator';
import PhotoToVideo from './components/tools/PhotoToVideo';
import SelfieEditor from './components/tools/SelfieEditor';

const TOOLS = [
  { id: 'video', label: 'टेक्स्ट टू वीडियो', icon: Video, color: '#ff2d78', short: 'वीडियो' },
  { id: 'audio', label: 'टेक्स्ट टू ऑडियो', icon: Mic, color: '#00f5ff', short: 'ऑडियो' },
  { id: 'image', label: 'टेक्स्ट टू इमेज', icon: ImageIcon, color: '#39ff14', short: 'इमेज' },
  { id: 'clone', label: 'वॉयस क्लोन', icon: Fingerprint, color: '#ffe600', short: 'क्लोन' },
  { id: 'hashtag', label: 'हैशटैग जेनरेटर', icon: Hash, color: '#ff7a00', short: 'हैशटैग' },
  { id: 'photo2video', label: 'फोटो टू वीडियो', icon: Film, color: '#00f5ff', short: 'P2V' },
  { id: 'selfie', label: 'सेल्फी एडिटर', icon: Camera, color: '#ff2d78', short: 'सेल्फी' },
];

export default function App() {
  const [active, setActive] = useState('video');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTool = TOOLS.find(t => t.id === active)!;

  const renderTool = () => {
    switch (active) {
      case 'video': return <TextToVideo />;
      case 'audio': return <TextToAudio />;
      case 'image': return <TextToImage />;
      case 'clone': return <VoiceClone />;
      case 'hashtag': return <HashtagGenerator />;
      case 'photo2video': return <PhotoToVideo />;
      case 'selfie': return <SelfieEditor />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f051d' }}>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ff2d78, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #ff7a00, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #00f5ff, transparent)', filter: 'blur(100px)', transform: 'translate(-50%, -50%)' }} />
      </div>

      <div className="flex flex-1 relative" style={{ zIndex: 1 }}>
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto"
          style={{ background: 'rgba(15,5,29,0.98)', borderRight: '1px solid rgba(255,45,120,0.15)' }}>
          {/* Logo */}
          <div className="p-5 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ff2d78, #ff7a00)', boxShadow: '0 0 20px rgba(255,45,120,0.5)' }}>
                <Zap size={20} fill="white" />
              </div>
              <div>
                <h1 className="text-base font-black text-white leading-none">AI Creator</h1>
                <p className="text-xs font-medium" style={{ color: '#ff7a00' }}>Suite</p>
              </div>
            </div>
            <div className="mt-3 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,45,120,0.5), transparent)' }} />
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1">
            <p className="text-xs font-semibold px-3 py-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
              टूल्स
            </p>
            {TOOLS.map(tool => {
              const Icon = tool.icon;
              const isActive = active === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActive(tool.id)}
                  className={`nav-item w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left ${isActive ? 'active' : ''}`}
                  style={isActive ? { borderLeft: `3px solid ${tool.color}` } : {}}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: isActive ? `${tool.color}22` : 'rgba(255,255,255,0.04)',
                      boxShadow: isActive ? `0 0 12px ${tool.color}44` : 'none',
                    }}
                  >
                    <Icon size={16} style={{ color: isActive ? tool.color : 'rgba(255,255,255,0.4)' }} />
                  </div>
                  <span className={`text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
                    {tool.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: tool.color, boxShadow: `0 0 8px ${tool.color}` }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4">
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.15)' }}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sparkles size={12} style={{ color: '#ff7a00' }} />
                <span className="text-xs font-bold text-white/60">Powered by AI</span>
              </div>
              <p className="text-xs text-white/30">Pollinations • Web Speech</p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col overflow-y-auto"
              style={{ background: '#0f051d', borderRight: '1px solid rgba(255,45,120,0.2)' }}>
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #ff2d78, #ff7a00)' }}>
                    <Zap size={18} fill="white" />
                  </div>
                  <h1 className="text-sm font-black text-white">AI Creator Suite</h1>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 space-y-1">
                {TOOLS.map(tool => {
                  const Icon = tool.icon;
                  const isActive = active === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => { setActive(tool.id); setSidebarOpen(false); }}
                      className={`nav-item w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left ${isActive ? 'active' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: isActive ? `${tool.color}22` : 'rgba(255,255,255,0.04)' }}>
                        <Icon size={16} style={{ color: isActive ? tool.color : 'rgba(255,255,255,0.4)' }} />
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/50'}`}>{tool.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top header */}
          <header className="sticky top-0 z-30 px-4 md:px-6 py-4 flex items-center gap-4"
            style={{ background: 'rgba(15,5,29,0.95)', borderBottom: '1px solid rgba(255,45,120,0.1)', backdropFilter: 'blur(12px)' }}>
            <button
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,45,120,0.2)' }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} style={{ color: '#ff2d78' }} />
            </button>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${activeTool.color}22`, border: `1px solid ${activeTool.color}44` }}
              >
                <activeTool.icon size={15} style={{ color: activeTool.color }} />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white leading-none truncate">{activeTool.label}</h1>
                <p className="text-xs text-white/30 mt-0.5 hidden sm:block">AI Content Creator Suite</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium" style={{ color: '#39ff14' }}>LIVE</span>
            </div>
          </header>

          {/* Tool content */}
          <div className="flex-1 p-4 md:p-6 pb-24 md:pb-8">
            <div className="max-w-2xl mx-auto">
              {renderTool()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-2 py-2"
        style={{ background: 'rgba(15,5,29,0.98)', borderTop: '1px solid rgba(255,45,120,0.15)', backdropFilter: 'blur(12px)' }}>
        <div className="flex justify-around">
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            const isActive = active === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActive(tool.id)}
                className="flex flex-col items-center gap-1 px-1 py-1 rounded-xl transition-all"
                style={isActive ? { background: `${tool.color}15` } : {}}
              >
                <Icon
                  size={20}
                  style={{
                    color: isActive ? tool.color : 'rgba(255,255,255,0.35)',
                    filter: isActive ? `drop-shadow(0 0 6px ${tool.color})` : 'none',
                  }}
                />
                <span style={{ color: isActive ? tool.color : 'rgba(255,255,255,0.3)', fontSize: '9px', fontWeight: 600 }}>
                  {tool.short}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Footer */}
      <footer className="hidden md:block relative z-10 py-4 px-6 text-center"
        style={{ borderTop: '1px solid rgba(255,45,120,0.1)', background: 'rgba(15,5,29,0.9)' }}>
        <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Developed by{' '}
          <span className="font-black" style={{
            background: 'linear-gradient(135deg, #ff2d78, #ff7a00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Swarup Hirani
          </span>
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
          हर वायरल वीडियो की शुरुआत यहाँ से होती है।
        </p>
      </footer>
    </div>
  );
}
