import React from 'react';
import { CHAPTERS } from '../data/chapters';

interface ScrollTimelineProps {
  scrollProgress: number;
  activeChapterIndex: number;
  onScrollToProgress: (progress: number) => void;
  showThumbnails?: boolean;
  setShowThumbnails?: (show: boolean) => void;
}

export const ScrollTimeline: React.FC<ScrollTimelineProps> = ({
  scrollProgress,
  activeChapterIndex,
  onScrollToProgress,
}) => {
  return (
    <aside className="fixed left-6 sm:left-10 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col select-none">
      <div className="relative flex flex-col space-y-6">
        {/* Continuous subtle vertical guide line */}
        <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[1px] bg-white/10" />

        {/* Dynamic active progress bar */}
        <div
          className="absolute left-[3px] top-1.5 w-[1px] bg-gradient-to-b from-cyan-400 via-cyan-300 to-amber-300 transition-all duration-200"
          style={{
            height: `${Math.min(100, Math.max(0, scrollProgress * 100))}%`,
          }}
        />

        {CHAPTERS.map((ch, idx) => {
          const isActive = activeChapterIndex === idx;
          const isPassed = scrollProgress >= ch.scrollStart;

          return (
            <div key={ch.id} className="relative flex items-center group">
              {/* Minimal Node Indicator */}
              <button
                onClick={() => onScrollToProgress(ch.scrollStart)}
                className={`relative z-10 w-2 h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                  isActive
                    ? 'scale-125 bg-cyan-300 ring-4 ring-cyan-400/20 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                    : isPassed
                    ? 'bg-cyan-200/70'
                    : 'bg-zinc-700/80 group-hover:bg-zinc-400'
                }`}
                title={`Go to ${ch.tag}`}
              />

              {/* Minimal Editorial Label */}
              <button
                onClick={() => onScrollToProgress(ch.scrollStart)}
                className="ml-4 text-left focus:outline-none flex items-center gap-2 cursor-pointer group"
              >
                <span
                  className={`text-[9px] font-mono tracking-widest transition-colors duration-300 ${
                    isActive ? 'text-cyan-400 font-semibold' : 'text-zinc-600 group-hover:text-zinc-400'
                  }`}
                >
                  {ch.number}
                </span>
                <span
                  className={`text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${
                    isActive
                      ? 'text-white font-medium translate-x-0.5'
                      : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                >
                  {ch.tag}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
