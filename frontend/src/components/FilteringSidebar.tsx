import { motion, AnimatePresence } from "framer-motion";
import { X, Filter } from "lucide-react";
import { useState } from "react";

interface FilterOption {
  id: string;
  label: string;
  active: boolean;
}

interface FilteringSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onFilterChange?: (filters: Record<string, boolean>) => void;
}

export const FilteringSidebar = ({
  isOpen = false,
  onClose,
  onFilterChange,
}: FilteringSidebarProps) => {
  const [filters, setFilters] = useState<FilterOption[]>([
    { id: "ai", label: "AI Models", active: false },
    { id: "ranking", label: "Ranking", active: false },
    { id: "performance", label: "Performance", active: false },
    { id: "ml", label: "Machine Learning", active: false },
    { id: "search", label: "Search", active: false },
    { id: "data", label: "Data", active: false },
    { id: "recent", label: "Recent", active: false },
    { id: "trending", label: "Trending", active: false },
  ]);

  const handleToggle = (id: string) => {
    const updated = filters.map((f) =>
      f.id === id ? { ...f, active: !f.active } : f,
    );
    setFilters(updated);

    const filterMap = updated.reduce(
      (acc, f) => {
        acc[f.id] = f.active;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    onFilterChange?.(filterMap);
  };

  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
    },
    exit: {
      x: "100%",
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-screen w-80 z-50"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <div
              className="
                h-full glass border-l border-mint-muted/20
                flex flex-col
                backdrop-blur-xl
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-mint-muted/10">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-mint-glow" />
                  <h2 className="font-bold text-text-primary font-mono">
                    FILTERS
                  </h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-mint-glow/10 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={20} className="text-mint-muted" />
                </motion.button>
              </div>

              {/* Filter Options */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <div className="text-xs font-mono text-mint-muted/50 uppercase mb-4">
                  Categories
                </div>

                {filters.map((filter, index) => (
                  <motion.div
                    key={filter.id}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <label className="text-sm text-text-primary font-mono">
                      {filter.label}
                    </label>

                    {/* Sliding pill toggle */}
                    <motion.button
                      onClick={() => handleToggle(filter.id)}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors
                        ${
                          filter.active
                            ? "bg-mint-glow"
                            : "bg-carbon-charcoal border border-mint-muted/30"
                        }
                      `}
                    >
                      <motion.div
                        className={`
                          absolute top-1 w-4 h-4 rounded-full
                          ${
                            filter.active
                              ? "bg-carbon-black"
                              : "bg-mint-muted/50"
                          }
                        `}
                        animate={{
                          x: filter.active ? 20 : 2,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-mint-muted/10 p-6 flex gap-3">
                <motion.button
                  onClick={() => {
                    setFilters(filters.map((f) => ({ ...f, active: false })));
                    onFilterChange?.(
                      filters.reduce(
                        (acc, f) => {
                          acc[f.id] = false;
                          return acc;
                        },
                        {} as Record<string, boolean>,
                      ),
                    );
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-mint-muted/30 text-mint-muted hover:bg-mint-muted/10 transition-colors font-mono text-sm uppercase"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reset
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-mint-glow text-carbon-black font-mono text-sm uppercase font-bold hover:shadow-lg hover:shadow-mint-glow/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Apply
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
