import React, { useState } from 'react';
import {
  ArrowLeft, Star, Heart, ExternalLink, Package,
  Sparkles, ShoppingBag, Ruler,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Product } from '../api/client';

interface ProductDetailsProps {
  product: Product;
  fitPreference: string;
  wishlist: Set<string>;
  onWishlist: (id: string) => void;
  onBack: () => void;
  onProductSelect: (p: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product: p, fitPreference, wishlist, onWishlist, onBack,
}) => {
  const [selSize, setSelSize] = useState(p.recommended_size);
  const [selColor, setSelColor] = useState(p.colors[0]);
  const isW = wishlist.has(p.id);
  const scoreColor = p.fit_match >= 90 ? '#8BC58D' : p.fit_match >= 75 ? '#FFD67E' : '#F49BC1';

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center hover:bg-bg-elevated transition-colors">
          <ArrowLeft size={16} className="text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-text-muted text-xs">{p.source}</p>
          <p className="text-white font-semibold text-sm truncate">{p.name}</p>
        </div>
        <button onClick={() => onWishlist(p.id)} className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-colors', isW ? 'bg-accent-pink/20' : 'bg-bg-card hover:bg-bg-elevated')}>
          <Heart size={16} className={isW ? 'fill-accent-pink text-accent-pink' : 'text-text-secondary'} />
        </button>
      </div>

      {/* Image */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="relative rounded-3xl overflow-hidden h-64 bg-bg-card">
          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/40 to-transparent" />
          <div className="absolute top-3 right-3 bg-bg-primary/60 rounded-2xl px-3 py-1.5 backdrop-blur-sm">
            <span className="text-sm font-bold" style={{ color: scoreColor }}>{p.fit_match}%</span>
            <span className="text-text-muted text-[10px] ml-1">fit</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-text-secondary text-xs font-medium">{p.brand}</p>
            <h2 className="text-white font-bold text-lg leading-tight">{p.name}</h2>
          </div>
          <span className="text-accent-mint font-bold text-xl">{p.currency}{p.price.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Star size={12} className="fill-accent-yellow text-accent-yellow" />
          <span className="text-white text-xs font-semibold">{p.rating}</span>
          <span className="text-text-muted text-xs">({p.review_count?.toLocaleString()})</span>
        </div>
        <p className="text-text-secondary text-xs mt-3 leading-relaxed">{p.description}</p>
      </div>

      {/* Colors */}
      <div className="px-5 mb-4 flex-shrink-0">
        <p className="text-white text-xs font-semibold mb-2">Color</p>
        <div className="flex gap-2">
          {p.colors.map(c => (
            <button key={c} onClick={() => setSelColor(c)}
              className={cn('w-7 h-7 rounded-full border-2 transition-all', selColor === c ? 'border-white scale-110' : 'border-transparent')}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="px-5 mb-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white text-xs font-semibold">Size</p>
          <button className="text-accent-mint text-xs flex items-center gap-1"><Ruler size={10} /> Size guide</button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {p.sizes.map(s => {
            const isRec = s === p.recommended_size;
            const isSel = s === selSize;
            return (
              <button key={s} onClick={() => setSelSize(s)}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all relative',
                  isSel ? 'bg-accent-mint text-bg-primary font-semibold' :
                  isRec ? 'bg-accent-mint/20 text-accent-mint border border-accent-mint/50' :
                  'bg-bg-card text-text-secondary hover:bg-bg-elevated hover:text-white')}>
                {s}
                {isRec && !isSel && (
                  <span className="absolute -top-1.5 -right-1 text-[8px] bg-accent-mint text-bg-primary rounded-full px-1 font-bold">AI</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Your Perfect Size card */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="bg-bg-card rounded-2xl p-4 border border-accent-mint/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent-mint/20 flex items-center justify-center">
              <Sparkles size={13} className="text-accent-mint" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Your Perfect Size</p>
              <p className="text-text-muted text-xs">LangGraph AI recommendation</p>
            </div>
            <span className="text-accent-mint font-bold text-2xl">{p.recommended_size}</span>
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            Fit Agent analysed your measurements against this garment's sizing data.
            Size <strong className="text-white">{p.recommended_size}</strong> is recommended
            for your preferred <strong className="text-accent-mint">{fitPreference}</strong> fit.
          </p>
          <div className="p-2 bg-bg-primary/40 rounded-xl text-xs text-text-secondary italic leading-relaxed">
            {p.fit_explanation}
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Package size={14} className="text-text-muted" />
          <span className="text-white text-xs font-semibold">Product Specifications</span>
        </div>
        <div className="space-y-1.5">
          {Object.entries(p.specs || {}).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-text-muted text-xs">{k}</span>
              <span className="text-text-secondary text-xs text-right max-w-[55%]">{v as string}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-28 flex-shrink-0 space-y-2">
        <a href={p.store_url} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-accent-mint text-bg-primary font-bold py-3.5 rounded-2xl hover:bg-accent-mint/90 transition-all text-sm active:scale-[0.98]">
          <ShoppingBag size={16} />
          Visit {p.source} Store
          <ExternalLink size={12} />
        </a>
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-text-muted text-[10px]">Also search on</span>
          {['Amazon', 'Myntra', 'Flipkart'].filter(s => s !== p.source).map(store => {
            const links: Record<string, string> = {
              Amazon:   `https://www.amazon.in/s?k=${encodeURIComponent(p.name)}`,
              Myntra:   `https://www.myntra.com/${encodeURIComponent(p.category)}`,
              Flipkart: `https://www.flipkart.com/search?q=${encodeURIComponent(p.name)}`,
            };
            return (
              <a key={store} href={links[store]} target="_blank" rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-bg-card border border-white/8 text-[10px] text-text-secondary font-medium hover:border-accent-mint/40 hover:text-white transition-colors">
                {store} ↗
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
