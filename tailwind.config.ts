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
      colors: {
        warehouse: {
          950: "#070a12",
          900: "#0b0f19",
          850: "#101626",
          800: "#161f36",
          700: "#1f2c4d",
          600: "#2d3e6b",
          500: "#3d538c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
