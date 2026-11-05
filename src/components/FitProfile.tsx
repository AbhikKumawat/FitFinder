import React, { useState } from 'react';
import { Edit2, CheckCircle, Ruler, Zap, Award, ChevronRight, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import type { UserProfile } from '../types';
import { MeasurementForm } from './MeasurementForm';

interface FitProfileProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

const FIT_PREFERENCES = [
  { value: 'slim' as const, label: 'Slim', desc: 'Close to body' },
  { value: 'regular' as const, label: 'Regular', desc: 'Classic fit' },
  { value: 'relaxed' as const, label: 'Relaxed', desc: 'Comfortable ease' },
  { value: 'oversized' as const, label: 'Oversized', desc: 'Loose, boxy' },
];

export const FitProfile: React.FC<FitProfileProps> = ({ profile, onProfileUpdate }) => {
  const [editingMeasurements, setEditingMeasurements] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  const measurementFields = [
    { key: 'height', label: 'Height', icon: '📏', color: 'text-accent-mint' },
    { key: 'chest', label: 'Chest', icon: '👔', color: 'text-accent-yellow' },
    { key: 'waist', label: 'Waist', icon: '📐', color: 'text-accent-pink' },
    { key: 'hips', label: 'Hips', icon: '🩱', color: 'text-accent-purple' },
    { key: 'shoulders', label: 'Shoulders', icon: '💪', color: 'text-accent-mint' },
    { key: 'footLength', label: 'Foot Length', icon: '👟', color: 'text-accent-yellow' },
  ] as const;

  if (editingMeasurements) {
    return (
      <MeasurementForm
        profile={localProfile}
        onSave={(updated) => {
          setLocalProfile(updated);
          onProfileUpdate(updated);
          setEditingMeasurements(false);
        }}
        onCancel={() => setEditingMeasurements(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      {/* Profile header */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-accent-mint/40">
              <img
                src={localProfile.avatar}
                alt={localProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent-mint flex items-center justify-center">
              <CheckCircle size={10} className="text-bg-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">{localProfile.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-mint rounded-full"
                  style={{ width: `${localProfile.profileCompletion}%` }}
                />
              </div>
              <span className="text-accent-mint text-xs font-semibold">{localProfile.profileCompletion}%</span>
            </div>
            <p className="text-text-muted text-xs mt-0.5">Profile complete</p>
          </div>
        </div>
      </div>

      {/* Your Fit Profile */}
      <div className="px-5 mb-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Ruler size={14} className="text-accent-mint" />
            Your Fit Profile
          </h3>
          <button
            className="flex items-center gap-1.5 text-xs text-accent-mint font-medium hover:underline"
            onClick={() => setEditingMeasurements(true)}
          >
            <Edit2 size={11} /> Edit
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {measurementFields.map((field) => (
            <div key={field.key} className="bg-bg-card rounded-2xl p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{field.icon}</span>
                <span className="text-text-muted text-xs">{field.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn('text-xl font-bold', field.color)}>
                  {localProfile.measurements[field.key]}
                </span>
                <span className="text-text-muted text-xs">{localProfile.measurements.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferred fit */}
      <div className="px-5 mb-5 flex-shrink-0">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Zap size={14} className="text-accent-yellow" />
          Preferred Fit Style
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {FIT_PREFERENCES.map((fp) => (
            <button
              key={fp.value}
              className={cn(
                'p-3 rounded-2xl border text-left transition-all duration-200',
                localProfile.fitPreference === fp.value
                  ? 'border-accent-mint bg-accent-mint/15'
                  : 'border-white/5 bg-bg-card hover:bg-bg-elevated'
              )}
              onClick={() => {
                const updated = { ...localProfile, fitPreference: fp.value };
                setLocalProfile(updated);
                onProfileUpdate(updated);
              }}
            >
              <p className={cn('text-sm font-semibold', localProfile.fitPreference === fp.value ? 'text-accent-mint' : 'text-white')}>
                {fp.label}
              </p>
              <p className="text-text-muted text-xs mt-0.5">{fp.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Favorite brands */}
      <div className="px-5 mb-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Star size={14} className="text-accent-yellow" />
            Favourite Brands
          </h3>
          <button className="text-text-muted text-xs hover:text-accent-mint flex items-center gap-1">
            Manage <ChevronRight size={11} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {localProfile.favoriteBrands.map((brand) => (
            <span key={brand} className="px-3 py-1.5 bg-bg-card rounded-xl text-xs font-medium text-white border border-white/10">
              {brand}
            </span>
          ))}
          <button className="px-3 py-1.5 bg-bg-card rounded-xl text-xs font-medium text-text-muted border border-dashed border-white/10 hover:border-accent-mint/40 hover:text-accent-mint transition-colors">
            + Add brand
          </button>
        </div>
      </div>

      {/* Fit Intelligence card */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="bg-accent-purple/15 border border-accent-purple/25 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award size={15} className="text-accent-purple" />
            <span className="text-accent-purple text-xs font-semibold">Your Fit Intelligence</span>
          </div>
          <p className="text-text-secondary text-xs leading-relaxed">
            Your recommendations become more personalized as you provide fit feedback after purchases. Keep rating your fits!
          </p>
          <div className="mt-3 flex gap-2">
            {[1,2,3,4,5].map((n) => (
              <button key={n} className="flex-1 h-6 rounded-lg bg-accent-purple/20 hover:bg-accent-purple/40 transition-colors" />
            ))}
          </div>
          <p className="text-text-muted text-[10px] mt-1.5 text-center">Rate your last 5 purchases</p>
        </div>
      </div>

      {/* Update CTA */}
      <div className="px-5 pb-28 flex-shrink-0">
        <button
          className="w-full flex items-center justify-center gap-2 bg-accent-mint text-bg-primary font-bold py-3.5 rounded-2xl hover:bg-accent-mint/90 transition-colors text-sm"
          onClick={() => setEditingMeasurements(true)}
        >
          <Ruler size={16} />
          Update My Measurements
        </button>
      </div>
    </div>
  );
};
