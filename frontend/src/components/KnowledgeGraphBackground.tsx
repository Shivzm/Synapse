import { useEffect, useRef } from "react";

export const KnowledgeGraphBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load tsparticles
    const initParticles = async () => {
      try {
        const { tsParticles } = await import("@tsparticles/engine");
        await import("@tsparticles/shape-circle");
        await import("@tsparticles/move-base");

        await tsParticles.load({
          id: "knowledge-graph",
          options: {
            particles: {
              number: { value: 20 },
              color: { value: "#00FFC2" },
              shape: { type: "circle" },
              move: {
                enable: true,
                speed: 0.5,
                random: true,
              },
              opacity: { value: 0.2 },
              size: { value: 2 },
            },
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: "grab",
                },
              },
              modes: {
                grab: {
                  distance: 200,
                  links: {
                    opacity: 0.5,
                    color: "#45A29E",
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        console.log("Particles library available - using CSS fallback");
      }
    };

    initParticles();
  }, []);

  return (
    <div
      id="knowledge-graph"
      ref={containerRef}
      className="fixed inset-0 bg-carbon-black pointer-events-none"
      style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(0, 255, 194, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(69, 162, 158, 0.05) 0%, transparent 50%),
          linear-gradient(135deg, #0b0c10 0%, #1a1a2e 100%)
        `,
      }}
    >
      {/* CSS-based node network as fallback */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="grid"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="50" cy="50" r="1" fill="rgba(0, 255, 194, 0.2)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};
