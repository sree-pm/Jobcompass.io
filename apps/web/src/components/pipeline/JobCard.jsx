import React from "react";
import { T, STAGE_COLOR } from "../common/Theme.js";

const SOURCE_ICON_MAP = {
  adzuna: "◎",
  greenhouse: "🌱",
  lever: "⚙",
  linkedin: "in",
  indeed: "◉",
  workday: "▣",
  manual: "✎",
  reed: "R",
  totaljobs: "TJ",
};

function sourceIcon(source) {
  if (!source) return "✎";
  const k = String(source).toLowerCase();
  return SOURCE_ICON_MAP[k] || "↗";
}

function confidenceTone(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  if (n >= 80) return { bg: T.emeraldLight, color: T.emerald, border: T.emeraldMid, label: `${n}%` };
  if (n >= 60) return { bg: T.amberLight, color: T.amber, border: T.amberMid, label: `${n}%` };
  return { bg: T.redLight, color: T.red, border: T.redMid, label: `${n}%` };
}

function formatSalary(salary) {
  if (!salary) return null;
  const s = String(salary).trim();
  if (/^\d/.test(s) && !s.includes("£")) return `£${s}`;
  if (s.toLowerCase().includes("gbp")) return s;
  return s;
}

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays > 0 && diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: diffDays > 365 ? "numeric" : undefined });
  } catch {
    return "";
  }
}

function parseMaybeJson(v, fallback) {
  if (v == null) return fallback;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  }
  return v;
}

export const JobCard = React.memo(function JobCard({ job, isSelected, onClick, draggable, onDragStart, onDragEnd }) {
  const [hover, setHover] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const scores = parseMaybeJson(job.scores, {});
  const verifier = parseMaybeJson(job.verifier_report, null);
  const confidence = verifier?.confidenceScore ?? scores?.confidence ?? job.confidence;
  const tone = confidenceTone(confidence);
  const salaryRaw = formatSalary(job.salary);
  const salaryLabel = salaryRaw ? String(salaryRaw).replace(/^£\s?/, "") : null;
  const updatedRaw = job.updated_at || job.updatedAt || job.created_at || job.createdAt;
  const updatedLabel = formatDate(updatedRaw);
  const icon = sourceIcon(job.source);
  const company = job.company || "—";
  const role = job.role || job.title || "Target Role";
  const location = job.location || "";

  const borderColor = isSelected ? T.violet : T.border;
  const bg = isSelected ? T.violetLight : T.card;
  const boxShadow = hover || focused || isSelected ? T.shadowStripe : T.shadowSm;
  const transform = hover ? "translateY(-1px)" : "translateY(0)";

  return (
    <div
      role="listitem"
      aria-selected={isSelected ? "true" : "false"}
      aria-label={`${role} at ${company}`}
      tabIndex={0}
      draggable={!!draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onClick?.(e);
        }
        if (e.key === " " ) {
          // space scrolls; let Enter handle; but support Space activating
          e.preventDefault();
          onClick?.(e);
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        borderWidth: isSelected ? "1.5px" : "1px",
        borderRadius: 12,
        padding: 14,
        marginBottom: 0,
        cursor: "pointer",
        boxShadow,
        transform,
        transition: "box-shadow 150ms ease, transform 150ms ease, border-color 150ms ease, background 150ms ease",
        outline: focused ? `2px solid ${T.violet}` : "none",
        outlineOffset: focused ? 1 : 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Top: source icon 20px circle + company 14px w600 #061b31 + role 13px #64748d + drag handle */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <span
            aria-hidden
            style={{
              width: 20,
              height: 20,
              minWidth: 20,
              minHeight: 20,
              borderRadius: "50%",
              background: T.pillBg,
              border: `1px solid ${T.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: T.slate,
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            {icon}
          </span>
          <div style={{ minWidth: 0, flex: 1, lineHeight: 1.2 }}>
            <div
              title={company}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: T.ink,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {company}
            </div>
            <div
              title={role}
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: T.slate,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginTop: 1,
              }}
            >
              {role}
            </div>
          </div>
        </div>
        {/* drag handle */}
        <span
          aria-hidden
          draggable={false}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            width: 16,
            height: 20,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: hover ? T.slate : T.hint,
            fontSize: 12,
            letterSpacing: 1,
            cursor: draggable ? "grab" : "pointer",
            flexShrink: 0,
            userSelect: "none",
            opacity: 0.9,
          }}
          title="Drag to move"
        >
          ⋮⋮
        </span>
      </div>

      {/* Middle row: location pill + salary £ chip */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {location && (
          <span
            title={location}
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: T.slate,
              background: T.pillBg,
              border: `1px solid ${T.border}`,
              padding: "3px 8px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              maxWidth: 160,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            <span aria-hidden style={{ fontSize: 10 }}>●</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{location}</span>
          </span>
        )}
        {salaryLabel && (
          <span
            aria-label={`Salary £${salaryLabel}`}
            title={`£${salaryLabel}`}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.emerald,
              background: T.emeraldLight,
              border: `1px solid ${T.emeraldMid}`,
              padding: "3px 8px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontFamily: T.mono,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            £{salaryLabel}
          </span>
        )}
      </div>

      {/* Footer: confidence badge + updated relative date */}
      <div
        style={{
          borderTop: `1px solid ${T.border}`,
          paddingTop: 8,
          marginTop: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          {tone ? (
            <span
              aria-label={`Confidence ${tone.label}`}
              title={`Confidence ${tone.label}`}
              style={{
                fontSize: 10,
                fontWeight: 510,
                color: tone.color,
                background: tone.bg,
                border: `1px solid ${tone.border}`,
                padding: "2px 6px",
                borderRadius: 999,
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              {tone.label} match
            </span>
          ) : (
            <span style={{ fontSize: 10, color: T.hint, fontWeight: 500 }}>—</span>
          )}
        </span>
        {updatedLabel && (
          <span
            title={String(updatedRaw)}
            style={{
              fontSize: 11,
              color: T.hint,
              fontFamily: T.mono,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {updatedLabel}
          </span>
        )}
      </div>
    </div>
  );
});
