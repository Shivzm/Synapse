import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ExternalLink, Zap } from "lucide-react";

interface ResultItem {
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

// ✅ Fix 1: Move gradient defs outside SVG to avoid duplicate IDs when multiple ScoreRings render
const ScoreRingDefs = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00FFC2" />
        <stop offset="100%" stopColor="#45A29E" />
      </linearGradient>
    </defs>
  </svg>
);

const ScoreRing = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <svg width="90" height="90" className="transform -rotate-90">
      {/* Track ring */}
      <circle
        cx="45"
        cy="45"
        r="38"
        fill="none"
        stroke="rgba(69, 162, 158, 0.15)"
        strokeWidth="4"
      />
      {/* Progress ring */}
      <motion.circle
        cx="45"
        cy="45"
        r="38"
        fill="none"
        stroke="url(#scoreGradient)"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1, ease: "easeOut" }}
        strokeLinecap="round"
      />
      {/* Score text - counter-rotate to stay upright */}
      <text
        x="45"
        y="52"
        textAnchor="middle"
        fill="#00FFC2"
        fontSize="16"
        fontFamily="monospace"
        fontWeight="bold"
        className="rotate-90"
        style={{ transform: "rotate(90deg)", transformOrigin: "45px 45px" }}
      >
        {Math.round(score)}%
      </text>
    </svg>
  );
};

