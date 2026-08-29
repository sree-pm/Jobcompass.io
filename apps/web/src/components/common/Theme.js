// ─────────────────────────────────────────────────────────────────────
// JobCompass Design System — single source of truth for ALL visual tokens
// Stripe (light luxury) × Linear (density) hybrid.
// RULE: components must ONLY reference tokens from this file.
//       Enforced by apps/api/test/designSystemGuard.test.js + CI.
// ─────────────────────────────────────────────────────────────────────

export const T = {
  // ── Artifact 1:1 — Jobcompass-V2-Uk.html :root tokens (mono-repo canonical)
  ink: "#0A0A0D",            // --ink
  cream: "#FCFBF8",          // --cream (body bg)
  cream2: "#FFFBF5",         // --cream2
  creamBorder: "#E9E6E1",    // --creamBorder
  lavender: "#A5A6FF",       // --lavender
  lavenderAA: "#7A7CFF",     // --lavenderAA
  lavenderHover: "#6F71FF",
  mutedArtifact: "#8A8885",  // --muted (artifact, decorative only)
  mutedStrong: "#6F6D6A",    // readable muted — 4.5:1 on cream/white
  success: "#0F6D5A",        // --success
  successBg: "#E6F4F1",      // --successBg
  // translucent artifact tokens (header/grid/shadow — live in Theme.js so TSX never writes rgba() literals)
  creamTrans: "rgba(252,251,248,0.85)",
  ink80: "rgba(10,10,13,0.80)",
  ink70: "rgba(10,10,13,0.70)",
  ink60: "rgba(10,10,13,0.60)",
  gridLine: "rgba(10,10,13,0.03)",
  shadowToast: "rgba(0,0,0,0.30)",
  shadowHeader: "rgba(0,0,0,0.12)",
  whiteOverlay06: "rgba(255,255,255,0.06)",
  white10: "rgba(255,255,255,0.10)",
  white08: "rgba(255,255,255,0.08)",
  white06: "rgba(255,255,255,0.06)",
  white04: "rgba(255,255,255,0.04)",
  white20: "rgba(255,255,255,0.20)",
  white25: "rgba(255,255,255,0.25)",
  white40: "rgba(255,255,255,0.40)",
  white50: "rgba(255,255,255,0.50)",
  white60: "rgba(255,255,255,0.60)",
  // legacy aliases for migrated code (keep)
  eggshell: "#FFFBF5",
  obsidian: "#0A0A0D",
  inkCard: "#121214",
  dangerBg: "#FFE8E8",
  dangerText: "#8B1A1A",
  obsidianSoft: "#15362B",
  gravel: "#8A8885",
  slate: "#6B7280",
  chalk: "#E9E6E1",
  bg: "#FCFBF8",           // --cream
  // Stripe surfaces kept
  surface: "#f6f9fc",      // section / inset background (Stripe)
  surfaceAlt: "#FFFBF5",
  surfaceCool: "#F4F4F5",
  surfaceAlt: "#f8fafc",   // alternate inset (slate-50)
  surfaceCool: "#f1f5f9",  // stronger inset / kbd / divider bg (slate-100)
  card: "#ffffff",         // card background
  disabledBg: "#e8eaf0",   // disabled input/button fill
  // ── Borders ───────────────────────────────────────────────────────
  border: "#e5edf5",       // default hairline (Stripe)
  borderCool: "#e2e8f0",   // cooler hairline (slate-200)
  borderStrong: "#d6dce6", // emphasis border
  // ── Typography colors ─────────────────────────────────────────────
  text: "#061b31",         // primary / heading (Stripe deep navy)
  heading: "#061b31",
  label: "#273951",        // form labels (Stripe label navy)
  muted: "#64748d",        // secondary text (Stripe slate)
  hint: "#94a3b8",         // placeholders, tertiary (slate-400)
  onColor: "#ffffff",      // text on brand/dark fills
  // ── Brand ─────────────────────────────────────────────────────────
  blue: "#533afd",         // primary brand (Stripe purple)
  blueHover: "#4434d4",    // primary hover
  blueDark: "#4434d4",
  blueLight: "#f0f0ff",    // brand tint bg
  blueMid: "#b9b9f9",      // brand tint border
  indigo: "#5e6ad2",       // Linear accent
  indigoDeep: "#4338ca",   // deep indigo CTA variant
  indigoLight: "#eef2ff",
  indigoMid: "#c7d2fe",
  purple: "#635bff",       // blurple stage/brand variant
  purpleVivid: "#7c4dff",
  purpleLight: "#f5f3ff",
  purpleMid: "#ddd6fe",
  // ── Focus / interactive overlays (brand alpha) ────────────────────
  focusRing: "rgba(83,58,253,0.15)",      // input focus halo
  focusRingStrong: "rgba(83,58,253,0.28)",
  selectRing: "rgba(83,58,253,0.12)",     // selected card halo
  hoverTint: "rgba(83,58,253,0.18)",
  // ── Semantic: success ─────────────────────────────────────────────
  green: "#0e9f6e",        // primary success
  greenDark: "#15803d",    // success text emphasis
  greenDeep: "#166534",
  greenLight: "#dcfce7",   // success bg
  greenMid: "#86efac",     // success border
  greenPale: "#ecfdf5",    // subtle success bg
  // ── Semantic: warning / amber ─────────────────────────────────────
  amber: "#975600",        // warning text (Stripe lemon-dark)
  amberText: "#92400e",    // alternate warning text
  amberAccent: "#e17a00",  // warning accent (stage: Interview)
  amberLight: "#fef9c3",   // warning bg
  amberMid: "#fde68a",     // warning border
  amberPale: "#fffbeb",    // subtle warning bg
  // ── Semantic: danger ──────────────────────────────────────────────
  red: "#df1b41",          // primary danger (Stripe)
  redDark: "#7f1d1d",      // danger text deep
  redLight: "#ffe4e6",     // danger bg
  redMid: "#fecdd3",       // danger border
  redPale: "#fef2f2",      // subtle danger bg
  redBorder: "#fecaca",    // danger zone border
    // ── Obsidian band (Jobright/Tsenta dark calculator) ─────────────────
  bandBg: "#0A0A0A",
  bandCard: "#111111",
  lime: "#D4FF32",          // Jobright lime accent
  limeDim: "#B8FF9A",
  mint: "#D6FFE0",          // Jobright mint
  // ── Overlay ───────────────────────────────────────────────────────
  overlay: "rgba(6,27,49,0.45)",     // modal backdrop
  overlaySoft: "rgba(6,27,49,0.32)",
  overlayLight: "rgba(6,27,49,0.06)",
  scrim: "rgba(6,27,49,0.40)",
  // ── Shadows — Stripe blue-tinted multi-layer ──────────────────────
  shadowSm: "rgba(50,50,93,0.08) 0 1px 3px, rgba(0,0,0,0.05) 0 1px 2px",
  shadow: "rgba(50,50,93,0.12) 0 4px 12px, rgba(0,0,0,0.06) 0 1px 3px",
  shadowLg: "rgba(50,50,93,0.18) 0 8px 24px, rgba(0,0,0,0.08) 0 2px 8px",
  shadowStripe: "rgba(50,50,93,0.12) 0 4px 12px, rgba(0,0,0,0.06) 0 1px 3px",
  shadowFloat: "rgba(50,50,93,0.25) 0 13px 27px -5px, rgba(0,0,0,0.08) 0 8px 16px -8px",
  // ── Radii (Linear 6/8/12/16 + pill) ───────────────────────────────
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusPill: 999,
  // ── Layout — 8px grid ─────────────────────────────────────────────
  navHeight: 64,
  grid: 8,
  // ── Type stacks ───────────────────────────────────────────────────
  sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  sansDisplay: "'Source Sans 3', Inter, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  fontFeatures: "'cv01','ss03','calt' 1",
  fontFeatureSettings: "'cv01','ss03'",
};

