import React, { useState } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Measurements } from '../api/client';

interface FitProfileProps {
  measurements: Measurements;
  fitPreference: string;
  onUpdate: (m: Measurements, fp: string) => void;
}

const FIELDS: { key: keyof Omit<Measurements, 'unit'>; label: string; icon: string }[] = [
  { key: 'height',      label: 'Height',      icon: '📏' },
  { key: 'chest',       label: 'Chest',        icon: '👔' },
  { key: 'waist',       label: 'Waist',        icon: '📐' },
  { key: 'hips',        label: 'Hips',         icon: '🩱' },
  { key: 'shoulders',   label: 'Shoulders',    icon: '💪' },
  { key: 'foot_length', label: 'Foot Length',  icon: '👟' },
];

const FIT_PREFS = [
  { value: 'slim',      label: 'Slim',      desc: 'Close to body' },
  { value: 'regular',   label: 'Regular',   desc: 'Classic fit' },
  { value: 'relaxed',   label: 'Relaxed',   desc: 'Comfortable ease' },
  { value: 'oversized', label: 'Oversized', desc: 'Loose, boxy' },
];

const ACCENT_COLORS = ['text-accent-mint', 'text-accent-yellow', 'text-accent-pink', 'text-accent-purple', 'text-accent-mint', 'text-accent-yellow'];

export const FitProfile: React.FC<FitProfileProps> = ({ measurements, fitPreference, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [local, setLocal]     = useState({ ...measurements });
  const [fp, setFp]           = useState(fitPreference);
  const [unit, setUnit]       = useState<'cm' | 'in'>(measurements.unit as 'cm' | 'in');

  const switchUnit = (u: 'cm' | 'in') => {
    if (u === unit) return;
    const factor = u === 'in' ? 1 / 2.54 : 2.54;
    const converted: Measurements = { ...local, unit: u };
    FIELDS.forEach(f => {
      (converted as unknown as Record<string, number | string>)[f.key] =
        Math.round((local[f.key] as number) * factor * 10) / 10;
    });
    setLocal(converted);
    setUnit(u);
  };

  const save = () => { onUpdate({ ...local, unit }, fp); setEditing(false); };

  if (editing) {
    return (
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 flex-shrink-0">
          <button onClick={() => setEditing(false)} className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center hover:bg-bg-elevated transition-colors">
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div>
            <h2 className="text-white font-bold">Edit Measurements</h2>
            <p className="text-text-muted text-xs">Your measurements power the AI fit engine</p>
          </div>
        </div>

        {/* Unit toggle */}
        <div className="px-5 mb-4 flex-shrink-0">
          <div className="flex bg-bg-card rounded-2xl p-1 w-fit">
            {(['cm', 'in'] as const).map(u => (
              <button key={u} onClick={() => switchUnit(u)}
                className={cn('px-5 py-2 rounded-xl text-sm font-semibold transition-all',
                  unit === u ? 'bg-accent-mint text-bg-primary' : 'text-text-secondary hover:text-white')}>
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="px-5 mb-5 space-y-3 flex-shrink-0">
          {FIELDS.map(f => (
            <div key={f.key} className="bg-bg-card rounded-2xl p-4 border border-white/5 flex items-center gap-3">
              <span className="text-xl">{f.icon}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{f.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" value={local[f.key] as number}
                  onChange={e => setLocal(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) || 0 }))}
                  className="w-20 bg-bg-primary text-white text-sm font-semibold rounded-xl px-3 py-2 text-center outline-none border border-white/10 focus:border-accent-mint/50 transition-colors"
                  step={unit === 'cm' ? 0.5 : 0.1} />
                <span className="text-text-muted text-xs w-6">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Fit preference */}
        <div className="px-5 mb-5 flex-shrink-0">
          <h3 className="text-white font-semibold text-sm mb-3">Preferred Fit</h3>
          <div className="grid grid-cols-2 gap-2">
            {FIT_PREFS.map(p => (
              <button key={p.value} onClick={() => setFp(p.value)}
                className={cn('p-3 rounded-2xl border text-left transition-all',
                  fp === p.value ? 'border-accent-mint bg-accent-mint/15' : 'border-white/5 bg-bg-card hover:bg-bg-elevated')}>
                <p className={cn('text-sm font-semibold', fp === p.value ? 'text-accent-mint' : 'text-white')}>{p.label}</p>
                <p className="text-text-muted text-xs">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-28 flex-shrink-0">
          <button onClick={save} className="w-full flex items-center justify-center gap-2 bg-accent-mint text-bg-primary font-bold py-3.5 rounded-2xl hover:bg-accent-mint/90 transition-colors text-sm">
            <Save size={16} /> Save & Recalculate Fits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-accent-mint/40">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Rahul Sharma</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-accent-mint rounded-full w-[85%]" />
              </div>
              <span className="text-accent-mint text-xs font-semibold">85%</span>
            </div>
            <p className="text-text-muted text-xs">Profile complete</p>
          </div>
        </div>
      </div>

      {/* Measurements grid */}
      <div className="px-5 mb-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Your Fit Profile</h3>
          <button onClick={() => setEditing(true)} className="text-accent-mint text-xs font-medium hover:underline">Edit</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FIELDS.map((f, i) => (
            <div key={f.key} className="bg-bg-card rounded-2xl p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{f.icon}</span>
                <span className="text-text-muted text-xs">{f.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn('text-xl font-bold', ACCENT_COLORS[i])}>{measurements[f.key as keyof Measurements]}</span>
                <span className="text-text-muted text-xs">{measurements.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fit preference */}
      <div className="px-5 mb-5 flex-shrink-0">
        <h3 className="text-white font-semibold text-sm mb-3">Preferred Fit Style</h3>
        <div className="grid grid-cols-2 gap-2">
          {FIT_PREFS.map(p => (
            <button key={p.value} onClick={() => { setFp(p.value); onUpdate(measurements, p.value); }}
              className={cn('p-3 rounded-2xl border text-left transition-all',
                fitPreference === p.value ? 'border-accent-mint bg-accent-mint/15' : 'border-white/5 bg-bg-card hover:bg-bg-elevated')}>
              <p className={cn('text-sm font-semibold', fitPreference === p.value ? 'text-accent-mint' : 'text-white')}>{p.label}</p>
              <p className="text-text-muted text-xs">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* LangGraph info card */}
      <div className="px-5 mb-5 flex-shrink-0">
        <div className="bg-accent-purple/15 border border-accent-purple/25 rounded-2xl p-4">
          <p className="text-accent-purple text-xs font-semibold mb-1">⚡ LangGraph Multi-Agent System</p>
          <p className="text-text-secondary text-xs leading-relaxed">
            Your measurements are sent to 8 AI agents running in a LangGraph StateGraph.
            6 retailer agents run in parallel, then a Fit Agent (Gemini) scores each product,
            and a Ranking Agent surfaces the best matches.
          </p>
        </div>
      </div>

      <div className="px-5 pb-28 flex-shrink-0">
        <button onClick={() => setEditing(true)} className="w-full flex items-center justify-center gap-2 bg-accent-mint text-bg-primary font-bold py-3.5 rounded-2xl hover:bg-accent-mint/90 transition-colors text-sm">
          📏 Update My Measurements
        </button>
      </div>
    </div>
  );
};
