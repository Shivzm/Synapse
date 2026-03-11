import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface NeuralButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onSuccess?: () => void;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const NeuralButton = ({
  children,
  onClick,
  onSuccess,
  variant = "primary",
  size = "md",
}: NeuralButtonProps) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg",
  };

  const triggerParticleBurst = () => {
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#00FFC2", "#45A29E"],
    });
  };

  const handleClick = () => {
    onClick?.();
    if (onSuccess) {
      triggerParticleBurst();
      onSuccess();
    }
  };

  return (
    <motion.button
      className={`
        ${sizeClasses[size]}
        font-semibold rounded-lg
        ${
          variant === "primary"
            ? "bg-mint-glow text-carbon-black hover:shadow-lg hover:shadow-mint-glow/50"
            : "bg-mint-muted text-carbon-black hover:bg-mint-glow transition-colors"
        }
        transition-all duration-200 font-mono uppercase tracking-wider
        relative overflow-hidden group
      `}
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <span className="relative z-10 block">{children}</span>
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 bg-mint-muted opacity-0 group-hover:opacity-20"
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
        />
      )}
    </motion.button>
  );
};
