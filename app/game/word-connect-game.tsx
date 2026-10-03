import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { WordItem, GameSettings } from './types';
import { soundManager } from './sound-manager';
import { Pause, Shuffle, Delete, ArrowRight, Box, RotateCcw } from 'lucide-react';

interface WordConnectGameProps {
  word: WordItem;
  roundNumber: number;
  settings: GameSettings;
  onSuccess: () => void;
  onOpenPause: () => void;
  onOpenAtlas: (targetName?: string) => void;
}

interface LetterNode {
  id: string;
  char: string;
  x: number;
  y: number;
}

export const WordConnectGame: React.FC<WordConnectGameProps> = ({
  word,
  roundNumber,
  settings,
  onSuccess,
  onOpenPause,
  onOpenAtlas,
}) => {
  const targetWord = word.word.toUpperCase();
  const wordLength = targetWord.length;

  const [shuffledChars, setShuffledChars] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize and shuffle letters
  useEffect(() => {
    const chars = targetWord.split('');
    let arr = [...chars];
    let attempts = 0;
    while (attempts < 10) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      if (arr.join('') !== targetWord) break;
      attempts++;
    }
    setShuffledChars(arr);
    setSelectedIndices([]);
    setPointerPos(null);
  }, [targetWord]);

  // Compute node coordinates based on polygon shape (Section 10.7)
  const platterNodes: LetterNode[] = useMemo(() => {
    const cx = 130;
    const cy = 130;
    const radius = 90;
    const nodes: LetterNode[] = [];

    if (wordLength === 7) {
      // Hexagon perimeter (6) + center (1)
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 - 90) * (Math.PI / 180);
        nodes.push({
          id: `node_${i}`,
          char: shuffledChars[i] || '',
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        });
      }
      // Center node
      nodes.push({
        id: `node_6`,
        char: shuffledChars[6] || '',
        x: cx,
        y: cy,
      });
    } else {
      // Regular polygon (triangle=3, square=4, pentagon=5, hexagon=6)
      for (let i = 0; i < wordLength; i++) {
        const angle = (i * (360 / wordLength) - 90) * (Math.PI / 180);
        nodes.push({
          id: `node_${i}`,
          char: shuffledChars[i] || '',
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        });
      }
    }
    return nodes;
  }, [wordLength, shuffledChars]);

  const isCheckingRef = useRef(false);

  // Validate the guess immediately when filled
  const checkGuessAndValidate = (indices: number[]) => {
    if (isCheckingRef.current || indices.length !== wordLength) return;
    isCheckingRef.current = true;

    const currentWord = indices.map((i) => shuffledChars[i]).join('');
    if (currentWord === targetWord) {
      soundManager.playWin(settings.sound);
      soundManager.vibrate(settings.vibration, [40, 60, 80]);
      onSuccess();
      isCheckingRef.current = false;
    } else {
      soundManager.playWrong(settings.sound);
      soundManager.vibrate(settings.vibration, [80, 50, 80]);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        isCheckingRef.current = false;
        // Default setting: clear if wrong, unless disabled by user in Settings
        if (settings.autoClearOnWrong !== false) {
          setSelectedIndices([]);
        }
      }, 600);
    }
  };

  // Handle tap letter
  const handleNodeClick = (index: number) => {
    if (isCheckingRef.current || isShaking) return;
    soundManager.playTap(settings.sound);
    soundManager.vibrate(settings.vibration, 20);

    const existsPos = selectedIndices.indexOf(index);
    if (existsPos === selectedIndices.length - 1) {
      setSelectedIndices(selectedIndices.slice(0, -1));
    } else if (existsPos === -1 && selectedIndices.length < wordLength) {
      const next = [...selectedIndices, index];
      setSelectedIndices(next);
      if (next.length === wordLength) {
        checkGuessAndValidate(next);
      }
    }
  };

  // Dragging support (Pointer Events for Touch & Mouse)
  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    if (isCheckingRef.current || isShaking) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    if (!selectedIndices.includes(index) && selectedIndices.length < wordLength) {
      soundManager.playTap(settings.sound);
      soundManager.vibrate(settings.vibration, 20);
      const next = [...selectedIndices, index];
      setSelectedIndices(next);
      if (next.length === wordLength) {
        setIsDragging(false);
        checkGuessAndValidate(next);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || isCheckingRef.current || isShaking) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setPointerPos({ x: px, y: py });

    platterNodes.forEach((node, idx) => {
      const dist = Math.hypot(px - node.x, py - node.y);
      if (dist < 32 && !selectedIndices.includes(idx) && selectedIndices.length < wordLength) {
        soundManager.playTap(settings.sound);
        soundManager.vibrate(settings.vibration, 15);
        const next = [...selectedIndices, idx];
        setSelectedIndices(next);
        if (next.length === wordLength) {
          setIsDragging(false);
          setPointerPos(null);
          checkGuessAndValidate(next);
        }
      }
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setPointerPos(null);
  };

  const handleShuffle = () => {
    if (isCheckingRef.current || isShaking) return;
    soundManager.playTap(settings.sound);
    soundManager.vibrate(settings.vibration, 15);
    const arr = [...shuffledChars];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledChars(arr);
    setSelectedIndices([]);
  };

  const handleClear = () => {
    if (isCheckingRef.current || isShaking) return;
    soundManager.playTap(settings.sound);
    setSelectedIndices([]);
  };

  const handleBackspace = () => {
    if (isCheckingRef.current || isShaking) return;
    soundManager.playTap(settings.sound);
    if (selectedIndices.length > 0) {
      setSelectedIndices(selectedIndices.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    checkGuessAndValidate(selectedIndices);
  };

  const formedWord = selectedIndices.map((i) => shuffledChars[i]).join('');

  return (
    <div
      className="flex flex-col h-full max-w-md mx-auto w-full select-none overflow-hidden justify-between"
      onPointerUp={handlePointerUp}
      style={{
        backgroundColor: 'var(--bg-canvas, #faf7f2)',
        color: 'var(--panel-text, #0f172a)',
      }}
    >
      {/* Top Bar (Section 10.7) */}
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

        <div className="flex flex-col items-center">
          <span
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: 'var(--accent-primary, #0284c7)' }}
          >
            Tebak Sambung
          </span>
          <span className="text-xs font-semibold opacity-75">
            Ronde {roundNumber}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenAtlas(word.atlasTarget)}
          className="py-1 px-3 rounded-xl text-white font-semibold text-xs border-b-4 active:translate-y-[2px] active:border-b-2 flex items-center gap-1 shadow-xs"
          style={{
            backgroundColor: 'var(--accent-primary, #0284c7)',
            borderColor: 'rgba(0, 0, 0, 0.35)',
          }}
        >
          <Box size={14} />
          <span>Atlas &gt;&gt;</span>
        </button>
      </div>

      {/* Sub-header Bar: Clue badge on left, Acak button on top right below navbar */}
      <div className="flex items-center justify-between px-4 pt-2 pb-0.5">
        <div
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: 'var(--panel-bg, #f1f5f9)',
            color: 'var(--accent-primary, #0284c7)',
          }}
        >
          💡 Petunjuk ({word.category})
        </div>

        {/* Acak Button: placed at top right below the navbar */}
        <button
          type="button"
          onClick={handleShuffle}
          className="tebak-key-tile tile-default py-1 px-3 text-xs flex items-center gap-1.5"
          title="Acak posisi huruf"
        >
          <Shuffle size={14} />
          <span>Acak</span>
        </button>
      </div>

      {/* Clue and Question Text */}
      <div className="px-4 py-1 text-center">
        <p className="text-sm font-semibold leading-snug opacity-95">
          {word.clue}
        </p>

        {word.atlasTarget && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <span
              className="text-[11px] px-2.5 py-0.5 rounded-md font-medium border"
              style={{
                backgroundColor: 'var(--panel-bg, #f1f5f9)',
                borderColor: 'var(--panel-border, rgba(0,0,0,0.12))',
              }}
            >
              Bagian: {word.atlasTarget}
            </span>
          </div>
        )}
      </div>

      {/* Answer Boxes with gentle shake on wrong */}
      <div className={`flex justify-center gap-1.5 px-4 my-2 ${isShaking ? 'animate-shake' : ''}`}>
        {Array.from({ length: wordLength }).map((_, i) => {
          const char = formedWord[i] || '';
          return (
            <div
              key={i}
              className={`tebak-slot-tile w-10 h-12 ${
                char ? 'slot-active' : 'slot-empty'
              } ${settings.largeText ? 'text-2xl' : 'text-xl'}`}
            >
              {char || '·'}
            </div>
          );
        })}
      </div>

      {/* Dragging / Platter Area */}
      <div className="flex-1 min-h-0 flex items-center justify-center relative my-1 overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-[260px] h-[260px] touch-none"
          onPointerMove={handlePointerMove}
        >
          {/* SVG connecting lines between selected nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {selectedIndices.length > 1 && (
              <polyline
                points={selectedIndices
                  .map((idx) => `${platterNodes[idx].x},${platterNodes[idx].y}`)
                  .join(' ')}
                fill="none"
                stroke="var(--accent-primary, #0284c7)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.85"
              />
            )}
            {isDragging && pointerPos && selectedIndices.length > 0 && (
              <line
                x1={platterNodes[selectedIndices[selectedIndices.length - 1]].x}
                y1={platterNodes[selectedIndices[selectedIndices.length - 1]].y}
                x2={pointerPos.x}
                y2={pointerPos.y}
                stroke="var(--accent-primary, #0284c7)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="4 4"
              />
            )}
          </svg>

          {/* Letter Nodes with Tactile Fake 3D Tiles */}
          {platterNodes.map((node, idx) => {
            const isSelected = selectedIndices.includes(idx);
            const orderIndex = selectedIndices.indexOf(idx);

            return (
              <div
                key={node.id}
                onPointerDown={(e) => handlePointerDown(idx, e)}
                onClick={() => handleNodeClick(idx)}
                style={{
                  left: `${node.x - 28}px`,
                  top: `${node.y - 28}px`,
                }}
                className={`tebak-node-tile w-14 h-14 ${
                  isSelected ? 'node-selected' : 'node-default'
                } ${settings.largeText ? 'text-2xl' : 'text-xl'}`}
              >
                {node.char}
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center font-bold">
                    {orderIndex + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Buttons (Clear, Hapus, Kirim) with Tactile Fake 3D Tiles */}
      <div className="flex gap-2.5 px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleClear}
          disabled={selectedIndices.length === 0}
          className="tebak-key-tile tile-default flex-1 py-2.5 sm:py-3 px-3 text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
          title="Bersihkan semua huruf"
        >
          <RotateCcw size={15} />
          <span>Clear</span>
        </button>

        <button
          type="button"
          onClick={handleBackspace}
          disabled={selectedIndices.length === 0}
          className="tebak-key-tile tile-action-delete flex-1 py-2.5 sm:py-3 px-3 text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
          title="Hapus satu huruf terakhir"
        >
          <Delete size={16} />
          <span>Hapus</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedIndices.length !== wordLength}
          className="tebak-key-tile tile-action-enter flex-[1.4] py-2.5 sm:py-3 px-4 text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          title="Kirim jawaban"
        >
          <span>Kirim</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