const SkeletonCard = ({ isLarge }: { isLarge: boolean }) => (
  <div
    className={`${isLarge ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}`}
  >
    <motion.div
      className="h-full rounded-xl border border-mint-muted/10 overflow-hidden"
      style={{ minHeight: isLarge ? "260px" : "140px" }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="h-full bg-gradient-to-br from-mint-muted/5 to-transparent p-5 flex flex-col gap-3">
        <div className="h-3 w-16 rounded-full bg-mint-muted/20" />
        <div className="h-5 w-3/4 rounded-full bg-mint-muted/15" />
        <div className="h-3 w-full rounded-full bg-mint-muted/10" />
        <div className="h-3 w-2/3 rounded-full bg-mint-muted/10" />
      </div>
    </motion.div>
  </div>
);

const ResultCard = ({
  result,
  index,
  isTopMatch,
}: {
  result: ResultItem;
  index: number;
  isTopMatch: boolean;
}) => {

  const [isHovered, setIsHovered] = useState(false);
  // Top matches take col-span-2, regular take col-span-1
  // No row-span — let height be natural, no overlapping
  const sizeClasses = isTopMatch ? "col-span-2" : "col-span-1";

  // Score color based on value
  const scoreColor =
    result.score >= 80
      ? "text-mint-glow"
      : result.score >= 60
        ? "text-yellow-400"
        : "text-orange-400";

  return (
    <motion.div
      className={`${sizeClasses}`}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      <motion.div
        className={`
          glass rounded-xl h-full
          flex flex-col justify-between
          cursor-pointer group relative overflow-hidden
          border transition-colors duration-300
          ${isTopMatch ? "border-mint-glow/40 ring-1 ring-mint-glow/10" : "border-mint-muted/15"}
          hover:border-mint-glow/50
        `}
        style={{
          minHeight: isTopMatch ? "220px" : "160px",
          padding: isTopMatch ? "1.5rem" : "1.1rem",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{
          y: -6,
          transition: { duration: 0.25, ease: "easeOut" },
        }}
      >
        {/* Ambient glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? isTopMatch
                ? "0 0 40px rgba(0,255,194,0.12), inset 0 0 30px rgba(0,255,194,0.06)"
                : "0 0 20px rgba(0,255,194,0.08), inset 0 0 15px rgba(0,255,194,0.04)"
              : "none",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Scanline texture for top match */}
        {isTopMatch && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #00FFC2, #00FFC2 1px, transparent 1px, transparent 4px)",
            }}
          />
        )}

        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Top Match badge */}
            {isTopMatch && (
              <motion.span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-mint-glow/15 border border-mint-glow/50 text-mint-glow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.07 }}
              >
                <Zap size={10} fill="currentColor" />
                Top Match
              </motion.span>
            )}

            {/* Category */}
            {result.category && (
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider bg-mint-muted/10 border border-mint-muted/25 text-mint-muted">
                {result.category}
              </span>
            )}
          </div>

          {/* Score pill (when not hovered) */}
          <AnimatePresence mode="wait">
            {!isHovered && (
              <motion.span
                key="score-pill"
                className={`shrink-0 font-mono font-bold text-sm ${scoreColor}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {result.score}%
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className={`
              font-bold leading-snug mb-2 group-hover:text-mint-glow transition-colors duration-200
              ${isTopMatch ? "text-lg line-clamp-2" : "text-base line-clamp-2"}
            `}
          >
            {result.title}
          </h3>
          <p className="text-mint-muted/60 text-xs leading-relaxed line-clamp-3 font-mono">
            {result.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-mint-muted/10">
          {/* Score ring on hover */}
          <AnimatePresence mode="wait">
            {isHovered ? (
              <motion.div
                key="ring"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                <ScoreRing score={result.score} />
              </motion.div>
            ) : (
              // ✅ Fix 2: removed displayScore state — use result.score directly
              <motion.div
                key="bar"
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-20 h-1 rounded-full bg-mint-muted/15 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-mint-glow to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score}%` }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.07,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {result.url && (
            <motion.a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-mint-glow/10 text-mint-glow hover:bg-mint-glow/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
            </motion.a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const BentoResultsGrid = ({
  results = [],
  isLoading = false,
}: BentoResultsGridProps) => {
  // ✅ Fix 3: useMemo to avoid re-sorting on every render
  const topMatchIds = useMemo(() => {
    const sorted = [...results].sort((a, b) => b.score - a.score);
    return new Set(sorted.slice(0, 2).map((r) => r.id));
  }, [results]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-6 h-10 w-48 rounded-lg bg-mint-muted/10 animate-pulse" />
        <div className="grid grid-cols-4 gap-4 auto-rows-max">
          <SkeletonCard isLarge={true} />
          <SkeletonCard isLarge={false} />
          <SkeletonCard isLarge={false} />
          <SkeletonCard isLarge={false} />
          <SkeletonCard isLarge={false} />
        </div>
      </div>
    );
  }

  if (!results.length) {
    return (
      <motion.div
        className="w-full h-80 flex flex-col items-center justify-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-12 h-12 rounded-full border border-mint-muted/20 flex items-center justify-center">
          <Zap size={20} className="text-mint-muted/30" />
        </div>
        <p className="font-mono text-sm text-mint-muted/40 text-center">
          Configure your search and hit enter to see results
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {/* Shared gradient defs — rendered once for all ScoreRings */}
      <ScoreRingDefs />

      {/* Header */}
      <motion.div
        className="mb-6 flex items-end justify-between"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h2 className="text-lg font-bold text-text-primary font-mono tracking-widest uppercase mb-0.5">
            Search Results
          </h2>
          <p className="text-xs text-mint-muted/50 font-mono">
            {results.length} result{results.length !== 1 ? "s" : ""} &mdash;
            ranked by relevance
          </p>
        </div>
        <span className="text-xs font-mono text-mint-glow/50 border border-mint-glow/20 px-2.5 py-1 rounded-full">
          {results.filter((r) => topMatchIds.has(r.id)).length} top match
          {results.filter((r) => topMatchIds.has(r.id)).length !== 1
            ? "es"
            : ""}
        </span>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-4 gap-3" style={{ gridAutoRows: "minmax(140px, auto)" }}>
        {results.map((result, i) => (
          <ResultCard
            key={result.id}
            result={result}
            index={i}
            isTopMatch={topMatchIds.has(result.id)}
          />
        ))}
      </div>
    </div>
  );
};
