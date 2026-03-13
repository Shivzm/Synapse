// FilteringSidebar.tsx
import { useState } from "react";

const DEFAULT_FILTERS = [
  { id: "ai",          label: "AI Models"        },
  { id: "ranking",     label: "Ranking"          },
  { id: "performance", label: "Performance"      },
  { id: "ml",          label: "Machine Learning" },
  { id: "search",      label: "Search"           },
  { id: "data",        label: "Data"             },
  { id: "recent",      label: "Recent"           },
  { id: "trending",    label: "Trending"         },
].map(f => ({ ...f, active: false }));

interface FilteringSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onFilterChange?: (filters: Record<string, boolean>) => void;
}

export const FilteringSidebar = ({ isOpen = false, onClose, onFilterChange }: FilteringSidebarProps) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const toggle = (id: string) => {
    const updated = filters.map(f => f.id === id ? { ...f, active: !f.active } : f);
    setFilters(updated);
    onFilterChange?.(Object.fromEntries(updated.map(f => [f.id, f.active])));
  };

  const resetAll = () => {
    const cleared = filters.map(f => ({ ...f, active: false }));
    setFilters(cleared);
    onFilterChange?.(Object.fromEntries(cleared.map(f => [f.id, false])));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="filter-overlay" onClick={onClose} />
      <aside className="filter-panel">
        <div className="filter-head">
          <h2>Filters</h2>
          <button className="filter-close" onClick={onClose}>×</button>
        </div>
        <div className="filter-section-label">Categories</div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filters.map(f => (
            <label key={f.id} className="filter-row">
              <span className="filter-label">{f.label}</span>
              <label className="toggle">
                <input type="checkbox" checked={f.active} onChange={() => toggle(f.id)} />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
              </label>
            </label>
          ))}
        </div>
        <div className="filter-foot">
          <button className="btn-ghost" onClick={resetAll}>Reset</button>
          <button className="btn-primary" onClick={onClose}>Apply</button>
        </div>
      </aside>
    </>
  );
};
