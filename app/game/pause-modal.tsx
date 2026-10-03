import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onExit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-xs rounded-2xl p-6 shadow-2xl text-center border-2"
        style={{
          backgroundColor: 'var(--panel-bg-solid, #ffffff)',
          borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
          color: 'var(--panel-text, #0f172a)',
        }}
      >
        <h3 className="text-xl font-bold tracking-wide mb-1">
          RONDE DIJEDA
        </h3>
        <p className="text-xs opacity-75 mb-6">
          Istirahat sejenak, yuk lanjut main lagi!
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 border-b-4 active:translate-y-[2px] active:border-b-2 transition-all"
            style={{
              backgroundColor: 'var(--accent-primary, #0284c7)',
              borderColor: 'rgba(0, 0, 0, 0.35)',
            }}
          >
            <Play size={18} fill="currentColor" />
            <span>Lanjut Main</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl font-semibold border-b-4 active:translate-y-[2px] active:border-b-2 flex items-center justify-center gap-2 transition-all text-sm"
            style={{
              backgroundColor: 'var(--panel-bg, #f1f5f9)',
              borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
              color: 'var(--panel-text, #0f172a)',
            }}
          >
            <RotateCcw size={16} />
            <span>Ulangi Ronde</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            className="w-full py-2 px-4 rounded-xl font-medium opacity-70 hover:opacity-100 hover:text-red-500 flex items-center justify-center gap-2 transition-colors text-xs mt-1"
          >
            <Home size={14} />
            <span>Keluar ke Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
