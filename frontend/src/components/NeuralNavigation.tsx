import { useState } from "react";
import { LayoutGrid, Laptop, Shirt, ShoppingBag, Zap, Cpu, TrendingUp, Activity } from "lucide-react";

const NAV_ITEMS = [
  { id: "all",         icon: <LayoutGrid   size={15} strokeWidth={1.5} />, label: "All"         },
  { id: "electronics", icon: <Laptop       size={15} strokeWidth={1.5} />, label: "Electronics" },
  { id: "fashion",     icon: <Shirt        size={15} strokeWidth={1.5} />, label: "Fashion"     },
  { id: "shopping",    icon: <ShoppingBag  size={15} strokeWidth={1.5} />, label: "Shopping"    },
  { id: "performance", icon: <Zap         size={15} strokeWidth={1.5} />, label: "Perf"        },
  { id: "ai",          icon: <Cpu          size={15} strokeWidth={1.5} />, label: "AI/ML"       },
  { id: "trends",      icon: <TrendingUp   size={15} strokeWidth={1.5} />, label: "Trends",  isLive: true },
  { id: "live",        icon: <Activity     size={15} strokeWidth={1.5} />, label: "Live",    isLive: true },
];

interface NeuralNavigationProps {
  onCategoryChange?: (id: string) => void;
}

export const NeuralNavigation = ({ onCategoryChange }: NeuralNavigationProps) => {
  const [active, setActive] = useState("all");

  return (
    <nav className="nav-sidebar">
      <div className="nav-logo"><span>S</span></div>
      <div className="nav-divider" />
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-item${active === item.id ? " active" : ""}`}
          onClick={() => { setActive(item.id); onCategoryChange?.(item.id); }}
          aria-label={item.label}
        >
          {item.icon}
          {item.isLive && <span className="nav-live-dot" />}
          <span className="nav-tooltip">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
