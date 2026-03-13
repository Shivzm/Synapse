import { motion } from "framer-motion";
import {
  Zap,
  Shirt,
  Home,
  TrendingUp,
  Laptop,
  ShoppingBag,
  Cpu,
  Activity,
} from "lucide-react";
import { useState } from "react";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isLiveTrend?: boolean;
}

interface NeuralNavigationProps {
  onCategoryChange?: (categoryId: string) => void;
}

export const NeuralNavigation = ({
  onCategoryChange,
}: NeuralNavigationProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const navigationItems: NavigationItem[] = [
    { id: "all", label: "All Items", icon: <Home size={24} /> },
    {
      id: "electronics",
      label: "Electronics",
      icon: <Laptop size={24} />,
    },
    { id: "fashion", label: "Fashion", icon: <Shirt size={24} /> },
    {
      id: "shopping",
      label: "Shopping",
      icon: <ShoppingBag size={24} />,
    },
    { id: "performance", label: "Performance", icon: <Zap size={24} /> },
    {
      id: "ai",
      label: "AI/ML",
      icon: <Cpu size={24} />,
    },
    {
      id: "live-trends",
      label: "Live Trends",
      icon: <TrendingUp size={24} />,
      isLiveTrend: true,
    },
    {
      id: "activity",
      label: "Real-time",
      icon: <Activity size={24} />,
      isLiveTrend: true,
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  // Breathing animation for icons
  const breathingAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Glow pulse on hover
  const glowAnimation = {
    hover: {
      scale: 1.15,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="fixed left-0 top-0 h-screen w-24 flex flex-col items-center justify-center gap-6 py-8 z-30"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Glassmorphic Background */}
      <div
        className="absolute inset-0 glass backdrop-blur-xl border-r border-mint-muted/20"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      />

      {/* Navigation Container */}
      <div className="relative z-10 flex flex-col gap-6 items-center">
        {navigationItems.map((item, index) => {
          const isActive = activeCategory === item.id;
          const isLiveTrend = item.isLiveTrend;

          return (
            <motion.button
              key={item.id}
              className={`
                relative p-4 rounded-xl transition-all duration-300
                flex items-center justify-center
                group
              `}
              onClick={() => handleCategoryClick(item.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                duration: 0.4,
              }}
              variants={glowAnimation}
              whileHover="hover"
              title={item.label}
            >
              {/* Live Trend pulse background */}
              {isLiveTrend && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-mint-glow/10"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Active background */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-mint-glow/20 rounded-xl"
                  layoutId="active-nav"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon container with breathing animation and glow */}
              <motion.div
                className={`
                  relative z-10 flex items-center justify-center
                  transition-all duration-300
                  ${
                    isActive
                      ? "text-mint-glow"
                      : "text-mint-muted group-hover:text-mint-glow"
                  }
                `}
                variants={breathingAnimation}
                initial="initial"
                animate="animate"
                whileHover={{
                  textShadow: "0 0 15px rgba(0, 255, 194, 0.5)",
                  scale: 1.2,
                }}
              >
                {item.icon}
              </motion.div>

              {/* Glow effect on hover - outer shadow */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  boxShadow: "0 0 15px rgba(0, 255, 194, 0.5)",
                }}
                transition={{ duration: 0.2 }}
              />

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  className="absolute right-0 top-1/2 transform translate-x-3 -translate-y-1/2 w-2 h-2 rounded-full bg-mint-glow"
                  layoutId="active-indicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-mint-glow to-transparent rounded-full"
        animate={{
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};
