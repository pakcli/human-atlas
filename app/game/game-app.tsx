import React, { useState, useEffect, useMemo } from 'react';
import type { GameLevel, GameMode, GameScreen, GameSettings } from './types';
import { getWordsForLevel } from './word-bank';
import { MenuScreen } from './menu-screen';
import { WordConnectGame } from './word-connect-game';
import { WordTypingGame } from './word-typing-game';
import { ExplanationCard } from './explanation-card';
import { PauseModal } from './pause-modal';
import { ExitModal } from './exit-modal';
import { AboutScreen } from './about-screen';
import { SettingsScreen } from './settings-screen';
import { RadialAlphabetBackground } from './radial-alphabet-background';
import { WordleVictoryModal } from './wordle-victory-modal';
import type { AccentThemeId } from '../theme-engine';
import type { GuessEvaluation, GameStats } from './types';

interface GameAppProps {
  currentTheme: 'light' | 'dark';
  accentTheme?: AccentThemeId;
  onToggleTheme: () => void;
  onSelectAccentTheme?: (id: AccentThemeId) => void;
  onOpenAtlas: (targetName?: string) => void;
  onCloseGame: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  sound: true,
  vibration: true,
  theme: 'light',
  largeText: false,
  colorBlindMarkers: true,
  readAloud: false,
  autoClearOnWrong: true,
  letterSuspense: true,
};

