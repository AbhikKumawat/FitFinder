import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Sparkles, CheckCircle, Loader2, XCircle,
  ChevronDown, ChevronUp, IndianRupee, Tag, X, PackageSearch, Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { streamSearch, type Product, type AgentLog, type Measurements, type SearchFilters } from '../api/client';

interface AgentSearchPanelProps {
  initialQuery?: string;
  measurements: Measurements;
  fitPreference: string;
  wishlist: Set<string>;
  onWishlist: (id: string) => void;
  onProductSelect: (p: Product) => void;
  geminiConfigured: boolean;
}

const AGENTS = [
  { id: 'amazon',  name: 'Amazon Agent',  icon: '🛒' },
  { id: 'myntra',  name: 'Myntra Agent',  icon: '🛍️' },
  { id: 'hm',      name: 'H&M Agent',     icon: '👔' },
  { id: 'zara',    name: 'Zara Agent',    icon: '🛍️' },
  { id: 'nike',    name: 'Nike Agent',    icon: '👟' },
  { id: 'adidas',  name: 'Adidas Agent',  icon: '👟' },
  { id: 'fit',     name: 'Fit Agent',     icon: '📐' },
  { id: 'ranking', name: 'Ranking Agent', icon: '🏆' },
];

type Phase = 'idle' | 'searching' | 'done';

const SUGGESTIONS = [
  'Black jeans under ₹2,000',
  'White shirt under ₹1,500',
  'Running shoes under ₹5,000',
  'Oversized tee under ₹1,000',
  'Jacket between ₹3,000 and ₹8,000',
];

