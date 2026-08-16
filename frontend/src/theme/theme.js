/**
 * ==========================================================
 * ACASH Design System v1.0
 * ----------------------------------------------------------
 * Single source of truth for the entire application.
 * Every premium component should use these values.
 * ==========================================================
 */

export const theme = {
  app: {
    name: "ACASH Tuition Portal",
    version: "1.0",
  },

  /* ------------------------------------------------------ */
  /* Colors                                                  */
  /* ------------------------------------------------------ */

  colors: {
    primary: "#008388",
    primaryLight: "#14B8A6",
    secondary: "#0EA5E9",

    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",

    background: "#F4F8FC",
    surface: "#FFFFFF",

    text: {
      primary: "#1E293B",
      secondary: "#64748B",
      muted: "#94A3B8",
    },

    border: "#E2E8F0",
  },

  /* ------------------------------------------------------ */
  /* Gradients                                               */
  /* ------------------------------------------------------ */

  gradients: {
    primary:
      "from-[#008388] via-[#14B8A6] to-cyan-400",

    hero:
      "from-cyan-500 via-[#008388] to-blue-600",

    library:
      "from-blue-500 to-cyan-400",

    students:
      "from-orange-500 to-amber-400",

    teachers:
      "from-emerald-500 to-green-400",

    assignments:
      "from-violet-500 to-purple-500",

    exams:
      "from-red-500 to-rose-500",

    analytics:
      "from-teal-500 to-cyan-500",

    ai:
      "from-cyan-500 to-sky-500",
  },

  /* ------------------------------------------------------ */
  /* Border Radius                                           */
  /* ------------------------------------------------------ */

  radius: {
    xs: "rounded-xl",
    sm: "rounded-2xl",
    md: "rounded-3xl",
    lg: "rounded-[32px]",
    xl: "rounded-[40px]",
    full: "rounded-full",
  },

  /* ------------------------------------------------------ */
  /* Shadows                                                 */
  /* ------------------------------------------------------ */

  shadows: {
    card: "shadow-sm",

    elevated:
      "shadow-lg",

    floating:
      "shadow-[0_20px_60px_rgba(15,23,42,0.08)]",

    hero:
      "shadow-[0_25px_70px_rgba(15,23,42,0.12)]",
  },

  /* ------------------------------------------------------ */
  /* Glassmorphism                                           */
  /* ------------------------------------------------------ */

  glass: {
    card:
      "bg-white/70 backdrop-blur-xl border border-white/60",

    panel:
      "bg-white/80 backdrop-blur-xl border border-white/60",

    modal:
      "bg-white/90 backdrop-blur-2xl border border-white/70",
  },

  /* ------------------------------------------------------ */
  /* Typography                                              */
  /* ------------------------------------------------------ */

  typography: {
    hero: "text-5xl font-bold",

    pageTitle: "text-4xl font-bold",

    section: "text-3xl font-bold",

    cardTitle: "text-2xl font-bold",

    subtitle: "text-lg text-slate-500",

    body: "text-base text-slate-600",

    caption: "text-sm text-slate-500",
  },

  /* ------------------------------------------------------ */
  /* Layout                                                  */
  /* ------------------------------------------------------ */

  layout: {
    maxWidth: "max-w-[1700px]",

    sidebarWidth: "w-72",

    navbarHeight: "h-24",
  },

  /* ------------------------------------------------------ */
  /* Spacing                                                 */
  /* ------------------------------------------------------ */

  spacing: {
    section: "mb-10",

    card: "p-7",

    panel: "p-8",

    hero: "p-10",
  },

  /* ------------------------------------------------------ */
  /* Animations                                              */
  /* ------------------------------------------------------ */

  animation: {
    fast: "transition-all duration-200",

    normal: "transition-all duration-300",

    slow: "transition-all duration-500",

    hover:
      "hover:-translate-y-2 hover:shadow-2xl",

    button:
      "hover:scale-105 active:scale-95",

    card:
      "hover:-translate-y-1 hover:shadow-xl",
  },

  /* ------------------------------------------------------ */
  /* Avatar System                                           */
  /* ------------------------------------------------------ */

  avatar: {
    small: "w-8 h-8",

    medium: "w-12 h-12",

    large: "w-16 h-16",

    hero: "w-24 h-24",

    stack: "-ml-2 first:ml-0",
  },

  /* ------------------------------------------------------ */
  /* Campus Buildings                                        */
  /* ------------------------------------------------------ */

  campus: {
    cardHeight: "min-h-[420px]",

    iconSize: "w-16 h-16",

    heroHeight: "min-h-[320px]",
  },
};

export default theme;