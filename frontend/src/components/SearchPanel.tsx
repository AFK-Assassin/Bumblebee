"use client";
import { useState } from "react";
import { Search, Loader2, Layers } from "lucide-react";
import { semanticSearch } from "@/lib/api";
import type { SearchResult } from "@/types";

export default function SearchPanel() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true); setError(""); setSearched(false);
    try {
      const res = await semanticSearch(query.trim(), topK);
      setResults(res.results);
      setSearched(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const getDistColor = (d: number) => {
    if (d < 0.2) return "text-green-400";
    if (d < 0.5) return "text-bee-yellow";
    return "text-red-400";
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-5 space-y-5">
      <div className="bg-bee-card border border-bee-border rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-semibold text-bee-yellow tracking-widest">SEMANTIC SEARCH</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search across all your documents…"
            className="bee-glow flex-1 bg-bee-dark border border-bee-border rounded-lg px-3 py-2 text-sm text-bee-text placeholder-bee-muted focus:outline-none"
          />
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="bg-bee-dark border border-bee-border rounded-lg px-2 py-2 text-sm text-bee-text focus:outline-none focus:border-bee-yellow"
          >
            {[3,5,8,10].map(n => <option key={n} value={n}>Top {n}</option>)}
          </select>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-bee-yellow to-bee-amber text-bee-dark text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg shadow-bee-yellow/20"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 text-sm text-red-400">
          ❌ {error}
        </div>
      )}

      {searched && (
        <div className="bg-bee-card border border-bee-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-bee-yellow tracking-widest">
              RESULTS
            </h3>
            <span className="text-[10px] text-bee-muted">{results.length} match{results.length !== 1 ? "es" : ""}</span>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-6 text-bee-muted text-sm">
              <Layers size={28} className="mx-auto mb-2 opacity-30" />
              <p>No matching chunks found. Try a different query.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={r.chunk_id} className="border border-bee-border rounded-lg p-4 space-y-2 animate-fade-up hover:border-bee-yellow/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] text-bee-muted flex-shrink-0">#{i + 1}</span>
                      <span className="text-sm text-bee-text font-medium truncate">{r.title}</span>
                    </div>
                    <span className={`text-xs font-mono flex-shrink-0 ${getDistColor(r.distance)}`}>
                      {r.distance.toFixed(4)}
                    </span>
                  </div>
                  <p className="text-[12px] text-bee-muted leading-relaxed line-clamp-4">{r.text}</p>
                  <div className="flex gap-3 text-[10px] text-bee-muted">
                    <span>DOC: {r.document_id}</span>
                    <span>CHUNK: {r.chunk_id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
