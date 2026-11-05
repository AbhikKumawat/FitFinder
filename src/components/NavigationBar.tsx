import React from 'react';
import {
  Home, Search, Ruler, Heart, User,
  Compass, Tag, LayoutGrid,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { NavItem } from '../types';

interface NavigationBarProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
  isMobile?: boolean;
}

const NAV_ITEMS = [
  { id: 'discover' as NavItem, label: 'Discover', icon: Compass, mobileIcon: Home },
  { id: 'search' as NavItem, label: 'Search', icon: Search, mobileIcon: Search },
  { id: 'categories' as NavItem, label: 'Categories', icon: LayoutGrid, mobileIcon: Tag },
  { id: 'wishlist' as NavItem, label: 'Wishlist', icon: Heart, mobileIcon: Heart },
  { id: 'profile' as NavItem, label: 'My Fit', icon: Ruler, mobileIcon: User },
];

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeItem,
  onNavigate,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5">
        <div className="flex items-center justify-around py-2 px-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.mobileIcon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                className="flex flex-col items-center gap-1 py-1 px-3 group"
                onClick={() => onNavigate(item.id)}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200',
                    isActive ? 'bg-accent-mint/20' : 'group-hover:bg-white/5'
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      'transition-colors duration-200',
                      isActive ? 'text-accent-mint' : 'text-text-secondary group-hover:text-white'
                    )}
                    fill={isActive && (item.id === 'wishlist') ? '#F49BC1' : 'none'}
                  />
                </div>
                <span
                  className={cn(
                    'text-[9px] font-medium transition-colors duration-200',
                    isActive ? 'text-accent-mint' : 'text-text-muted'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1 p-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        return (
          <button
            key={item.id}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all duration-200 group',
              isActive
                ? 'bg-accent-mint/15 text-accent-mint'
                : 'text-text-secondary hover:bg-white/5 hover:text-white'
            )}
            onClick={() => onNavigate(item.id)}
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-mint" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
