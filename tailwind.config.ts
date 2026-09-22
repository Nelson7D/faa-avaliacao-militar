import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        foreground: "#0F172A",
        sidebar: {
          DEFAULT: "#0B1612",
          surface: "#11221B",
          border: "#1E332A",
          hover: "rgba(255, 255, 255, 0.06)",
          active: "rgba(255, 255, 255, 0.12)",
          text: "#E2E8F0",
          muted: "#8FA39A",
          accent: "#D4AF37",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        primary: {
          DEFAULT: "#0F3323", // Verde Institucional Profundo
          foreground: "#FFFFFF",
          container: "#0B1612",
          dark: "#082016",
          light: "#184A34",
          tint: "#2E6B4F",
          subtle: "#EBF5F0",
          fixed: "#C3E8D5",
          "fixed-dim": "#9CCEB4",
        },
        secondary: {
          DEFAULT: "#B89047", // Ouro Militar Refinado / Champanhe Bronze
          foreground: "#FFFFFF",
          container: "#B89047",
          dark: "#916F30",
          light: "#D8AD5D",
          subtle: "#FDF8EE",
          fixed: "#FCE7BE",
          "fixed-dim": "#E5BE72",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#F8FAFC",
          foreground: "#0F3323",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
          container: "#FEF2F2",
        },
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#B89047",
        // Tactical Military Tokens (Design System 3.0)
        tactical: {
          bg: "#0D140B",
          deep: "#090E07",
          olive: "#1C2718",
          "olive-light": "#2E3D27",
          "olive-border": "rgba(117, 134, 82, 0.35)",
          card: "rgba(22, 31, 19, 0.72)",
          "card-hover": "rgba(30, 42, 26, 0.85)",
          "glass-border": "rgba(255, 255, 255, 0.08)",
          gold: "#D4AF37",
          "gold-light": "#E5C56D",
          "gold-dim": "#997E28",
          "gold-border": "rgba(212, 175, 55, 0.3)",
          "text-primary": "#F8FAFC",
          "text-secondary": "#9EAF94",
          "text-muted": "#6C7D63",
          "form-bg": "rgba(255, 255, 255, 0.88)",
          "form-text": "#0F172A",
        },
        // Tactical Regimental Status Tokens (Refined)
        regimental: {
          favorable: "#059669",
          "favorable-bg": "#ECFDF5",
          "favorable-border": "#A7F3D0",
          sigFavorable: "#047857",
          "sigFavorable-bg": "#D1FAE5",
          "sigFavorable-border": "#6EE7B7",
          unfavorable: "#DC2626",
          "unfavorable-bg": "#FEF2F2",
          "unfavorable-border": "#FECACA",
          gold: "#B89047",
          "gold-bg": "#FFFBEB",
          "gold-border": "#FDE68A",
          shield: "#0F3323",
        },
        // Modern Surface Container Tokens
        "surface-container": "#F1F5F9",
        "surface-container-low": "#F8FAFC",
        "surface-container-high": "#E2E8F0",
        "surface-container-highest": "#CBD5E1",
        "surface-container-lowest": "#FFFFFF",
        "outline-variant": "#E2E8F0",
        "on-surface-variant": "#475569",
      },
      boxShadow: {
        "subtle": "0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 1px rgb(0 0 0 / 0.02)",
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        "floating": "0 10px 25px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
        "glow-gold": "0 0 20px rgba(212, 175, 55, 0.35)",
        "glow-emerald": "0 0 20px rgba(5, 150, 105, 0.35)",
        "tactical-card": "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        "tactical-input": "inset 0 1px 2px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        "2xl": "1rem",
        xl: "0.75rem",
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
        DEFAULT: "0.375rem",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
        geist: ["var(--font-geist-sans)", "sans-serif"],
        "geist-mono": ["var(--font-geist-mono)", "monospace"],
      },
      spacing: {
        "sidebar-width": "260px",
        "margin-desktop": "24px",
        "margin-mobile": "16px",
        gutter: "16px",
      },
      keyframes: {
        "alert-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "alert-pulse": "alert-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
