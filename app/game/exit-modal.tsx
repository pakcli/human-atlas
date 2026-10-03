import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ExitModalProps {
  isOpen: boolean;
  onStay: () => void;
  onConfirmExit: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({
  isOpen,
  onStay,
  onConfirmExit,
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
        <div
          className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--panel-bg, #f1f5f9)',
            color: 'var(--accent-primary, #0284c7)',
          }}
        >
          <AlertCircle size={26} />
        </div>
        <h3 className="text-lg font-bold tracking-wide mb-1">
          Keluar dari Ronde?
        </h3>
        <p className="text-xs opacity-75 mb-6">
          Progres ronde yang sedang berjalan akan hilang jika kamu keluar sekarang.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onStay}
            className="flex-1 py-2.5 px-3 rounded-xl font-bold text-white border-b-4 active:translate-y-[2px] active:border-b-2 shadow-sm text-sm"
            style={{
              backgroundColor: 'var(--accent-primary, #0284c7)',
              borderColor: 'rgba(0, 0, 0, 0.35)',
            }}
          >
            Tetap Main
          </button>
          <button
            type="button"
            onClick={onConfirmExit}
            className="flex-1 py-2.5 px-3 rounded-xl font-semibold border-b-4 active:translate-y-[2px] active:border-b-2 text-sm"
            style={{
              backgroundColor: 'var(--panel-bg, #e2e8f0)',
              borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
              color: 'var(--panel-text, #0f172a)',
            }}
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
};
