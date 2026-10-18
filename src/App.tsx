import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { QuizSection } from './components/QuizSection';
import { EventHorizonSimulator } from './components/EventHorizonSimulator';
import { NasaGallerySection } from './components/NasaGallerySection';
import { LiveAlertsSection } from './components/LiveAlertsSection';
import { BlackHoleCatalogSection } from './components/BlackHoleCatalogSection';
import { UserProgressState, DailyCosmicEnigma } from './types';
import { cosmicSound } from './lib/sound';
import { Award } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('galeria');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // User Engagement State (Why Return Every Day?)
  const [userProgress, setUserProgress] = useState<UserProgressState>(() => {
    const saved = localStorage.getItem('nasa_blackhole_user_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // use default
      }
    }
    return {
      xp: 120,
      level: 1,
      levelTitle: 'Astrônomo Iniciante',
      dailyStreak: 1,
      solvedEnigmas: [],
      unlockedBadges: [
        {
          id: 'first-entry',
          name: 'Primeiro Contato EHT',
          description: 'Acessou o Arquivo Oficial de Buracos Negros da NASA',
          icon: 'Sparkles',
          unlockedAt: 'Hoje'
        }
      ]
    };
  });

  // Daily Enigma
  const [currentEnigmaIndex, setCurrentEnigmaIndex] = useState<number>(0);
  const [dailyEnigma, setDailyEnigma] = useState<DailyCosmicEnigma | null>(null);
  const [enigmaSolvedToday, setEnigmaSolvedToday] = useState<boolean>(false);
  const [recentBadgeToast, setRecentBadgeToast] = useState<string | null>(null);

  // Fetch Daily Enigma
  useEffect(() => {
    const fetchEnigma = async () => {
      try {
        const res = await fetch(`/api/daily-enigma?index=${currentEnigmaIndex}`);
        const json = await res.json();
        if (json.success) {
          setDailyEnigma(json.data);
          // Check if already solved
          setEnigmaSolvedToday(userProgress.solvedEnigmas.includes(json.data.dayId));
        }
      } catch (err) {
        console.error('Erro ao buscar enigma cósmico:', err);
      }
    };
    fetchEnigma();
  }, [currentEnigmaIndex]);

  // Save Progress & compute levels
  const updateProgress = (addedXp: number, enigmaId?: string) => {
    setUserProgress(prev => {
      const newXp = prev.xp + addedXp;
      let newLevel = 1;
      let newTitle = 'Astrônomo Iniciante';

      if (newXp >= 1000) {
        newLevel = 5;
        newTitle = 'Mestre da Relatividade Geral';
      } else if (newXp >= 600) {
        newLevel = 4;
        newTitle = 'Teórico do Limite de Hawking';
      } else if (newXp >= 350) {
        newLevel = 3;
        newTitle = 'Astrofísico de Kerr';
      } else if (newXp >= 200) {
        newLevel = 2;
        newTitle = 'Pesquisador do EHT';
      }

      const solved = enigmaId ? [...prev.solvedEnigmas, enigmaId] : prev.solvedEnigmas;

      const nextState: UserProgressState = {
        ...prev,
        xp: newXp,
        level: newLevel,
        levelTitle: newTitle,
        solvedEnigmas: solved
      };

      try {
        localStorage.setItem('nasa_blackhole_user_progress', JSON.stringify(nextState));
      } catch {
        // ignore storage error
      }

      return nextState;
    });
  };

  // Handle solved enigma
  const handleEnigmaSolved = (xpReward: number, title: string) => {
    if (!dailyEnigma) return;
    cosmicSound.playSuccessChime();
    setEnigmaSolvedToday(true);
    updateProgress(xpReward, dailyEnigma.dayId);
    setRecentBadgeToast(`Missão Cumprida: "${title}" (+${xpReward} XP)`);
    setTimeout(() => {
      setRecentBadgeToast(null);
    }, 5000);
  };

  const handleNextEnigma = () => {
    setCurrentEnigmaIndex(prev => prev + 1);
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const isNowPlaying = cosmicSound.toggleMute();
    setSoundEnabled(isNowPlaying);
  };

  return (
    <div className="min-h-screen bg-[#030914] text-slate-100 selection:bg-cyan-400 selection:text-slate-950">
      {/* Navbar */}
      <Navbar
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        userProgress={userProgress}
        activeSection={activeSection}
        onNavigate={(sec) => {
          setActiveSection(sec);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-8">
        {/* Dynamic Section Navigation */}
        <div className="pt-2">
          {activeSection === 'galeria' && (
            <NasaGallerySection />
          )}

          {activeSection === 'simulador' && (
            <EventHorizonSimulator />
          )}

          {activeSection === 'alertas' && (
            <LiveAlertsSection />
          )}

          {activeSection === 'catalogo' && (
            <BlackHoleCatalogSection
              onSelectForSimulation={(id) => {
                setActiveSection('simulador');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeSection === 'quiz' && (
            <QuizSection
              currentEnigmaIndex={currentEnigmaIndex}
              dailyEnigma={dailyEnigma}
              onSolved={handleEnigmaSolved}
              onNextEnigma={handleNextEnigma}
              isSolvedToday={enigmaSolvedToday}
            />
          )}
        </div>

        {/* Footer info */}
        <footer className="border-t border-cyan-500/20 pt-6 pb-12 text-center text-xs text-slate-400">
          <p>
            Desenvolvido com dados oficiais dos arquivos EHT (Event Horizon Telescope), NASA Image and Video Library, Chandra X-Ray Observatory e JWST.
          </p>
          <p className="mt-1 text-cyan-300 font-semibold">
            Aberta Global • Ciência Sem Fronteiras • Repositório Mundial de Referências por Nome (NASA, ESO, JAXA, Chandra, LIGO)
          </p>
        </footer>
      </main>

      {/* Achievement Toast */}
      {recentBadgeToast && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border border-cyan-500/50 bg-slate-900/95 px-4 py-3 text-sm font-bold text-cyan-200 shadow-2xl shadow-cyan-500/20 backdrop-blur-md animate-bounce">
          <Award className="h-5 w-5 text-cyan-400" />
          <span>{recentBadgeToast}</span>
        </div>
      )}
    </div>
  );
}
