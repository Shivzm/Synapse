import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "carbon-black": "var(--bg-black)",
        "carbon-charcoal": "var(--bg-charcoal)",
        "mint-glow": "var(--accent-mint)",
        "mint-muted": "var(--accent-cyan)",
        "text-primary": "var(--text-primary)",
      },
      animation: {
        "spin-gradient": "spin-gradient 3s linear infinite",
        "stagger-in": "stagger-in 0.5s ease-out",
      },
      keyframes: {
        "spin-gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "stagger-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
