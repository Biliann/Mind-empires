import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#f7f7f8",
        charcoal: "#ffffff",
        ember: "#b85c6b",
        gold: "#2f5f8f",
        bone: "#171717",
        mist: "#6f6a67",
        ink: "#fbfbfd",
        blood: "#b42318",
        moss: "#426b58",
        steel: "#8b8581",
        sakura: "#f7dce5",
        washi: "#fffaf7",
        sumi: "#171717",
        matcha: "#7a8f5a"
      },
      boxShadow: {
        premium: "0 24px 60px rgba(0,0,0,0.08)",
        insetGlow: "inset 0 0 0 1px rgba(0,0,0,0.06)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
