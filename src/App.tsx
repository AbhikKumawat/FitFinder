import { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { NavigationBar } from './components/NavigationBar';
import { DiscoverPage } from './components/DiscoverPage';
import { ProductDetails } from './components/ProductDetails';
import { FitProfile } from './components/FitProfile';
import { AgentSearchPanel } from './components/AgentSearchPanel';
import { WishlistPage } from './components/WishlistPage';
import { CategoriesPage } from './components/CategoriesPage';
import type { Product, NavItem, UserProfile } from './types';
import { DEFAULT_USER_PROFILE } from './data/products';

function App() {
  const [activeNav, setActiveNav] = useState<NavItem>('discover');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearchQuery, setAiSearchQuery] = useState('');

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
    window.scrollTo(0, 0);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setAiSearchQuery(searchQuery);
    setActiveNav('search');
  }, [searchQuery]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setActiveCategory((prev) => (prev === categoryId ? null : categoryId));
  }, []);

  const renderContent = () => {
    if (selectedProduct) {
      return (
        <ProductDetails
          product={selectedProduct}
          userProfile={userProfile}
          wishlist={wishlist}
          onWishlist={toggleWishlist}
          onBack={handleBack}
          onProductSelect={handleProductSelect}
        />
      );
    }

    switch (activeNav) {
      case 'discover':
        return (
          <DiscoverPage
            wishlist={wishlist}
            onWishlist={toggleWishlist}
            onProductSelect={handleProductSelect}
            onNavigate={setActiveNav}
            onCategorySelect={handleCategorySelect}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
          />
        );
      case 'search':
        return (
          <AgentSearchPanel
            initialQuery={aiSearchQuery}
            wishlist={wishlist}
            onWishlist={toggleWishlist}
            onProductSelect={handleProductSelect}
          />
        );
      case 'categories':
        return (
          <CategoriesPage
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
            wishlist={wishlist}
            onWishlist={toggleWishlist}
            onProductSelect={handleProductSelect}
          />
        );
      case 'wishlist':
        return (
          <WishlistPage
            wishlist={wishlist}
            onWishlist={toggleWishlist}
            onProductSelect={handleProductSelect}
            onNavigate={setActiveNav}
          />
        );
      case 'profile':
        return (
          <FitProfile
            profile={userProfile}
            onProfileUpdate={setUserProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Desktop layout */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        {/* Left sidebar nav */}
        <div className="w-56 flex-shrink-0 flex flex-col border-r border-white/5 py-6">
          <div className="px-5 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent-mint flex items-center justify-center">
                <Sparkles size={15} className="text-bg-primary" />
              </div>
              <div>
                <span className="text-white font-bold text-base">FitFinder</span>
                <div className="text-[9px] text-text-muted font-medium leading-none">AI Fashion</div>
              </div>
            </div>
          </div>

          <NavigationBar
            activeItem={activeNav}
            onNavigate={(item) => {
              setActiveNav(item);
              setSelectedProduct(null);
            }}
          />

          <div className="mt-auto px-4 pb-2">
            <div className="flex items-center gap-3 bg-bg-card rounded-2xl p-3">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-8 h-8 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{userProfile.name}</p>
                <p className="text-text-muted text-[10px]">{userProfile.profileCompletion}% complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Three-panel content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Panel 1 — Discover */}
          <div className="w-80 flex-shrink-0 overflow-y-auto scrollbar-hide border-r border-white/5">
            <DiscoverPage
              wishlist={wishlist}
              onWishlist={toggleWishlist}
              onProductSelect={handleProductSelect}
              onNavigate={setActiveNav}
              onCategorySelect={handleCategorySelect}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>

          {/* Panel 2 — Product Details or AI Search */}
          <div className="flex-1 overflow-y-auto scrollbar-hide border-r border-white/5">
            {selectedProduct ? (
              <ProductDetails
                product={selectedProduct}
                userProfile={userProfile}
                wishlist={wishlist}
                onWishlist={toggleWishlist}
                onBack={handleBack}
                onProductSelect={handleProductSelect}
              />
            ) : (
              <AgentSearchPanel
                initialQuery={aiSearchQuery}
                wishlist={wishlist}
                onWishlist={toggleWishlist}
                onProductSelect={handleProductSelect}
              />
            )}
          </div>

          {/* Panel 3 — Fit Profile */}
          <div className="w-80 flex-shrink-0 overflow-y-auto scrollbar-hide">
            <FitProfile
              profile={userProfile}
              onProfileUpdate={setUserProfile}
            />
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-5 pt-4 pb-3 glass border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-mint flex items-center justify-center">
              <Sparkles size={12} className="text-bg-primary" />
            </div>
            <span className="text-white font-bold text-base">FitFinder</span>
          </div>
          <img
            src={userProfile.avatar}
            alt={userProfile.name}
            className="w-8 h-8 rounded-xl object-cover cursor-pointer border border-white/10"
            onClick={() => {
              setActiveNav('profile');
              setSelectedProduct(null);
            }}
          />
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-hide">{renderContent()}</main>

        <NavigationBar
          activeItem={activeNav}
          onNavigate={(item) => {
            setActiveNav(item);
            setSelectedProduct(null);
          }}
          isMobile
        />
      </div>
    </div>
  );
}

export default App;
