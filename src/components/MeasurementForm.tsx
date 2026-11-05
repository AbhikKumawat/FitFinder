import React, { useState } from 'react';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import type { UserProfile } from '../types';

interface MeasurementFormProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
}

type MeasurementKey = 'height' | 'chest' | 'waist' | 'hips' | 'shoulders' | 'footLength';

const FIELDS: { key: MeasurementKey; label: string; icon: string; hint: string }[] = [
  { key: 'height', label: 'Height', icon: '📏', hint: 'Stand straight, measure from floor to top of head' },
  { key: 'chest', label: 'Chest', icon: '👔', hint: 'Measure around the fullest part of your chest' },
  { key: 'waist', label: 'Waist', icon: '📐', hint: 'Measure around your natural waistline' },
  { key: 'hips', label: 'Hips', icon: '🩱', hint: 'Measure around the fullest part of your hips' },
  { key: 'shoulders', label: 'Shoulders', icon: '💪', hint: 'Measure from shoulder tip to shoulder tip' },
  { key: 'footLength', label: 'Foot Length', icon: '👟', hint: 'Measure your foot from heel to longest toe' },
];

const FIT_PREFERENCES = [
  { value: 'slim' as const, label: 'Slim', desc: 'Close to body' },
  { value: 'regular' as const, label: 'Regular', desc: 'Classic fit' },
  { value: 'relaxed' as const, label: 'Relaxed', desc: 'Comfortable ease' },
  { value: 'oversized' as const, label: 'Oversized', desc: 'Loose, boxy' },
];

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  profile,
  onSave,
  onCancel,
}) => {
  const [measurements, setMeasurements] = useState({ ...profile.measurements });
  const [fitPref, setFitPref] = useState(profile.fitPreference);
  const [unit, setUnit] = useState<'cm' | 'in'>(profile.measurements.unit);

  const convertValue = (value: number, from: 'cm' | 'in', to: 'cm' | 'in') => {
    if (from === to) return value;
    if (from === 'cm' && to === 'in') return Math.round(value / 2.54 * 10) / 10;
    return Math.round(value * 2.54 * 10) / 10;
  };

  const handleUnitSwitch = (newUnit: 'cm' | 'in') => {
    if (newUnit === unit) return;
    const converted = { ...measurements, unit: newUnit };
    const numericKeys: MeasurementKey[] = ['height', 'chest', 'waist', 'hips', 'shoulders', 'footLength'];
    numericKeys.forEach((key) => {
      (converted as Record<string, number | string>)[key] = convertValue(
        measurements[key] as number,
        unit,
        newUnit
      );
    });
    setMeasurements(converted as typeof measurements);
    setUnit(newUnit);
  };

  const handleChange = (key: MeasurementKey, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setMeasurements((prev) => ({ ...prev, [key]: num }));
    }
  };

  const handleSave = () => {
    onSave({
      ...profile,
      measurements: { ...measurements, unit },
      fitPreference: fitPref,
      profileCompletion: 95,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 flex-shrink-0">
        <button
          className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center hover:bg-bg-elevated transition-colors"
          onClick={onCancel}
        >
          <ArrowLeft size={16} className="text-white" />
        </button>
        <div>
          <h2 className="text-white font-bold">Edit Measurements</h2>
          <p className="text-text-muted text-xs">Update your body measurements</p>
        </div>
      </div>

      {/* Unit toggle */}
      <div className="px-5 mb-5 flex-shrink-0">
        <div className="flex items-center bg-bg-card rounded-2xl p-1 w-fit">
          {(['cm', 'in'] as const).map((u) => (
            <button
              key={u}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                unit === u ? 'bg-accent-mint text-bg-primary' : 'text-text-secondary hover:text-white'
              )}
              onClick={() => handleUnitSwitch(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Measurement fields */}
      <div className="px-5 mb-5 flex-shrink-0">
        <h3 className="text-white font-semibold text-sm mb-3">Body Measurements</h3>
        <div className="space-y-3">
          {FIELDS.map((field) => (
            <div key={field.key} className="bg-bg-card rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xl">{field.icon}</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{field.label}</p>
                  <p className="text-text-muted text-[10px] mt-0.5">{field.hint}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={measurements[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-20 bg-bg-primary text-white text-sm font-semibold rounded-xl px-3 py-2 text-center outline-none border border-white/10 focus:border-accent-mint/50 transition-colors"
                    step={unit === 'cm' ? 0.5 : 0.1}
                    min={0}
                  />
                  <span className="text-text-muted text-xs w-6">{unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fit preference */}
      <div className="px-5 mb-5 flex-shrink-0">
        <h3 className="text-white font-semibold text-sm mb-3">Preferred Fit Style</h3>
        <div className="grid grid-cols-2 gap-2">
          {FIT_PREFERENCES.map((fp) => (
            <button
              key={fp.value}
              className={cn(
                'p-3 rounded-2xl border text-left transition-all duration-200',
                fitPref === fp.value
                  ? 'border-accent-mint bg-accent-mint/15'
                  : 'border-white/5 bg-bg-card hover:bg-bg-elevated'
              )}
              onClick={() => setFitPref(fp.value)}
            >
              <p className={cn('text-sm font-semibold', fitPref === fp.value ? 'text-accent-mint' : 'text-white')}>
                {fp.label}
              </p>
              <p className="text-text-muted text-xs mt-0.5">{fp.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Save & reset */}
      <div className="px-5 pb-28 flex-shrink-0 space-y-2">
        <button
          className="w-full flex items-center justify-center gap-2 bg-accent-mint text-bg-primary font-bold py-3.5 rounded-2xl hover:bg-accent-mint/90 transition-colors text-sm"
          onClick={handleSave}
        >
          <Save size={16} />
          Save Measurements
        </button>
        <button
          className="w-full flex items-center justify-center gap-2 bg-bg-card text-text-secondary font-medium py-3 rounded-2xl hover:bg-bg-elevated hover:text-white transition-colors text-sm"
          onClick={onCancel}
        >
          <RefreshCw size={14} />
          Cancel
        </button>
      </div>
    </div>
  );
};
