import { useState, useCallback, useEffect } from 'react';
import { Compass, Search, LayoutGrid, Heart, User, Sparkles, Zap, AlertCircle } from 'lucide-react';
import { cn } from './lib/utils';
import { checkHealth, getAllProducts, type Product, type Measurements } from './api/client';
import { DiscoverPage } from './components/DiscoverPage';
import { AgentSearchPanel } from './components/AgentSearchPanel';
import { FitProfile } from './components/FitProfile';
import { ProductDetails } from './components/ProductDetails';

type Tab = 'discover' | 'search' | 'categories' | 'wishlist' | 'profile';

const DEFAULT_MEASUREMENTS: Measurements = {
  height: 175, chest: 96, waist: 82, hips: 100, shoulders: 44, foot_length: 27, unit: 'cm',
};

const NAV = [
  { id: 'discover'   as Tab, label: 'Discover',  Icon: Compass },
  { id: 'search'     as Tab, label: 'Search',     Icon: Search },
  { id: 'categories' as Tab, label: 'Categories', Icon: LayoutGrid },
  { id: 'wishlist'   as Tab, label: 'Wishlist',   Icon: Heart },
  { id: 'profile'    as Tab, label: 'My Fit',     Icon: User },
];

export default function App() {
  const [tab, setTab]           = useState<Tab>('discover');
  const [selected, setSelected] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [measurements, setMeasurements] = useState<Measurements>(DEFAULT_MEASUREMENTS);
  const [fitPref, setFitPref]   = useState('relaxed');
  const [aiQuery, setAiQuery]   = useState('');
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth()
      .then(h => { setBackendOk(true); setGeminiConfigured(h.gemini_configured); })
      .catch(() => setBackendOk(false));
    getAllProducts()
      .then(p => setProducts(p))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const handleSearchSubmit = (q: string) => { setAiQuery(q); setTab('search'); setSelected(null); };
  const handleNav = (t: string) => { setTab(t as Tab); setSelected(null); };

  const renderPanel = (panelFor: Tab) => {
    if (selected) {
      return (
        <ProductDetails product={selected} fitPreference={fitPref} wishlist={wishlist}
          onWishlist={toggleWishlist} onBack={() => setSelected(null)} onProductSelect={setSelected} />
      );
    }
    switch (panelFor) {
      case 'discover': return (
        <DiscoverPage products={products} loading={productsLoading} wishlist={wishlist}
          onWishlist={toggleWishlist} onProductSelect={setSelected}
          onSearchSubmit={handleSearchSubmit} onNavigate={handleNav} />
      );
      case 'search': return (
        <AgentSearchPanel initialQuery={aiQuery} measurements={measurements}
          fitPreference={fitPref} wishlist={wishlist} onWishlist={toggleWishlist}
          onProductSelect={setSelected} geminiConfigured={geminiConfigured} />
      );
      case 'profile': return (
        <FitProfile measurements={measurements} fitPreference={fitPref}
          onUpdate={(m, fp) => { setMeasurements(m); setFitPref(fp); }} />
      );
      case 'wishlist': {
        const wishlisted = products.filter(p => wishlist.has(p.id));
        return (
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            <div className="px-5 pt-6 pb-4">
              <h1 className="text-white font-bold text-xl flex items-center gap-2">
                <Heart size={20} className="fill-accent-pink text-accent-pink" /> Wishlist
              </h1>
              <p className="text-text-secondary text-xs mt-1">{wishlisted.length} saved items</p>
            </div>
            {wishlisted.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 px-5 pb-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-accent-pink/15 flex items-center justify-center mb-4">
                  <Heart size={32} className="text-accent-pink" />
                </div>
                <h2 className="text-white font-semibold text-lg mb-2">No saved items</h2>
                <button onClick={() => handleNav('discover')} className="mt-4 px-6 py-3 bg-accent-mint text-bg-primary font-semibold rounded-2xl text-sm">
                  Discover Products
                </button>
              </div>
            ) : (
              <div className="px-5 mb-24 flex flex-col gap-3">
                {wishlisted.map(p => (
                  <div key={p.id} className="flex gap-3 bg-bg-card rounded-2xl p-3 cursor-pointer hover:bg-bg-elevated transition-colors" onClick={() => setSelected(p)}>
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-muted text-xs">{p.brand}</p>
                      <h3 className="text-white font-semibold text-sm truncate">{p.name}</h3>
                      <span className="text-accent-mint font-bold text-sm">{p.currency}{p.price.toLocaleString()}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); toggleWishlist(p.id); }}
                      className="w-7 h-7 rounded-full bg-bg-primary/50 flex items-center justify-center">
                      <Heart size={12} className="fill-accent-pink text-accent-pink" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {backendOk === false && (
        <div className="bg-red-500/15 border-b border-red-500/20 px-4 py-2 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle size={12} /> Backend offline. Run:
          <code className="bg-bg-card px-1.5 py-0.5 rounded text-[10px]">cd fitfinder-langgraph/backend && python main.py</code>
        </div>
      )}

      {/* Desktop — 3 panel */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        <div className="w-56 flex-shrink-0 flex flex-col border-r border-white/5 py-6">
          <div className="px-5 mb-8 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-mint flex items-center justify-center">
              <Sparkles size={15} className="text-bg-primary" />
            </div>
            <div>
              <span className="text-white font-bold text-base">FitFinder</span>
              <div className="text-[9px] font-medium flex items-center gap-1 mt-0.5">
                <span className="text-text-muted">LangGraph</span>
                {geminiConfigured && <span className="text-accent-mint flex items-center gap-0.5"><Zap size={8} />Gemini</span>}
              </div>
            </div>
          </div>
          <nav className="flex flex-col gap-1 px-2">
            {NAV.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => handleNav(id)}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all',
                  tab === id ? 'bg-accent-mint/15 text-accent-mint' : 'text-text-secondary hover:bg-white/5 hover:text-white')}>
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
                {tab === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-mint" />}
              </button>
            ))}
          </nav>
          <div className="mt-auto px-4 pb-2">
            <div className="flex items-center gap-3 bg-bg-card rounded-2xl p-3">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" alt="" className="w-8 h-8 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">Rahul Sharma</p>
                <p className="text-text-muted text-[10px]">85% complete</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 flex-shrink-0 overflow-y-auto scrollbar-hide border-r border-white/5">
            <DiscoverPage products={products} loading={productsLoading} wishlist={wishlist}
              onWishlist={toggleWishlist} onProductSelect={setSelected}
              onSearchSubmit={handleSearchSubmit} onNavigate={handleNav} />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide border-r border-white/5">
            {selected ? (
              <ProductDetails product={selected} fitPreference={fitPref} wishlist={wishlist}
                onWishlist={toggleWishlist} onBack={() => setSelected(null)} onProductSelect={setSelected} />
            ) : (
              <AgentSearchPanel key={aiQuery} initialQuery={aiQuery} measurements={measurements}
                fitPreference={fitPref} wishlist={wishlist} onWishlist={toggleWishlist}
                onProductSelect={setSelected} geminiConfigured={geminiConfigured} />
            )}
          </div>
          <div className="w-80 flex-shrink-0 overflow-y-auto scrollbar-hide">
            <FitProfile measurements={measurements} fitPreference={fitPref}
              onUpdate={(m, fp) => { setMeasurements(m); setFitPref(fp); }} />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-5 pt-4 pb-3 glass border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-mint flex items-center justify-center">
              <Sparkles size={12} className="text-bg-primary" />
            </div>
            <span className="text-white font-bold">FitFinder</span>
            {geminiConfigured && (
              <span className="text-[9px] font-semibold text-accent-mint bg-accent-mint/15 px-1.5 py-0.5 rounded-full">Gemini</span>
            )}
          </div>
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" alt=""
            className="w-8 h-8 rounded-xl object-cover cursor-pointer border border-white/10"
            onClick={() => handleNav('profile')} />
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-hide">{renderPanel(tab)}</main>
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5">
          <div className="flex items-center justify-around py-2 px-4">
            {NAV.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => handleNav(id)} className="flex flex-col items-center gap-1 py-1 px-3 group">
                <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center transition-all', tab === id ? 'bg-accent-mint/20' : 'group-hover:bg-white/5')}>
                  <Icon size={18} className={cn('transition-colors', tab === id ? 'text-accent-mint' : 'text-text-secondary')} />
                </div>
                <span className={cn('text-[9px] font-medium', tab === id ? 'text-accent-mint' : 'text-text-muted')}>{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
