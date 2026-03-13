import { useState } from "react";
import "./App.css";
import {
  KnowledgeGraphBackground,
  NeuralButton,
  AgenticSearchBar,
  BentoResultsGrid,
  FilteringSidebar,
  NeuralNavigation,
  PerformanceDashboard,
} from "./components";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  score: number;
  url?: string;
  category?: string;
}

function App() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Mock search handler - replace with actual API call
  const handleSearch = async (_query: string) => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setResults([
        {
          id: "1",
          title: "Advanced Ranking Algorithms",
          description:
            "Deep dive into how modern search engines rank results using machine learning and relevance scoring.",
          score: 95,
          category: "Ranking",
          url: "#",
        },
        {
          id: "2",
          title: "Neural Networks for Search",
          description:
            "Using transformers and attention mechanisms to improve search relevance.",
          score: 87,
          category: "AI",
          url: "#",
        },
        {
          id: "3",
          title: "Building Scalable Search",
          description:
            "Architecture patterns for deploying search at massive scale.",
          score: 92,
          category: "Performance",
          url: "#",
        },
        {
          id: "4",
          title: "Search Optimization",
          description:
            "Tips and tricks for optimizing search query execution and latency.",
          score: 78,
          category: "Performance",
          url: "#",
        },
        {
          id: "5",
          title: "ML-Based Personalization",
          description:
            "How to personalize search results using machine learning models.",
          score: 85,
          category: "ML",
          url: "#",
        },
        {
          id: "6",
          title: "Vector Search",
          description: "Implementing semantic search using vector embeddings.",
          score: 90,
          category: "Search",
          url: "#",
        },
      ]);
      setIsSearching(false);
    }, 800);
  };

  const handleFilterChange = (filters: Record<string, boolean>) => {
    console.log("Filters applied:", filters);
    // Filter results based on selected filters
  };

  // Calculate average confidence score from results
  const averageConfidence =
    results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.score, 0) / results.length,
        )
      : 0;

  // Simulate inference speed (in real scenario, would come from backend)
  const inferenceSpeedMs = isSearching ? 95 : 85;

  return (
    <div className="relative w-full min-h-screen">
      {/* Background animation layer */}
      <KnowledgeGraphBackground />

      {/* Neural Navigation Sidebar */}
      <NeuralNavigation
        onCategoryChange={(categoryId) => {
          setActiveCategory(categoryId);
          console.log("Category changed to:", categoryId);
        }}
      />

      {/* Main content - accounting for sidebar */}
      <div className="relative z-10 w-full min-h-screen flex flex-col pl-24">
        {/* Header */}
        <header className="pt-8 px-6 flex items-center justify-between">
          <div className="font-mono font-bold text-2xl text-mint-glow tracking-wider">
            VESPA SEARCH
          </div>
          <NeuralButton onClick={() => setIsFilterOpen(true)} size="sm">
            FILTERS
          </NeuralButton>
        </header>

        {/* Search bar section */}
        <section className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-4xl px-6">
            <AgenticSearchBar onSearch={handleSearch} isLoading={isSearching} />
          </div>
        </section>

        {/* Results section */}
        <section className="flex-1 px-6 pb-12">
          <div className="max-w-6xl mx-auto">
            <BentoResultsGrid results={results} isLoading={isSearching} />
          </div>
        </section>

        {/* Footer with action buttons */}
        {results.length > 0 && (
          <footer className="px-6 py-8 flex items-center justify-center gap-4">
            <NeuralButton
              variant="secondary"
              size="md"
              onClick={() => {
                setResults([]);
              }}
            >
              CLEAR
            </NeuralButton>
            <NeuralButton
              size="md"
              onClick={() => {
                handleSearch("new search");
              }}
              onSuccess={() => console.log("Search completed!")}
            >
              NEW SEARCH
            </NeuralButton>
          </footer>
        )}
      </div>

      {/* Filtering sidebar */}
      <FilteringSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilterChange={handleFilterChange}
      />

      {/* Performance Dashboard */}
      <PerformanceDashboard
        isSearching={isSearching}
        hasResults={results.length > 0}
        confidenceScore={averageConfidence}
        inferenceSpeed={inferenceSpeedMs}
      />
    </div>
  );
}

export default App;
