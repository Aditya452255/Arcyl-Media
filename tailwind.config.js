/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C5CFC",
          light: "#9B7AFF",
          dark: "#5A3AD9",
          50: "rgba(124, 92, 252, 0.05)",
          100: "rgba(124, 92, 252, 0.1)",
          200: "rgba(124, 92, 252, 0.2)",
          300: "rgba(124, 92, 252, 0.3)",
        },
        accent: {
          blue: "#4A7CFC",
          violet: "#9B6FE8",
          purple: "#6C3CE0",
        },
        dark: {
          DEFAULT: "#06070B",
          50: "#0D0F18",
          100: "#0F1120",
          200: "#131528",
          300: "#1A1D30",
          400: "#222540",
          500: "#2A2D48",
        },
        muted: {
          DEFAULT: "#8B8DA3",
          light: "#A8AAC0",
          dark: "#6B6D83",
        },
        glass: {
          border: "rgba(255, 255, 255, 0.06)",
          "border-light": "rgba(255, 255, 255, 0.1)",
          bg: "rgba(15, 17, 30, 0.7)",
          "bg-light": "rgba(15, 17, 30, 0.5)",
        },
      },
      fontFamily: {
        heading: ["var(--font-dm-serif)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "spin-reverse": "spin-reverse 25s linear infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "ticker": "ticker 30s linear infinite",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "scale-in": "scale-in 0.6s ease-out forwards",
        "slide-in-left": "slide-in-left 0.8s ease-out forwards",
        "slide-in-right": "slide-in-right 0.8s ease-out forwards",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
      },
      keyframes: {
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 92, 252, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(124, 92, 252, 0.3)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":
          "radial-gradient(ellipse at center top, rgba(124, 92, 252, 0.15) 0%, transparent 60%)",
        "section-gradient":
          "radial-gradient(ellipse at center, rgba(124, 92, 252, 0.08) 0%, transparent 70%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(124, 92, 252, 0.1) 0%, rgba(74, 124, 252, 0.05) 100%)",
        "cta-gradient":
          "linear-gradient(135deg, rgba(124, 92, 252, 0.3) 0%, rgba(74, 124, 252, 0.15) 50%, rgba(124, 92, 252, 0.3) 100%)",
        "button-gradient":
          "linear-gradient(135deg, #7C5CFC 0%, #4A7CFC 100%)",
      },
      boxShadow: {
        glow: "0 0 30px rgba(124, 92, 252, 0.15)",
        "glow-lg": "0 0 60px rgba(124, 92, 252, 0.2)",
        "glow-xl": "0 0 100px rgba(124, 92, 252, 0.25)",
        card: "0 4px 30px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 40px rgba(124, 92, 252, 0.15)",
      },
    },
  },
  plugins: [],
};
