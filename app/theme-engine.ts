export type AccentThemeId = 'darkgray_lightgray' | 'navy_blue' | 'brown_cream' | 'red_pink' | 'greendark_greenlight' | 'custom';

export interface ThemeOption {
  id: AccentThemeId;
  label: string;
  dotColorLight: string;
  dotColorDark: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'navy_blue', label: 'Navy / Blue', dotColorLight: '#0284c7', dotColorDark: '#38bdf8' },
  { id: 'darkgray_lightgray', label: 'Darkgray / Lightgray', dotColorLight: '#475569', dotColorDark: '#94a3b8' },
  { id: 'brown_cream', label: 'Brown / Cream', dotColorLight: '#b45309', dotColorDark: '#f59e0b' },
  { id: 'red_pink', label: 'Red / Pink', dotColorLight: '#e11d48', dotColorDark: '#fb7185' },
  { id: 'greendark_greenlight', label: 'Greendark / Greenlight', dotColorLight: '#059669', dotColorDark: '#34d399' },
  { id: 'custom', label: 'Custom Accent', dotColorLight: '#8b5cf6', dotColorDark: '#a78bfa' },
];

export interface ThemePalette {
  id: AccentThemeId;
  mode: 'light' | 'dark';
  name: string;
  primaryAccent: string;
  bgCanvas: string;
  bgGround: string;
  bgPlatform: string;
  ringOuter: string;
  ringInner: string;
  panelBg: string;
  panelBorder: string;
  textColor: string;
  textMuted: string;
  sliderTrack: string;
  sliderFill: string;
}

export function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

