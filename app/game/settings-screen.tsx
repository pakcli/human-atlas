import React, { useState } from 'react';
import type { GameSettings } from './types';
import { THEME_OPTIONS, type AccentThemeId } from '../theme-engine';
import { ChevronLeft, Volume2, VolumeX, Smartphone, Sun, Moon, Type, Eye, Trash2, Check, RotateCcw } from 'lucide-react';

interface SettingsScreenProps {
  settings: GameSettings;
  accentTheme?: AccentThemeId;
  onSelectAccentTheme?: (id: AccentThemeId) => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClearGameData: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  accentTheme = 'navy_blue',
  onSelectAccentTheme,
  onUpdateSettings,
  onClearGameData,
  onBack,
}) => {
  const [dataCleared, setDataCleared] = useState(false);

  const handleClear = () => {
    onClearGameData();
    setDataCleared(true);
    setTimeout(() => setDataCleared(false), 2000);
  };

  return (
    <div
      className="flex flex-col h-full max-w-md mx-auto w-full select-none overflow-y-auto px-4 py-3"
      style={{
        backgroundColor: 'transparent',
        color: 'var(--panel-text, #0f172a)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          data-slot="button"
          onClick={onBack}
          className="tebak-key-tile tile-default flex items-center gap-1 py-1.5 px-3 text-xs"
        >
          <ChevronLeft size={16} />
          <span>Kembali</span>
        </button>
        <span className="font-bold text-base">
          Pengaturan
        </span>
      </div>

      <div className="flex flex-col gap-3.5 pb-8">
        {/* Toggle List */}
        <div
          className="p-4 rounded-2xl border shadow-sm divide-y divide-black/10 dark:divide-white/10"
          style={{
            backgroundColor: 'var(--panel-bg-solid, #ffffff)',
            borderColor: 'var(--panel-border, rgba(0,0,0,0.12))',
          }}
        >
          {/* Sound */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5">
              {settings.sound ? (
                <Volume2 size={18} style={{ color: 'var(--accent-primary, #0284c7)' }} />
              ) : (
                <VolumeX size={18} className="opacity-40" />
              )}
              <span className="text-xs font-semibold">
                Efek Suara
              </span>
            </div>
            <button
              type="button"
              data-slot="button"
              onClick={() => onUpdateSettings({ sound: !settings.sound })}
              className={`tebak-key-tile min-w-[56px] py-1.5 px-3 text-xs tracking-wider ${
                settings.sound ? 'tile-action-enter' : 'tile-default opacity-50'
              }`}
            >
              {settings.sound ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5">
              <Smartphone size={18} style={{ color: 'var(--accent-primary, #0284c7)' }} />
              <span className="text-xs font-semibold">
                Getar Sentuhan
              </span>
            </div>
            <button
              type="button"
              data-slot="button"
              onClick={() => onUpdateSettings({ vibration: !settings.vibration })}
              className={`tebak-key-tile min-w-[56px] py-1.5 px-3 text-xs tracking-wider ${
                settings.vibration ? 'tile-action-enter' : 'tile-default opacity-50'
              }`}
            >
              {settings.vibration ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Theme (Terang / Gelap) */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5">
              {settings.theme === 'dark' ? (
                <Moon size={18} style={{ color: 'var(--accent-primary, #0284c7)' }} />
              ) : (
                <Sun size={18} style={{ color: 'var(--accent-primary, #0284c7)' }} />
              )}
              <div>
                <div className="text-xs font-semibold">
                  Tema Warna
                </div>
                <div className="text-[10px] opacity-60">
                  Mengikuti tema visual atlas utama
                </div>
              </div>
            </div>
            <button
              type="button"
              data-slot="button"
              onClick={() =>
                onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
              }
              className="tebak-key-tile tile-action-enter flex items-center gap-1.5 py-1.5 px-3 text-xs"
            >
              {settings.theme === 'dark' ? '🌙 Gelap' : '☀️ Terang'}
            </button>
          </div>

          {/* Accent Palette Selector */}
          <div className="py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold">
                Aksen Warna ({THEME_OPTIONS.find((t) => t.id === accentTheme)?.label ?? 'Navy / Blue'})
              </div>
              <span
                className="w-3.5 h-3.5 rounded-full border shadow-sm"
                style={{
                  backgroundColor: 'var(--accent-primary, #0284c7)',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                }}
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {THEME_OPTIONS.map((opt) => {
                const isSelected = accentTheme === opt.id;
                const dotColor = settings.theme === 'dark' ? opt.dotColorDark : opt.dotColorLight;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-slot="button"
                    onClick={() => onSelectAccentTheme?.(opt.id)}
                    title={opt.label}
                    className={`tebak-key-tile h-9 flex items-center justify-center transition-all ${
                      isSelected ? 'tile-action-enter ring-2 ring-white/60' : 'tile-default'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                      style={{ backgroundColor: dotColor }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Large Text */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5">
              <Type size={18} style={{ color: 'var(--accent-primary, #0284c7)' }} />
              <div>
                <div className="text-xs font-semibold">
                  Huruf Besar
                </div>
                <div className="text-[10px] opacity-60">
                  Ukuran huruf ubin lebih besar untuk TK
                </div>
              </div>
            </div>
            <button
              type="button"
              data-slot="button"
              onClick={() => onUpdateSettings({ largeText: !settings.largeText })}
              className={`tebak-key-tile min-w-[56px] py-1.5 px-3 text-xs tracking-wider ${
                settings.largeText ? 'tile-action-enter' : 'tile-default opacity-50'
              }`}
            >
              {settings.largeText ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Color-blind markers */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5">
              <Eye size={18} style={{ color: 'var(--accent-primary, #0284c7)' }} />
              <div>
                <div className="text-xs font-semibold">
                  Penanda Aksesibilitas
                </div>
                <div className="text-[10px] opacity-60">
                  Tanda ✓ dan titik di ubin untuk buta warna
                </div>
              </div>
            </div>
            <button
              type="button"
              data-slot="button"
              onClick={() => onUpdateSettings({ colorBlindMarkers: !settings.colorBlindMarkers })}
              className={`tebak-key-tile min-w-[56px] py-1.5 px-3 text-xs tracking-wider ${
                settings.colorBlindMarkers ? 'tile-action-enter' : 'tile-default opacity-50'
              }`}
            >
              {settings.colorBlindMarkers ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Auto-clear on wrong guess */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5">
              <RotateCcw size={18} style={{ color: 'var(--accent-primary, #0284c7)' }} />
              <div>
                <div className="text-xs font-semibold">
                  Hapus Otomatis Saat Salah
                </div>
                <div className="text-[10px] opacity-60">
                  Bersihkan kotak jawaban jika salah
                </div>
              </div>
            </div>
            <button
              type="button"
              data-slot="button"
              onClick={() => onUpdateSettings({ autoClearOnWrong: settings.autoClearOnWrong === false ? true : false })}
              className={`tebak-key-tile min-w-[56px] py-1.5 px-3 text-xs tracking-wider ${
                settings.autoClearOnWrong !== false ? 'tile-action-enter' : 'tile-default opacity-50'
              }`}
            >
              {settings.autoClearOnWrong !== false ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Read aloud (soon) */}
          <div className="flex items-center justify-between py-2.5 opacity-60">
            <div>
              <div className="text-xs font-semibold">
                Bacakan Soal
              </div>
              <div className="text-[10px] opacity-60">
                Suara pembaca otomatis untuk anak TK
              </div>
            </div>
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent-primary, #0284c7) 15%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent-primary, #0284c7) 35%, transparent)',
                color: 'var(--accent-primary, #0284c7)',
              }}
            >
              Segera
            </span>
          </div>
        </div>

        {/* Data Management */}
        <div
          className="p-4 rounded-2xl border shadow-sm"
          style={{
            backgroundColor: 'var(--panel-bg-solid, #ffffff)',
            borderColor: 'var(--panel-border, rgba(0,0,0,0.12))',
          }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-wider mb-1"
            style={{ color: 'var(--accent-primary, #0284c7)' }}
          >
            Data Permainan
          </h3>
          <p className="text-[11px] opacity-75 mb-3 leading-relaxed">
            Riwayat ronde dan skor tersimpan di perangkat ini.
          </p>

          <button
            type="button"
            data-slot="button"
            onClick={handleClear}
            className="w-full py-2.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-b-4 border-red-300 dark:border-red-900 active:translate-y-[2px] active:border-b-2 font-bold text-xs flex items-center justify-center gap-2 transition-transform"
          >
            {dataCleared ? (
              <>
                <Check size={16} className="text-emerald-600" />
                <span>Data Berhasil Dihapus</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Hapus Data Main</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
