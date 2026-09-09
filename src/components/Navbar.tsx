import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, ArrowUpRight } from 'lucide-react';
import { audioEngine } from './AudioController';

interface NavbarProps {
  onOpenStory: () => void;
  onOpenGetInvolved: () => void;
  onOpenDrawer: (topic: 'process' | 'sustainability' | 'shop') => void;
  onScrollToChapter: (scrollProgress: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenStory,
  onOpenGetInvolved,
  onOpenDrawer,
  onScrollToChapter,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const active = audioEngine.toggle();
    setIsPlaying(active);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled
          ? 'py-4 bg-[#080a0d]/80 backdrop-blur-xl border-b border-white/[0.06]'
          : 'py-6 bg-gradient-to-b from-[#080a0d]/90 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onScrollToChapter(0)}
          className="group flex items-center gap-2 cursor-pointer text-left focus:outline-none"
        >
          <span className="font-display tracking-[0.4em] text-xl font-light text-white transition-opacity group-hover:opacity-80">
            P U R E
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/80 animate-pulse" />
        </button>

        {/* Center Editorial Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-medium tracking-[0.2em] uppercase text-zinc-400">
          <button
            onClick={() => onScrollToChapter(0)}
            className="hover:text-white transition-colors duration-300 relative py-1 group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan-400/80 transition-all duration-300 group-hover:w-full" />
          </button>
          <button
            onClick={onOpenStory}
            className="hover:text-white transition-colors duration-300 relative py-1 group"
          >
            Our Story
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan-400/80 transition-all duration-300 group-hover:w-full" />
          </button>
          <button
            onClick={() => onOpenDrawer('process')}
            className="hover:text-white transition-colors duration-300 relative py-1 group"
          >
            Process
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan-400/80 transition-all duration-300 group-hover:w-full" />
          </button>
          <button
            onClick={() => onOpenDrawer('sustainability')}
            className="hover:text-white transition-colors duration-300 relative py-1 group"
          >
            Sustainability
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan-400/80 transition-all duration-300 group-hover:w-full" />
          </button>
          <button
            onClick={() => onOpenDrawer('shop')}
            className="hover:text-white transition-colors duration-300 relative py-1 group flex items-center gap-1"
          >
            Shop
            <ArrowUpRight className="w-3 h-3 opacity-60" />
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan-400/80 transition-all duration-300 group-hover:w-full" />
          </button>
        </nav>

        {/* Right Actions: Sound Ambient Toggle & Get Started */}
        <div className="flex items-center gap-4">
          {/* Ambient Soundscape Toggle */}
          <button
            onClick={toggleSound}
            title={isPlaying ? 'Mute ambient soundscape' : 'Enable ambient soundscape'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-sans border transition-all duration-300 ${
              isPlaying
                ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                <span className="hidden sm:inline text-[11px] tracking-wider uppercase font-medium">Sound On</span>
                <span className="flex items-end gap-0.5 h-3 ml-0.5">
                  <span className="w-0.5 h-full bg-cyan-400 animate-[bounce_1s_infinite_100ms]" />
                  <span className="w-0.5 h-2/3 bg-cyan-400 animate-[bounce_1s_infinite_300ms]" />
                  <span className="w-0.5 h-4/5 bg-cyan-400 animate-[bounce_1s_infinite_200ms]" />
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline text-[11px] tracking-wider uppercase font-medium">Sound</span>
              </>
            )}
          </button>

          {/* CTA Button */}
          <button
            onClick={onOpenGetInvolved}
            className="px-5 py-2 rounded-full text-xs font-medium tracking-wider uppercase text-black bg-white hover:bg-zinc-200 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[73px] bg-[#0c1017]/95 backdrop-blur-2xl border-b border-white/10 px-8 py-8 flex flex-col space-y-6">
          <button
            onClick={() => {
              onScrollToChapter(0);
              setMobileMenuOpen(false);
            }}
            className="text-left text-sm tracking-[0.2em] uppercase text-zinc-300 hover:text-white"
          >
            01 — Home
          </button>
          <button
            onClick={() => {
              onOpenStory();
              setMobileMenuOpen(false);
            }}
            className="text-left text-sm tracking-[0.2em] uppercase text-zinc-300 hover:text-white"
          >
            02 — Our Story
          </button>
          <button
            onClick={() => {
              onOpenDrawer('process');
              setMobileMenuOpen(false);
            }}
            className="text-left text-sm tracking-[0.2em] uppercase text-zinc-300 hover:text-white"
          >
            03 — Process
          </button>
          <button
            onClick={() => {
              onOpenDrawer('sustainability');
              setMobileMenuOpen(false);
            }}
            className="text-left text-sm tracking-[0.2em] uppercase text-zinc-300 hover:text-white"
          >
            04 — Sustainability
          </button>
          <button
            onClick={() => {
              onOpenDrawer('shop');
              setMobileMenuOpen(false);
            }}
            className="text-left text-sm tracking-[0.2em] uppercase text-zinc-300 hover:text-white"
          >
            05 — Pure Bottle Shop
          </button>
          <button
            onClick={() => {
              onOpenGetInvolved();
              setMobileMenuOpen(false);
            }}
            className="w-full py-3 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-widest text-center"
          >
            Get Involved Now
          </button>
        </div>
      )}
    </header>
  );
};
