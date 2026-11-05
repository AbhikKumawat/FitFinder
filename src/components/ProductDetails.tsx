import React, { useState } from 'react';
import {
  ArrowLeft, Star, Heart, ExternalLink, ChevronRight,
  Ruler, TrendingUp, Package, Sparkles, ShoppingBag,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { FitScoreBadge } from './FitScoreBadge';
import type { Product, UserProfile } from '../types';
import { PRODUCTS } from '../data/products';

interface ProductDetailsProps {
  product: Product;
  userProfile: UserProfile;
  wishlist: Set<string>;
  onWishlist: (id: string) => void;
  onBack: () => void;
  onProductSelect: (product: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  userProfile,
  wishlist,
  onWishlist,
  onBack,
  onProductSelect,
}) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.recommendedSize);
  const [currentImage, setCurrentImage] = useState(0);
  const isWishlisted = wishlist.has(product.id);

  const similar = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, 3);

  const measurements = userProfile.measurements;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      {/* Back + header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
        <button
          className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center hover:bg-bg-elevated transition-colors"
          onClick={onBack}
        >
          <ArrowLeft size={16} className="text-white" />
        </button>
        <div className="flex-1">
          <p className="text-text-muted text-xs">{product.source}</p>
          <p className="text-white font-semibold text-sm truncate">{product.name}</p>
        </div>
        <button
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
            isWishlisted ? 'bg-accent-pink/20' : 'bg-bg-card hover:bg-bg-elevated'
          )}
          onClick={() => onWishlist(product.id)}
        >
          <Heart
            size={16}
            className={isWishlisted ? 'fill-accent-pink text-accent-pink' : 'text-text-secondary'}
          />
        </button>
      </div>

      {/* Product images */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="relative rounded-3xl overflow-hidden h-64 bg-bg-card">
          <img
            src={product.images[currentImage]}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/40 to-transparent" />
          <div className="absolute top-3 right-3">
            <FitScoreBadge score={product.fitMatch} size="md" />
          </div>
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 mt-2 justify-center">
            {product.images.map((_, i) => (
              <button
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  currentImage === i ? 'bg-accent-mint w-5' : 'bg-text-muted'
                )}
                onClick={() => setCurrentImage(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-text-secondary text-xs font-medium">{product.brand}</p>
            <h2 className="text-white font-bold text-lg leading-tight mt-0.5">{product.name}</h2>
          </div>
          <span className="text-accent-mint font-bold text-xl">{product.currency}{product.price.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-accent-yellow text-accent-yellow" />
            <span className="text-white text-xs font-semibold">{product.rating}</span>
          </div>
          <span className="text-text-muted text-xs">({product.reviewCount.toLocaleString()} reviews)</span>
        </div>
        <p className="text-text-secondary text-xs mt-3 leading-relaxed">{product.description}</p>
      </div>

      {/* Colors */}
      <div className="px-5 mb-4 flex-shrink-0">
        <p className="text-white text-xs font-semibold mb-2">Color</p>
        <div className="flex gap-2">
          {product.colors.map((color) => (
            <button
              key={color}
              className={cn(
                'w-7 h-7 rounded-full border-2 transition-all duration-200',
                selectedColor === color ? 'border-white scale-110' : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="px-5 mb-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white text-xs font-semibold">Size</p>
          <button className="text-accent-mint text-xs flex items-center gap-1 hover:underline">
            <Ruler size={10} /> Size guide
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {product.sizes.map((size) => {
            const isRec = size === product.recommendedSize;
            const isSel = size === selectedSize;
            return (
              <button
                key={size}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 relative',
                  isSel
                    ? 'bg-accent-mint text-bg-primary font-semibold'
                    : isRec
                    ? 'bg-accent-mint/20 text-accent-mint border border-accent-mint/50'
                    : 'bg-bg-card text-text-secondary hover:bg-bg-elevated hover:text-white'
                )}
                onClick={() => setSelectedSize(size)}
              >
                {size}
                {isRec && !isSel && (
                  <span className="absolute -top-1.5 -right-1 text-[8px] bg-accent-mint text-bg-primary rounded-full px-1 font-bold">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Your Perfect Size Card */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="bg-bg-card rounded-2xl p-4 border border-accent-mint/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent-mint/20 flex items-center justify-center">
              <Sparkles size={13} className="text-accent-mint" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Your Perfect Size</p>
              <p className="text-text-muted text-xs">AI recommendation</p>
            </div>
            <div className="ml-auto">
              <span className="text-accent-mint font-bold text-2xl">{product.recommendedSize}</span>
            </div>
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            Based on your measurements, size <strong className="text-white">{product.recommendedSize}</strong> provides
            the closest match to your preferred{' '}
            <strong className="text-accent-mint">{userProfile.fitPreference}</strong> fit.
          </p>
          {/* Fit comparison */}
          <div className="space-y-2">
            <FitRow
              label="Your chest"
              value={`${measurements.chest} cm`}
              valueColor="text-white"
            />
            <FitRow
              label="Garment chest"
              value={`${measurements.chest + 8} cm`}
              valueColor="text-accent-mint"
            />
            <FitRow
              label="Preferred fit"
              value={userProfile.fitPreference.charAt(0).toUpperCase() + userProfile.fitPreference.slice(1)}
              valueColor="text-accent-yellow"
            />
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-text-secondary text-xs leading-relaxed">{product.fitExplanation}</p>
          </div>
        </div>
      </div>

      {/* Product specs */}
      <div className="px-5 mb-4 flex-shrink-0">
        <button className="flex items-center justify-between w-full group">
          <div className="flex items-center gap-2">
            <Package size={14} className="text-text-muted" />
            <span className="text-white text-xs font-semibold">Product Specifications</span>
          </div>
          <ChevronRight size={14} className="text-text-muted group-hover:text-white transition-colors" />
        </button>
        <div className="mt-3 space-y-1.5">
          {Object.entries(product.specs).map(([key, value]) => (
            <div key={key} className="flex justify-between items-start">
              <span className="text-text-muted text-xs">{key}</span>
              <span className="text-text-secondary text-xs text-right max-w-[55%]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Promo cards */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="bg-accent-yellow/15 border border-accent-yellow/25 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={13} className="text-accent-yellow" />
            <span className="text-accent-yellow text-xs font-semibold">More Great Matches</span>
          </div>
          <p className="text-text-secondary text-xs">Discover more products that match your fit across all supported brands.</p>
          <button className="mt-2 text-xs font-semibold text-accent-yellow hover:underline">
            Explore →
          </button>
        </div>
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <div className="px-5 mb-4 flex-shrink-0">
          <div className="bg-accent-purple/15 border border-accent-purple/25 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} className="text-accent-purple" />
              <span className="text-accent-purple text-xs font-semibold">Similar From Other Brands</span>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {similar.map((p) => (
                <div
                  key={p.id}
                  className="flex-shrink-0 w-28 cursor-pointer"
                  onClick={() => onProductSelect(p)}
                >
                  <div className="rounded-xl overflow-hidden h-20 mb-1">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-white text-[10px] font-medium truncate">{p.brand}</p>
                  <p className="text-accent-mint text-[10px] font-semibold">{p.currency}{p.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="px-5 pb-28 flex-shrink-0 space-y-2">
        {/* Primary: Visit Store — proper <a> so it always opens in a new tab */}
        <a
          href={product.storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-accent-mint text-bg-primary font-bold py-3.5 rounded-2xl hover:bg-accent-mint/90 active:scale-[0.98] transition-all text-sm"
        >
          <ShoppingBag size={16} />
          Visit {product.source} Store
          <ExternalLink size={12} />
        </a>

        {/* Store badge row — shows all supported stores */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-text-muted text-[10px]">Also available on</span>
          {['Amazon', 'Myntra', 'Flipkart'].filter((s) => s !== product.source).map((store) => {
            const storeLinks: Record<string, string> = {
              Amazon:   `https://www.amazon.in/s?k=${encodeURIComponent(product.name)}`,
              Myntra:   `https://www.myntra.com/${encodeURIComponent(product.category)}`,
              Flipkart: `https://www.flipkart.com/search?q=${encodeURIComponent(product.name)}`,
            };
            return (
              <a
                key={store}
                href={storeLinks[store]}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-bg-card border border-white/8 text-[10px] text-text-secondary font-medium hover:border-accent-mint/40 hover:text-white transition-colors"
              >
                {store} ↗
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function FitRow({ label, value, valueColor }: { label: string; value: string; valueColor: string }) {
  return (
    <div className="flex items-center justify-between bg-bg-primary/40 rounded-xl px-3 py-2">
      <span className="text-text-secondary text-xs">{label}</span>
      <span className={cn('text-xs font-semibold', valueColor)}>{value}</span>
    </div>
  );
}
