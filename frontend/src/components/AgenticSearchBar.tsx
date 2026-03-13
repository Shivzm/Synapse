import { useState, useRef, useEffect } from "react";
import { Search, ArrowRight, X } from "lucide-react";

const SUGGESTIONS = [
  { label: "Electronics trending",       tag: "trending" },
  { label: "Fashion new arrivals",        tag: "new"      },
  { label: "Performance benchmarks",      tag: "perf"     },
  { label: "AI-driven recommendations",  tag: "ai"       },
  { label: "Vector search ranking",       tag: "search"   },
];

interface AgenticSearchBarProps {
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export const AgenticSearchBar = ({ onSearch, isLoading = false }: AgenticSearchBarProps) => {
  const [query, setQuery]   = useState("");
  const [open, setOpen]     = useState(false);
  const [hiIdx, setHiIdx]   = useState(-1);
  const inputRef            = useRef<HTMLInputElement>(null);
  const containerRef        = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submit = (q = query) => {
    if (!q.trim()) return;
    onSearch?.(q);
    setOpen(false);
    setHiIdx(-1);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter")      { filtered[hiIdx] ? submit(filtered[hiIdx].label) : submit(); }
    if (e.key === "Escape")     { setOpen(false); setQuery(""); }
    if (e.key === "ArrowDown")  { e.preventDefault(); setHiIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setHiIdx(i => Math.max(i - 1, -1)); }
  };

  const filtered = query
    ? SUGGESTIONS.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))
    : SUGGESTIONS;

  const highlight = (label: string) => {
    if (!query) return label;
    const lo = label.toLowerCase();
    const idx = lo.indexOf(query.toLowerCase());
    if (idx === -1) return label;
    return (
      <>
        {label.slice(0, idx)}
        <span style={{ color: "var(--mint)" }}>{label.slice(idx, idx + query.length)}</span>
        {label.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="search-container" ref={containerRef}>
      <div style={{ position: "relative" }}>
        <span className="search-icon" style={{ color: isLoading ? "var(--mint)" : undefined }}>
          <Search size={14} strokeWidth={isLoading ? 2.5 : 1.5} />
        </span>

        <input
          ref={inputRef}
          type="text"
          className={`search-field${isLoading ? " loading" : ""}`}
          placeholder={isLoading ? "PROCESSING QUERY..." : "ENTER SEARCH QUERY..."}
          value={query}
          onChange={e => { setQuery(e.target.value); setHiIdx(-1); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          disabled={isLoading}
        />

        <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 2 }}>
          {query && !isLoading && (
            <button className="search-submit" onClick={() => { setQuery(""); inputRef.current?.focus(); }}>
              <X size={13} strokeWidth={1.5} />
            </button>
          )}
          <button className="search-submit" onClick={() => submit()} disabled={isLoading || !query.trim()}>
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="search-meta">
        <span className="label">
          {isLoading
            ? <span style={{ color: "var(--mint)" }}>● SEARCHING</span>
            : "Synapse / semantic search"
          }
        </span>
        {query && (
          <span className="label" style={{ color: "var(--ash)" }}>
            {query.length} chars · ↑↓ navigate · ↵ select
          </span>
        )}
      </div>

      {open && !isLoading && filtered.length > 0 && (
        <div className="search-suggestions">
          {filtered.map((s, i) => (
            <div
              key={s.label}
              className={`suggestion-item${hiIdx === i ? " highlighted" : ""}`}
              onMouseEnter={() => setHiIdx(i)}
              onMouseLeave={() => setHiIdx(-1)}
              onMouseDown={() => { setQuery(s.label); submit(s.label); }}
            >
              <span>{highlight(s.label)}</span>
              <span className="suggestion-tag">{s.tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
