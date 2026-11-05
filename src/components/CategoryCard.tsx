import React from 'react';
import { cn } from '../lib/utils';
import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onSelect?: (categoryId: string) => void;
  isActive?: boolean;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onSelect,
  isActive = false,
  className,
}) => {
  const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    'bg-accent-mint/20 border-accent-mint/30': {
      bg: 'rgba(139,197,141,0.15)',
      border: 'rgba(139,197,141,0.3)',
      text: '#8BC58D',
      badge: 'rgba(139,197,141,0.25)',
    },
    'bg-accent-yellow/20 border-accent-yellow/30': {
      bg: 'rgba(255,214,126,0.15)',
      border: 'rgba(255,214,126,0.3)',
      text: '#FFD67E',
      badge: 'rgba(255,214,126,0.25)',
    },
    'bg-accent-purple/20 border-accent-purple/30': {
      bg: 'rgba(120,102,217,0.15)',
      border: 'rgba(120,102,217,0.3)',
      text: '#7866D9',
      badge: 'rgba(120,102,217,0.25)',
    },
    'bg-accent-pink/20 border-accent-pink/30': {
      bg: 'rgba(244,155,193,0.15)',
      border: 'rgba(244,155,193,0.3)',
      text: '#F49BC1',
      badge: 'rgba(244,155,193,0.25)',
    },
  };

  const colors = colorMap[category.color] || colorMap['bg-accent-mint/20 border-accent-mint/30'];

  return (
    <button
      className={cn(
        'flex flex-col items-start gap-3 p-4 rounded-2xl border w-full text-left',
        'hover:scale-[1.03] transition-all duration-200 group',
        isActive && 'ring-2',
        className
      )}
      style={{
        background: isActive ? colors.bg : colors.bg,
        borderColor: isActive ? colors.text : colors.border,
        boxShadow: isActive ? `0 0 0 1px ${colors.text}` : undefined,
      }}
      onClick={() => onSelect?.(category.id)}
    >
      <span className="text-2xl">{category.icon}</span>
      <div className="flex-1">
        <p className="text-white font-semibold text-sm">{category.name}</p>
        <p className="text-text-secondary text-xs mt-0.5">{category.count} items</p>
      </div>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{ background: colors.badge, color: colors.text }}
      >
        View →
      </span>
    </button>
  );
};
