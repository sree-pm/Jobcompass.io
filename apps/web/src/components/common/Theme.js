export const T = {
  // — Surfaces — Stripe light canvas
  bg: "#ffffff",
  surface: "#f6f9fc",
  card: "#ffffff",
  border: "#e5edf5",
  borderStrong: "#d6dce6",
  // — Typography — Linear density / Stripe heading
  text: "#061b31",
  muted: "#64748d",
  hint: "#94a3b8",
  heading: "#061b31",
  // — Brand / Accent — Stripe purple
  blue: "#533afd",
  blueHover: "#4434d4",
  blueDark: "#4434d4",
  blueLight: "#f0f0ff",
  blueMid: "#b9b9f9",
  indigo: "#5e6ad2",
  indigoLight: "#eef2ff",
  indigoMid: "#c7d2fe",
  purple: "#635bff",
  purpleLight: "#f5f3ff",
  purpleMid: "#ddd6fe",
  // — Semantic — tuned to Stripe
  green: "#0e9f6e",
  greenLight: "#dcfce7",
  greenMid: "#86efac",
  yellow: "#975600",
  yellowLight: "#fef9c3",
  yellowMid: "#fde68a",
  amber: "#975600",
  amberLight: "#fef9c3",
  amberMid: "#fde68a",
  red: "#df1b41",
  redLight: "#ffe4e6",
  redMid: "#fecdd3",
  // — Overlay & shadow — blue-tinted Stripe shadows
  overlay: "rgba(6,27,49,0.45)",
  shadowSm: "rgba(50,50,93,0.08) 0 1px 3px, rgba(0,0,0,0.05) 0 1px 2px",
  shadow: "rgba(50,50,93,0.12) 0 4px 12px, rgba(0,0,0,0.06) 0 1px 3px",
  shadowLg: "rgba(50,50,93,0.18) 0 8px 24px, rgba(0,0,0,0.08) 0 2px 8px",
  shadowStripe: "rgba(50,50,93,0.12) 0 4px 12px, rgba(0,0,0,0.06) 0 1px 3px",
  shadowFloat: "rgba(50,50,93,0.25) 0 13px 27px -5px, rgba(0,0,0,0.08) 0 8px 16px -8px",
  // — Radii — Linear 6/8/12/16 + pill
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusPill: 999,
  // — Layout — 8px grid, nav height
  navHeight: 56,
  grid: 8,
  // — Type — Linear density
  sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  sansDisplay: "'Source Sans 3', Inter, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  fontFeatures: "'cv01','ss03','calt' 1",
  fontFeatureSettings: "'cv01','ss03'",
};

export const STAGES = ["Saved", "Tailored", "Applied", "Interview", "Offer", "Rejected"];

export const STAGE_COLOR = {
  Saved: "#635BFF",
  Tailored: "#7c4dff",
  Applied: "#533afd",
  Interview: "#e17a00",
  Offer: "#0e9f6e",
  Rejected: "#df1b41",
};

export const LIMITS = {
  JOBS: 50,
  JOBS_WARN: 40,
  COMPANIES: 50,
  COMPANIES_WARN: 40,
  CHAT_PER_JOB: 100,
  CHAT_WARN: 90,
};

// Badge palette for BuyCreditsModal — Stripe×Linear premium
// New pack tiers: Starter violet, Active emerald, Power indigo
// Legacy keys aliased for backwards compat
export const PACK_BADGE = {
  Starter: { bg: "#f5f3ff", color: "#5e6ad2", border: "#ddd6fe" },
  Active: { bg: "#dcfce7", color: "#0e9f6e", border: "#86efac" },
  Power: { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
  // legacy aliases (BuyCreditsModal still references these)
  "Most Popular": { bg: "#f5f3ff", color: "#5e6ad2", border: "#ddd6fe" },
  "Best Value": { bg: "#dcfce7", color: "#0e9f6e", border: "#86efac" },
  "Maximum Volume": { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
};

// Extra tokens consumed by polished Navbar / Settings
export const NAV_HEIGHT = 56;
