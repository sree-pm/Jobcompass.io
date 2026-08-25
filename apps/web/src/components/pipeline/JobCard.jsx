import React from "react";
import { T, STAGE_COLOR } from "../common/Theme.js";
import { Row, Tag } from "../common/UiPrimitives.jsx";

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
  if (v == null) return null;
  if (v >= 80) return { bg: T.greenLight, color: T.green, border: T.greenMid, label: `${v}%` };
  if (v >= 60) return { bg: T.yellowLight, color: T.yellow, border: T.yellowMid, label: `${v}%` };
  return { bg: T.redLight, color: T.red, border: T.redMid, label: `${v}%` };
}

function formatSalary(salary) {
  if (!salary) return null;
  const s = String(salary).trim();
  // ensure £ prefix when numeric
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
    try { return JSON.parse(v); } catch { return fallback; }
  }
  return v;
}

export const JobCard = React.memo(function JobCard({ job, isSelected, onClick, draggable, onDragStart, onDragEnd }) {
  const scores = parseMaybeJson(job.scores, {});
  const verifier = parseMaybeJson(job.verifier_report, null);
  const confidence = verifier?.confidenceScore ?? scores?.confidence ?? job.confidence;
  const tone = confidenceTone(confidence);
  const salaryLabel = formatSalary(job.salary);
  const updatedRaw = job.updated_at || job.updatedAt || job.created_at || job.createdAt;
  const updatedLabel = formatDate(updatedRaw);
  const statusKey = (job.status || "saved").toLowerCase();
  // map legacy awaiting_response to Tailored for color
  const colorKey = statusKey === "awaiting_response" ? "Tailored" : (job.status || "Saved");
  const statusColor = STAGE_COLOR[colorKey] || STAGE_COLOR[statusKey] || T.blue;
  const icon = sourceIcon(job.source);

  return (
    <div
      role="listitem"
      aria-selected={isSelected ? "true" : "false"}
      aria-label={`${job.role || job.title || "Role"} at ${job.company || "Unknown"}`}
      onClick={onClick}
      draggable={!!draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(e);
        }
      }}
      style={{
        background: isSelected ? T.blueLight : T.card,
        border: isSelected ? `2px solid ${T.blue}` : `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "12px 12px 10px",
        marginBottom: 10,
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: isSelected ? "0 4px 12px rgba(217,120,87,0.15)" : "0 1px 2px rgba(0,0,0,0.04)",
        outline: "none",
      }}
    >
      <Row justify="space-between" style={{ marginBottom: 6, gap: 8 }} align="center">
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
            minWidth: 0,
          }}
          title={job.role || job.title}
        >
          {job.role || job.title || "Target Role"}
        </span>
        <Tag label={job.status || "saved"} color={statusColor} />
      </Row>

      <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {job.company || "—"}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, alignItems: "center" }}>
        {job.location && (
          <span
            style={{
              fontSize: 11,
              color: T.muted,
              background: T.surface,
              border: `1px solid ${T.border}`,
              padding: "2px 7px",
              borderRadius: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={job.location}
          >
            <span aria-hidden>📍</span> {job.location}
          </span>
        )}
        {salaryLabel && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: T.text,
              background: "#fff",
              border: `1px solid ${T.borderStrong}`,
              padding: "2px 8px",
              borderRadius: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}
            aria-label={`Salary ${salaryLabel}`}
            title={salaryLabel}
          >
            <span aria-hidden style={{ color: T.green, fontWeight: 800 }}>£</span> {salaryLabel.replace(/^£\s?/, "")}
          </span>
        )}
      </div>

      <div
        style={{
          borderTop: `1px solid ${T.border}`,
          paddingTop: 7,
          marginTop: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: T.muted,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={job.source || "manual"}
        >
          <span
            aria-hidden
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: T.surface,
              border: `1px solid ${T.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: T.muted,
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{job.source ? `via ${job.source}` : "manual"}</span>
        </span>

        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {updatedLabel && (
            <span style={{ fontSize: 10, color: T.hint, fontFamily: T.mono }} title={String(updatedRaw)}>
              {updatedLabel}
            </span>
          )}
          {tone && (
            <span
              aria-label={`Confidence ${tone.label}`}
              title={`Confidence ${tone.label}`}
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: tone.color,
                background: tone.bg,
                border: `1px solid ${tone.border}`,
                padding: "2px 6px",
                borderRadius: 20,
                letterSpacing: "0.02em",
              }}
            >
              {tone.label}
            </span>
          )}
        </span>
      </div>
    </div>
  );
});
