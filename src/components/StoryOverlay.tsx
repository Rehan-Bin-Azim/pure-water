import React from 'react';
import { Play, ArrowDown, HeartHandshake } from 'lucide-react';

interface StoryOverlayProps {
  scrollProgress: number;
  onOpenStory: () => void;
  onOpenGetInvolved: () => void;
  onScrollToProgress: (p: number) => void;
}

export const StoryOverlay: React.FC<StoryOverlayProps> = ({
  scrollProgress,
  onOpenStory,
  onOpenGetInvolved,
  onScrollToProgress,
}) => {
  // Helper to calculate smooth cinematic opacity, translateY, and blur
  const getSceneStyle = (start: number, end: number) => {
    const range = end - start;
    const fadeRange = range * 0.22;

    if (scrollProgress < start - 0.04 || scrollProgress > end + 0.04) {
      return {
        opacity: 0,
        transform: 'translate3d(0, 20px, 0)',
        filter: 'blur(4px)',
        pointerEvents: 'none' as const,
      };
    }

    let opacity = 0;
    let translateY = 0;
    let blur = 0;

    if (scrollProgress < start + fadeRange) {
      const progressIn = (scrollProgress - start) / fadeRange;
      opacity = Math.max(0, Math.min(1, progressIn));
      translateY = (1 - opacity) * 18;
      blur = (1 - opacity) * 4;
    } else if (scrollProgress > end - fadeRange) {
      const progressOut = (end - scrollProgress) / fadeRange;
      opacity = Math.max(0, Math.min(1, progressOut));
      translateY = -(1 - opacity) * 16;
      blur = (1 - opacity) * 4;
    } else {
      opacity = 1;
      translateY = 0;
      blur = 0;
    }

    return {
      opacity,
      transform: `translate3d(0, ${translateY}px, 0)`,
      filter: blur > 0.1 ? `blur(${blur}px)` : 'none',
      pointerEvents: opacity > 0.4 ? ('auto' as const) : ('none' as const),
    };
  };

  return (
    <div className="fixed inset-0 z-20 pointer-events-none p-6 sm:p-12 md:p-16">
      {/* ---------------- SCENE 1: HERO (0.0 to 0.18) ----------------
          Composition: Text Left / Glass Slightly Right */}
      <div
        className="absolute left-6 sm:left-14 md:left-24 top-1/2 -translate-y-1/2 max-w-xl transition-all duration-700 ease-out"
        style={getSceneStyle(0.0, 0.18)}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-[10px] tracking-[0.35em] uppercase text-cyan-400 font-mono font-medium">
            01 / PURITY IN REPOSE
          </span>
          <span className="w-8 h-[1px] bg-cyan-400/50" />
        </div>

        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-light text-white leading-[1.05] tracking-tight mb-4">
          Small Drops
          <br />
          Make a Big Change
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 font-light mb-8 tracking-wide font-sans">
          Cleaner water. Brighter tomorrow.
        </p>

        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={onOpenStory}
            className="group flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs uppercase tracking-widest transition-all duration-300 backdrop-blur-md shadow-lg hover:border-white/40 active:scale-95 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:scale-110">
              <Play className="w-3 h-3 fill-black ml-0.5" />
            </div>
            <span>Watch Our Story</span>
          </button>
        </div>
      </div>

      {/* ---------------- SCENE 2: WATER (0.18 to 0.35) ----------------
          Composition: Text Left / Glass Center-Right */}
      <div
        className="absolute left-6 sm:left-14 md:left-24 top-1/2 -translate-y-1/2 max-w-lg transition-all duration-700 ease-out"
        style={getSceneStyle(0.18, 0.35)}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[10px] tracking-[0.35em] uppercase text-cyan-400 font-mono font-medium">
            02 / THE INCEPTION
          </span>
          <span className="w-6 h-[1px] bg-cyan-400/50" />
        </div>

        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light text-white leading-[1.08] tracking-tight mb-4">
          Purity in
          <br />
          Every Drop
        </h2>

        <p className="text-base sm:text-lg text-zinc-300 font-light tracking-wide font-sans">
          Every journey begins with a single drop.
        </p>
      </div>

      {/* ---------------- SCENE 3: MOTION (0.35 to 0.52) ----------------
          Composition: Text Lower-Left / Glass Upper-Right Tilting */}
      <div
        className="absolute left-6 sm:left-14 md:left-24 bottom-16 sm:bottom-24 max-w-lg transition-all duration-700 ease-out"
        style={getSceneStyle(0.35, 0.52)}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[10px] tracking-[0.35em] uppercase text-cyan-400 font-mono font-medium">
            03 / MOMENTUM
          </span>
          <span className="w-6 h-[1px] bg-cyan-400/50" />
        </div>

        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light text-white leading-[1.08] tracking-tight mb-4">
          Flowing
          <br />
          Towards Change
        </h2>

        <p className="text-base sm:text-lg text-zinc-300 font-light tracking-wide font-sans">
          Every action creates a ripple.
        </p>
      </div>

      {/* ---------------- SCENE 4: FLOW (0.52 to 0.70) ----------------
          Composition: Text Upper-Left / Water Crossing Screen */}
      <div
        className="absolute left-6 sm:left-14 md:left-24 top-24 sm:top-32 max-w-lg transition-all duration-700 ease-out"
        style={getSceneStyle(0.52, 0.70)}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[10px] tracking-[0.35em] uppercase text-cyan-400 font-mono font-medium">
            04 / BEYOND BOUNDARIES
          </span>
          <span className="w-6 h-[1px] bg-cyan-400/50" />
        </div>

        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light text-white leading-[1.08] tracking-tight mb-4">
          From Small Actions
          <br />
          to a Healthier Planet
        </h2>

        <p className="text-base sm:text-lg text-zinc-300 font-light tracking-wide font-sans">
          What we do today flows towards a brighter tomorrow.
        </p>
      </div>

      {/* ---------------- SCENE 5: RIVER (0.70 to 0.84) ----------------
          Composition: Text Left / River Center */}
      <div
        className="absolute left-6 sm:left-14 md:left-24 top-1/2 -translate-y-1/2 max-w-lg transition-all duration-700 ease-out"
        style={getSceneStyle(0.70, 0.84)}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[10px] tracking-[0.35em] uppercase text-cyan-400 font-mono font-medium">
            05 / THE CONFLUENCE
          </span>
          <span className="w-6 h-[1px] bg-cyan-400/50" />
        </div>

        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light text-white leading-[1.08] tracking-tight mb-4">
          Every Drop
          <br />
          Becomes a Journey
        </h2>

        <p className="text-base sm:text-lg text-zinc-300 font-light tracking-wide font-sans">
          Small actions can create lasting change.
        </p>
      </div>

      {/* ---------------- SCENE 6: LANDSCAPE (0.84 to 0.94) ----------------
          Composition: Minimal Text over Mountain Vista */}
      <div
        className="absolute left-6 sm:left-14 md:left-24 top-1/3 max-w-xl transition-all duration-700 ease-out"
        style={getSceneStyle(0.84, 0.94)}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[10px] tracking-[0.35em] uppercase text-amber-300 font-mono font-medium">
            06 / THE LIVING VALLEY
          </span>
          <span className="w-6 h-[1px] bg-amber-400/50" />
        </div>

        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-light text-white leading-[1.08] tracking-tight mb-4">
          Cleaner Water
          <br />
          Healthier Lives
        </h2>

        <p className="text-base sm:text-lg text-zinc-300 font-light tracking-wide font-sans">
          Together, we create lasting change.
        </p>
      </div>

      {/* ---------------- SCENE 7: FINAL CTA (0.94 to 1.0) ----------------
          Composition: Large Centered CTA & Emotional Payoff */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 transition-all duration-700 ease-out pointer-events-none"
        style={getSceneStyle(0.94, 1.0)}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] tracking-[0.4em] uppercase text-amber-300 font-mono font-medium">
              P U R E
            </span>
            <span className="w-8 h-[1px] bg-amber-400/50" />
          </div>

          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl font-light text-white leading-[1.05] tracking-tight mb-5">
            A Cleaner
            <br />
            Tomorrow
          </h2>

          <div className="space-y-1 mb-8">
            <p className="text-base sm:text-xl text-zinc-200 font-light tracking-wide">
              For People.
            </p>
            <p className="text-base sm:text-xl text-zinc-200 font-light tracking-wide">
              For Nature.
            </p>
            <p className="text-base sm:text-xl text-zinc-200 font-light tracking-wide">
              For Tomorrow.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pointer-events-auto">
            <button
              onClick={onOpenGetInvolved}
              className="px-8 py-3.5 rounded-full bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-zinc-200 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.35)] hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Get Involved</span>
            </button>

            <button
              onClick={onOpenStory}
              className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs uppercase tracking-widest transition-all duration-300 backdrop-blur-md hover:border-white/40 active:scale-95 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
                <Play className="w-3 h-3 fill-black ml-0.5" />
              </div>
              <span>Watch Our Story</span>
            </button>
          </div>

          {/* Golden Script Calligraphy */}
          <div className="mt-10">
            <p className="font-script text-4xl sm:text-5xl text-amber-200/80 leading-snug drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              A Brighter Tomorrow Together
            </p>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent mx-auto mt-2" />
          </div>
        </div>
      </div>

      {/* Floating Scroll Indicator in Hero */}
      <div
        className="fixed right-8 sm:right-14 bottom-12 z-30 pointer-events-auto flex flex-col items-center gap-3 transition-opacity duration-500"
        style={{
          opacity: scrollProgress < 0.12 ? 1 - scrollProgress / 0.12 : 0,
        }}
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-400 font-mono writing-vertical-rl">
          Scroll to explore
        </span>
        <button
          onClick={() => onScrollToProgress(0.22)}
          className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/50 transition-all animate-bounce cursor-pointer"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Persistent Minimal Footer (Visible in final scene) */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-30 px-6 sm:px-12 py-5 bg-gradient-to-t from-black/90 to-transparent border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-700 pointer-events-auto text-xs text-zinc-400"
        style={{
          opacity: scrollProgress > 0.92 ? 1 : 0,
          transform: scrollProgress > 0.92 ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: scrollProgress > 0.92 ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="font-display tracking-[0.3em] font-light text-white text-sm">
            P U R E
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-[11px] text-zinc-400">Cleaner Water. Brighter Tomorrow.</span>
        </div>

        <div className="flex items-center gap-6 text-[11px]">
          <button onClick={() => onScrollToProgress(0)} className="hover:text-white transition-colors cursor-pointer">
            Back to top
          </button>
          <span className="text-zinc-700">•</span>
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <span className="text-zinc-700">•</span>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
            Terms of Impact
          </a>
        </div>

        <div className="flex items-center gap-4 text-zinc-500">
          <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
          <span className="hover:text-white cursor-pointer transition-colors">YouTube</span>
        </div>
      </footer>
    </div>
  );
};
