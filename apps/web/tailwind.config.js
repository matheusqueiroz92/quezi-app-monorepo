/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        // Paleta Quezi - Elegante e Sofisticada (conforme frontend.mdc)
        marsala: {
          DEFAULT: "#69042A", // Primária - Elegância, confiança e profundidade
          light: "#8B4660",
          dark: "#4A031D",
        },
        gold: {
          DEFAULT: "#D4AF37", // Secundária - Luxo, sucesso e refinamento
          light: "#F2E3B3",
          medium: "#E8C68A",
        },
        neutral: {
          white: "#FFFFFF",
          pearl: "#F5F5F5", // Neutra - Suavidade, equilíbrio e leveza
          medium: "#E0E0E0",
          graphite: "#6B6B6B",
          light: "#F8F8F8",
        },
        accent: {
          blush: "#F4E4E6", // Acento - Delicadeza, feminilidade e calor humano
          champagne: "#F9F4EF",
        },
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        quezi: "12px",
        "quezi-lg": "20px",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "var(--font-sans)"],
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
