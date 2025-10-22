/**
 * Design Tokens - Quezi App
 *
 * Tokens de design sistematizados para garantir consistência visual
 * em toda a aplicação. Seguem as diretrizes da identidade visual Quezi.
 */

// ========================================
// CORES
// ========================================

export const colors = {
  // Primária - Marsala (Elegância e Sofisticação)
  marsala: {
    DEFAULT: "#8B4660",
    light: "#A15468",
    dark: "#69042A",
    darker: "#954D5F",
  },

  // Secundária - Dourado (Luxo e Refinamento)
  dourado: {
    DEFAULT: "#D4AF37",
    light: "#F2E3B3",
    medium: "#E8C68A",
  },

  // Neutras
  neutral: {
    white: "#FFFFFF",
    pearl: "#F5F5F5",
    medium: "#E0E0E0",
    graphite: "#6B6B6B",
    dark: "#333333",
  },

  // Acentos
  accent: {
    blush: "#F4E4E6",
    champagne: "#F9F4EF",
  },

  // Estados
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
} as const;

// ========================================
// TIPOGRAFIA
// ========================================

export const typography = {
  // Famílias
  fontFamily: {
    display: "var(--font-playfair), Playfair Display, serif",
    body: "var(--font-inter), Inter, sans-serif",
  },

  // Tamanhos
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
    "7xl": "4.5rem", // 72px
  },

  // Pesos
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Alturas de linha
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Espaçamento entre letras
  letterSpacing: {
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
  },
} as const;

// ========================================
// ESPAÇAMENTOS
// ========================================

export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
} as const;

// ========================================
// BORDAS
// ========================================

export const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px
  DEFAULT: "0.5rem", // 8px
  md: "0.75rem", // 12px
  lg: "1rem", // 16px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  full: "9999px",

  // Específicos Quezi
  quezi: "12px",
  queziLg: "20px",
} as const;

export const borderWidth = {
  0: "0",
  DEFAULT: "1px",
  2: "2px",
  4: "4px",
  8: "8px",
} as const;

// ========================================
// SOMBRAS
// ========================================

export const boxShadow = {
  // Sombras suaves e sutis (Quezi style)
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  none: "none",

  // Sombras premium com toque dourado
  premium: "0 4px 20px 0 rgba(212, 175, 55, 0.15)",
  premiumHover: "0 8px 30px 0 rgba(212, 175, 55, 0.25)",
} as const;

// ========================================
// BREAKPOINTS
// ========================================

export const breakpoints = {
  xs: "320px", // Mobile pequeno
  sm: "640px", // Mobile
  md: "768px", // Tablet
  lg: "1024px", // Desktop
  xl: "1280px", // Desktop grande
  "2xl": "1536px", // Desktop extra grande
} as const;

// ========================================
// Z-INDEX
// ========================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
  top: 100,
} as const;

// ========================================
// TRANSIÇÕES E ANIMAÇÕES
// ========================================

export const transitions = {
  duration: {
    instant: "75ms",
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "500ms",
  },

  timing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    linear: "linear",

    // Custom cubic-bezier (suavidade premium)
    smoothIn: "cubic-bezier(0.4, 0, 1, 1)",
    smoothOut: "cubic-bezier(0, 0, 0.2, 1)",
    smoothInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

// ========================================
// DIMENSÕES COMUNS
// ========================================

export const sizes = {
  // Sidebar
  sidebarWidth: {
    collapsed: "80px",
    expanded: "280px",
  },

  // Header
  headerHeight: {
    mobile: "64px",
    desktop: "72px",
  },

  // Avatares
  avatar: {
    xs: "24px",
    sm: "32px",
    md: "40px",
    lg: "48px",
    xl: "64px",
    "2xl": "96px",
  },

  // Ícones
  icon: {
    xs: "12px",
    sm: "16px",
    md: "20px",
    lg: "24px",
    xl: "32px",
  },

  // Container
  container: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
} as const;

// ========================================
// GRADIENTES
// ========================================

export const gradients = {
  // Gradiente principal Quezi
  primary: "linear-gradient(135deg, #8B4660 0%, #69042A 100%)",

  // Gradiente dourado premium
  gold: "linear-gradient(135deg, #D4AF37 0%, #E8C68A 100%)",

  // Gradiente suave para backgrounds
  softBlush: "linear-gradient(135deg, #F9F4EF 0%, #F4E4E6 100%)",

  // Overlay para imagens
  overlay: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)",
  overlayTop: "linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)",
} as const;

// ========================================
// UTILITÁRIOS
// ========================================

/**
 * Função helper para criar classes de transição
 */
export const createTransition = (
  properties: string[] = ["all"],
  duration: keyof typeof transitions.duration = "normal",
  timing: keyof typeof transitions.timing = "smoothInOut"
): string => {
  return properties
    .map(
      (prop) =>
        `${prop} ${transitions.duration[duration]} ${transitions.timing[timing]}`
    )
    .join(", ");
};

/**
 * Função helper para criar sombras customizadas
 */
export const createShadow = (
  color: string,
  opacity: number = 0.1,
  blur: number = 10,
  spread: number = 0,
  offsetX: number = 0,
  offsetY: number = 4
): string => {
  const rgbColor = color.replace("#", "");
  const r = parseInt(rgbColor.substr(0, 2), 16);
  const g = parseInt(rgbColor.substr(2, 2), 16);
  const b = parseInt(rgbColor.substr(4, 2), 16);

  return `${offsetX}px ${offsetY}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Exportação consolidada de todos os tokens
 */
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  boxShadow,
  breakpoints,
  zIndex,
  transitions,
  sizes,
  gradients,
} as const;

export default designTokens;
