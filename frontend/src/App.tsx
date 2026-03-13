import { useState } from "react";
import "./App.css";
import { KnowledgeGraphBackground } from "./components/KnowledgeGraphBackground";
import { NeuralNavigation }         from "./components/NeuralNavigation";
import { AgenticSearchBar }         from "./components/AgenticSearchBar";
import { BentoResultsGrid }         from "./components/BentoResultsGrid";
import { FilteringSidebar }         from "./components/FilteringSidebar";
import { PerformanceDashboard }     from "./components/PerformanceDashboard";
import { NeuralButton }             from "./components/NeuralButton";
import type { ResultItem }          from "./components/BentoResultsGrid";

const MOCK_RESULTS: ResultItem[] = [
  { id: "1", title: "Advanced Ranking Algorithms",    description: "Deep dive into how modern search engines rank results using machine learning and relevance scoring.",                        score: 95, category: "Ranking",  url: "#" },
  { id: "2", title: "Vector Search Foundations",      description: "Implementing semantic search using dense vector embeddings and approximate nearest-neighbour algorithms.",                  score: 90, category: "Search",   url: "#" },
  { id: "3", title: "Building Scalable Search",       description: "Architecture patterns for deploying search infrastructure at massive scale without latency regressions.",                   score: 88, category: "Perf",    url: "#" },
  { id: "4", title: "Neural Networks for Search",     description: "Using transformers and attention mechanisms to improve search relevance at scale.",                                        score: 85, category: "AI",      url: "#" },
  { id: "5", title: "ML-Based Personalization",       description: "Personalizing results using online learning models and real-time user signals.",                                           score: 82, category: "ML",      url: "#" },
  { id: "6", title: "Search Query Optimization",      description: "Techniques for reducing P99 latency and improving throughput in high-volume production search systems.",                   score: 78, category: "Perf",    url: "#" },
];

function App() {
  const [filterOpen, setFilterOpen]   = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults]         = useState<ResultItem[]>([]);

  const handleSearch = (_query: string) => {
    setIsSearching(true);
    setTimeout(() => {
      setResults(MOCK_RESULTS);
      setIsSearching(false);
    }, 900);
  };

  const avgConfidence = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0;

  return (
    <div style={{ minHeight: "100vh", paddingLeft: 52 }}>
      <KnowledgeGraphBackground />
      <NeuralNavigation />

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <header className="app-header">
          <div className="wordmark">
            <span className="wordmark-slash">/</span>
            SYNAPSE
            <span style={{ color: "var(--ash)", fontWeight: 300 }}></span>
          </div>
          <div className="header-actions">
            {results.length > 0 && (
              <NeuralButton variant="secondary" size="sm" onClick={() => setResults([])}>
                Clear
              </NeuralButton>
            )}
            <button className="header-btn" onClick={() => setFilterOpen(true)}>
              Filters
            </button>
          </div>
        </header>

        {/* Search section */}
        <section style={{ padding: "28px 24px 22px", borderBottom: "1px solid var(--rule)" }}>
          <div style={{ marginBottom: 8 }}>
            <span className="label">Query</span>
          </div>
          <AgenticSearchBar onSearch={handleSearch} isLoading={isSearching} />
        </section>

        {/* Results */}
        <main style={{ flex: 1, padding: "20px 24px 120px" }}>
          <BentoResultsGrid results={results} isLoading={isSearching} />
        </main>
      </div>

      <FilteringSidebar isOpen={filterOpen} onClose={() => setFilterOpen(false)} />
      <PerformanceDashboard
        isSearching={isSearching}
        hasResults={results.length > 0}
        confidenceScore={avgConfidence}
        inferenceSpeed={85}
      />
    </div>
  );
}

export default App;
