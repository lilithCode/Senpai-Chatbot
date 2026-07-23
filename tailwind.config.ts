import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: "#00f3ff",
          magenta: "#ff00ff",
          yellow: "#fcee0a",
          dark: "#050508",
        },
      },
      backgroundImage: {
        // This creates that subtle grid pattern seen in sci-fi UIs
        'cyber-grid': "linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;