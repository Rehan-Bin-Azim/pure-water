import React, { useState, useEffect, useCallback } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { StoryOverlay } from './components/StoryOverlay';
import { Navbar } from './components/Navbar';
import { ScrollTimeline } from './components/ScrollTimeline';
import { StoryModal } from './components/StoryModal';
import { GetInvolvedModal } from './components/GetInvolvedModal';
import { DrawerInfo } from './components/DrawerInfo';
import { CustomCursor } from './components/CustomCursor';
import { CHAPTERS } from './data/chapters';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [storyModalOpen, setStoryModalOpen] = useState<boolean>(false);
  const [getInvolvedModalOpen, setGetInvolvedModalOpen] = useState<boolean>(false);
  const [drawerTopic, setDrawerTopic] = useState<'process' | 'sustainability' | 'shop' | null>(null);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);

  // Smooth scroll progress calculation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const progress = Math.max(0, Math.min(1, scrollY / totalScroll));
      setScrollProgress(progress);

      // Find current chapter
      let currentIndex = 0;
      for (let i = 0; i < CHAPTERS.length; i++) {
        if (progress >= CHAPTERS[i].scrollStart - 0.04) {
          currentIndex = i;
        }
      }
      setActiveChapterIndex(currentIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToProgress = useCallback((progress: number) => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: progress * totalScroll,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="relative bg-[#07090c] text-white min-h-screen selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Interactive Cursor for Desktop */}
      <CustomCursor />

      {/* Global Luxury Film Grain & Vignette Overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-film-grain opacity-40 mix-blend-overlay" />
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,7,10,0.65)_100%)]" />

      {/* 3D WebGL Canvas Engine (Fixed Background Viewport) */}
      <ThreeCanvas scrollProgress={scrollProgress} />

      {/* Fixed Navigation Bar */}
      <Navbar
        onOpenStory={() => setStoryModalOpen(true)}
        onOpenGetInvolved={() => setGetInvolvedModalOpen(true)}
        onOpenDrawer={(topic) => setDrawerTopic(topic)}
        onScrollToChapter={(p) => scrollToProgress(p)}
      />

      {/* Vertical Chapter Timeline Navigation HUD */}
      <ScrollTimeline
        scrollProgress={scrollProgress}
        activeChapterIndex={activeChapterIndex}
        onScrollToProgress={scrollToProgress}
        showThumbnails={showThumbnails}
        setShowThumbnails={setShowThumbnails}
      />

      {/* Story Overlay Text & Dynamic Callouts */}
      <StoryOverlay
        scrollProgress={scrollProgress}
        onOpenStory={() => setStoryModalOpen(true)}
        onOpenGetInvolved={() => setGetInvolvedModalOpen(true)}
        onScrollToProgress={scrollToProgress}
      />

      {/* Tall Scroll Track for physical scrubbing through all 7 continuous stages */}
      <div className="relative w-full h-[700vh] pointer-events-none" />

      {/* Modals & Slide-over Drawers */}
      <StoryModal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        onOpenGetInvolved={() => {
          setStoryModalOpen(false);
          setGetInvolvedModalOpen(true);
        }}
      />

      <GetInvolvedModal
        isOpen={getInvolvedModalOpen}
        onClose={() => setGetInvolvedModalOpen(false)}
      />

      <DrawerInfo
        topic={drawerTopic}
        onClose={() => setDrawerTopic(null)}
        onOpenGetInvolved={() => {
          setDrawerTopic(null);
          setGetInvolvedModalOpen(true);
        }}
      />
    </div>
  );
}
