import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, ISourceOptions } from "@tsparticles/engine";

interface AgenticSearchBarProps {
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export const AgenticSearchBar = ({
  onSearch,
  isLoading = false,
}: AgenticSearchBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [particlesReady, setParticlesReady] = useState(false);
  const [particleVelocity, setParticleVelocity] = useState(0.5);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const engineInitialized = useRef(false);
  const particlesRef = useRef<Container | undefined>(undefined);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Initialize tsParticles
  useEffect(() => {
    if (engineInitialized.current) return;
    engineInitialized.current = true;

    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesReady(true);
    });
  }, []);

  // Track cursor movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Refresh particles when velocity changes (uses particlesRef instead of re-render)
  useEffect(() => {
    if (particlesRef.current) {
      particlesRef.current.refresh();
    }
  }, [particleVelocity]);

  // Pause particles when idle, play when expanded
  useEffect(() => {
    if (!particlesRef.current) return;
    if (isExpanded) {
      particlesRef.current.play();
    } else {
      particlesRef.current.pause();
    }
  }, [isExpanded]);

  // Callback to capture engine instance from Particles component
  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) {
      particlesRef.current = container;
    }
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      setIsExpanded(false);
      setQuery("");
      setParticleVelocity(0.5);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.length > 0) {
      const velocity = Math.min(3, 0.5 + newQuery.length * 0.15);
      setParticleVelocity(velocity);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setParticleVelocity(0.5);
      }, 1500);
    }
  };

  const particleOptions: ISourceOptions = {
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      number: {
        value: 40,
      },
      color: { value: ["#00ffc2", "#45a29e"] },
      shape: { type: "circle" },
      opacity: { value: { min: 0.1, max: 0.4 } },
      size: { value: { min: 1, max: 3 } },
      move: {
        enable: true,
        speed: particleVelocity,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
      links: {
        enable: true,
        distance: 80,
        color: "#00ffc2",
        opacity: 0.15,
        width: 1,
      },
    },
    detectRetina: true,
    interactivity: {
      // Use cursor position to determine interaction origin
      detectsOn: "window",
      events: {
        onHover: {
          enable: true,
          mode: ["repulse", "attract"], // repulse + attract based on cursor
        },
        onClick: {
          enable: true,
          mode: "push",
        },
      },
      modes: {
        repulse: {
          distance: 120,
          duration: 0.4,
          factor: (cursorPos.x / window.innerWidth) * 3 + 0.5, // dynamic repulse based on cursor X
        },
        attract: {
          distance: 200,
          duration: 0.4,
          factor: (cursorPos.y / window.innerHeight) * 3 + 0.5, // dynamic attract based on cursor Y
        },
        push: {
          quantity: 5,
        },
      },
    },
  };

  return (
    <div className="relative w-full">
      {/* Particle background layer */}
      {particlesReady && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <Particles
            particlesLoaded={particlesLoaded} // ← captures engine instance into particlesRef
            options={particleOptions}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Search bar container */}
      <div className="relative flex justify-center items-center h-20 z-10">
        <motion.div
          className="relative"
          animate={{ width: isExpanded ? "90%" : "50px" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Glow effect */}
          {isExpanded && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-mint-glow/0 via-mint-glow/20 to-mint-muted/10 blur-2xl"
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Main search container */}
          <motion.div
            className={`
              glass relative rounded-full h-14
              flex items-center px-6 gap-3
              ${isLoading ? "border-mint-glow/70" : isExpanded ? "border-mint-glow/50" : "border-mint-muted/30"}
              ${isLoading || isExpanded ? "shadow-lg shadow-mint-glow/30" : "hover:shadow-md hover:shadow-mint-glow/10"}
              transition-all duration-300 backdrop-blur-xl
            `}
            style={{
              boxShadow: isLoading
                ? "0 0 30px rgba(0, 255, 194, 0.4), inset 0 0 20px rgba(0, 255, 194, 0.1)"
                : isExpanded
                  ? "0 0 20px rgba(0, 255, 194, 0.2)"
                  : "none",
            }}
            onClick={() => {
              if (!isExpanded) setIsExpanded(true);
            }}
          >
            {/* Animated border */}
            {(isLoading || isExpanded) && (
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: isLoading
                    ? "conic-gradient(from 0deg, var(--accent-mint), var(--accent-cyan), var(--accent-mint))"
                    : "transparent",
                  padding: isLoading ? "1px" : "0px",
                }}
                animate={{ rotate: isLoading ? 360 : 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Search icon */}
            <motion.div
              animate={{
                color: isLoading
                  ? "rgba(0, 255, 194, 0.9)"
                  : isExpanded
                    ? "rgba(0, 255, 194, 0.8)"
                    : "rgba(69, 162, 158, 0.6)",
              }}
              whileHover={{ scale: 1.1 }}
            >
              <Search size={20} strokeWidth={2.5} />
            </motion.div>

            {/* Input */}
            {isExpanded && (
              <motion.input
                type="text"
                placeholder="Search the digital abyss..."
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-mint-muted/30 font-mono text-sm"
                autoFocus
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              />
            )}

            {/* Clear / Close button */}
            {isExpanded && (
              <motion.button
                onClick={() => {
                  if (query) {
                    setQuery("");
                    setParticleVelocity(0.5);
                  } else {
                    setIsExpanded(false);
                    setParticleVelocity(0.5);
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

          {/* Suggestions dropdown */}
          {isExpanded && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-4 bg-carbon-charcoal/80 rounded-lg p-4 border border-mint-muted/20 backdrop-blur-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="text-mint-muted/60 text-xs font-mono mb-3">
                Suggested queries
              </div>
              <div className="space-y-2">
                {[
                  "Electronics trending",
                  "Fashion new arrivals",
                  "Performance benchmarks",
                  "AI-driven recommendations",
                ].map((item) => (
                  <motion.div
                    key={item}
                    className="text-text-primary text-sm cursor-pointer p-2 rounded hover:bg-mint-glow/10 transition-colors font-mono"
                    onClick={() => {
                      setQuery(item);
                      onSearch?.(item);
                    }}
                    whileHover={{ x: 5 }}
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
