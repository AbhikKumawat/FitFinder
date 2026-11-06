// API client for FitFinder LangGraph backend
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Measurements {
  height: number; chest: number; waist: number;
  hips: number; shoulders: number; foot_length: number; unit: string;
}

export interface Product {
  id: string; name: string; brand: string; price: number; currency: string;
  category: string; image: string; colors: string[]; sizes: string[];
  recommended_size: string; fit_match: number; fit_explanation: string;
  rating: number; review_count: number; description: string;
  specs: Record<string, string>; store_url: string; source: string;
}

export interface AgentLog {
  agent: string; status: 'idle' | 'running' | 'done' | 'error'; message: string;
}

export interface SearchFilters {
  min_price: number | null; max_price: number | null;
  keywords: string[]; category: string | null;
}

export interface SearchResult {
  products: Product[]; summary: string;
  agent_logs: AgentLog[]; filters: SearchFilters;
}

export interface HealthResult {
  status: string; gemini_configured: boolean; mode: string;
}

// ── REST endpoints ────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<HealthResult> {
  const r = await fetch(`${BASE}/api/health`);
  return r.json();
}

export async function getAllProducts(): Promise<Product[]> {
  const r = await fetch(`${BASE}/api/products`);
  const data = await r.json();
  return data.products ?? [];
}

export async function searchProducts(
  query: string,
  measurements: Measurements,
  fitPreference: string,
): Promise<SearchResult> {
  const r = await fetch(`${BASE}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, measurements, fit_preference: fitPreference }),
  });
  if (!r.ok) throw new Error(`Search failed: ${r.status}`);
  return r.json();
}

// ── SSE streaming search ──────────────────────────────────────────────────────
export function streamSearch(
  query: string,
  measurements: Measurements,
  fitPreference: string,
  callbacks: {
    onAgentStart?: (log: AgentLog) => void;
    onAgentDone?: (log: AgentLog) => void;
    onResult?: (result: { products: Product[]; summary: string; filters: SearchFilters }) => void;
    onError?: (err: string) => void;
  },
): () => void {
  const params = new URLSearchParams({
    query,
    measurements: JSON.stringify(measurements),
    fit_preference: fitPreference,
  });
  const es = new EventSource(`${BASE}/api/search/stream?${params}`);

  es.addEventListener('agent_start', (e) => {
    try { callbacks.onAgentStart?.(JSON.parse(e.data)); } catch {}
  });
  es.addEventListener('agent_done', (e) => {
    try { callbacks.onAgentDone?.(JSON.parse(e.data)); } catch {}
  });
  es.addEventListener('result', (e) => {
    try { callbacks.onResult?.(JSON.parse(e.data)); } catch {}
    es.close();
  });
  es.addEventListener('error', (e: MessageEvent) => {
    try { callbacks.onError?.(JSON.parse(e.data)?.error ?? 'Unknown error'); } catch {}
    es.close();
  });
  es.onerror = () => { callbacks.onError?.('Connection to backend lost'); es.close(); };

  // Return a cleanup function
  return () => es.close();
}
