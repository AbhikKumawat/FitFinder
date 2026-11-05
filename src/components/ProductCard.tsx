import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Product } from '../types';
import { FitScoreBadge } from './FitScoreBadge';

interface ProductCardProps {
  product: Product;
  variant?: 'featured' | 'compact' | 'list';
  onSelect?: (product: Product) => void;
  onWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'compact',
  onSelect,
  onWishlist,
  isWishlisted = false,
  className,
}) => {
  if (variant === 'featured') {
    return (
      <div
        className={cn(
          'relative bg-bg-card rounded-3xl overflow-hidden cursor-pointer group',
          'hover:scale-[1.01] transition-all duration-300',
          className
        )}
        onClick={() => onSelect?.(product)}
      >
        <div className="relative h-52 overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card/90 via-transparent to-transparent" />
          {/* Fit badge overlay */}
          <div className="absolute top-3 right-3">
            <FitScoreBadge score={product.fitMatch} size="sm" />
          </div>
          {/* Wishlist */}
          <button
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-bg-primary/70 flex items-center justify-center hover:bg-bg-primary transition-colors"
            onClick={(e) => { e.stopPropagation(); onWishlist?.(product.id); }}
          >
            <Heart
              size={14}
              className={isWishlisted ? 'fill-accent-pink text-accent-pink' : 'text-text-secondary'}
            />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <p className="text-text-secondary text-xs font-medium mb-0.5">{product.brand}</p>
              <h3 className="text-white font-semibold text-sm leading-tight truncate">{product.name}</h3>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-accent-mint font-bold text-lg">
              {product.currency}{product.price.toLocaleString()}
            </span>
            <span className="text-xs bg-accent-mint/20 text-accent-mint font-semibold px-2 py-0.5 rounded-full">
              Size {product.recommendedSize}
            </span>
          </div>

          <p className="text-text-secondary text-xs mt-2 line-clamp-2 leading-relaxed">
            {product.fitExplanation}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        className={cn(
          'flex gap-3 bg-bg-card rounded-2xl p-3 cursor-pointer group',
          'hover:bg-bg-elevated transition-all duration-200',
          className
        )}
        onClick={() => onSelect?.(product)}
      >
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-text-muted text-xs">{product.brand} · {product.source}</p>
          <h3 className="text-white font-semibold text-sm truncate mt-0.5">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-accent-mint font-bold text-sm">{product.currency}{product.price.toLocaleString()}</span>
            <span className="text-xs bg-accent-mint/15 text-accent-mint font-medium px-1.5 py-0.5 rounded-md">
              {product.recommendedSize}
            </span>
          </div>
          <p className="text-text-secondary text-xs mt-1 line-clamp-1">{product.fitExplanation}</p>
          {/* Quick store link */}
          <a
            href={product.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-accent-purple hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Visit {product.source} ↗
          </a>
        </div>
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <FitScoreBadge score={product.fitMatch} size="sm" showLabel={false} />
          <button
            className="w-7 h-7 rounded-full bg-bg-primary/50 flex items-center justify-center hover:bg-bg-primary transition-colors"
            onClick={(e) => { e.stopPropagation(); onWishlist?.(product.id); }}
          >
            <Heart
              size={12}
              className={isWishlisted ? 'fill-accent-pink text-accent-pink' : 'text-text-secondary'}
            />
          </button>
        </div>
      </div>
    );
  }

  // compact
  return (
    <div
      className={cn(
        'bg-bg-card rounded-2xl overflow-hidden cursor-pointer group',
        'hover:scale-[1.02] hover:shadow-xl transition-all duration-300',
        className
      )}
      onClick={() => onSelect?.(product)}
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 to-transparent" />
        <div className="absolute top-2 right-2">
          <span className="text-xs bg-accent-mint/20 text-accent-mint font-semibold px-1.5 py-0.5 rounded-lg backdrop-blur-sm">
            {product.fitMatch}%
          </span>
        </div>
        <button
          className="absolute top-2 left-2 w-6 h-6 rounded-full bg-bg-primary/70 flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); onWishlist?.(product.id); }}
        >
          <Heart
            size={10}
            className={isWishlisted ? 'fill-accent-pink text-accent-pink' : 'text-text-secondary'}
          />
        </button>
      </div>
      <div className="p-3">
        <p className="text-text-muted text-[10px] font-medium">{product.brand}</p>
        <h3 className="text-white font-semibold text-xs leading-tight mt-0.5 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-accent-mint font-bold text-sm">{product.currency}{product.price.toLocaleString()}</span>
          <span className="text-[10px] text-text-secondary">Size {product.recommendedSize}</span>
        </div>
      </div>
    </div>
  );
};
