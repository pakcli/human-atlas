import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, ShieldCheck, Check } from 'lucide-react';

interface AboutScreenProps {
  onBack: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSent(false);
      setFeedbackText('');
    }, 1800);
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
          onClick={onBack}
          className="tebak-key-tile tile-default flex items-center gap-1 py-1.5 px-3 text-xs"
        >
          <ChevronLeft size={16} />
          <span>Kembali</span>
        </button>
        <span className="font-bold text-base">
          Tentang Game
        </span>
      </div>

      <div className="flex flex-col gap-3.5 pb-8">
        {/* App Title Card */}
        <div
          className="p-4 rounded-2xl border shadow-sm text-center"
          style={{
            backgroundColor: 'var(--panel-bg-solid, #ffffff)',
            borderColor: 'var(--panel-border, rgba(0,0,0,0.12))',
          }}
        >
          <h2 className="text-xl font-black tracking-wide mb-0.5">
            Tebak Tebak Kata
          </h2>
          <div
            className="text-xs font-semibold"
            style={{ color: 'var(--accent-primary, #0284c7)' }}
          >
            Versi 0.1 · Gratis (MVP)
          </div>
          <p className="text-xs opacity-75 mt-2 leading-relaxed">
            Game tebak istilah biologi manusia dengan kurikulum ramah anak, terhubung langsung dengan <strong>Human Atlas 3D</strong>.
          </p>
        </div>

        {/* Cara Main (Section 10.4) */}
        <div
          className="p-4 rounded-2xl border shadow-sm"
          style={{
            backgroundColor: 'var(--panel-bg-solid, #ffffff)',
            borderColor: 'var(--panel-border, rgba(0,0,0,0.12))',
          }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: 'var(--accent-primary, #0284c7)' }}
          >
            Cara Main
          </h3>
          <ol className="text-xs space-y-2 pl-4 list-decimal font-medium leading-relaxed opacity-85">
            <li><strong>Lihat petunjuk</strong> atau gambar organ tubuh.</li>
            <li><strong>Tebak katanya</strong> dengan mengetik atau menyambungkan huruf.</li>
            <li><strong>Baca kartu penjelasan</strong> untuk belajar fungsi organ tersebut.</li>
          </ol>
        </div>

        {/* Arti Warna (Section 10.4) */}
        <div
          className="p-4 rounded-2xl border shadow-sm"
          style={{
            backgroundColor: 'var(--panel-bg-solid, #ffffff)',
            borderColor: 'var(--panel-border, rgba(0,0,0,0.12))',
          }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-wider mb-2.5"
            style={{ color: 'var(--accent-primary, #0284c7)' }}
          >
            Arti Warna Ubin
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#8FCB7E] text-[#13380e] border-b-4 border-[#5E9E4E] flex items-center justify-center font-bold text-xs">
                ✓
              </span>
              <span className="text-xs font-medium opacity-90">
                <strong>Hijau:</strong> Huruf benar dan posisinya tepat
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#CFE3EC] text-[#1e3a47] border-b-4 border-[#9DBFCF] flex items-center justify-center font-bold text-xs">
                ·
              </span>
              <span className="text-xs font-medium opacity-90">
                <strong>Es (Biru Muda):</strong> Huruf belum tepat pada kata tersebut
              </span>
            </div>
          </div>
        </div>

        {/* Materi & Atlas info */}
        <div
          className="p-3.5 rounded-2xl border text-xs leading-relaxed"
          style={{
            backgroundColor: 'var(--panel-bg, #f1f5f9)',
            borderColor: 'var(--panel-border, rgba(0,0,0,0.12))',
          }}
        >
          <p>
            Materi: <strong>Biologi Manusia (TK &amp; SD)</strong>
            <br />
            Dibuat bersama <strong>Human Atlas 3D</strong> untuk membantu mengingat struktur tubuh secara visual.
          </p>
        </div>

        {/* Coming soon note */}
        <div
          className="p-3 rounded-xl border border-dashed text-[11px] font-medium text-center"
          style={{
            borderColor: 'var(--panel-border, rgba(0,0,0,0.25))',
            color: 'var(--accent-primary, #0284c7)',
          }}
        >
          Segera hadir: Tingkat SMP, SMA, mode ujian, dan pack materi buatan guru!
        </div>

        {/* Bottom Actions: Kirim Masukan & Privasi */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setShowFeedbackModal(true)}
            style={{
              backgroundColor: 'var(--panel-bg-solid, #ffffff)',
              borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
              borderBottomColor: 'rgba(0, 0, 0, 0.28)',
            }}
            className="flex-1 py-2.5 px-3 rounded-xl border-b-4 active:translate-y-[2px] active:border-b-2 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <MessageSquare size={14} />
            <span>Kirim Masukan</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            style={{
              backgroundColor: 'var(--panel-bg-solid, #ffffff)',
              borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
              borderBottomColor: 'rgba(0, 0, 0, 0.28)',
            }}
            className="flex-1 py-2.5 px-3 rounded-xl border-b-4 active:translate-y-[2px] active:border-b-2 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <ShieldCheck size={14} />
            <span>Privasi</span>
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-xs border-2 rounded-2xl p-5 shadow-2xl"
            style={{
              backgroundColor: 'var(--panel-bg-solid, #ffffff)',
              borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
            }}
          >
            <h4 className="font-bold text-sm mb-1">
              Kirim Masukan
            </h4>
            <p className="text-[11px] opacity-75 mb-3">
              Ada yang seru atau bingung? Tulis saranmu di sini:
            </p>

            {feedbackSent ? (
              <div className="py-6 text-center text-xs font-bold text-emerald-600 flex flex-col items-center gap-2">
                <Check size={28} className="p-1 rounded-full bg-emerald-100" />
                <span>Terima kasih atas masukanmu!</span>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="flex flex-col gap-2.5">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Ketik masukanmu di sini..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--panel-bg, #f8fafc)',
                    borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
                    color: 'var(--panel-text, #0f172a)',
                  }}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="flex-1 py-2 rounded-xl border font-semibold text-xs"
                    style={{
                      backgroundColor: 'var(--panel-bg, #e2e8f0)',
                      borderColor: 'var(--panel-border, rgba(0,0,0,0.12))',
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-white font-bold text-xs border-b-4 active:translate-y-[2px] active:border-b-2"
                    style={{
                      backgroundColor: 'var(--accent-primary, #0284c7)',
                      borderColor: 'rgba(0,0,0,0.35)',
                    }}
                  >
                    Kirim
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-xs border-2 rounded-2xl p-5 shadow-2xl"
            style={{
              backgroundColor: 'var(--panel-bg-solid, #ffffff)',
              borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
            }}
          >
            <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Privasi Pemain</span>
            </h4>
            <div className="text-xs space-y-2 leading-relaxed max-h-56 overflow-y-auto pr-1 opacity-85">
              <p>
                Game ini dirancang ramah untuk anak-anak dan pelajar:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Tidak mengumpulkan data pribadi atau lokasi.</li>
                <li>Riwayat permainan hanya disimpan secara lokal di perangkat ini.</li>
                <li>Bebas iklan pihak ketiga.</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="w-full mt-4 py-2 rounded-xl text-white font-bold text-xs border-b-4 active:translate-y-[2px] active:border-b-2"
              style={{
                backgroundColor: 'var(--accent-primary, #0284c7)',
                borderColor: 'rgba(0,0,0,0.35)',
              }}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
