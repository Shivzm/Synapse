import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";

interface ExpandingSearchBarProps {
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  recentSearches?: string[];
  trendingSearches?: string[];
}

export const ExpandingSearchBar = ({
  onSearch,
  isLoading = false,
  recentSearches = ["ML models", "Ranking algorithms", "Performance metrics"],
  trendingSearches = ["Neural embeddings", "Vector search", "Semantic ranking"],
}: ExpandingSearchBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<"recent" | "trending">("recent");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions =
    activeTab === "recent" ? recentSearches : trendingSearches;
  const showDropdown = isExpanded && isFocused && !isLoading;

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
        if (!query) setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [query]);

  const handleSearch = (searchQuery = query) => {
  if (searchQuery.trim()) {
    onSearch?.(searchQuery);
    setIsFocused(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur(); // ← removes focus from input so dropdown can't reopen
  }
};

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        handleSearch(suggestions[highlightedIndex]);
        setQuery(suggestions[highlightedIndex]);
      } else {
        handleSearch();
      }
      setHighlightedIndex(-1);
    }
    if (e.key === "Escape") {
      setIsFocused(false);
      setIsExpanded(false);
      setQuery("");
      setHighlightedIndex(-1);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setIsFocused(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClear = () => {
    if (query) {
      setQuery("");
      inputRef.current?.focus();
    } else {
      setIsExpanded(false);
      setIsFocused(false);
      setQuery("");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center h-20"
    >
      <motion.div
        className="relative"
        animate={{ width: isExpanded ? "min(600px, 90vw)" : "52px" }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      >
        {/* Outer ambient glow */}
        <motion.div
          className="absolute -inset-1 rounded-full blur-xl pointer-events-none"
          animate={{
            opacity: isLoading ? 0.6 : isExpanded ? 0.3 : 0,
            background: isLoading
              ? "radial-gradient(ellipse, rgba(0,255,194,0.4) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(0,255,194,0.2) 0%, transparent 70%)",
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Main pill */}
        <motion.div
          className={`
            relative rounded-full h-[52px]
            flex items-center gap-3
            glass border backdrop-blur-2xl
            transition-colors duration-300 overflow-hidden
            ${
              isLoading
                ? "border-mint-glow/60 shadow-[0_0_30px_rgba(0,255,194,0.35)]"
                : isExpanded
                  ? "border-mint-glow/35 shadow-[0_0_20px_rgba(0,255,194,0.15)]"
                  : "border-mint-muted/25 hover:border-mint-muted/40"
            }
          `}
          style={{
            paddingLeft: isExpanded ? "1.25rem" : "0",
            paddingRight: isExpanded ? "0.75rem" : "0",
          }}
          onClick={!isExpanded ? handleExpand : undefined}
        >
          {/* Loading conic border */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, #00FFC2 60deg, #45A29E 120deg, transparent 180deg)",
                  padding: "1.5px",
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.2 },
                  rotate: { duration: 1.8, repeat: Infinity, ease: "linear" },
                }}
              />
            )}
          </AnimatePresence>

          {/* Search icon */}
          <motion.div
            className="shrink-0 flex items-center justify-center"
            animate={{
              x: isExpanded ? 0 : "calc(52px / 2 - 50%)",
              color: isLoading
                ? "rgba(0, 255, 194, 1)"
                : isExpanded
                  ? "rgba(0, 255, 194, 0.8)"
                  : "rgba(69, 162, 158, 0.7)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            whileHover={!isExpanded ? { scale: 1.15 } : {}}
          >
            <motion.div
              animate={{ rotate: isLoading ? [0, -15, 15, 0] : 0 }}
              transition={{
                duration: 0.5,
                repeat: isLoading ? Infinity : 0,
                repeatDelay: 0.8,
              }}
            >
              <Search size={18} strokeWidth={2.2} />
            </motion.div>
          </motion.div>

          {/* Input */}
          <AnimatePresence>
            {isExpanded && (
              <motion.input
                ref={inputRef}
                type="text"
                placeholder={
                  isLoading ? "Searching the abyss..." : "Search anything..."
                }
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-mint-muted/35 font-mono text-sm min-w-0"
                disabled={isLoading}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          {/* Right side actions */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="flex items-center gap-1 shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Char count hint */}
                {query.length > 0 && !isLoading && (
                  <motion.span
                    className="text-xs font-mono text-mint-muted/30 pr-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {query.length}
                  </motion.span>
                )}

                {/* Search submit button */}
                {query.trim() && !isLoading && (
                  <motion.button
                    onClick={() => handleSearch()}
                    className="p-1.5 rounded-full bg-mint-glow/20 border border-mint-glow/40 text-mint-glow hover:bg-mint-glow/30 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                  >
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </motion.button>
                )}

                {/* Clear / Close */}
                <motion.button
                  onClick={handleClear}
                  className="p-1.5 rounded-full hover:bg-mint-muted/10 text-mint-muted/50 hover:text-mint-muted transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <X size={14} strokeWidth={2} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-3 rounded-2xl glass border border-mint-muted/20 backdrop-blur-2xl overflow-hidden"
              style={{
                boxShadow:
                  "0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,255,194,0.05)",
              }}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {/* Tab bar */}
              <div className="flex border-b border-mint-muted/10 px-3 pt-3">
                {(["recent", "trending"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setHighlightedIndex(-1);
                    }}
                    className={`
                      relative flex items-center gap-1.5 px-3 pb-2.5 text-xs font-mono uppercase tracking-widest transition-colors
                      ${activeTab === tab ? "text-mint-glow" : "text-mint-muted/40 hover:text-mint-muted/70"}
                    `}
                  >
                    {tab === "recent" ? (
                      <Clock size={10} />
                    ) : (
                      <TrendingUp size={10} />
                    )}
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-px bg-mint-glow"
                        layoutId="activeTab"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Suggestions */}
              <div className="p-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{
                      opacity: 0,
                      x: activeTab === "trending" ? 10 : -10,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {suggestions.map((item, i) => (
                      <motion.button
                        key={item}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                          transition-colors duration-150 group
                          ${
                            highlightedIndex === i
                              ? "bg-mint-glow/10 text-mint-glow"
                              : "text-text-primary hover:bg-mint-muted/8 hover:text-mint-glow"
                          }
                        `}
                        onClick={() => {
                          setQuery(item);
                          handleSearch(item);
                        }}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        onMouseLeave={() => setHighlightedIndex(-1)}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        {/* Icon */}
                        <span
                          className={`shrink-0 transition-colors ${highlightedIndex === i ? "text-mint-glow" : "text-mint-muted/30"}`}
                        >
                          {activeTab === "recent" ? (
                            <Clock size={12} />
                          ) : (
                            <TrendingUp size={12} />
                          )}
                        </span>

                        {/* Label with query highlight */}
                        <span className="flex-1 text-sm font-mono">
                          {query &&
                          item.toLowerCase().includes(query.toLowerCase()) ? (
                            <>
                              {item.substring(
                                0,
                                item.toLowerCase().indexOf(query.toLowerCase()),
                              )}
                              <span className="text-mint-glow font-bold">
                                {item.substring(
                                  item
                                    .toLowerCase()
                                    .indexOf(query.toLowerCase()),
                                  item
                                    .toLowerCase()
                                    .indexOf(query.toLowerCase()) +
                                    query.length,
                                )}
                              </span>
                              {item.substring(
                                item
                                  .toLowerCase()
                                  .indexOf(query.toLowerCase()) + query.length,
                              )}
                            </>
                          ) : (
                            item
                          )}
                        </span>

                        {/* Arrow on hover */}
                        <motion.span
                          className="shrink-0 text-mint-glow/40"
                          animate={{
                            opacity: highlightedIndex === i ? 1 : 0,
                            x: highlightedIndex === i ? 0 : -4,
                          }}
                          transition={{ duration: 0.15 }}
                        >
                          <ArrowRight size={12} />
                        </motion.span>
                      </motion.button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-mint-muted/8 flex items-center gap-3">
                <span className="text-xs font-mono text-mint-muted/25">
                  ↑↓ navigate
                </span>
                <span className="text-xs font-mono text-mint-muted/25">
                  ↵ select
                </span>
                <span className="text-xs font-mono text-mint-muted/25">
                  esc close
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
