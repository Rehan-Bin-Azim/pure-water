import React, { useState } from 'react';
import { X, Play, Pause, Award, Droplets, Globe, ShieldCheck } from 'lucide-react';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGetInvolved: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  isOpen,
  onClose,
  onOpenGetInvolved,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0d1219] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080b0f]">
          <div className="flex items-center gap-3">
            <span className="font-display tracking-[0.3em] text-white text-sm">P U R E</span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono">
              The Documentary Short
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Stage / Cinematic Visualizer */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
          {/* Ambient Video Background Simulation */}
          <video
            autoPlay
            loop
            muted={!isPlaying}
            playsInline
            className="w-full h-full object-cover opacity-80"
            poster="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop"
          >
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              type="video/mp4"
            />
          </video>

          {/* Vignette & cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1219] via-transparent to-black/40 pointer-events-none" />

          {/* Centered Play / Pause Toggle Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute z-10 w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-1" />
            )}
          </button>

          {/* Lower Cinematic Subtitle */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-zinc-300 pointer-events-none">
            <span className="font-mono text-cyan-300">03:42 / 12:00 • 4K HDR 60fps</span>
            <span className="tracking-wider uppercase text-[11px] text-zinc-400">
              Directed by PURE Global Cinema
            </span>
          </div>
        </div>

        {/* Story Manifesto & Impact Metrics */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl text-white font-light">
                From Glacial Origin to Global Impact
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Filmed across the Swiss Alps, Ethiopian highlands, and Pacific Northwest watersheds.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenGetInvolved();
              }}
              className="self-start sm:self-auto px-5 py-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Support the Mission
            </button>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-white/10">
            <div className="flex flex-col">
              <span className="text-2xl font-light text-white font-display">1.4M+</span>
              <span className="text-[11px] text-zinc-400 tracking-wider uppercase">
                Lives Provided Clean Water
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-light text-white font-display">340+</span>
              <span className="text-[11px] text-zinc-400 tracking-wider uppercase">
                Alpine & Deep Wells Built
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-light text-white font-display">100%</span>
              <span className="text-[11px] text-zinc-400 tracking-wider uppercase">
                Public Transparency
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-light text-white font-display">0</span>
              <span className="text-[11px] text-zinc-400 tracking-wider uppercase">
                Single-Use Plastics
              </span>
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed font-light">
            Every glass of water you pour holds the history of our planet. When rain falls upon mountain
            granite, it embarks on a century-long journey through mineral filtration before reaching
            our lips. Our mission is to restore this natural sanctity and ensure that clean, living
            water flows freely to every person on Earth.
          </p>
        </div>
      </div>
    </div>
  );
};
