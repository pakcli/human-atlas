import React, { useState, useEffect } from 'react';
import { Camera, Copy, RotateCcw, Save, Check, Eye, EyeOff, Layers, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export interface TunerValues {
  x: number;      // offset in meters (-0.05 to +0.05)
  y: number;      // offset in meters (-0.10 to +0.10)
  z: number;      // offset in meters (-0.10 to +0.10)
  rotX: number;   // degrees (-90 to +90)
  rotY: number;   // degrees (-45 to +45)
  rotZ: number;   // degrees (-45 to +45)
  scaleAll: number; // uniform multiplier (0.5 to 1.5)
  scaleX: number;   // X-axis multiplier (0.5 to 1.5)
  scaleY: number;   // Y-axis multiplier (0.5 to 1.5)
  scaleZ: number;   // Z-axis multiplier (0.5 to 1.5)
}

const DEFAULT_VALUES: TunerValues = {
  x: 0,
  y: 0,
  z: 0,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  scaleAll: 1.0,
  scaleX: 1.0,
  scaleY: 1.0,
  scaleZ: 1.0,
};

const STORAGE_KEY = 'female_mesh_tuner';

export function ModelTuner({
  sex,
  onIsolateBones,
  onToggleSkin,
  onAutoSelectVagina,
}: {
  sex: 'male' | 'female';
  onIsolateBones?: () => void;
  onToggleSkin?: () => void;
  onAutoSelectVagina?: () => void;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const [values, setValues] = useState<TunerValues>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return { ...DEFAULT_VALUES, ...JSON.parse(stored) };
      } catch {}
    }
    return DEFAULT_VALUES;
  });

  // Secret keyword listener: "wkwkwk"
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check URL query parameters (?tune=wkwkwk or ?secret=wkwkwk or ?wkwkwk)
    const params = new URLSearchParams(window.location.search);
    if (
      params.get('tune') === 'wkwkwk' ||
      params.get('secret') === 'wkwkwk' ||
      params.has('wkwkwk')
    ) {
      setUnlocked(true);
      setOpen(true);
      setTimeout(() => onAutoSelectVagina?.(), 400);
    }

    // Keyboard listener for "wkwkwk" sequence
    let keyBuffer = '';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key && e.key.length === 1) {
        keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-6);
        if (keyBuffer === 'wkwkwk') {
          setUnlocked(true);
          setOpen(true);
          onAutoSelectVagina?.();
          keyBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onAutoSelectVagina]);

  // Dispatch transform event to Three.js scene
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('atlas-mesh-tune', { detail: values }));
    }
  }, [values]);

  if (sex !== 'female' || !unlocked) return null;

  const update = (key: keyof TunerValues, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const nudge = (key: keyof TunerValues, delta: number) => {
    setValues((prev) => ({ ...prev, [key]: Number((prev[key] + delta).toFixed(4)) }));
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleReset = () => {
    setValues(DEFAULT_VALUES);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleCopy = () => {
    const jsonStr = JSON.stringify(values, null, 2);
    const cliCmd = `node scripts/import-sketchfab-vagina.mjs --x ${values.x.toFixed(4)} --y ${values.y.toFixed(4)} --z ${values.z.toFixed(4)} --rotX ${values.rotX} --rotY ${values.rotY} --rotZ ${values.rotZ} --scaleAll ${values.scaleAll.toFixed(3)} --scaleX ${values.scaleX.toFixed(3)} --scaleY ${values.scaleY.toFixed(3)} --scaleZ ${values.scaleZ.toFixed(3)}`;
    const fullText = `// Tuner Values:\n${jsonStr}\n\n// Bake Command:\n${cliCmd}`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const snapCamera = (view: 'side' | 'bottom' | 'front') => {
    window.dispatchEvent(new CustomEvent('atlas-camera-snap', { detail: { view } }));
  };

  if (!open) {
    return (
      <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 90 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            color: '#e2e8f0',
            fontSize: '11px',
            gap: '6px',
          }}
        >
          <Sliders size={13} />
          Tune Reproductive Mesh
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 90,
        width: 330,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
        color: '#f8fafc',
        fontFamily: 'inherit',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: '12px' }}>
          <Sliders size={14} style={{ color: '#38bdf8' }} />
          <span>3D Mesh Tuner</span>
          <span style={{ fontSize: '9px', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '4px', padding: '1px 5px', fontWeight: 600 }}>
            ⚡ wkwkwk
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setMinimized(!minimized)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 3 }}
          >
            {minimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 3 }}
          >
            ✕
          </button>
        </div>
      </div>

      {!minimized && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '11px', maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Quick Camera & Reference Buttons */}
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: 5 }}>
              Camera Angles
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
              <Button variant="ghost" size="sm" onClick={() => snapCamera('side')} style={{ fontSize: '10px', height: 26, background: 'rgba(255,255,255,0.06)' }}>
                📷 Side (45°)
              </Button>
              <Button variant="ghost" size="sm" onClick={() => snapCamera('bottom')} style={{ fontSize: '10px', height: 26, background: 'rgba(255,255,255,0.06)' }}>
                📷 Bottom
              </Button>
              <Button variant="ghost" size="sm" onClick={() => snapCamera('front')} style={{ fontSize: '10px', height: 26, background: 'rgba(255,255,255,0.06)' }}>
                📷 Front
              </Button>
            </div>
          </div>

          {/* Quick Reference Overlays */}
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: 5 }}>
              Visual References
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {onIsolateBones && (
                <Button variant="ghost" size="sm" onClick={onIsolateBones} style={{ fontSize: '10px', height: 26, background: 'rgba(255,255,255,0.06)' }}>
                  🦴 Pelvic Bones
                </Button>
              )}
              {onToggleSkin && (
                <Button variant="ghost" size="sm" onClick={onToggleSkin} style={{ fontSize: '10px', height: 26, background: 'rgba(255,255,255,0.06)' }}>
                  👁️ Ghost Skin
                </Button>
              )}
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.08)' }} />

          {/* Translation X, Y, Z */}
          <ControlRow
            label="Position X (Lateral)"
            value={`${(values.x * 1000).toFixed(0)} mm`}
            val={values.x}
            min={-0.05}
            max={0.05}
            step={0.001}
            onChange={(v) => update('x', v)}
            onDec={() => nudge('x', -0.001)}
            onInc={() => nudge('x', 0.001)}
          />

          <ControlRow
            label="Position Y (Height)"
            value={`${(values.y * 1000).toFixed(0)} mm`}
            val={values.y}
            min={-0.08}
            max={0.08}
            step={0.001}
            onChange={(v) => update('y', v)}
            onDec={() => nudge('y', -0.001)}
            onInc={() => nudge('y', 0.001)}
          />

          <ControlRow
            label="Position Z (Front/Back)"
            value={`${(values.z * 1000).toFixed(0)} mm`}
            val={values.z}
            min={-0.08}
            max={0.08}
            step={0.001}
            onChange={(v) => update('z', v)}
            onDec={() => nudge('z', -0.001)}
            onInc={() => nudge('z', 0.001)}
          />

          <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.08)' }} />

          {/* Rotation X, Y, Z */}
          <ControlRow
            label="Rotation X (Pelvic Tilt)"
            value={`${values.rotX}°`}
            val={values.rotX}
            min={-60}
            max={60}
            step={1}
            onChange={(v) => update('rotX', v)}
            onDec={() => nudge('rotX', -1)}
            onInc={() => nudge('rotX', 1)}
          />

          <ControlRow
            label="Rotation Y (Twist / Yaw)"
            value={`${values.rotY}°`}
            val={values.rotY}
            min={-30}
            max={30}
            step={1}
            onChange={(v) => update('rotY', v)}
            onDec={() => nudge('rotY', -1)}
            onInc={() => nudge('rotY', 1)}
          />

          <ControlRow
            label="Rotation Z (Roll / Level)"
            value={`${values.rotZ}°`}
            val={values.rotZ}
            min={-30}
            max={30}
            step={1}
            onChange={(v) => update('rotZ', v)}
            onDec={() => nudge('rotZ', -1)}
            onInc={() => nudge('rotZ', 1)}
          />

          <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.08)' }} />

          {/* Scale (4 Sliders) */}
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginTop: 2 }}>
            Scale Controls (4 Sliders)
          </div>

          <ControlRow
            label="Scale (All Axes)"
            value={`${Math.round(values.scaleAll * 100)}%`}
            val={values.scaleAll}
            min={0.5}
            max={1.5}
            step={0.01}
            onChange={(v) => update('scaleAll', v)}
            onDec={() => nudge('scaleAll', -0.01)}
            onInc={() => nudge('scaleAll', 0.01)}
          />

          <ControlRow
            label="Scale X (Width)"
            value={`${Math.round(values.scaleX * 100)}%`}
            val={values.scaleX}
            min={0.5}
            max={1.5}
            step={0.01}
            onChange={(v) => update('scaleX', v)}
            onDec={() => nudge('scaleX', -0.01)}
            onInc={() => nudge('scaleX', 0.01)}
          />

          <ControlRow
            label="Scale Y (Height)"
            value={`${Math.round(values.scaleY * 100)}%`}
            val={values.scaleY}
            min={0.5}
            max={1.5}
            step={0.01}
            onChange={(v) => update('scaleY', v)}
            onDec={() => nudge('scaleY', -0.01)}
            onInc={() => nudge('scaleY', 0.01)}
          />

          <ControlRow
            label="Scale Z (Depth)"
            value={`${Math.round(values.scaleZ * 100)}%`}
            val={values.scaleZ}
            min={0.5}
            max={1.5}
            step={0.01}
            onChange={(v) => update('scaleZ', v)}
            onDec={() => nudge('scaleZ', -0.01)}
            onInc={() => nudge('scaleZ', 0.01)}
          />

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                style={{
                  fontSize: '11px',
                  background: saved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: saved ? '#22c55e' : 'rgba(255, 255, 255, 0.15)',
                  color: saved ? '#4ade80' : '#e2e8f0',
                  gap: 5,
                }}
              >
                {saved ? <Check size={12} /> : <Save size={12} />}
                {saved ? 'Saved!' : 'Save Browser'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                style={{
                  fontSize: '11px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#94a3b8',
                  gap: 5,
                }}
              >
                <RotateCcw size={12} />
                Reset
              </Button>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={handleCopy}
              style={{
                fontSize: '11px',
                background: copied ? '#10b981' : '#0284c7',
                color: '#ffffff',
                fontWeight: 600,
                gap: 6,
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Coordinates Copied!' : 'Copy Coordinates'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ControlRow({
  label,
  value,
  val,
  min,
  max,
  step,
  onChange,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  val: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
        <span style={{ color: '#cbd5e1' }}>{label}</span>
        <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={onDec}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            color: '#cbd5e1',
            width: 22,
            height: 22,
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          -
        </button>
        <div style={{ flex: 1 }}>
          <Slider
            min={min}
            max={max}
            step={step}
            value={[val]}
            onValueChange={(val: any) => {
              const n = Array.isArray(val) ? val[0] : (typeof val === 'number' ? val : val?.[0]);
              if (typeof n === 'number') onChange(n);
            }}
          />
        </div>
        <button
          onClick={onInc}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            color: '#cbd5e1',
            width: 22,
            height: 22,
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