export const STAGES = ["Saved", "Tailored", "Applied", "Interview", "Offer", "Rejected"];

export const STAGE_COLOR = {
  Saved: T.purple,
  Tailored: T.purpleVivid,
  Applied: T.blue,
  Interview: T.amberAccent,
  Offer: T.green,
  Rejected: T.red,
};

export const LIMITS = {
  JOBS: 50,
  JOBS_WARN: 40,
  COMPANIES: 50,
  COMPANIES_WARN: 40,
  CHAT_PER_JOB: 100,
  CHAT_WARN: 90,
};

// Badge palette for BuyCreditsModal — Starter violet, Active emerald, Power indigo
export const PACK_BADGE = {
  Starter: { bg: T.purpleLight, color: T.indigo, border: T.purpleMid },
  Active: { bg: T.greenLight, color: T.green, border: T.greenMid },
  Power: { bg: T.indigoLight, color: T.indigoDeep, border: T.indigoMid },
  // legacy aliases
  "Most Popular": { bg: T.purpleLight, color: T.indigo, border: T.purpleMid },
  "Best Value": { bg: T.greenLight, color: T.green, border: T.greenMid },
  "Maximum Volume": { bg: T.indigoLight, color: T.indigoDeep, border: T.indigoMid },
};

export const NAV_HEIGHT = 64;

// ── Compat aliases — older components reference these names ─────────
// These map onto real tokens above. Prefer the canonical names in new code.
T.textStrong = T.text;
T.stripePrimary = T.blue;
T.primary = T.blue;
T.primaryHover = T.blueHover;
T.stripeBg = T.surface;
T.stripeDark = T.indigoDeep;
T.pillBg = T.surface;
T.borderNav = T.border;
T.navBg = "rgba(255,255,255,0.8)"; // translucent nav surface (backdrop-blur pair)
T.sansTabs = T.sans;
T.tabInactive = T.muted;
T.heading = T.text;
T.slate = T.muted;
T.inter = T.sans;
T.yellow = T.amber;
T.yellowLight = T.amberLight;
T.yellowMid = T.amberMid;
T.emerald = T.green;
T.emeraldLight = T.greenLight;
T.emeraldMid = T.greenMid;
T.violet = T.blue;
T.violetLight = T.blueLight;
T.violetMid = T.blueMid;
T.hoverShadow = "0 1px 2px rgba(83,58,253,0.18)"; // small brand-tint lift on hover
