// NeuralButton.tsx
import confetti from "canvas-confetti";

interface NeuralButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onSuccess?: () => void;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const NeuralButton = ({
  children, onClick, onSuccess,
  variant = "primary", size = "md",
}: NeuralButtonProps) => {
  const pad = { sm: "5px 10px", md: "7px 16px", lg: "9px 20px" }[size];
  const fsz = { sm: "9px",      md: "10px",      lg: "11px"     }[size];

  return (
    <button
      className={variant === "primary" ? "neural-btn" : "btn-ghost"}
      style={{ padding: pad, fontSize: fsz }}
      onClick={() => {
        onClick?.();
        if (onSuccess) {
          confetti({ particleCount: 28, spread: 50, origin: { x: 0.5, y: 0.6 }, colors: ["#00e8a8", "#009e72"], ticks: 45 });
          onSuccess();
        }
      }}
    >
      {children}
    </button>
  );
};
