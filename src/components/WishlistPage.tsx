import React from 'react';
import { Heart } from 'lucide-react';
import type { Product, NavItem } from '../types';
import { ProductCard } from './ProductCard';
import { PRODUCTS } from '../data/products';

interface WishlistPageProps {
  wishlist: Set<string>;
  onWishlist: (id: string) => void;
  onProductSelect: (product: Product) => void;
  onNavigate: (item: NavItem) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlist,
  onWishlist,
  onProductSelect,
  onNavigate,
}) => {
  const wishlisted = PRODUCTS.filter((p) => wishlist.has(p.id));

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-white font-bold text-xl flex items-center gap-2">
          <Heart size={20} className="text-accent-pink fill-accent-pink" />
          Wishlist
        </h1>
        <p className="text-text-secondary text-xs mt-1">
          {wishlisted.length} saved {wishlisted.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {wishlisted.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 px-5 pb-24">
          <div className="w-20 h-20 rounded-3xl bg-accent-pink/15 flex items-center justify-center mb-4">
            <Heart size={32} className="text-accent-pink" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">No saved items yet</h2>
          <p className="text-text-secondary text-sm text-center leading-relaxed">
            Tap the heart icon on any product to save it here for later.
          </p>
          <button
            className="mt-6 px-6 py-3 bg-accent-mint text-bg-primary font-semibold rounded-2xl text-sm hover:bg-accent-mint/90 transition-colors"
            onClick={() => onNavigate('discover')}
          >
            Discover Products
          </button>
        </div>
      ) : (
        <div className="px-5 mb-24 flex flex-col gap-3">
          {wishlisted.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="list"
              onSelect={onProductSelect}
              onWishlist={onWishlist}
              isWishlisted={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
