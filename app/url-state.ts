import {
  SYSTEMS,
  DEFAULT_VISIBLE,
  DEFAULT_OPACITIES,
  type SystemId,
  type AnatomySex,
  type SceneState,
  type AccentThemeId,
  type View,
} from './anatomy';

export const ALL_SYSTEM_IDS: SystemId[] = SYSTEMS.map(s => s.id);

const STORAGE_KEY = 'human_atlas_saved_session';

/**
 * Encodes the visible systems using Majority Delta Encoding:
 * - If majority of systems are ON: encodes excluded with '-' prefix (e.g. -digestive-urinary)
 * - If majority of systems are OFF: encodes included with '+' prefix (e.g. +skeletal+muscular)
 */
export function encodeScope(visible: SystemId[], all: SystemId[] = ALL_SYSTEM_IDS): string {
  if (visible.length === all.length) return '';
  if (visible.length === 0) return 'none';

  const visibleSet = new Set(visible);
  const hidden = all.filter(s => !visibleSet.has(s));

  if (visible.length >= all.length / 2) {
    return '-' + hidden.join('-');
  } else {
    return '+' + visible.join('+');
  }
}

/**
 * Decodes the scope string back into an array of active SystemId.
 */
export function decodeScope(scopeStr: string, all: SystemId[] = ALL_SYSTEM_IDS): SystemId[] {
  if (!scopeStr || scopeStr === 'all') {
    return [...DEFAULT_VISIBLE];
  }
  if (scopeStr === 'none') {
    return [];
  }

  if (scopeStr.startsWith('-')) {
    const tokens = scopeStr.slice(1).split(/[-+,]/).filter(Boolean);
    const excluded = new Set(tokens);
    return all.filter(s => !excluded.has(s));
  }

  if (scopeStr.startsWith('+')) {
    const tokens = scopeStr.slice(1).split(/[-+,]/).filter(Boolean);
    const included = new Set(tokens);
    return all.filter(s => included.has(s));
  }

  // Fallback for standard comma-delimited strings
  const direct = scopeStr.split(',').filter(Boolean);
  const matched = direct.filter(s => all.includes(s as SystemId)) as SystemId[];
  return matched.length > 0 ? matched : [...DEFAULT_VISIBLE];
}

/**
 * Encodes non-default system opacities (e.g. integumentary:0.5)
 */
export function encodeOpacities(opacities?: Partial<Record<SystemId, number>>): string {
  if (!opacities) return '';
  const entries: string[] = [];
  for (const [id, val] of Object.entries(opacities)) {
    if (typeof val === 'number') {
      const defaultVal = DEFAULT_OPACITIES[id as SystemId] ?? 1.0;
      if (Math.abs(val - defaultVal) > 0.01) {
        entries.push(`${id}:${val.toFixed(2)}`);
      }
    }
  }
  return entries.join(',');
}

/**
 * Decodes opacity string back into a Record<SystemId, number>
 */
export function decodeOpacities(str?: string): Partial<Record<SystemId, number>> {
  if (!str) return {};
  const res: Partial<Record<SystemId, number>> = {};
  const pairs = str.split(',');
  for (const pair of pairs) {
    const [id, valStr] = pair.split(':');
    if (id && valStr) {
      const num = parseFloat(valStr);
      if (!isNaN(num) && num >= 0 && num <= 1) {
        res[id as SystemId] = num;
      }
    }
  }
  return res;
}

export interface SerializedSession {
  sex: AnatomySex;
  theme: 'light' | 'dark';
  state: SceneState;
  camera?: {
    pos: [number, number, number];
    target: [number, number, number];
  };
}

/**
 * Serializes the complete application snapshot into a clean shareable URL query string.
 */
export function serializeStateToUrl(session: SerializedSession): string {
  const { sex, theme, state, camera } = session;
  const p = new URLSearchParams();

  // 1. Reference anatomy dataset
  p.set('sex', sex);

  // 2. Systems scope via Majority Delta Encoding
  const scopeStr = encodeScope(state.visible, ALL_SYSTEM_IDS);
  if (scopeStr) {
    p.set('scope', scopeStr);
  }

  // 3. Explode progression
  if (state.explode > 0.005) {
    p.set('exp', state.explode.toFixed(2));
  }

  // 4. Exact Camera world coordinates & target
  if (camera) {
    p.set('cam', camera.pos.map(n => n.toFixed(2)).join(','));
    p.set('tgt', camera.target.map(n => n.toFixed(2)).join(','));
  }

  // 5. Focused organ structure
  const focused = state.selected[0];
  if (focused) {
    p.set('a', focused);
  }

  // 6. Structure isolate mode
  if (state.isolate) {
    p.set('iso', '1');
  }

  // 7. View cardinal preset
  if (state.view && state.view !== 'three-quarter') {
    p.set('view', state.view);
  }

  // 8. Inspection dots toggle
  if (state.showDots === false) {
    p.set('dots', '0');
  }

  // 9. Opacity customizations
  const opStr = encodeOpacities(state.opacities);
  if (opStr) {
    p.set('op', opStr);
  }

  // 10. Accent theme & Dark/Light mode
  if (state.accentTheme && state.accentTheme !== 'navy_blue') {
    p.set('theme', state.accentTheme);
  }
  if (state.accentTheme === 'custom' && state.customAccentColor) {
    p.set('custom', state.customAccentColor.replace('#', ''));
  }
  if (theme === 'dark') {
    p.set('mode', 'dark');
  }

  const query = p.toString();
  return `${window.location.origin}${window.location.pathname}${query ? '?' + query : ''}`;
}

