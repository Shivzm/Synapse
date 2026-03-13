import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Zap, Activity, Brain } from "lucide-react";

interface PerformanceDashboardProps {
  isSearching?: boolean;
  hasResults?: boolean;
  confidenceScore?: number;
  inferenceSpeed?: number;
}

const PerformanceRing = ({
  value,
  label,
  size = 80,
}: {
  value: number;
  label: string;
  size?: number;
}) => {
  const circumference = 2 * Math.PI * (size / 2 - 5);
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: "drop-shadow(0 0 10px rgba(0, 255, 194, 0.3))" }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 5}
          fill="none"
          stroke="rgba(69, 162, 158, 0.2)"
          strokeWidth="2"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 5}
          fill="none"
          stroke="url(#perfGradient)"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
          }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="perfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFC2" />
            <stop offset="100%" stopColor="#45A29E" />
          </linearGradient>
        </defs>
        {/* Value text */}
        <text
          x={size / 2}
          y={size / 2 + 4}
          textAnchor="middle"
          className="fill-mint-glow font-mono font-bold"
          fontSize={size / 3}
        >
          {Math.round(value)}%
        </text>
      </svg>
      <p className="text-xs font-mono text-mint-muted mt-2">{label}</p>
    </div>
  );
};

export const PerformanceDashboard = ({
  isSearching = false,
  hasResults = false,
  confidenceScore = 85,
  inferenceSpeed = 92,
}: PerformanceDashboardProps) => {
  const avgLatency = 42;
  const [celebratedOnce, setCelebratedOnce] = useState(false);

  // Trigger confetti on successful search completion
  useEffect(() => {
    if (hasResults && !isSearching && !celebratedOnce && confidenceScore > 80) {
      handleCelebration();
      setCelebratedOnce(true);
    }
  }, [hasResults, isSearching, celebratedOnce, confidenceScore]);

  // Reset celebration flag when searching again
  useEffect(() => {
    if (isSearching) {
      setCelebratedOnce(false);
    }
  }, [isSearching]);

  const handleCelebration = () => {
    // Digital rain confetti - mints and cyans instead of party colors
    const colors = ["#00FFC2", "#45A29E", "#00FF88", "#1FFFA0"];

    // Multiple bursts for more dramatic effect

    const defaults = {
      startVelocity: 30,
      spread: 60,
      ticks: 60,
      zIndex: 0,
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const createBurst = () => {
      confetti(
        Object.assign({}, defaults, {
          particleCount: 40,
          origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0, 0.5) },
          colors: colors,
        }),
      );
    };

    // Create multiple bursts
    for (let i = 0; i < 3; i++) {
      setTimeout(createBurst, i * 300);
    }
  };

  // Simulate inference speed pulse
  const [simulatedSpeed, setSimulatedSpeed] = useState(inferenceSpeed);

useEffect(() => {
  if (!isSearching) {
    setSimulatedSpeed(inferenceSpeed);
    return;
  }
  const interval = setInterval(() => {
    setSimulatedSpeed(inferenceSpeed + Math.sin(Date.now() / 300) * 5);
  }, 100);
  return () => clearInterval(interval);
}, [isSearching, inferenceSpeed]);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Outer glow container */}
      <div
        className="relative p-6 rounded-2xl glass border border-mint-glow/30 backdrop-blur-xl"
        style={{
          boxShadow:
            "0 0 30px rgba(0, 255, 194, 0.2), inset 0 0 20px rgba(0, 255, 194, 0.05)",
        }}
      >
        {/* Animated background pulse */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-mint-glow/10 to-transparent"
          animate={{
            opacity: isSearching ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{
                rotate: isSearching ? 360 : 0,
              }}
              transition={{
                duration: isSearching ? 2 : 0.5,
                repeat: isSearching ? Infinity : 0,
                ease: "linear",
              }}
            >
              <Brain size={16} className="text-mint-glow" />
            </motion.div>
            <h3 className="text-xs font-mono font-bold text-mint-glow uppercase tracking-wider">
              System Status
            </h3>
          </div>

          {/* Metrics Grid */}
          <div className="flex items-center gap-6">
            {/* Confidence Score Ring */}
            <div>
              <PerformanceRing
                value={confidenceScore}
                label="Confidence"
                size={70}
              />
            </div>

            {/* Stats Column */}
            <div className="flex flex-col gap-3">
              {/* Inference Speed */}
              <motion.div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-mint-glow/10 border border-mint-glow/30"
                animate={{
                  boxShadow: isSearching
                    ? "0 0 15px rgba(0, 255, 194, 0.4)"
                    : "0 0 5px rgba(0, 255, 194, 0.2)",
                }}
              >
                <Zap size={12} className="text-mint-glow" />
                <span className="text-xs font-mono text-mint-muted">
                  Speed:{" "}
                  <span className="text-mint-glow font-bold">
                    {Math.round(simulatedSpeed)}ms
                  </span>
                </span>
              </motion.div>

              {/* Latency */}
              <motion.div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-mint-muted/10 border border-mint-muted/30"
                animate={{
                  backgroundColor: isSearching
                    ? "rgba(0, 255, 194, 0.15)"
                    : "rgba(69, 162, 158, 0.1)",
                }}
              >
                <Activity size={12} className="text-mint-muted" />
                <span className="text-xs font-mono text-mint-muted/70">
                  Latency:{" "}
                  <span className="text-mint-muted font-bold">
                    {avgLatency}ms
                  </span>
                </span>
              </motion.div>

              {/* Status Badge */}
              <motion.div
                className={`px-2 py-1 rounded text-xs font-mono font-bold text-center ${
                  isSearching
                    ? "bg-mint-glow/20 text-mint-glow"
                    : "bg-mint-muted/10 text-mint-muted"
                }`}
                animate={{
                  opacity: isSearching ? [0.6, 1, 0.6] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: isSearching ? Infinity : 0,
                }}
              >
                {isSearching
                  ? "⚡ PROCESSING"
                  : hasResults
                    ? "✓ READY"
                    : "○ IDLE"}
              </motion.div>
            </div>
          </div>

          {/* Confetti trigger indicator */}
          {hasResults && confidenceScore > 80 && !isSearching && (
            <motion.div
              className="mt-3 pt-3 border-t border-mint-glow/20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs font-mono text-mint-glow/70">
                🎆 High Confidence Match!
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating particles around dashboard on activity */}
      {isSearching && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-mint-glow/40"
              initial={{
                x: 0,
                y: 0,
                opacity: 0.8,
              }}
              animate={{
                x: Math.cos((i * Math.PI * 2) / 3) * 40,
                y: Math.sin((i * Math.PI * 2) / 3) * 40,
                opacity: 0,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};
