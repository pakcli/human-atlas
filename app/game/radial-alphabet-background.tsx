import React, { useMemo } from 'react';
import { generateRadialGlyphs } from './radial-alphabet-generator';

interface RadialAlphabetBackgroundProps {
  seed?: number;
  className?: string;
  theme?: 'light' | 'dark';
}

const EXTENT = 1000;

export const RadialAlphabetBackground: React.FC<RadialAlphabetBackgroundProps> = ({
  seed,
  className = '',
  theme = 'light',
}) => {
  const glyphs = useMemo(() => generateRadialGlyphs({ seed, extent: EXTENT }), [seed]);
  const half = EXTENT / 2;

  return (
    <svg
      aria-hidden="true"
      className={`radial-alphabet-watermark pointer-events-none absolute inset-0 w-full h-full select-none ${className}`}
      viewBox={`${-half} ${-half} ${EXTENT} ${EXTENT}`}
      preserveAspectRatio="xMidYMid slice"
      style={{
        zIndex: -1,
        fill: 'var(--accent-primary, #0284c7)',
        opacity: theme === 'dark' ? 0.09 : 0.07,
        transition: 'fill 0.3s ease, opacity 0.3s ease',
      }}
    >
      {glyphs.map((g, i) => (
        <text
          key={i}
          x={g.x}
          y={g.y}
          fontSize={g.size}
          fontWeight={800}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(${g.rotation.toFixed(1)} ${g.x.toFixed(1)} ${g.y.toFixed(1)})`}
          style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
        >
          {g.char}
        </text>
      ))}
    </svg>
  );
};
