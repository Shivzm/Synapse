import { motion } from "framer-motion";
import { useState } from "react";
import { ExternalLink } from "lucide-react";

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

const ScoreRing = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <svg width="100" height="100" className="transform -rotate-90">
      {/* Background ring */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="rgba(69, 162, 158, 0.2)"
        strokeWidth="3"
      />
      {/* Progress ring */}
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#scoreGradient)"
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFC2" />
          <stop offset="100%" stopColor="#45A29E" />
        </linearGradient>
      </defs>
      {/* Score text */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        className="fill-mint-glow font-mono text-sm font-bold"
        fontSize="18"
      >
        {Math.round(score)}%
      </text>
    </svg>
  );
};

const ResultCard = ({
  result,
  index,
}: {
  result: ResultItem;
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  // Staggered entrance animation
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
    },
  };

  // Card size varies - some are larger
  const isLarge = index % 4 === 0 || index % 4 === 3;
  const isMedium = index % 4 === 1;

  const sizeClasses = isLarge
    ? "col-span-2 row-span-2"
    : isMedium
      ? "col-span-1 row-span-2"
      : "col-span-1 row-span-1";

  return (
    <motion.div
      className={`${sizeClasses} h-full`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      transition={{
        delay: index * 0.05,
        duration: 0.4,
        ease: "easeOut",
      }}
    >
      <motion.div
        className="
          glass rounded-xl p-6 h-full
          flex flex-col justify-between
          cursor-pointer group relative overflow-hidden
          border border-mint-muted/20
          hover:border-mint-glow/40
        "
        onMouseEnter={() => {
          setIsHovered(true);
          setDisplayScore(result.score);
        }}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{
          y: -5,
          transition: { duration: 0.3 },
        }}
      >
        {/* Inner shadow on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow: "inset 0 0 20px rgba(0, 255, 194, 0.1)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        {/* Category badge */}
        {result.category && (
          <motion.div
            className="inline-flex w-fit px-3 py-1 rounded-full bg-mint-muted/10 border border-mint-muted/30 mb-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-xs font-mono text-mint-muted uppercase">
              {result.category}
            </span>
          </motion.div>
        )}

        {/* Content */}
        <div>
          <h3 className="text-lg font-bold text-text-primary mb-2 leading-tight line-clamp-2 group-hover:text-mint-glow transition-colors">
            {result.title}
          </h3>
          <p className="text-sm text-mint-muted/70 line-clamp-3">
            {result.description}
          </p>
        </div>

        {/* Footer with score and link */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-mint-muted/10">
          {isHovered ? (
            <div className="w-24">
              <ScoreRing score={displayScore} />
            </div>
          ) : (
            <div className="text-mint-glow font-mono font-bold text-lg">
              {result.score}%
            </div>
          )}

          {result.url && (
            <motion.a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-mint-glow/10 text-mint-glow hover:bg-mint-glow/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink size={18} />
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
  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <motion.div
          className="flex gap-2"
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-mint-glow"
              variants={{
                initial: { y: 0 },
                animate: { y: -10 },
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-mint-muted/50">
        <p className="font-mono text-center">
          Configure your search and hit enter to see results
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-4 gap-4 auto-rows-max">
        {results.map((result, index) => (
          <ResultCard key={result.id} result={result} index={index} />
        ))}
      </div>
    </motion.div>
  );
};
