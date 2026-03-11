import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

interface ExpandingSearchBarProps {
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export const ExpandingSearchBar = ({
  onSearch,
  isLoading = false,
}: ExpandingSearchBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
    if (e.key === "Escape") {
      setIsExpanded(false);
      setQuery("");
    }
  };

  return (
    <div className="relative flex justify-center items-center h-20">
      <motion.div
        className="relative"
        animate={{ width: isExpanded ? "90%" : "50px" }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        {/* Main search container */}
        <motion.div
          className={`
            glass relative rounded-full h-14
            flex items-center px-4 gap-3
            ${isLoading ? "border-mint-glow/50" : "border-mint-muted/30"}
            ${
              isLoading
                ? "shadow-lg shadow-mint-glow/20"
                : "hover:shadow-md hover:shadow-mint-glow/10"
            }
            transition-all duration-300
          `}
          style={{
            boxShadow: isLoading ? "0 0 20px rgba(0, 255, 194, 0.3)" : "none",
          }}
        >
          {/* Rotating glow border when loading */}
          {isLoading && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 0deg, var(--accent-mint), var(--accent-cyan), var(--accent-mint))",
                padding: "1px",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Search icon */}
          <motion.div
            animate={{
              color: isLoading
                ? "rgba(0, 255, 194, 0.8)"
                : "rgba(69, 162, 158, 0.6)",
            }}
          >
            <Search size={20} />
          </motion.div>

          {/* Input field */}
          {isExpanded ? (
            <motion.input
              type="text"
              placeholder="Search anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="
                flex-1 bg-transparent outline-none text-text-primary
                placeholder:text-mint-muted/40 font-mono text-sm
              "
              autoFocus
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            />
          ) : null}

          {/* Close/Clear button */}
          {isExpanded && (
            <motion.button
              onClick={() => {
                if (query) {
                  setQuery("");
                } else {
                  setIsExpanded(false);
                }
              }}
              className="p-1 hover:bg-mint-glow/10 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={16} className="text-mint-muted" />
            </motion.button>
          )}
        </motion.div>

        {/* Expanded search overlay with suggestions */}
        {isExpanded && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-4 bg-carbon-charcoal rounded-lg p-4 border border-mint-muted/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-mint-muted/60 text-xs font-mono mb-3">
              Recent searches
            </div>
            <div className="space-y-2">
              {["ML models", "Ranking algorithms", "Performance metrics"].map(
                (item) => (
                  <motion.div
                    key={item}
                    className="text-text-primary text-sm cursor-pointer p-2 rounded hover:bg-mint-glow/10 transition-colors"
                    onClick={() => {
                      setQuery(item);
                      handleSearch();
                    }}
                    whileHover={{ x: 5 }}
                  >
                    {item}
                  </motion.div>
                ),
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Trigger button when collapsed */}
      {!isExpanded && (
        <motion.button
          onClick={() => setIsExpanded(true)}
          className="absolute inset-0 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        />
      )}
    </div>
  );
};
