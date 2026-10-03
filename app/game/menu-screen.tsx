import React from 'react';
import type { GameLevel, GameMode } from './types';
import { SkeletonMascot } from './mascot';
import { Play, Box, Info, Settings } from 'lucide-react';

interface MenuScreenProps {
  level: GameLevel;
  onSelectLevel: (lvl: GameLevel) => void;
  onStartMode: (mode: GameMode) => void;
  onOpenAtlas: () => void;
  onOpenAbout: () => void;
  onOpenSettings: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  level,
  onSelectLevel,
  onStartMode,
  onOpenAtlas,
  onOpenAbout,
  onOpenSettings,
}) => {
  return (
    <div
      className="flex flex-col h-full max-w-md mx-auto w-full select-none overflow-hidden px-4 py-2.5 justify-between"
      style={{
        backgroundColor: 'transparent',
        color: 'var(--panel-text, #0f172a)',
      }}
    >
      {/* Top Utility Bar: Tentang & Pengaturan */}
      <div className="flex items-center justify-between pt-0.5">
        <span
          className="text-[11px] font-bold tracking-wider uppercase opacity-75"
          style={{ color: 'var(--accent-primary, #0284c7)' }}
        >
          🎮 Game Edukasi
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenAbout}
            className="tebak-key-tile tile-default p-1.5 text-xs flex items-center gap-1"
            title="Tentang Game"
          >
            <Info size={14} />
            <span className="text-[11px] font-bold">Tentang</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="tebak-key-tile tile-default p-1.5 text-xs flex items-center gap-1"
            title="Pengaturan"
          >
            <Settings size={14} />
            <span className="text-[11px] font-bold">Opsi</span>
          </button>
        </div>
      </div>

      {/* Hero Section: Mascot & Title */}
      <div className="flex flex-col items-center text-center my-auto py-1">
        <SkeletonMascot pose="idle" size={82} />

        <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 mb-0.5">
          TEBAK TEBAK KATA
        </h1>
        <p
          className="text-[11px] font-semibold italic opacity-85"
          style={{ color: 'var(--accent-primary, #0284c7)' }}
        >
          &ldquo;Tebak istilah, naikin SDM-mu&rdquo;
        </p>
      </div>

      {/* Main Action Section: Level & Game Modes */}
      <div className="flex flex-col gap-2 my-auto">
        {/* Level Switcher (Section 10.3) */}
        <div
          className="p-1.5 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: 'var(--panel-bg-solid, #ffffff)',
            borderColor: 'var(--panel-border, rgba(0,0,0,0.14))',
          }}
        >
          <span className="text-xs font-bold pl-2 opacity-85">
            Jenjang:
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onSelectLevel('TK')}
              style={{
                backgroundColor: level === 'TK' ? 'var(--accent-primary, #0284c7)' : 'transparent',
                color: level === 'TK' ? '#ffffff' : 'var(--panel-text, #0f172a)',
              }}
              className="py-1 px-3 rounded-lg text-xs font-bold transition-all"
            >
              ● TK (3-6 huruf)
            </button>
            <button
              type="button"
              onClick={() => onSelectLevel('SD')}
              style={{
                backgroundColor: level === 'SD' ? 'var(--accent-primary, #0284c7)' : 'transparent',
                color: level === 'SD' ? '#ffffff' : 'var(--panel-text, #0f172a)',
              }}
              className="py-1 px-3 rounded-lg text-xs font-bold transition-all"
            >
              ● SD (4-7 huruf)
            </button>
          </div>
        </div>

        {/* Mode 1: Tebak Sambung (Connect letters) */}
        <button
          type="button"
          onClick={() => onStartMode('connect')}
          className="tebak-card-tile card-default text-left p-3 group"
        >
          {level === 'TK' && (
            <span className="absolute top-2 right-2.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold">
              ★ Rekomendasi TK
            </span>
          )}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black group-hover:scale-110 transition-transform shrink-0"
              style={{
                backgroundColor: 'var(--panel-bg, #f1f5f9)',
                color: 'var(--accent-primary, #0284c7)',
              }}
            >
              <Play size={18} fill="currentColor" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm">
                TEBAK SAMBUNG
              </div>
              <div className="text-[11px] opacity-70 mt-0.5 leading-tight">
                Sambung huruf dengan jari / ketuk santai
              </div>
            </div>
          </div>
        </button>

        {/* Mode 2: Tebak Ketik (Typing guess) */}
        <button
          type="button"
          onClick={() => onStartMode('typing')}
          className="tebak-card-tile card-default text-left p-3 group"
        >
          {level === 'SD' && (
            <span className="absolute top-2 right-2.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold">
              ★ Rekomendasi SD
            </span>
          )}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black group-hover:scale-110 transition-transform shrink-0"
              style={{
                backgroundColor: 'var(--panel-bg, #f1f5f9)',
                color: 'var(--accent-primary, #0284c7)',
              }}
            >
              <Play size={18} fill="currentColor" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm">
                TEBAK KETIK
              </div>
              <div className="text-[11px] opacity-70 mt-0.5 leading-tight">
                Ketik kata, baca petunjuk warna &amp; skor
              </div>
            </div>
          </div>
        </button>

        {/* Atlas 3D Direct Launcher Button */}
        <button
          type="button"
          onClick={onOpenAtlas}
          className="tebak-card-tile card-default w-full py-2.5 px-3 font-bold text-xs flex items-center justify-center gap-2"
        >
          <Box size={16} style={{ color: 'var(--accent-primary, #0284c7)' }} />
          <span>Lihat Atlas Anatomi 3D</span>
        </button>
      </div>

      {/* Footer Notice */}
      <div className="text-[10px] text-center opacity-60 pb-1">
        Segera hadir: jenjang SMP, SMA, mode ujian &amp; pack guru
      </div>
    </div>
  );
};
