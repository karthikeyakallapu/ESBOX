import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E5E7EB",

        text: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
          disabled: "#CBD5E1",
        },

        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          soft: "#EFF6FF",
        },

        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",

        vault: {
          bg: "#020617",
          surface: "#020617",
          border: "#1E293B",
          text: "#F8FAFC",
          muted: "#94A3B8",
          accent: "#38BDF8",
        },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        brand: ["Unbounded", "Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },

      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "12px",
        xl: "16px",
      },

      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.04)",
        cardHover: "0 12px 32px rgba(0,0,0,0.06)",
        modal: "0 24px 64px rgba(0,0,0,0.12)",
      },

      transitionTimingFunction: {
        soft: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },

  plugins: [forms, typography],
};

export default config;