export const GameApp: React.FC<GameAppProps> = ({
  currentTheme,
  accentTheme = 'navy_blue',
  onToggleTheme,
  onSelectAccentTheme,
  onOpenAtlas,
  onCloseGame,
}) => {
  // Screen state
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [level, setLevel] = useState<GameLevel>('TK');
  const [mode, setMode] = useState<GameMode>('connect');

  // Words & rounds
  const [wordIndex, setWordIndex] = useState(0);
  const words = useMemo(() => getWordsForLevel(level), [level]);
  const currentWord = words[wordIndex % words.length];

  // Modals state
  const [showPause, setShowPause] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [victoryGuesses, setVictoryGuesses] = useState<GuessEvaluation[]>([]);
  const [lastRoundResult, setLastRoundResult] = useState<{
    isWin: boolean;
    score?: number;
    wrongCount?: number;
  }>({ isWin: false });

  // Stats state (loads from localStorage)
  const [stats, setStats] = useState<GameStats>(() => {
    if (typeof window === 'undefined') {
      return { roundsPlayed: 0, wordsWon: 0, totalScore: 0, currentStreak: 0, bestStreak: 0, history: [] };
    }
    try {
      const saved = localStorage.getItem('tebak_kata_stats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { roundsPlayed: 0, wordsWon: 0, totalScore: 0, currentStreak: 0, bestStreak: 0, history: [] };
  });

  // Settings state (loads from localStorage)
  const [settings, setSettings] = useState<GameSettings>(() => {
    if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS, theme: currentTheme };
    try {
      const saved = localStorage.getItem('tebak_kata_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed, theme: currentTheme };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_SETTINGS, theme: currentTheme };
  });

  // Sync theme changes
  useEffect(() => {
    setSettings((s) => ({ ...s, theme: currentTheme }));
  }, [currentTheme]);

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('tebak_kata_settings', JSON.stringify(updated));
      }
      if (newSettings.theme && newSettings.theme !== currentTheme) {
        onToggleTheme();
      }
      return updated;
    });
  };

  const handleClearGameData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tebak_kata_stats');
      localStorage.removeItem('tebak_kata_settings');
    }
    setStats({ roundsPlayed: 0, wordsWon: 0, totalScore: 0, currentStreak: 0, bestStreak: 0, history: [] });
  };

  // Level selector
  const handleSelectLevel = (lvl: GameLevel) => {
    setLevel(lvl);
    setWordIndex(0);
  };

  // Start game mode
  const handleStartMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScreen(selectedMode);
    setShowExplanation(false);
    setShowVictory(false);
  };

  // Handle win in Word Connect (Swipe mode)
  const handleConnectSuccess = () => {
    const curStreak = (stats.currentStreak || 0) + 1;
    const bestStr = Math.max(stats.bestStreak || 0, curStreak);
    const updatedStats: GameStats = {
      ...stats,
      roundsPlayed: stats.roundsPlayed + 1,
      wordsWon: stats.wordsWon + 1,
      totalScore: stats.totalScore + 10,
      currentStreak: curStreak,
      bestStreak: bestStr,
    };
    setStats(updatedStats);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tebak_kata_stats', JSON.stringify(updatedStats));
    }

    setLastRoundResult({ isWin: true });
    setShowExplanation(true);
  };

  // Handle win in Word Typing (Typing mode) - triggers Wordle Victory Recap Popup
  const handleTypingSuccess = (finalScore: number, wrongCount: number, evaluations?: GuessEvaluation[]) => {
    const curStreak = (stats.currentStreak || 0) + 1;
    const bestStr = Math.max(stats.bestStreak || 0, curStreak);
    const updatedStats: GameStats = {
      ...stats,
      roundsPlayed: stats.roundsPlayed + 1,
      wordsWon: stats.wordsWon + 1,
      totalScore: stats.totalScore + finalScore,
      currentStreak: curStreak,
      bestStreak: bestStr,
    };
    setStats(updatedStats);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tebak_kata_stats', JSON.stringify(updatedStats));
    }

    setLastRoundResult({ isWin: true, score: finalScore, wrongCount });
    setVictoryGuesses(evaluations || []);
    setShowVictory(true);
  };

  // Next word
  const handleNextWord = () => {
    setShowVictory(false);
    setShowExplanation(false);
    setWordIndex((prev) => prev + 1);
  };

  // Swap to Atlas while preserving game session (Section 9 & 10.8)
  const handleViewInAtlas = (targetName?: string) => {
    onOpenAtlas(targetName);
  };

  return (
    <div
      data-theme={currentTheme}
      className={`relative isolate w-full h-full flex flex-col overflow-hidden font-sans select-none ${
        currentTheme === 'dark' ? 'dark' : ''
      }`}
      style={{
        backgroundColor: 'var(--bg-canvas, #faf7f2)',
        color: 'var(--panel-text, #0f172a)',
      }}
    >
      <RadialAlphabetBackground theme={currentTheme} />

      {/* Active Screen View */}
      {screen === 'menu' && (
        <MenuScreen
          level={level}
          onSelectLevel={handleSelectLevel}
          onStartMode={handleStartMode}
          onOpenAtlas={() => onOpenAtlas()}
          onOpenAbout={() => setScreen('about')}
          onOpenSettings={() => setScreen('settings')}
        />
      )}

      {screen === 'connect' && (
        <WordConnectGame
          word={currentWord}
          roundNumber={wordIndex + 1}
          settings={settings}
          onSuccess={handleConnectSuccess}
          onOpenPause={() => setShowPause(true)}
          onOpenAtlas={handleViewInAtlas}
        />
      )}

      {screen === 'typing' && (
        <WordTypingGame
          word={currentWord}
          settings={settings}
          onSuccess={handleTypingSuccess}
          onOpenPause={() => setShowPause(true)}
          onOpenAtlas={handleViewInAtlas}
        />
      )}

      {screen === 'about' && <AboutScreen onBack={() => setScreen('menu')} />}

      {screen === 'settings' && (
        <SettingsScreen
          settings={settings}
          accentTheme={accentTheme}
          onSelectAccentTheme={onSelectAccentTheme}
          onUpdateSettings={handleUpdateSettings}
          onClearGameData={handleClearGameData}
          onBack={() => setScreen('menu')}
        />
      )}

      {/* Wordle Victory Recap Modal (Section 10.8 & screenshot reference) */}
      <WordleVictoryModal
        isOpen={showVictory}
        word={currentWord}
        guesses={victoryGuesses}
        currentStreak={stats.currentStreak || 0}
        bestStreak={stats.bestStreak || 0}
        onNext={handleNextWord}
        onHome={() => {
          setShowVictory(false);
          setScreen('menu');
        }}
        onViewInAtlas={handleViewInAtlas}
      />

      {/* Explanation Card Modal (Section 10.8) */}
      {showExplanation && (
        <ExplanationCard
          word={currentWord}
          isWin={lastRoundResult.isWin}
          score={lastRoundResult.score}
          wrongCount={lastRoundResult.wrongCount}
          onNext={handleNextWord}
          onViewInAtlas={handleViewInAtlas}
        />
      )}

      {/* Pause Modal (Section 10.8) */}
      <PauseModal
        isOpen={showPause}
        onResume={() => setShowPause(false)}
        onRestart={() => {
          setShowPause(false);
          setWordIndex((w) => w);
        }}
        onExit={() => {
          setShowPause(false);
          setShowExitConfirm(true);
        }}
      />

      {/* Exit Confirmation Modal (Section 10.8) */}
      <ExitModal
        isOpen={showExitConfirm}
        onStay={() => setShowExitConfirm(false)}
        onConfirmExit={() => {
          setShowExitConfirm(false);
          setScreen('menu');
        }}
      />
    </div>
  );
};
