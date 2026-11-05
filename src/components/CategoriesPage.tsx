import React from 'react';
import { CategoryCard } from './CategoryCard';
import { ProductCard } from './ProductCard';
import type { Product } from '../types';
import { CATEGORIES, PRODUCTS } from '../data/products';

interface CategoriesPageProps {
  activeCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  wishlist: Set<string>;
  onWishlist: (id: string) => void;
  onProductSelect: (product: Product) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  activeCategory,
  onCategorySelect,
  wishlist,
  onWishlist,
  onProductSelect,
}) => {
  const filteredProducts = activeCategory
    ? PRODUCTS.filter((p) => p.category === activeCategory)
    : PRODUCTS;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-white font-bold text-xl">Categories</h1>
        <p className="text-text-secondary text-xs mt-1">Browse by clothing type</p>
      </div>

      {/* Category grid */}
      <div className="px-5 mb-5 flex-shrink-0">
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onSelect={(id) => onCategorySelect(activeCategory === id ? '' : id)}
              isActive={activeCategory === cat.id}
            />
          ))}
        </div>
      </div>

      {/* Products for selected category */}
      <div className="px-5 mb-24">
        <h2 className="text-white font-semibold text-sm mb-3">
          {activeCategory
            ? `${CATEGORIES.find((c) => c.id === activeCategory)?.name} (${filteredProducts.length})`
            : `All Products (${filteredProducts.length})`}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="compact"
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
