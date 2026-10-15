import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#C9F27D",
          hover: "#bbf062",
          dim: "rgba(201, 242, 125, 0.1)",
          border: "rgba(201, 242, 125, 0.4)",
        },
        brand: {
          bg: "#09090b",
          card: "rgba(18, 22, 31, 0.4)",
          panel: "rgba(24, 30, 41, 0.6)",
          lime: "#C9F27D",
        },
      },
    },
  },
  plugins: [],
};

export default config;
