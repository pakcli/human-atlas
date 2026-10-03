import React, { useState, useEffect, useRef } from 'react';
import type { WordItem, GameSettings, GuessEvaluation } from './types';
import { evaluateGuess, computeFinalScore } from './game-engine';
import { soundManager } from './sound-manager';
import { Pause, Delete, CornerDownLeft, Sparkles, Box } from 'lucide-react';

interface WordTypingGameProps {
  word: WordItem;
  settings: GameSettings;
  onSuccess: (finalScore: number, wrongCount: number) => void;
  onOpenPause: () => void;
  onOpenAtlas: (targetName?: string) => void;
}


export const WordTypingGame: React.FC<WordTypingGameProps> = ({
  word,
  settings,
  onSuccess,
  onOpenPause,
  onOpenAtlas,
}) => {
  const targetWord = word.word.toUpperCase();
  const wordLength = targetWord.length;

  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<GuessEvaluation[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState('Ketik tebakanmu, lalu tekan Enter');
  const [isShakeActive, setIsShakeActive] = useState(false);

  const wrongCount = guesses.length;
  const currentScore = computeFinalScore(wrongCount, revealedIndices.length);

  // Key state color map (green or ice for keyboard keys)
  const keyStatusMap = useRef<Record<string, 'right' | 'wrong'>>({});
  guesses.forEach((g) => {
    g.guess.split('').forEach((char, index) => {
      const status = g.statuses[index];
      if (status === 'right') {
        keyStatusMap.current[char] = 'right';
      } else if (!keyStatusMap.current[char]) {
        keyStatusMap.current[char] = 'wrong';
      }
    });
  });

  // Handle letter input
  const handleAddChar = (char: string) => {
    if (currentGuess.length < wordLength) {
      soundManager.playTap(settings.sound);
      soundManager.vibrate(settings.vibration, 15);
      setCurrentGuess((prev) => prev + char);
    }
  };

  const handleBackspace = () => {
    soundManager.playTap(settings.sound);
    setCurrentGuess((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (currentGuess.length !== wordLength) {
      soundManager.playWrong(settings.sound);
      setFeedbackMessage(`Panjang kata harus ${wordLength} huruf!`);
      setIsShakeActive(true);
      setTimeout(() => setIsShakeActive(false), 500);
      return;
    }

    const evaluation = evaluateGuess(currentGuess, targetWord);
    const nextGuesses = [...guesses, evaluation];
    setGuesses(nextGuesses);
    setFeedbackMessage(evaluation.message);

    if (evaluation.rightCount === wordLength) {
      // Won!
      soundManager.playWin(settings.sound);
      soundManager.vibrate(settings.vibration, [50, 70, 100]);
      const finalScore = computeFinalScore(guesses.length, revealedIndices.length);
      onSuccess(finalScore, guesses.length);
    } else {
      // Wrong guess
      soundManager.playWrong(settings.sound);
      soundManager.vibrate(settings.vibration, 30);
      if (settings.autoClearOnWrong !== false) {
        setCurrentGuess('');
      }
    }
  };

  // Remove specific letter from guessing word draft when user presses on its slot
  const handleRemoveDraftChar = (colIdx: number) => {
    if (colIdx < currentGuess.length) {
      soundManager.playTap(settings.sound);
      soundManager.vibrate(settings.vibration, 15);
      setCurrentGuess((prev) => prev.slice(0, colIdx) + prev.slice(colIdx + 1));
    }
  };

  // Powerup: Reveal a letter (costs 2 score points)
  const canReveal = currentScore > 2 && revealedIndices.length < Math.floor(wordLength / 2);

  const handleRevealLetter = () => {
    if (!canReveal) return;
    soundManager.playPowerup(settings.sound);
    soundManager.vibrate(settings.vibration, 40);

    const unrevealed = [];
    for (let i = 0; i < wordLength; i++) {
      if (!revealedIndices.includes(i)) {
        unrevealed.push(i);
      }
    }
    if (unrevealed.length > 0) {
      const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setRevealedIndices((prev) => [...prev, pick]);
      setFeedbackMessage(`Huruf '${targetWord[pick]}' terungkap di posisi ke-${pick + 1}!`);
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleAddChar(key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div
      className="flex flex-col h-full max-w-md mx-auto w-full select-none overflow-hidden justify-between"
      style={{
        backgroundColor: 'transparent',
        color: 'var(--panel-text, #0f172a)',
      }}
    >
      {/* Top Bar (Section 10.6) */}
      <div
        className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 border-b"
        style={{ borderColor: 'var(--panel-border, rgba(0,0,0,0.12))' }}
      >
        <button
          type="button"
          onClick={onOpenPause}
          className="p-2 rounded-xl border-b-4 active:translate-y-[2px] active:border-b-2"
          style={{
            backgroundColor: 'var(--panel-bg, #f1f5f9)',
            borderColor: 'var(--panel-border, rgba(0,0,0,0.25))',
            color: 'var(--panel-text, #0f172a)',
          }}
          title="Jeda"
        >
          <Pause size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div
            className="px-2.5 py-1 rounded-xl border text-xs font-bold"
            style={{
              backgroundColor: 'var(--panel-bg, #f1f5f9)',
              borderColor: 'var(--panel-border, rgba(0,0,0,0.15))',
              color: 'var(--accent-primary, #0284c7)',
            }}
          >
            Skor: {currentScore}
          </div>
          <div
            className="px-2 py-1 rounded-xl text-xs font-semibold opacity-75"
            style={{ backgroundColor: 'var(--panel-bg, #f1f5f9)' }}
          >
            Salah: {wrongCount}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenAtlas(word.atlasTarget)}
          className="py-1 px-3 rounded-xl font-semibold text-xs border-b-4 active:translate-y-[2px] active:border-b-2 flex items-center gap-1 text-white shadow-xs"
          style={{
            backgroundColor: 'var(--accent-primary, #0284c7)',
            borderColor: 'rgba(0, 0, 0, 0.35)',
          }}
        >
          <Box size={14} />
          <span>Atlas &gt;&gt;</span>
        </button>
      </div>

      {/* Clue and Question Header */}
      <div className="px-4 py-2 text-center">
        <div
          className="inline-block px-3 py-0.5 mb-1 rounded-full text-[11px] font-semibold"
          style={{
            backgroundColor: 'var(--panel-bg, #f1f5f9)',
            color: 'var(--accent-primary, #0284c7)',
          }}
        >
          💡 Petunjuk ({word.category})
        </div>
        <p className="text-sm font-semibold leading-snug opacity-95">
          {word.clue}
        </p>

        {/* Revealed letters hint bar if any */}
        {revealedIndices.length > 0 && (
          <div
            className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium"
            style={{ color: 'var(--accent-primary, #0284c7)' }}
          >
            <span>Bantuan terbuka:</span>
            {revealedIndices.map((idx) => (
              <span key={idx} className="font-bold underline">
                posisi {idx + 1} = &lsquo;{targetWord[idx]}&rsquo;
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Feedback & SDM Meter Banner */}
      <div className="px-4 my-1 text-center">
        <div
          className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full border shadow-sm text-xs font-semibold"
          style={{
            backgroundColor: 'var(--panel-bg-solid, #ffffff)',
            borderColor: 'var(--panel-border, rgba(0,0,0,0.15))',
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--accent-primary, #0284c7)' }}
          />
          <span>{feedbackMessage}</span>
        </div>
      </div>

      {/* Guess History Rows (Wordle-style grid with tactile fake 3D tiles) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-1 flex flex-col gap-1.5 items-center justify-center">
        {/* Past guesses */}
        {guesses.map((g, rowIdx) => (
          <div key={rowIdx} className="flex gap-1.5">
            {g.guess.split('').map((char, colIdx) => {
              const status = g.statuses[colIdx];
              const isRight = status === 'right';
              return (
                <div
                  key={colIdx}
                  className={`tebak-slot-tile w-10 h-10 sm:w-11 sm:h-11 ${
                    isRight ? 'tile-right' : 'tile-wrong'
                  } ${settings.largeText ? 'text-xl' : 'text-lg'}`}
                >
                  {char}
                  {/* Accessibility markers ✓ or · (Section 4.3 & 11) */}
                  {settings.colorBlindMarkers && (
                    <span className="absolute top-0.5 right-0.5 text-[9px] font-black opacity-70">
                      {isRight ? '✓' : '·'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Current Active Input Row (Tapping a letter removes it from the draft) */}
        <div className={`flex gap-1.5 ${isShakeActive ? 'animate-shake' : ''}`}>
          {Array.from({ length: wordLength }).map((_, colIdx) => {
            const char = currentGuess[colIdx] || '';
            const isRevealedHint = revealedIndices.includes(colIdx) && !char;
            return (
              <button
                key={colIdx}
                type="button"
                onClick={() => handleRemoveDraftChar(colIdx)}
                title={char ? `Hapus huruf ${char}` : undefined}
                className={`tebak-slot-tile w-10 h-10 sm:w-11 sm:h-11 ${
                  char
                    ? 'slot-active cursor-pointer active:scale-90 hover:brightness-110'
                    : 'slot-empty'
                } ${isRevealedHint ? 'border-dashed' : ''} ${
                  settings.largeText ? 'text-xl' : 'text-lg'
                }`}
              >
                {char || (isRevealedHint ? targetWord[colIdx] : '')}
              </button>
            );
          })}
        </div>

        {/* Empty Placeholder Rows (Wordle reference grid) */}
        {Array.from({ length: Math.max(0, 4 - guesses.length) }).map((_, rIdx) => (
          <div key={`empty-${rIdx}`} className="flex gap-1.5 opacity-85">
            {Array.from({ length: wordLength }).map((__, cIdx) => (
              <div
                key={`empty-cell-${cIdx}`}
                className="tebak-slot-tile slot-empty w-10 h-10 sm:w-11 sm:h-11"
              />
            ))}
          </div>
        ))}
      </div>

      {/* On-screen QWERTY Keyboard with Tactile Fake 3D Tiles (Section 4.2 & 11) */}
      <div
        className="px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t"
        style={{
          backgroundColor: 'var(--panel-bg, #f8fafc)',
          borderColor: 'var(--panel-border, rgba(0,0,0,0.14))',
        }}
      >
        {/* Powerup Bar */}
        <div className="flex justify-between items-center px-1 mb-1.5">
          <button
            type="button"
            onClick={handleRevealLetter}
            disabled={!canReveal}
            className="tebak-key-tile tile-default py-1 px-2.5 text-[11px] sm:text-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>Buka huruf -2</span>
          </button>

          <span className="text-[11px] opacity-75 font-semibold">
            Panjang: {wordLength} huruf
          </span>
        </div>

        {/* Tactile Fake 3D Keyboard Keys - 3 Row Layout Matching Reference */}
        <div className="flex flex-col gap-1.5 items-center w-full max-w-sm mx-auto">
          {/* Row 1: 10 Keys */}
          <div className="flex gap-1 justify-center w-full">
            {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((k) => {
              const status = keyStatusMap.current[k];
              let statusClass = 'tile-default';
              if (status === 'right') statusClass = 'tile-right';
              else if (status === 'wrong') statusClass = 'tile-wrong';

              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleAddChar(k)}
                  className={`tebak-key-tile ${statusClass} flex-1 min-w-[24px] sm:min-w-[28px] h-10 sm:h-11 text-xs sm:text-sm`}
                >
                  {k}
                </button>
              );
            })}
          </div>

          {/* Row 2: 9 Keys (Centered) */}
          <div className="flex gap-1 justify-center w-full px-2">
            {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((k) => {
              const status = keyStatusMap.current[k];
              let statusClass = 'tile-default';
              if (status === 'right') statusClass = 'tile-right';
              else if (status === 'wrong') statusClass = 'tile-wrong';

              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleAddChar(k)}
                  className={`tebak-key-tile ${statusClass} flex-1 min-w-[24px] sm:min-w-[28px] h-10 sm:h-11 text-xs sm:text-sm`}
                >
                  {k}
                </button>
              );
            })}
          </div>

          {/* Row 3: 7 Letter Keys + Backspace + Enter */}
          <div className="flex gap-1 justify-center w-full">
            {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((k) => {
              const status = keyStatusMap.current[k];
              let statusClass = 'tile-default';
              if (status === 'right') statusClass = 'tile-right';
              else if (status === 'wrong') statusClass = 'tile-wrong';

              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleAddChar(k)}
                  className={`tebak-key-tile ${statusClass} flex-1 min-w-[24px] sm:min-w-[28px] h-10 sm:h-11 text-xs sm:text-sm`}
                >
                  {k}
                </button>
              );
            })}

            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleBackspace}
              className="tebak-key-tile tile-action-delete flex-[1.3] min-w-[32px] sm:min-w-[36px] h-10 sm:h-11 flex items-center justify-center"
              title="Hapus"
            >
              <Delete size={17} />
            </button>

            {/* Enter Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={currentGuess.length !== wordLength}
              className="tebak-key-tile tile-action-enter flex-[1.4] min-w-[36px] sm:min-w-[42px] h-10 sm:h-11 flex items-center justify-center disabled:opacity-40"
              title="Enter"
            >
              <CornerDownLeft size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
