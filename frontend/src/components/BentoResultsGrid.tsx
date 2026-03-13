import { useMemo } from "react";
import { ExternalLink } from "lucide-react";

export interface ResultItem {
  id: string;
  title: string;
  description: string;
  score: number;
  url?: string;
  category?: string;
}

interface BentoResultsGridProps {
  results?: ResultItem[];
  isLoading?: boolean;
}

const SkeletonCard = ({ wide }: { wide?: boolean }) => (
  <div className="skeleton-card" style={{ gridColumn: wide ? "span 2" : undefined, minHeight: wide ? 190 : 155 }}>
    <div className="skeleton-block" style={{ height: 8, width: "28%", marginBottom: 12 }} />
    <div className="skeleton-block" style={{ height: 13, width: "78%" }} />
    <div className="skeleton-block" style={{ height: 10, width: "94%" }} />
    <div className="skeleton-block" style={{ height: 10, width: "58%" }} />
    <div className="skeleton-block" style={{ height: 2, width: "100%", marginTop: 14 }} />
  </div>
);

const ResultCard = ({ result, rank, isTop }: { result: ResultItem; rank: number; isTop: boolean }) => (
  <article className={`result-card${isTop ? " top-match" : ""}`}>
    <div className="card-rank">
      <span>#{String(rank).padStart(2, "0")}</span>
      {isTop && <span className="rank-badge">Top match</span>}
      {result.category && <span className="card-category">{result.category}</span>}
    </div>
    <h3 className="card-title">{result.title}</h3>
    <p className="card-desc">{result.description}</p>
    <div className="card-footer">
      <div className="score-bar-wrap">
        <div className="score-bar-fill" style={{ width: `${result.score}%` }} />
      </div>
      <span className="score-num">{result.score}%</span>
      {result.url && (
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--ash)", marginLeft: 10, display: "flex", alignItems: "center", transition: "color 0.12s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--mint)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--ash)")}
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink size={11} strokeWidth={1.5} />
        </a>
      )}
    </div>
  </article>
);

export const BentoResultsGrid = ({ results = [], isLoading = false }: BentoResultsGridProps) => {
  const sorted = useMemo(() => [...results].sort((a, b) => b.score - a.score), [results]);
  const topIds = useMemo(() => new Set(sorted.slice(0, 2).map(r => r.id)), [sorted]);

  if (isLoading) {
    return (
      <>
        <div className="results-header" style={{ opacity: 0.4 }}>
          <span className="label">Loading results…</span>
        </div>
        <div className="skeleton-grid">
          <SkeletonCard wide /><SkeletonCard /><SkeletonCard />
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </>
    );
  }

  if (!sorted.length) {
    return (
      <div className="empty-state">
        <div className="empty-cross" />
        <p className="empty-text">No query — run a search to see results</p>
      </div>
    );
  }

  const topCount = sorted.filter(r => topIds.has(r.id)).length;

  return (
    <>
      <div className="results-header">
        <span className="results-count">
          <strong>{sorted.length}</strong> result{sorted.length !== 1 ? "s" : ""}&ensp;·&ensp;ranked by relevance
        </span>
        <span className="label label-mint">{topCount} top match{topCount !== 1 ? "es" : ""}</span>
      </div>
      <div className="bento-grid">
        {sorted.map((r, i) => (
          <ResultCard key={r.id} result={r} rank={i + 1} isTop={topIds.has(r.id)} />
        ))}
      </div>
    </>
  );
};
