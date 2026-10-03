import React from 'react';
import type { WordItem } from './types';
import { SkeletonMascot } from './mascot';
import { ArrowRight, Box } from 'lucide-react';

interface ExplanationCardProps {
  word: WordItem;
  isWin: boolean;
  score?: number;
  wrongCount?: number;
  onNext: () => void;
  onViewInAtlas: (targetName?: string) => void;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  word,
  isWin,
  score,
  wrongCount = 0,
  onNext,
  onViewInAtlas,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center border-2"
        style={{
          backgroundColor: 'var(--panel-bg-solid, #ffffff)',
          borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
          color: 'var(--panel-text, #0f172a)',
        }}
      >
        {/* Mascot Reaction */}
        <div className="-mt-14 mb-2">
          <SkeletonMascot
            pose={isWin ? 'cheer' : 'shrug'}
            size={110}
            showSpeech={isWin ? 'HEBAT SEKALI!' : 'Tetap semangat!'}
          />
        </div>

        {/* Heading */}
        <span
          className="text-xs font-bold tracking-wider uppercase mb-1"
          style={{ color: 'var(--accent-primary, #0284c7)' }}
        >
          {isWin ? 'Mantap, Benar!' : 'Jawaban yang Benar:'}
        </span>

        {/* Word Spelled Out */}
        <div className="flex gap-1.5 justify-center flex-wrap my-2">
          {word.word.split('').map((char, index) => (
            <span
              key={index}
              className="inline-flex items-center justify-center w-9 h-11 text-lg font-black rounded-lg bg-[#8FCB7E] text-[#13380e] border-b-4 border-[#5E9E4E] shadow-sm select-none"
            >
              {char}
            </span>
          ))}
        </div>

        {/* Explanation Card Content */}
        <div
          className="w-full my-4 p-3.5 rounded-2xl border text-left"
          style={{
            backgroundColor: 'var(--panel-bg, #f8fafc)',
            borderColor: 'var(--panel-border, rgba(0,0,0,0.12))',
          }}
        >
          <div
            className="text-[11px] font-semibold mb-1 flex items-center gap-1.5"
            style={{ color: 'var(--accent-primary, #0284c7)' }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--accent-primary, #0284c7)' }}
            />
            <span>Kategori: {word.category}</span>
          </div>
          <p className="text-sm font-medium leading-relaxed opacity-90">
            {word.explanation}
          </p>
        </div>

        {/* Score Summary */}
        {score !== undefined && (
          <div
            className="w-full py-2 px-3 mb-4 rounded-xl text-xs font-semibold flex justify-between items-center border"
            style={{
              backgroundColor: 'var(--panel-bg, #f1f5f9)',
              borderColor: 'var(--panel-border, rgba(0,0,0,0.12))',
            }}
          >
            <span>Perolehan Ronde:</span>
            <span
              className="font-bold text-sm"
              style={{ color: 'var(--accent-primary, #0284c7)' }}
            >
              +{score} Poin {wrongCount > 0 ? `(${wrongCount} salah tebak)` : '(Sempurna!)'}
            </span>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onNext}
            className="w-full py-3 px-4 rounded-2xl font-bold text-white shadow-md flex items-center justify-center gap-2 text-base border-b-4 active:translate-y-[2px] active:border-b-2 transition-all"
            style={{
              backgroundColor: 'var(--accent-primary, #0284c7)',
              borderColor: 'rgba(0, 0, 0, 0.35)',
            }}
          >
            <span>Soal Berikutnya</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={() => onViewInAtlas(word.atlasTarget)}
            className="w-full py-2.5 px-4 rounded-2xl font-semibold border-b-4 active:translate-y-[2px] active:border-b-2 flex items-center justify-center gap-2 text-sm shadow-sm transition-all"
            style={{
              backgroundColor: 'var(--panel-bg, #ffffff)',
              borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
              color: 'var(--panel-text, #0f172a)',
            }}
          >
            <Box size={16} style={{ color: 'var(--accent-primary, #0284c7)' }} />
            <span>Lihat di Atlas 3D &gt;&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
