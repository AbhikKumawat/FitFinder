import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Sparkles, CheckCircle, Loader2, XCircle,
  ChevronDown, ChevronUp, IndianRupee, Tag, X, PackageSearch,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Product, AgentStatus } from '../types';
import { ProductCard } from './ProductCard';
import { PRODUCTS } from '../data/products';

interface AgentSearchPanelProps {
  initialQuery?: string;
  wishlist: Set<string>;
  onWishlist: (id: string) => void;
  onProductSelect: (product: Product) => void;
}

interface ParsedQuery {
  minPrice: number | null;
  maxPrice: number | null;
  keywords: string[];
  rawPriceLabel: string | null;
}

// ─── Natural-language query parser ────────────────────────────────────────────
function parseQuery(raw: string): ParsedQuery {
  let q = raw.toLowerCase().trim();
  let minPrice: number | null = null;
  let maxPrice: number | null = null;
  let rawPriceLabel: string | null = null;

  // Strip currency symbols so we match plain numbers too
  q = q.replace(/₹|rs\.?|inr/gi, '').replace(/,/g, '');

  // Patterns:  "under X"  "below X"  "less than X"  "upto X"  "up to X"
  const underPattern = /(?:under|below|less\s+than|upto|up\s+to)\s+(\d+(?:\.\d+)?)/i;
  // Patterns:  "above X"  "over X"  "more than X"  "greater than X"  "above X"
  const overPattern  = /(?:above|over|more\s+than|greater\s+than|from)\s+(\d+(?:\.\d+)?)/i;
  // Pattern:   "between X and Y"
  const betweenPattern = /between\s+(\d+(?:\.\d+)?)\s+(?:and|to|-)\s+(\d+(?:\.\d+)?)/i;
  // Pattern:   "X to Y"  "X - Y"
  const rangePattern = /(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)/i;

  let match: RegExpMatchArray | null;

  if ((match = q.match(betweenPattern))) {
    minPrice = parseFloat(match[1]);
    maxPrice = parseFloat(match[2]);
    rawPriceLabel = `₹${minPrice.toLocaleString()} – ₹${maxPrice.toLocaleString()}`;
    q = q.replace(betweenPattern, ' ');
  } else if ((match = q.match(rangePattern))) {
    // Only treat as price range if both numbers are plausible prices (> 50)
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2]);
    if (a > 50 && b > 50 && b > a) {
      minPrice = a;
      maxPrice = b;
      rawPriceLabel = `₹${a.toLocaleString()} – ₹${b.toLocaleString()}`;
      q = q.replace(rangePattern, ' ');
    }
  } else {
    if ((match = q.match(underPattern))) {
      maxPrice = parseFloat(match[1]);
      rawPriceLabel = `Under ₹${maxPrice.toLocaleString()}`;
      q = q.replace(underPattern, ' ');
    }
    if ((match = q.match(overPattern))) {
      minPrice = parseFloat(match[1]);
      rawPriceLabel = rawPriceLabel
        ? rawPriceLabel + ` & Above ₹${minPrice.toLocaleString()}`
        : `Above ₹${minPrice.toLocaleString()}`;
      q = q.replace(overPattern, ' ');
    }
  }

  // Remove filler words, then split into meaningful keywords
  const FILLERS = [
    'that', 'fit', 'me', 'perfectly', 'for', 'my', 'with', 'a', 'an', 'the',
    'good', 'best', 'nice', 'perfect', 'some', 'in', 'on', 'at', 'and', 'or',
    'want', 'need', 'find', 'show', 'give', 'get', 'buy', 'looking', 'search',
    'please', 'can', 'you', 'help', 'budget', 'price', 'range', 'around',
    'approximately', 'roughly', 'size',
  ];

  const keywords = q
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length > 1 && !FILLERS.includes(w));

  return { minPrice, maxPrice, keywords, rawPriceLabel };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const AGENTS: Omit<AgentStatus, 'status' | 'message'>[] = [
  { id: 'amazon', name: 'Amazon Agent',  icon: '🛒' },
  { id: 'myntra', name: 'Myntra Agent',  icon: '🛍️' },
  { id: 'hm',     name: 'H&M Agent',     icon: '👔' },
  { id: 'fit',    name: 'Fit Agent',     icon: '📐' },
  { id: 'ranking',name: 'Ranking Agent', icon: '🏆' },
];

const AGENT_MESSAGES: Record<string, [string, string, string]> = {
  amazon:  ['Searching products…',          'Found 234 results',          'Filtering by size chart…'],
  myntra:  ['Connecting to catalogue…',     'Comparing size charts…',     'Found 189 matches'],
  hm:      ['Fetching H&M inventory…',      'Analysing garment measurements…', 'Matched 97 items'],
  fit:     ['Loading your profile…',        'Calculating personalised size…', 'Fit analysis complete'],
  ranking: ['Scoring fit confidence…',      'Ranking by match quality…',  'Finding best matches'],
};

type SearchPhase = 'idle' | 'searching' | 'done';