export const AgentSearchPanel: React.FC<AgentSearchPanelProps> = ({
  initialQuery = '', measurements, fitPreference,
  wishlist, onWishlist, onProductSelect, geminiConfigured,
}) => {
  const [query, setQuery]       = useState(initialQuery);
  const [phase, setPhase]       = useState<Phase>('idle');
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentLog>>({});
  const [results, setResults]   = useState<Product[]>([]);
  const [summary, setSummary]   = useState('');
  const [filters, setFilters]   = useState<SearchFilters | null>(null);
  const [showAgents, setShowAgents] = useState(true);
  const [noResults, setNoResults] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (initialQuery) { setQuery(initialQuery); runSearch(initialQuery); }
    return () => cleanupRef.current?.();
  }, []);

  const runSearch = (q: string) => {
    if (!q.trim()) return;
    cleanupRef.current?.();
    setPhase('searching');
    setResults([]); setNoResults(false); setError(null); setSummary('');
    setFilters(null); setShowAgents(true);

    // Reset all agent statuses to running
    const initial: Record<string, AgentLog> = {};
    AGENTS.forEach(a => { initial[a.name] = { agent: a.name, status: 'running', message: 'Waiting…' }; });
    setAgentStatuses(initial);

    cleanupRef.current = streamSearch(q, measurements, fitPreference, {
      onAgentStart: (log) => setAgentStatuses(prev => ({ ...prev, [log.agent]: { ...log, status: 'running' } })),
      onAgentDone:  (log) => setAgentStatuses(prev => ({ ...prev, [log.agent]: { ...log, status: 'done' } })),
      onResult: ({ products, summary: s, filters: f }) => {
        setResults(products);
        setSummary(s);
        setFilters(f);
        setNoResults(products.length === 0);
        setPhase('done');
      },
      onError: (err) => { setError(err); setPhase('done'); },
    });
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); runSearch(query); };
  const clear = () => { cleanupRef.current?.(); setQuery(''); setPhase('idle'); setResults([]); setNoResults(false); setError(null); setFilters(null); };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-white font-bold text-xl mb-1 flex items-center gap-2">
          <Sparkles size={20} className="text-accent-purple" /> AI Fit Search
          {geminiConfigured && (
            <span className="text-[10px] font-semibold bg-accent-mint/20 text-accent-mint px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap size={9} /> Gemini Powered
            </span>
          )}
        </h1>
        <p className="text-text-secondary text-xs">
          {geminiConfigured
            ? 'Real AI agents powered by Gemini search and analyse across all platforms.'
            : 'Demo mode — add GOOGLE_API_KEY to backend .env for Gemini-powered AI analysis.'}
        </p>
      </div>

      {/* Search input */}
      <div className="px-5 mb-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-bg-card rounded-2xl px-4 py-3 border border-white/5">
            <Search size={16} className="text-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder='e.g. "black jeans under ₹2,000 that fit me"'
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-text-muted outline-none"
            />
            {query && <button type="button" onClick={clear}><X size={14} className="text-text-muted hover:text-white" /></button>}
          </div>
          <button
            type="submit"
            disabled={!query.trim() || phase === 'searching'}
            className={cn(
              'flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all',
              phase === 'searching'
                ? 'bg-accent-purple/50 text-white/70 cursor-wait'
                : 'bg-accent-purple text-white hover:bg-accent-purple/90',
            )}
          >
            {phase === 'searching'
              ? <><Loader2 size={15} className="animate-spin" /> Agents searching…</>
              : <><Sparkles size={15} /> Search with AI</>}
          </button>
        </form>

        {phase === 'idle' && (
          <div className="mt-3">
            <p className="text-text-muted text-xs mb-2">Try:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => { setQuery(s); runSearch(s); }}
                  className="px-3 py-1.5 bg-bg-card rounded-xl text-xs text-text-secondary border border-white/8 hover:border-accent-purple/40 hover:text-white transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {phase === 'done' && filters && (
        <div className="px-5 mb-3 flex-shrink-0 flex flex-wrap gap-2">
          {filters.max_price && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent-mint/15 border border-accent-mint/30 text-accent-mint text-xs font-semibold">
              <IndianRupee size={9} /> Under ₹{filters.max_price.toLocaleString()}
            </span>
          )}
          {filters.min_price && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent-mint/15 border border-accent-mint/30 text-accent-mint text-xs font-semibold">
              <IndianRupee size={9} /> Above ₹{filters.min_price.toLocaleString()}
            </span>
          )}
          {filters.keywords?.map(kw => (
            <span key={kw} className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent-purple/15 border border-accent-purple/30 text-accent-purple text-xs font-semibold">
              <Tag size={9} /> {kw}
            </span>
          ))}
        </div>
      )}

      {/* Agent statuses */}
      {phase !== 'idle' && (
        <div className="px-5 mb-5 flex-shrink-0">
          <button className="flex items-center justify-between w-full mb-3" onClick={() => setShowAgents(v => !v)}>
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', phase === 'searching' ? 'bg-accent-yellow animate-pulse' : 'bg-accent-mint')} />
              {phase === 'searching' ? 'LangGraph Agents Running…' : 'Graph Execution Complete'}
            </h3>
            {showAgents ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
          </button>
          {showAgents && (
            <div className="space-y-2">
              {AGENTS.map(agent => {
                const log = agentStatuses[agent.name];
                const status: 'running' | 'done' | 'error' | 'idle' = log?.status ?? 'idle';
                return (
                  <div key={agent.id} className={cn(
                    'flex items-center gap-3 bg-bg-card rounded-xl px-3 py-2.5 border transition-all duration-300',
                    status === 'running' ? 'border-accent-yellow/30 bg-accent-yellow/5' :
                    status === 'done'    ? 'border-accent-mint/20' : 'border-white/5',
                  )}>
                    <span className="text-base">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium">{agent.name}</p>
                      <p className="text-text-muted text-[10px] truncate">{log?.message ?? 'Waiting…'}</p>
                    </div>
                    {status === 'running' && <Loader2 size={12} className="text-accent-yellow animate-spin" />}
                    {status === 'done'    && <CheckCircle size={12} className="text-accent-mint" />}
                    {status === 'error'   && <XCircle size={12} className="text-red-400" />}
                    {status === 'idle'    && <div className="w-3 h-3 rounded-full bg-text-muted/40" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {phase === 'done' && summary && (
        <div className="px-5 mb-3 flex-shrink-0">
          <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-2xl p-3">
            <p className="text-text-secondary text-xs leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-5 mb-4 flex-shrink-0">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-300">{error}</div>
        </div>
      )}

      {/* No results */}
      {phase === 'done' && noResults && !error && (
        <div className="px-5 mb-10 flex-shrink-0">
          <div className="bg-bg-card rounded-3xl p-6 flex flex-col items-center text-center border border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-accent-yellow/15 flex items-center justify-center mb-4">
              <PackageSearch size={28} className="text-accent-yellow" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">No products found</h3>
            <p className="text-text-secondary text-xs leading-relaxed mb-4">{summary || 'Try a broader search or remove the price filter.'}</p>
            <button onClick={clear} className="px-5 py-2.5 rounded-2xl bg-bg-elevated text-text-secondary text-sm font-medium hover:text-white transition-colors">
              Clear & try again
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {phase === 'done' && results.length > 0 && (
        <div className="px-5 mb-24 flex-shrink-0">
          <h3 className="text-white font-semibold text-sm mb-3">
            {results.length} Products Found — Best Fit First
          </h3>
          <div className="flex flex-col gap-3">
            {results.map(p => (
              <ProductListCard key={p.id} product={p} wishlist={wishlist} onWishlist={onWishlist} onSelect={onProductSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function ProductListCard({ product: p, wishlist, onWishlist, onSelect }: {
  product: Product; wishlist: Set<string>;
  onWishlist: (id: string) => void; onSelect: (p: Product) => void;
}) {
  const isW = wishlist.has(p.id);
  const scoreColor = p.fit_match >= 90 ? '#8BC58D' : p.fit_match >= 75 ? '#FFD67E' : '#F49BC1';
  return (
    <div className="flex gap-3 bg-bg-card rounded-2xl p-3 cursor-pointer hover:bg-bg-elevated transition-colors group"
      onClick={() => onSelect(p)}>
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
        <a href={p.store_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-accent-purple hover:underline"
          onClick={e => e.stopPropagation()}>
          Visit {p.source} ↗
        </a>
      </div>
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <span className="text-xs font-bold" style={{ color: scoreColor }}>{p.fit_match}%</span>
        <button className="w-7 h-7 rounded-full bg-bg-primary/50 flex items-center justify-center hover:bg-bg-primary transition-colors"
          onClick={e => { e.stopPropagation(); onWishlist(p.id); }}>
          <span className={cn('text-xs', isW ? 'text-red-400' : 'text-text-muted')}>♥</span>
        </button>
      </div>
    </div>
  );
}
