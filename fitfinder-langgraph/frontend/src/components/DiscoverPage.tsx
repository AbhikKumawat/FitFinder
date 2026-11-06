import React, { useState } from 'react';
import { Search, SlidersHorizontal, Sparkles, TrendingUp, ChevronRight, Heart } from 'lucide-react';
import type { Product } from '../api/client';

interface DiscoverPageProps {
  products: Product[];
  loading: boolean;
  wishlist: Set<string>;
  onWishlist: (id: string) => void;
  onProductSelect: (p: Product) => void;
  onSearchSubmit: (q: string) => void;
  onNavigate: (tab: string) => void;
}

const CATEGORIES = [
  { id: 'shirts',   name: 'Shirts',    icon: '👔', color: { bg: 'rgba(139,197,141,0.15)', border: 'rgba(139,197,141,0.3)', text: '#8BC58D' } },
  { id: 'tshirts',  name: 'T-Shirts',  icon: '👕', color: { bg: 'rgba(255,214,126,0.15)', border: 'rgba(255,214,126,0.3)', text: '#FFD67E' } },
  { id: 'jeans',    name: 'Jeans',     icon: '👖', color: { bg: 'rgba(120,102,217,0.15)', border: 'rgba(120,102,217,0.3)', text: '#7866D9' } },
  { id: 'trousers', name: 'Trousers',  icon: '🩱', color: { bg: 'rgba(244,155,193,0.15)', border: 'rgba(244,155,193,0.3)', text: '#F49BC1' } },
  { id: 'shoes',    name: 'Shoes',     icon: '👟', color: { bg: 'rgba(139,197,141,0.15)', border: 'rgba(139,197,141,0.3)', text: '#8BC58D' } },
  { id: 'jackets',  name: 'Jackets',   icon: '🧥', color: { bg: 'rgba(255,214,126,0.15)', border: 'rgba(255,214,126,0.3)', text: '#FFD67E' } },
];

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  products, loading, wishlist, onWishlist, onProductSelect, onSearchSubmit, onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = products.filter(p => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.brand.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const featured = filtered[0];

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <p className="text-text-secondary text-xs font-medium">Good evening 👋</p>
        <h1 className="text-white text-2xl font-bold leading-tight mt-0.5">
          Find your<br /><span className="text-accent-mint">perfect fit.</span>
        </h1>
        <p className="text-text-secondary text-xs mt-2">Powered by LangGraph multi-agent AI.</p>
      </div>

      {/* Search bar */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 bg-bg-card rounded-2xl px-4 py-3 border border-white/5">
            <Search size={16} className="text-text-muted flex-shrink-0" />
            <input type="text" placeholder="Search clothes, shoes, brands..." value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearchSubmit(query)}
              className="flex-1 bg-transparent text-sm text-white placeholder-text-muted outline-none" />
          </div>
          <button onClick={() => setActiveCategory(null)}
            className="w-11 h-11 rounded-2xl bg-bg-card flex items-center justify-center text-text-secondary hover:text-white transition-colors">
            <SlidersHorizontal size={16} />
          </button>
        </div>
        {query && (
          <button onClick={() => onSearchSubmit(query)}
            className="mt-2 w-full flex items-center gap-2 bg-accent-purple/15 border border-accent-purple/30 rounded-xl px-3 py-2 text-xs text-accent-purple font-medium hover:bg-accent-purple/20 transition-colors">
            <Sparkles size={12} /> Search with AI Agents: "{query}"
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="px-5 mb-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Categories</h2>
          <button onClick={() => onNavigate('categories')} className="text-text-muted text-xs hover:text-accent-mint flex items-center gap-1">
            See all <ChevronRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(prev => prev === cat.id ? null : cat.id)}
              className="flex flex-col items-start gap-2 p-3 rounded-2xl border text-left transition-all hover:scale-[1.02]"
              style={{ background: cat.color.bg, borderColor: activeCategory === cat.id ? cat.color.text : cat.color.border,
                boxShadow: activeCategory === cat.id ? `0 0 0 1px ${cat.color.text}` : undefined }}>
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="text-white font-semibold text-xs">{cat.name}</p>
                <span className="text-[10px] font-semibold mt-0.5 block" style={{ color: cat.color.text }}>View →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {loading ? (
        <div className="px-5 mb-5 flex-shrink-0">
          <div className="bg-bg-card rounded-3xl h-64 animate-pulse" />
        </div>
      ) : featured && (
        <div className="px-5 mb-5 flex-shrink-0">
          <h2 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-accent-mint" /> Recommended For You
          </h2>
          <FeaturedCard product={featured} isWishlisted={wishlist.has(featured.id)} onWishlist={onWishlist} onSelect={onProductSelect} />
        </div>
      )}

      {/* Product list */}
      <div className="px-5 mb-24 flex-shrink-0">
        <h2 className="text-white font-semibold text-sm mb-3">
          {activeCategory ? `${CATEGORIES.find(c => c.id === activeCategory)?.name} (${filtered.length})` : `All Products (${filtered.length})`}
        </h2>
        <div className="flex flex-col gap-3">
          {filtered.slice(1).map(p => (
            <ListCard key={p.id} product={p} isWishlisted={wishlist.has(p.id)} onWishlist={onWishlist} onSelect={onProductSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};

function FeaturedCard({ product: p, isWishlisted, onWishlist, onSelect }: {
  product: Product; isWishlisted: boolean; onWishlist: (id: string) => void; onSelect: (p: Product) => void;
}) {
  const scoreColor = p.fit_match >= 90 ? '#8BC58D' : p.fit_match >= 75 ? '#FFD67E' : '#F49BC1';
  return (
    <div className="bg-bg-card rounded-3xl overflow-hidden cursor-pointer group hover:scale-[1.01] transition-all duration-300" onClick={() => onSelect(p)}>
      <div className="relative h-52 overflow-hidden">
        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/90 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 bg-bg-primary/60 rounded-xl px-2 py-1 backdrop-blur-sm">
          <span className="text-sm font-bold" style={{ color: scoreColor }}>{p.fit_match}%</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onWishlist(p.id); }}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-bg-primary/70 flex items-center justify-center hover:bg-bg-primary transition-colors">
          <Heart size={14} className={isWishlisted ? 'fill-accent-pink text-accent-pink' : 'text-text-secondary'} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-text-secondary text-xs font-medium">{p.brand}</p>
        <h3 className="text-white font-semibold text-sm mt-0.5">{p.name}</h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-accent-mint font-bold text-lg">{p.currency}{p.price.toLocaleString()}</span>
          <span className="text-xs bg-accent-mint/20 text-accent-mint font-semibold px-2 py-0.5 rounded-full">Size {p.recommended_size}</span>
        </div>
        <p className="text-text-secondary text-xs mt-2 line-clamp-2 leading-relaxed">{p.fit_explanation}</p>
      </div>
    </div>
  );
}

function ListCard({ product: p, isWishlisted, onWishlist, onSelect }: {
  product: Product; isWishlisted: boolean; onWishlist: (id: string) => void; onSelect: (p: Product) => void;
}) {
  const scoreColor = p.fit_match >= 90 ? '#8BC58D' : p.fit_match >= 75 ? '#FFD67E' : '#F49BC1';
  return (
    <div className="flex gap-3 bg-bg-card rounded-2xl p-3 cursor-pointer hover:bg-bg-elevated transition-colors group" onClick={() => onSelect(p)}>
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-muted text-xs">{p.brand} · {p.source}</p>
        <h3 className="text-white font-semibold text-sm truncate mt-0.5">{p.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-accent-mint font-bold text-sm">{p.currency}{p.price.toLocaleString()}</span>
          <span className="text-xs bg-accent-mint/15 text-accent-mint font-medium px-1.5 py-0.5 rounded-md">{p.recommended_size}</span>
        </div>
        <p className="text-text-secondary text-xs mt-1 line-clamp-1">{p.fit_explanation}</p>
      </div>
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <span className="text-xs font-bold" style={{ color: scoreColor }}>{p.fit_match}%</span>
        <button onClick={e => { e.stopPropagation(); onWishlist(p.id); }}
          className="w-7 h-7 rounded-full bg-bg-primary/50 flex items-center justify-center hover:bg-bg-primary transition-colors">
          <Heart size={12} className={isWishlisted ? 'fill-accent-pink text-accent-pink' : 'text-text-secondary'} />
        </button>
      </div>
    </div>
  );
}