export function getThemePalette(
  themeId: AccentThemeId = 'navy_blue',
  mode: 'light' | 'dark' = 'light',
  customHex = '#38bdf8'
): ThemePalette {
  const isDark = mode === 'dark';

  if (themeId === 'custom') {
    const rgb = hexToRgb(customHex);
    const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    if (isDark) {
      const activeHex = hslToHex(h, Math.max(s, 60), Math.max(l, 55));
      return {
        id: 'custom',
        mode: 'dark',
        name: 'Custom',
        primaryAccent: activeHex,
        bgCanvas: hslToHex(h, 20, 10),
        bgGround: hslToHex(h, 20, 7),
        bgPlatform: hslToHex(h, 22, 14),
        ringOuter: hslToHex(h, 24, 25),
        ringInner: hslToHex(h, 22, 18),
        panelBg: `hsla(${h}, 22%, 11%, 0.88)`,
        panelBorder: `hsla(${h}, 60%, 65%, 0.18)`,
        textColor: '#f1f5f9',
        textMuted: '#94a3b8',
        sliderTrack: `hsla(${h}, 20%, 25%, 0.5)`,
        sliderFill: activeHex,
      };
    } else {
      const activeHex = hslToHex(h, Math.max(s, 65), Math.min(l, 40));
      return {
        id: 'custom',
        mode: 'light',
        name: 'Custom',
        primaryAccent: activeHex,
        bgCanvas: hslToHex(h, 22, 96),
        bgGround: hslToHex(h, 20, 86),
        bgPlatform: hslToHex(h, 18, 93),
        ringOuter: hslToHex(h, 22, 68),
        ringInner: hslToHex(h, 20, 78),
        panelBg: 'rgba(255, 255, 255, 0.92)',
        panelBorder: `hsla(${h}, 40%, 30%, 0.12)`,
        textColor: '#0f172a',
        textMuted: '#64748b',
        sliderTrack: `hsla(${h}, 20%, 88%, 0.8)`,
        sliderFill: activeHex,
      };
    }
  }

  const PRESETS: Record<Exclude<AccentThemeId, 'custom'>, { light: ThemePalette; dark: ThemePalette }> = {
    navy_blue: {
      dark: {
        id: 'navy_blue',
        mode: 'dark',
        name: 'Navy / Blue',
        primaryAccent: '#38bdf8',
        bgCanvas: '#0c121d',
        bgGround: '#090e17',
        bgPlatform: '#151f30',
        ringOuter: '#22334f',
        ringInner: '#1a273e',
        panelBg: 'rgba(16, 25, 42, 0.88)',
        panelBorder: 'rgba(56, 189, 248, 0.18)',
        textColor: '#f0f6fc',
        textMuted: '#94a3b8',
        sliderTrack: 'rgba(56, 189, 248, 0.18)',
        sliderFill: '#38bdf8',
      },
      light: {
        id: 'navy_blue',
        mode: 'light',
        name: 'Navy / Blue',
        primaryAccent: '#0284c7',
        bgCanvas: '#f0f4fa',
        bgGround: '#d3dbe8',
        bgPlatform: '#e6edf7',
        ringOuter: '#8ca3c7',
        ringInner: '#adc2df',
        panelBg: 'rgba(255, 255, 255, 0.92)',
        panelBorder: 'rgba(2, 132, 199, 0.15)',
        textColor: '#0f172a',
        textMuted: '#64748b',
        sliderTrack: 'rgba(2, 132, 199, 0.12)',
        sliderFill: '#0284c7',
      },
    },
    darkgray_lightgray: {
      dark: {
        id: 'darkgray_lightgray',
        mode: 'dark',
        name: 'Darkgray / Lightgray',
        primaryAccent: '#cbd5e1',
        bgCanvas: '#1b1e22',
        bgGround: '#14171a',
        bgPlatform: '#23272d',
        ringOuter: '#3d454e',
        ringInner: '#2c333b',
        panelBg: 'rgba(27, 31, 37, 0.88)',
        panelBorder: 'rgba(255, 255, 255, 0.1)',
        textColor: '#f1f5f9',
        textMuted: '#94a3b8',
        sliderTrack: 'rgba(255, 255, 255, 0.15)',
        sliderFill: '#cbd5e1',
      },
      light: {
        id: 'darkgray_lightgray',
        mode: 'light',
        name: 'Darkgray / Lightgray',
        primaryAccent: '#263b48',
        bgCanvas: '#f2f3f3',
        bgGround: '#d5d9dc',
        bgPlatform: '#eeeeec',
        ringOuter: '#8c969f',
        ringInner: '#a4aeb8',
        panelBg: 'rgba(255, 255, 255, 0.92)',
        panelBorder: 'rgba(24, 37, 54, 0.1)',
        textColor: '#20242b',
        textMuted: '#68727d',
        sliderTrack: 'rgba(24, 37, 54, 0.12)',
        sliderFill: '#263b48',
      },
    },
    brown_cream: {
      dark: {
        id: 'brown_cream',
        mode: 'dark',
        name: 'Brown / Cream',
        primaryAccent: '#f59e0b',
        bgCanvas: '#1a1613',
        bgGround: '#14100d',
        bgPlatform: '#29211c',
        ringOuter: '#42362e',
        ringInner: '#332923',
        panelBg: 'rgba(32, 26, 22, 0.88)',
        panelBorder: 'rgba(245, 158, 11, 0.18)',
        textColor: '#fef3c7',
        textMuted: '#d1c0b3',
        sliderTrack: 'rgba(245, 158, 11, 0.18)',
        sliderFill: '#f59e0b',
      },
      light: {
        id: 'brown_cream',
        mode: 'light',
        name: 'Brown / Cream',
        primaryAccent: '#b45309',
        bgCanvas: '#faf7f2',
        bgGround: '#e2dad0',
        bgPlatform: '#f4eee5',
        ringOuter: '#bfae9b',
        ringInner: '#d5c7b5',
        panelBg: 'rgba(255, 255, 255, 0.92)',
        panelBorder: 'rgba(180, 83, 9, 0.15)',
        textColor: '#291807',
        textMuted: '#786657',
        sliderTrack: 'rgba(180, 83, 9, 0.12)',
        sliderFill: '#b45309',
      },
    },
    red_pink: {
      dark: {
        id: 'red_pink',
        mode: 'dark',
        name: 'Red / Pink',
        primaryAccent: '#fb7185',
        bgCanvas: '#1a1013',
        bgGround: '#140a0c',
        bgPlatform: '#281619',
        ringOuter: '#442228',
        ringInner: '#351b20',
        panelBg: 'rgba(34, 18, 24, 0.88)',
        panelBorder: 'rgba(251, 113, 133, 0.18)',
        textColor: '#ffe4e6',
        textMuted: '#d6a8b1',
        sliderTrack: 'rgba(251, 113, 133, 0.18)',
        sliderFill: '#fb7185',
      },
      light: {
        id: 'red_pink',
        mode: 'light',
        name: 'Red / Pink',
        primaryAccent: '#e11d48',
        bgCanvas: '#fdf2f4',
        bgGround: '#e5d0d4',
        bgPlatform: '#f8e4e8',
        ringOuter: '#c5929d',
        ringInner: '#dbb0b9',
        panelBg: 'rgba(255, 255, 255, 0.92)',
        panelBorder: 'rgba(225, 29, 72, 0.15)',
        textColor: '#370b13',
        textMuted: '#8a5c66',
        sliderTrack: 'rgba(225, 29, 72, 0.12)',
        sliderFill: '#e11d48',
      },
    },
    greendark_greenlight: {
      dark: {
        id: 'greendark_greenlight',
        mode: 'dark',
        name: 'Greendark / Greenlight',
        primaryAccent: '#34d399',
        bgCanvas: '#0c1813',
        bgGround: '#0a120e',
        bgPlatform: '#16261e',
        ringOuter: '#233d30',
        ringInner: '#1b2f25',
        panelBg: 'rgba(16, 32, 25, 0.88)',
        panelBorder: 'rgba(52, 211, 153, 0.18)',
        textColor: '#ecfdf5',
        textMuted: '#9ac9b5',
        sliderTrack: 'rgba(52, 211, 153, 0.18)',
        sliderFill: '#34d399',
      },
      light: {
        id: 'greendark_greenlight',
        mode: 'light',
        name: 'Greendark / Greenlight',
        primaryAccent: '#059669',
        bgCanvas: '#f0f7f3',
        bgGround: '#d2ded7',
        bgPlatform: '#e4ede7',
        ringOuter: '#8eada0',
        ringInner: '#acc5b9',
        panelBg: 'rgba(255, 255, 255, 0.92)',
        panelBorder: 'rgba(5, 150, 105, 0.15)',
        textColor: '#062e1c',
        textMuted: '#587c6c',
        sliderTrack: 'rgba(5, 150, 105, 0.12)',
        sliderFill: '#059669',
      },
    },
  };

  return isDark ? PRESETS[themeId].dark : PRESETS[themeId].light;
}

export function applyThemeToDom(palette: ThemePalette) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--accent-primary', palette.primaryAccent);
  root.style.setProperty('--bg-canvas', palette.bgCanvas);
  root.style.setProperty('--panel-bg', palette.panelBg);
  root.style.setProperty('--panel-border', palette.panelBorder);
  root.style.setProperty('--panel-text', palette.textColor);
  root.style.setProperty('--panel-text-muted', palette.textMuted);
  root.style.setProperty('--slider-track', palette.sliderTrack);
  root.style.setProperty('--slider-fill', palette.sliderFill);
}
