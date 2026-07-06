import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        petrol: "#0B3A44",
        "petrol-2": "#12525F",
        "petrol-ink": "#072229",
        mint: "#15A99A",
        "mint-soft": "#D7EEEB",
        signal: "#FF5A3C",
        "signal-soft": "#FFE2DB",
        amber: "#D9902F",
        "amber-soft": "#F6E7CE",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
