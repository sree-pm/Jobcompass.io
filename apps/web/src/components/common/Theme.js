export const T = {
  // — Surfaces —
  bg: "#FAF9F5",
  surface: "#F2F0EA",
  card: "#FFFFFF",
  border: "#E5E2D9",
  borderStrong: "#D4D0C8",
  // — Typography —
  text: "#1C1917",
  muted: "#78716C",
  hint: "#A8A29E",
  // — Brand / Accent — warm terracotta remains the primary
  blue: "#D97857",
  blueLight: "#FEF3EC",
  blueMid: "#F7C5A8",
  blueDark: "#B65A3A",
  // — Semantic —
  green: "#15803d",
  greenLight: "#f0fdf4",
  greenMid: "#bbf7d0",
  yellow: "#92400e",
  yellowLight: "#fffbeb",
  yellowMid: "#fde68a",
  red: "#dc2626",
  redLight: "#fef2f2",
  redMid: "#fecaca",
  purple: "#6d28d9",
  purpleLight: "#f5f3ff",
  purpleMid: "#ddd6fe",
  indigo: "#4338ca",
  indigoLight: "#eef2ff",
  indigoMid: "#c7d2fe",
  // — Overlay & shadow —
  overlay: "rgba(28,25,23,0.45)",
  shadowSm: "0 1px 2px rgba(28,25,23,0.06)",
  shadow: "0 4px 16px rgba(28,25,23,0.08)",
  shadowLg: "0 20px 40px rgba(28,25,23,0.14)",
  // — Radii —
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusPill: 999,
  // — Type —
  sans: "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  mono: "'JetBrains Mono','Fira Code','Courier New',monospace",
};

export const STAGES = ["Saved", "Applied", "Awaiting Response", "Interview", "Offer", "Rejected"];

export const STAGE_COLOR = {
  Saved: "#6366f1",
  Applied: "#2563eb",
  "Awaiting Response": "#d97706",
  Interview: "#7c3aed",
  Offer: "#15803d",
  Rejected: "#dc2626",
};

export const LIMITS = {
  JOBS: 50,
  JOBS_WARN: 40,
  COMPANIES: 50,
  COMPANIES_WARN: 40,
  CHAT_PER_JOB: 100,
  CHAT_WARN: 90,
};

// Badge palette for BuyCreditsModal
export const PACK_BADGE = {
  "Most Popular": { bg: "#FEF3EC", color: "#D97857", border: "#F7C5A8" },
  "Best Value": { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "Maximum Volume": { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
};

// Extra tokens consumed by polished Navbar / Settings
export const NAV_HEIGHT = 64;
