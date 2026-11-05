import React, { useState } from 'react';
import { Search, SlidersHorizontal, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProductCard } from './ProductCard';
import { CategoryCard } from './CategoryCard';
import type { Product, NavItem } from '../types';
import { PRODUCTS, CATEGORIES } from '../data/products';

interface DiscoverPageProps {
  wishlist: Set<string>;
  onWishlist: (id: string) => void;
  onProductSelect: (product: Product) => void;
  onNavigate: (item: NavItem) => void;
  onCategorySelect: (categoryId: string) => void;
  activeCategory: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  wishlist,
  onWishlist,
  onProductSelect,
  onNavigate,
  onCategorySelect,
  activeCategory,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchCat = !activeCategory || p.category === activeCategory;
    const matchQ = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const featured = filteredProducts[0];

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-text-secondary text-xs font-medium">Good evening 👋</p>
            <h1 className="text-white text-2xl font-bold leading-tight mt-0.5">
              Find your<br />
              <span className="text-accent-mint">perfect fit.</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center">
              <Sparkles size={14} className="text-accent-purple" />
            </div>
          </div>
        </div>
        <p className="text-text-secondary text-xs mt-2 leading-relaxed">
          Discover styles made for your measurements.
        </p>
      </div>

      {/* Search bar */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 bg-bg-card rounded-2xl px-4 py-3 border border-white/5">
            <Search size={16} className="text-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Search clothes, shoes, brands..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
              className="flex-1 bg-transparent text-sm text-white placeholder-text-muted outline-none"
            />
          </div>
          <button
            className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors',
              showFilters ? 'bg-accent-mint/20 text-accent-mint' : 'bg-bg-card text-text-secondary hover:text-white'
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* AI search prompt */}
        {searchQuery && (
          <button
            className="mt-2 w-full flex items-center gap-2 bg-accent-purple/15 border border-accent-purple/30 rounded-xl px-3 py-2 text-xs text-accent-purple font-medium hover:bg-accent-purple/20 transition-colors"
            onClick={onSearchSubmit}
          >
            <Sparkles size={12} />
            Search with AI: "{searchQuery}"
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="px-5 mb-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Categories</h2>
          <button
            className="text-text-muted text-xs hover:text-accent-mint transition-colors flex items-center gap-1"
            onClick={() => onNavigate('categories')}
          >
            See all <ChevronRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onSelect={onCategorySelect}
              isActive={activeCategory === cat.id}
            />
          ))}
        </div>
      </div>

      {/* Featured Product */}
      {featured && (
        <div className="px-5 mb-5 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-mint" />
              Recommended For You
            </h2>
          </div>
          <ProductCard
            product={featured}
            variant="featured"
            onSelect={onProductSelect}
            onWishlist={onWishlist}
            isWishlisted={wishlist.has(featured.id)}
          />
        </div>
      )}

      {/* More products */}
      <div className="px-5 mb-24">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">
            {activeCategory
              ? `${CATEGORIES.find((c) => c.id === activeCategory)?.name ?? ''} (${filteredProducts.length})`
              : 'All Products'}
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {filteredProducts.slice(1).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="list"
              onSelect={onProductSelect}
              onWishlist={onWishlist}
              isWishlisted={wishlist.has(product.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
