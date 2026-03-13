import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface PerformanceDashboardProps {
  isSearching?: boolean;
  hasResults?: boolean;
  confidenceScore?: number;
  inferenceSpeed?: number;
}

export const PerformanceDashboard = ({
  isSearching = false,
  hasResults = false,
  confidenceScore = 0,
  inferenceSpeed = 85,
}: PerformanceDashboardProps) => {
  const [celebrated, setCelebrated]     = useState(false);
  const [displaySpeed, setDisplaySpeed] = useState(inferenceSpeed);

  /* confetti burst on high-confidence result */
  useEffect(() => {
    if (hasResults && !isSearching && !celebrated && confidenceScore > 80) {
      const colors = ["#00e8a8", "#009e72", "#00ff88"];
      [0, 280, 560].forEach(delay =>
        setTimeout(() => confetti({
          particleCount: 32, spread: 52,
          origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.4 },
          colors, ticks: 50,
        }), delay)
      );
      setCelebrated(true);
    }
  }, [hasResults, isSearching, celebrated, confidenceScore]);

  useEffect(() => { if (isSearching) setCelebrated(false); }, [isSearching]);

  /* speed jitter while searching */
  useEffect(() => {
    if (!isSearching) { setDisplaySpeed(inferenceSpeed); return; }
    const id = setInterval(() => {
      setDisplaySpeed(Math.round(inferenceSpeed + (Math.random() - 0.5) * 14));
    }, 160);
    return () => clearInterval(id);
  }, [isSearching, inferenceSpeed]);

  const statusLabel = isSearching ? "PROCESSING" : hasResults ? "READY" : "IDLE";
  const dotClass    = isSearching ? "active" : hasResults ? "ready" : "";

  return (
    <aside className="perf-panel">
      <div className="perf-header">
        <span className="perf-title">System</span>
        <span className="perf-status" style={{ color: isSearching ? "var(--mint)" : "var(--ash)" }}>
          <span className={`status-dot ${dotClass}`} />
          {statusLabel}
        </span>
      </div>

      <div className="perf-bar-row">
        <div className="perf-bar-label">
          <span className="perf-key">Confidence</span>
          <span className="perf-key" style={{ color: confidenceScore > 80 ? "var(--mint)" : "var(--ash)" }}>
            {confidenceScore}%
          </span>
        </div>
        <div className="perf-bar-track">
          <div className="perf-bar-fill" style={{ width: `${confidenceScore}%` }} />
        </div>
      </div>

      <div className="perf-metric">
        <span className="perf-key">Speed</span>
        <span className={`perf-val${isSearching ? " highlight" : ""}`}>
          {displaySpeed}<span className="perf-unit">ms</span>
        </span>
      </div>

      <div className="perf-metric">
        <span className="perf-key">Latency</span>
        <span className="perf-val">42<span className="perf-unit">ms</span></span>
      </div>

      {hasResults && confidenceScore > 80 && !isSearching && (
        <div className="perf-good">✓ High confidence match</div>
      )}
    </aside>
  );
};