const SUGGESTIONS = [
  'Black jeans under ₹2,000',
  'White shirt under ₹1,500',
  'Running shoes under ₹5,000',
  'Oversized tee under ₹1,000',
  'Jacket between ₹3,000 and ₹8,000',
];

// ─── Component ────────────────────────────────────────────────────────────────
export const AgentSearchPanel: React.FC<AgentSearchPanelProps> = ({
  initialQuery = '',
  wishlist,
  onWishlist,
  onProductSelect,
}) => {
  const [query,       setQuery]       = useState(initialQuery);
  const [phase,       setPhase]       = useState<SearchPhase>('idle');
  const [agents,      setAgents]      = useState<AgentStatus[]>(
    AGENTS.map((a) => ({ ...a, status: 'idle', message: '' }))
  );
  const [results,     setResults]     = useState<Product[]>([]);
  const [noResults,   setNoResults]   = useState(false);
  const [showAgents,  setShowAgents]  = useState(true);
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
  const timerRefs = useRef<number[]>([]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      runSearch(initialQuery);
    }
    return () => timerRefs.current.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSearch = (q: string) => {
    if (!q.trim()) return;
    setPhase('searching');
    setResults([]);
    setNoResults(false);
    setParsedQuery(null);
    setShowAgents(true);

    setAgents(AGENTS.map((a) => ({ ...a, status: 'idle', message: 'Waiting…' })));

    // Animate each agent sequentially
    AGENTS.forEach((agent, idx) => {
      const msgs = AGENT_MESSAGES[agent.id];
      const t0   = idx * 900;

      const t1 = window.setTimeout(() =>
        setAgents((prev) => prev.map((a) =>
          a.id === agent.id ? { ...a, status: 'running', message: msgs[0] } : a
        )), t0);

      const t2 = window.setTimeout(() =>
        setAgents((prev) => prev.map((a) =>
          a.id === agent.id ? { ...a, message: msgs[1] } : a
        )), t0 + 350);

      const t3 = window.setTimeout(() =>
        setAgents((prev) => prev.map((a) =>
          a.id === agent.id ? { ...a, status: 'done', message: msgs[2] } : a
        )), t0 + 850);

      timerRefs.current.push(t1, t2, t3);
    });

    // Finalise results after all agents finish
    const finalDelay = AGENTS.length * 900 + 400;
    const tf = window.setTimeout(() => {
      const parsed = parseQuery(q);
      setParsedQuery(parsed);

      const filtered = PRODUCTS.filter((p) => {
        // ── Price gates ──────────────────────────────────────────
        if (parsed.maxPrice !== null && p.price > parsed.maxPrice) return false;
        if (parsed.minPrice !== null && p.price < parsed.minPrice) return false;

        // ── Keyword gates (if any keywords extracted) ────────────
        if (parsed.keywords.length === 0) return true;   // only price filter — show all matches

        return parsed.keywords.some((kw) =>
          p.name.toLowerCase().includes(kw)     ||
          p.brand.toLowerCase().includes(kw)    ||
          p.category.toLowerCase().includes(kw) ||
          kw.includes(p.category)               ||
          kw.includes(p.brand.toLowerCase())
        );
      });

      // Sort by fit score descending
      const sorted = [...filtered].sort((a, b) => b.fitMatch - a.fitMatch);

      if (sorted.length === 0) {
        setNoResults(true);
        setResults([]);
      } else {
        setResults(sorted);
        setNoResults(false);
      }
      setPhase('done');
    }, finalDelay);

    timerRefs.current.push(tf);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    timerRefs.current.forEach(clearTimeout);
    runSearch(query);
  };

  const clearSearch = () => {
    timerRefs.current.forEach(clearTimeout);
    setQuery('');
    setPhase('idle');
    setResults([]);
    setNoResults(false);
    setParsedQuery(null);
  };

  const StatusIcon = ({ status }: { status: AgentStatus['status'] }) => {
    switch (status) {
      case 'running': return <Loader2    size={12} className="text-accent-yellow animate-spin" />;
      case 'done':    return <CheckCircle size={12} className="text-accent-mint" />;
      case 'error':   return <XCircle    size={12} className="text-red-400" />;
      default:        return <div className="w-3 h-3 rounded-full bg-text-muted/40" />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-white font-bold text-xl mb-1 flex items-center gap-2">
          <Sparkles size={20} className="text-accent-purple" />
          AI Fit Search
        </h1>
        <p className="text-text-secondary text-xs">
          Describe what you're looking for — our AI agents search across all supported platforms.
        </p>
      </div>

      {/* ── Search input ── */}
      <div className="px-5 mb-5 flex-shrink-0">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-bg-card rounded-2xl px-4 py-3 border border-white/5">
              <Search size={16} className="text-text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder='e.g. "black jeans under ₹2,000 that fit me"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-text-muted outline-none"
              />
              {query && (
                <button type="button" onClick={clearSearch} className="text-text-muted hover:text-white transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!query.trim() || phase === 'searching'}
              className={cn(
                'flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all duration-200',
                phase === 'searching'
                  ? 'bg-accent-purple/50 text-white/70 cursor-wait'
                  : 'bg-accent-purple text-white hover:bg-accent-purple/90 active:scale-[0.98]'
              )}
            >
              {phase === 'searching'
                ? <><Loader2 size={15} className="animate-spin" /> Searching across platforms…</>
                : <><Sparkles size={15} /> Search with AI</>}
            </button>
          </div>
        </form>

        {/* Quick suggestions */}
        {phase === 'idle' && (
          <div className="mt-3">
            <p className="text-text-muted text-xs mb-2">Try:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="px-3 py-1.5 bg-bg-card rounded-xl text-xs text-text-secondary border border-white/8 hover:border-accent-purple/40 hover:text-white transition-colors"
                  onClick={() => { setQuery(s); runSearch(s); }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Active filter chips ── */}
      {phase === 'done' && parsedQuery && (
        <div className="px-5 mb-3 flex-shrink-0 flex flex-wrap gap-2">
          {parsedQuery.rawPriceLabel && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-mint/15 border border-accent-mint/30 text-accent-mint text-xs font-semibold">
              <IndianRupee size={10} /> {parsedQuery.rawPriceLabel}
            </span>
          )}
          {parsedQuery.keywords.map((kw) => (
            <span key={kw} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-purple/15 border border-accent-purple/30 text-accent-purple text-xs font-semibold">
              <Tag size={10} /> {kw}
            </span>
          ))}
        </div>
      )}

      {/* ── Agent status panel ── */}
      {phase !== 'idle' && (
        <div className="px-5 mb-5 flex-shrink-0">
          <button
            className="flex items-center justify-between w-full mb-3"
            onClick={() => setShowAgents(!showAgents)}
          >
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                phase === 'searching' ? 'bg-accent-yellow animate-pulse' : 'bg-accent-mint'
              )} />
              {phase === 'searching' ? 'Agents Working…' : 'Search Complete'}
            </h3>
            {showAgents
              ? <ChevronUp   size={14} className="text-text-muted" />
              : <ChevronDown size={14} className="text-text-muted" />}
          </button>

          {showAgents && (
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={cn(
                    'flex items-center gap-3 bg-bg-card rounded-xl px-3 py-2.5 border transition-all duration-300',
                    agent.status === 'running'
                      ? 'border-accent-yellow/30 bg-accent-yellow/5'
                      : agent.status === 'done'
                      ? 'border-accent-mint/20'
                      : 'border-white/5'
                  )}
                >
                  <span className="text-base">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium">{agent.name}</p>
                    <p className="text-text-muted text-[10px] truncate">{agent.message}</p>
                  </div>
                  <StatusIcon status={agent.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── No results state ── */}
      {phase === 'done' && noResults && (
        <div className="px-5 mb-10 flex-shrink-0">
          <div className="bg-bg-card rounded-3xl p-6 flex flex-col items-center text-center border border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-accent-yellow/15 flex items-center justify-center mb-4">
              <PackageSearch size={28} className="text-accent-yellow" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">No products found</h3>

            {/* Show exactly what filters were applied */}
            <div className="flex flex-wrap gap-2 justify-center my-3">
              {parsedQuery?.rawPriceLabel && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-mint/15 border border-accent-mint/30 text-accent-mint text-xs font-semibold">
                  <IndianRupee size={10} /> {parsedQuery.rawPriceLabel}
                </span>
              )}
              {parsedQuery?.keywords.map((kw) => (
                <span key={kw} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-purple/15 border border-accent-purple/30 text-accent-purple text-xs font-semibold">
                  <Tag size={10} /> {kw}
                </span>
              ))}
            </div>

            <p className="text-text-secondary text-xs leading-relaxed mb-5">
              None of our demo products match these filters right now.
              {parsedQuery?.maxPrice !== null && (
                <> Try increasing your budget or browsing all products.</>
              )}
            </p>

            {/* Smart suggestions based on what they searched */}
            {parsedQuery && parsedQuery.keywords.length > 0 && (
              <div className="w-full">
                <p className="text-text-muted text-xs mb-2">Try without the price limit:</p>
                <button
                  className="w-full py-2.5 rounded-2xl bg-accent-purple/20 text-accent-purple font-semibold text-sm hover:bg-accent-purple/30 transition-colors"
                  onClick={() => {
                    const keywordOnly = parsedQuery.keywords.join(' ');
                    setQuery(keywordOnly);
                    runSearch(keywordOnly);
                  }}
                >
                  Search "{parsedQuery.keywords.join(' ')}" — any price
                </button>
              </div>
            )}

            <button
              className="mt-2 w-full py-2.5 rounded-2xl bg-bg-elevated text-text-secondary font-medium text-sm hover:bg-bg-elevated/80 transition-colors"
              onClick={clearSearch}
            >
              Clear & start over
            </button>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {phase === 'done' && results.length > 0 && (
        <div className="px-5 mb-24 flex-shrink-0">
          <h3 className="text-white font-semibold text-sm mb-3">
            {results.length} {results.length === 1 ? 'Product' : 'Products'} Found — Best Fit First
          </h3>
          <div className="flex flex-col gap-3">
            {results.map((product) => (
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
      )}
    </div>
  );
};
