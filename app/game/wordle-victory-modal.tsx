import React from 'react';
import type { WordItem, GuessEvaluation } from './types';
import { Home, RotateCcw, Box } from 'lucide-react';

interface WordleVictoryModalProps {
  isOpen: boolean;
  word: WordItem;
  guesses: GuessEvaluation[];
  currentStreak: number;
  bestStreak: number;
  onNext: () => void;
  onHome: () => void;
  onViewInAtlas: (targetName?: string) => void;
}

export const WordleVictoryModal: React.FC<WordleVictoryModalProps> = ({
  isOpen,
  word,
  guesses,
  currentStreak,
  bestStreak,
  onNext,
  onHome,
  onViewInAtlas,
}) => {
  if (!isOpen) return null;

  const wordLength = word.word.length;
  const maxRows = 6;

  // Catchy celebration headline based on attempts
  let headline = 'FANTASTIS!';
  if (guesses.length === 1) headline = 'LUMAYAN SAKTI!';
  else if (guesses.length === 2) headline = 'LUAR BIASA!';
  else if (guesses.length === 3) headline = 'SEMPURNA!';
  else if (guesses.length >= 6) headline = 'DRAMATIS!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn select-none">
      <div
        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center border-2"
        style={{
          backgroundColor: 'var(--panel-bg-solid, #ffffff)',
          borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
          color: 'var(--panel-text, #0f172a)',
        }}
      >
        {/* Celebration Banner / Headline */}
        <h2 className="text-2xl sm:text-3xl font-black tracking-wider uppercase mb-1 drop-shadow-sm">
          {headline}
        </h2>
        <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-4">
          Jawaban: <span style={{ color: 'var(--accent-primary, #0284c7)' }}>{word.word.toUpperCase()}</span>
        </div>

        {/* Wordle Attempt Grid Matrix (6 Rows matching the reference) */}
        <div className="p-3.5 rounded-2xl bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 mb-5 flex flex-col gap-1.5 items-center justify-center">
          {Array.from({ length: maxRows }).map((_, rowIdx) => {
            const evaluation = guesses[rowIdx];
            return (
              <div key={rowIdx} className="flex gap-1.5">
                {Array.from({ length: wordLength }).map((__, colIdx) => {
                  if (evaluation) {
                    const status = evaluation.statuses[colIdx];
                    const isRight = status === 'right';
                    return (
                      <div
                        key={colIdx}
                        className={`tebak-slot-tile w-8 h-8 sm:w-9 sm:h-9 ${
                          isRight ? 'tile-right' : 'tile-wrong'
                        }`}
                      />
                    );
                  }
                  return (
                    <div
                      key={colIdx}
                      className="tebak-slot-tile slot-empty w-8 h-8 sm:w-9 sm:h-9 opacity-80"
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Streak Statistics Section */}
        <div className="w-full py-2 mb-4 flex flex-col gap-1 border-y border-black/10 dark:border-white/10">
          <div className="text-sm sm:text-base font-extrabold tracking-wide uppercase">
            CURRENT STREAK: <span style={{ color: 'var(--accent-primary, #0284c7)' }}>{currentStreak}</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold tracking-wide uppercase opacity-85">
            BEST STREAK: <span style={{ color: 'var(--accent-primary, #0284c7)' }}>{bestStreak}</span>
          </div>
        </div>

        {/* Action Controls matching reference (Home on Left, Next/Replay on Right) */}
        <div className="flex items-center justify-center gap-4 w-full px-2">
          {/* Home Button */}
          <button
            type="button"
            data-slot="button"
            onClick={onHome}
            title="Kembali ke Menu"
            className="tebak-key-tile tile-default w-14 h-14 rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <Home size={26} />
          </button>

          {/* Next / Play Again Button */}
          <button
            type="button"
            data-slot="button"
            onClick={onNext}
            title="Lanjut Ronde Berikutnya"
            className="tebak-key-tile tile-action-enter flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-md active:scale-95 transition-transform"
          >
            <RotateCcw size={22} />
            <span>Lanjut Main</span>
          </button>
        </div>

        {/* Secondary: Explore in Atlas 3D */}
        {word.atlasTarget && (
          <button
            type="button"
            data-slot="button"
            onClick={() => onViewInAtlas(word.atlasTarget)}
            className="mt-3 text-xs font-semibold flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--accent-primary, #0284c7)' }}
          >
            <Box size={14} />
            <span>Pelajari di Human Atlas 3D &gt;&gt;</span>
          </button>
        )}
      </div>
    </div>
  );
};
