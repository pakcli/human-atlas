import React, { useState } from 'react';

export type MascotPose = 'idle' | 'cheer' | 'shrug';

interface MascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  onDance?: () => void;
  showSpeech?: string;
}

export const SkeletonMascot: React.FC<MascotProps> = ({
  pose = 'idle',
  size = 120,
  className = '',
  onDance,
  showSpeech,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const [isDancing, setIsDancing] = useState(false);

  const handleMascotTap = () => {
    const next = tapCount + 1;
    if (next >= 5) {
      setTapCount(0);
      setIsDancing(true);
      if (onDance) onDance();
      setTimeout(() => setIsDancing(false), 2400);
    } else {
      setTapCount(next);
    }
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none cursor-pointer transition-transform active:scale-95 ${className}`}
      onClick={handleMascotTap}
      title="Hai! Aku Si Tulang, maskot belajarmu. Ketuk 5x buat lihat aku joget!"
    >
      {showSpeech && (
        <div className="absolute -top-10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold px-3 py-1 rounded-full shadow-md border border-amber-300 dark:border-amber-500/30 whitespace-nowrap animate-bounce">
          {showSpeech}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 rotate-45 border-r border-b border-amber-300 dark:border-amber-500/30" />
        </div>
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`overflow-visible transition-all duration-300 ${
          isDancing ? 'animate-bounce' : ''
        }`}
      >
        <defs>
          <filter id="bone-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Cheer Sparkles / Stars */}
        {(pose === 'cheer' || isDancing) && (
          <g className="animate-pulse">
            <path d="M 28 30 L 32 38 L 40 42 L 32 46 L 28 54 L 24 46 L 16 42 L 24 38 Z" fill="#FBBF24" />
            <path d="M 132 32 L 135 38 L 142 41 L 135 44 L 132 50 L 129 44 L 122 41 L 129 38 Z" fill="#F59E0B" />
            <circle cx="22" cy="72" r="3" fill="#34D399" />
            <circle cx="138" cy="74" r="3.5" fill="#60A5FA" />
          </g>
        )}

        {/* Mascot Body Group */}
        <g
          filter="url(#bone-shadow)"
          style={{
            transformOrigin: '80px 140px',
            transform: isDancing ? 'rotate(5deg)' : pose === 'shrug' ? 'rotate(-2deg)' : 'none',
            transition: 'transform 0.3s ease',
          }}
        >
          {/* Pelvis & Legs */}
          <path
            d="M 68 114 C 68 110, 92 110, 92 114 L 89 122 C 84 125, 76 125, 71 122 Z"
            fill="#FDF8ED"
            stroke="#475569"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Left Leg */}
          <path
            d="M 72 122 L 67 146 M 67 146 L 61 148"
            stroke="#475569"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Right Leg */}
          <path
            d="M 88 122 L 93 146 M 93 146 L 99 148"
            stroke="#475569"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Spine & Ribcage */}
          {/* Spine */}
          <line x1="80" y1="78" x2="80" y2="114" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
          {/* Ribs */}
          <path
            d="M 62 88 C 66 82, 94 82, 98 88 M 65 97 C 69 92, 91 92, 95 97 M 70 106 C 73 102, 87 102, 90 106"
            fill="none"
            stroke="#475569"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Arms according to POSE */}
          {pose === 'idle' && !isDancing && (
            <>
              {/* Left Arm: Relaxed down */}
              <path
                d="M 64 82 C 54 94, 52 108, 56 118"
                fill="none"
                stroke="#475569"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="56" cy="120" r="3.5" fill="#FDF8ED" stroke="#475569" strokeWidth="2.5" />

              {/* Right Arm: Friendly wave */}
              <path
                d="M 96 82 C 108 80, 116 72, 118 60"
                fill="none"
                stroke="#475569"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Hand Wave */}
              <circle cx="118" cy="57" r="4.5" fill="#FDF8ED" stroke="#475569" strokeWidth="2.5" />
            </>
          )}

          {pose === 'cheer' && (
            <>
              {/* Both Arms UP in Celebration */}
              <path
                d="M 64 82 C 48 70, 42 54, 46 38"
                fill="none"
                stroke="#475569"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <circle cx="46" cy="36" r="4.5" fill="#FDF8ED" stroke="#475569" strokeWidth="2.5" />

              <path
                d="M 96 82 C 112 70, 118 54, 114 38"
                fill="none"
                stroke="#475569"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <circle cx="114" cy="36" r="4.5" fill="#FDF8ED" stroke="#475569" strokeWidth="2.5" />
            </>
          )}

          {pose === 'shrug' && (
            <>
              {/* Arms Shrugging Outwards */}
              <path
                d="M 64 84 C 50 86, 44 94, 42 86"
                fill="none"
                stroke="#475569"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="41" cy="84" r="4.5" fill="#FDF8ED" stroke="#475569" strokeWidth="2.5" />

              <path
                d="M 96 84 C 110 86, 116 94, 118 86"
                fill="none"
                stroke="#475569"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="119" cy="84" r="4.5" fill="#FDF8ED" stroke="#475569" strokeWidth="2.5" />
            </>
          )}

          {isDancing && (
            <>
              {/* Funny dance arms */}
              <path
                d="M 64 82 C 45 68, 52 48, 38 42"
                fill="none"
                stroke="#475569"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M 96 82 C 114 96, 126 102, 134 88"
                fill="none"
                stroke="#475569"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Skull Head */}
          <g
            style={{
              transformOrigin: '80px 58px',
              transform: pose === 'shrug' ? 'rotate(10deg)' : isDancing ? 'rotate(-6deg)' : 'none',
              transition: 'transform 0.3s ease',
            }}
          >
            {/* Cranium Base */}
            <path
              d="M 52 50 C 52 30, 108 30, 108 50 C 108 62, 102 68, 96 70 L 96 78 C 96 82, 64 82, 64 78 L 64 70 C 58 68, 52 62, 52 50 Z"
              fill="#FFFDF7"
              stroke="#334155"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Cheekbone details */}
            <path d="M 54 58 Q 59 64 64 65" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            <path d="M 106 58 Q 101 64 96 65" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

            {/* Cute Big Eyes */}
            {pose === 'cheer' || isDancing ? (
              // Happy curved eyes
              <>
                <path d="M 64 49 Q 70 42 76 49" fill="none" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                <path d="M 84 49 Q 90 42 96 49" fill="none" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
              </>
            ) : pose === 'shrug' ? (
              // Curious blink / tilted eyes
              <>
                <ellipse cx="70" cy="49" rx="6" ry="7" fill="#1E293B" />
                <circle cx="72" cy="47" r="2.5" fill="#FFFFFF" />
                <ellipse cx="90" cy="49" rx="6" ry="5" fill="#1E293B" />
                <circle cx="92" cy="48" r="2" fill="#FFFFFF" />
              </>
            ) : (
              // Friendly open eyes
              <>
                <ellipse cx="70" cy="49" rx="6.5" ry="7.5" fill="#1E293B" />
                <circle cx="72" cy="47" r="2.5" fill="#FFFFFF" />
                <ellipse cx="90" cy="49" rx="6.5" ry="7.5" fill="#1E293B" />
                <circle cx="92" cy="47" r="2.5" fill="#FFFFFF" />
              </>
            )}

            {/* Inverted Heart Nose */}
            <path
              d="M 80 57 C 78.5 54, 76 56, 78 59 L 80 62 L 82 59 C 84 56, 81.5 54, 80 57 Z"
              fill="#475569"
            />

            {/* Teeth / Friendly Smile */}
            <path
              d="M 68 73 L 92 73"
              stroke="#334155"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 72 70 L 72 76 M 76 70 L 76 76 M 80 70 L 80 76 M 84 70 L 84 76 M 88 70 L 88 76"
              stroke="#334155"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