/**
 * Parses URL query parameters into a session configuration.
 */
export function parseStateFromUrl(search: string): Partial<SerializedSession> | null {
  if (!search || search.length < 2) return null;
  const p = new URLSearchParams(search);

  const res: Partial<SerializedSession> = {};
  const state: Partial<SceneState> = {};

  // Sex
  const sexParam = p.get('sex');
  if (sexParam === 'male' || sexParam === 'female') {
    res.sex = sexParam;
  }

  // Scope (majority delta) or fallback 'vis'
  const scopeParam = p.get('scope') ?? p.get('vis');
  if (scopeParam) {
    state.visible = decodeScope(scopeParam, ALL_SYSTEM_IDS);
  }

  // Explode
  const expParam = p.get('exp');
  if (expParam !== null) {
    const val = parseFloat(expParam);
    if (!isNaN(val)) {
      state.explode = Math.max(0, Math.min(1, val));
    }
  }

  // Camera Position and Target
  const camParam = p.get('cam');
  const tgtParam = p.get('tgt');
  if (camParam) {
    const coords = camParam.split(',').map(Number);
    if (coords.length === 3 && coords.every(n => !isNaN(n))) {
      state.cameraPos = [coords[0], coords[1], coords[2]];
    }
  }
  if (tgtParam) {
    const coords = tgtParam.split(',').map(Number);
    if (coords.length === 3 && coords.every(n => !isNaN(n))) {
      state.cameraTarget = [coords[0], coords[1], coords[2]];
    }
  }
  if (state.cameraPos && state.cameraTarget) {
    res.camera = {
      pos: state.cameraPos,
      target: state.cameraTarget,
    };
  }

  // Focused / Selected Part ID ('a' or 'focus')
  const focusedParam = p.get('a') ?? p.get('focus');
  if (focusedParam) {
    state.selected = [focusedParam];
  }

  // Isolate mode
  const isoParam = p.get('iso');
  if (isoParam === '1' || isoParam === 'true') {
    state.isolate = true;
  }

  // View preset
  const viewParam = p.get('view');
  if (viewParam === 'three-quarter' || viewParam === 'front' || viewParam === 'side' || viewParam === 'back') {
    state.view = viewParam as View;
  }

  // Show dots
  const dotsParam = p.get('dots');
  if (dotsParam === '0' || dotsParam === 'false') {
    state.showDots = false;
  } else if (dotsParam === '1' || dotsParam === 'true') {
    state.showDots = true;
  }

  // Opacities
  const opParam = p.get('op');
  if (opParam) {
    state.opacities = decodeOpacities(opParam);
  }

  // Theme & Mode
  const themeParam = p.get('theme');
  if (themeParam) {
    state.accentTheme = themeParam as AccentThemeId;
  }
  const customParam = p.get('custom');
  if (customParam) {
    state.customAccentColor = '#' + customParam;
  }

  const modeParam = p.get('mode');
  if (modeParam === 'dark' || modeParam === 'light') {
    res.theme = modeParam;
  }

  res.state = state as SceneState;
  return res;
}

/**
 * Saves current session to localStorage
 */
export function saveSessionToLocalStorage(session: SerializedSession): void {
  try {
    const data = {
      sex: session.sex,
      theme: session.theme,
      state: {
        visible: session.state.visible,
        selected: session.state.selected,
        isolate: session.state.isolate,
        explode: session.state.explode,
        view: session.state.view,
        showDots: session.state.showDots,
        accentTheme: session.state.accentTheme,
        customAccentColor: session.state.customAccentColor,
        opacities: session.state.opacities,
      },
      camera: session.camera,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be unavailable in private browsing or iframe
  }
}

/**
 * Restores previous session from localStorage
 */
export function loadSessionFromLocalStorage(): Partial<SerializedSession> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const res: Partial<SerializedSession> = {};
    if (parsed.sex === 'male' || parsed.sex === 'female') {
      res.sex = parsed.sex;
    }
    if (parsed.theme === 'dark' || parsed.theme === 'light') {
      res.theme = parsed.theme;
    }
    if (parsed.state && typeof parsed.state === 'object') {
      res.state = {
        ...parsed.state,
      };
    }
    if (parsed.camera && Array.isArray(parsed.camera.pos) && Array.isArray(parsed.camera.target)) {
      res.camera = parsed.camera;
      if (res.state) {
        res.state.cameraPos = parsed.camera.pos;
        res.state.cameraTarget = parsed.camera.target;
      }
    }
    return res;
  } catch {
    return null;
  }
}
