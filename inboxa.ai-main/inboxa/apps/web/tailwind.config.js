const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Email Agent Visual Grammar
        "agent-match": "hsl(var(--success))",
        "agent-delete": "hsl(var(--destructive))",
        "agent-progress": "hsl(var(--primary))",
        "agent-warning": "hsl(var(--warning))",
        // Teal color palette for planner features
        teal: {
          DEFAULT: "hsl(178 60% 50%)", // teal-500 equivalent
          50: "hsl(178 60% 95%)",
          100: "hsl(178 60% 90%)",
          200: "hsl(178 60% 80%)",
          300: "hsl(178 60% 70%)",
          400: "hsl(178 60% 60%)",
          500: "hsl(178 60% 50%)",
          600: "hsl(178 60% 40%)",
          700: "hsl(178 60% 30%)",
          800: "hsl(178 60% 20%)",
          900: "hsl(178 60% 10%)",
          foreground: "hsl(0 0% 100%)",
        },
      },
      fontFamily: {
        sans: [
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "system-ui",
          ...fontFamily.sans,
        ],
        mono: ["JetBrains Mono", "SF Mono", ...fontFamily.mono],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "gentle-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.4)" },
          "50%": { boxShadow: "0 0 0 4px hsl(var(--primary) / 0.1)" },
        },
        "match-highlight": {
          "0%": { backgroundColor: "hsl(var(--success) / 0)" },
          "50%": { backgroundColor: "hsl(var(--success) / 0.2)" },
          "100%": { backgroundColor: "hsl(var(--success) / 0.1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
        "slide-in": "slide-in 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
        "scale-in": "scale-in 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "gentle-glow": "gentle-glow 2s infinite",
        "match-highlight": "match-highlight 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
        slowest: "600ms",
      },
      transitionTimingFunction: {
        "ease-out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "ease-in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
        "ease-spring": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
    require("@headlessui/tailwindcss"),
    require("@tailwindcss/typography"),
  ],
};
