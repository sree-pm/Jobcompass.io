import React from "react";
import { T } from "./Theme.js";

export function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "20px",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s, box-shadow 0.15s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Row({ children, gap = 10, align = "center", justify = "flex-start", wrap, style = {} }) {
  return (
    <div
      style={{
        display: "flex",
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Btn({ onClick, children, variant = "primary", size = "md", disabled = false, style = {}, title }) {
  const V = {
    primary: {
      background: T.blue,
      color: T.card,
      border: `1px solid ${T.blue}`,
      boxShadow: T.shadowStripe,
    },
    stripe: {
      background: T.blue,
      color: T.card,
      border: `1px solid ${T.blue}`,
      boxShadow: T.shadowStripe,
    },
    indigo: {
      background: T.indigo,
      color: T.card,
      border: `1px solid ${T.indigo}`,
      boxShadow: T.shadowSm,
    },
    ghost: {
      background: T.card,
      color: T.text,
      border: `1px solid ${T.border}`,
    },
    outline: {
      background: "transparent",
      color: T.text,
      border: `1px solid ${T.borderStrong}`,
    },
    subtle: {
      background: T.surface,
      color: T.blue,
      border: `1px solid ${T.border}`,
    },
    success: { background: T.green, color: T.card, border: `1px solid ${T.green}` },
    danger: { background: T.red, color: T.card, border: `1px solid ${T.red}` },
  };
  const S = {
    xs: { padding: "3px 9px", fontSize: 11, borderRadius: 6, minHeight: 26 },
    sm: { padding: "5px 11px", fontSize: 12, borderRadius: 6, minHeight: 30 },
    md: { padding: "0 16px", fontSize: 13, borderRadius: 6, minHeight: 36, height: 36 },
    lg: { padding: "0 22px", fontSize: 14, borderRadius: 6, minHeight: 40, height: 40 },
  };
  const base = V[variant] || V.primary;
  const sz = S[size] || S.md;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={title}
      disabled={disabled}
      style={{
        ...base,
        ...sz,
        fontWeight: 600,
        fontFamily: T.sans,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
        transition: "all 0.15s ease",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === "subtle") {
          e.currentTarget.style.background = T.blue;
          e.currentTarget.style.color = T.card;
          e.currentTarget.style.borderColor = T.blue;
        }
        if (variant === "ghost" || variant === "outline") {
          e.currentTarget.style.borderColor = T.blue;
        }
      }}
      onMouseLeave={e => {
        if (variant === "subtle") {
          e.currentTarget.style.background = T.surface;
          e.currentTarget.style.color = T.blue;
          e.currentTarget.style.borderColor = T.border;
        }
        if (variant === "ghost" || variant === "outline") {
          e.currentTarget.style.borderColor = variant === "outline" ? T.borderStrong : T.border;
        }
      }}
    >
      {children}
    </button>
  );
}

export function Label({ children }) {
  return (
    <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 5 }}>
      {children}
    </div>
  );
}

export function Field({ label, value, onChange, placeholder, multi, rows = 4, style = {}, type = "text" }) {
  const base = {
    width: "100%",
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusSm,
    height: multi ? undefined : 44,
    minHeight: multi ? undefined : 44,
    padding: multi ? "10px 13px" : "0 13px",
    color: T.text,
    fontSize: 13,
    fontFamily: T.sans,
    outline: "none",
    boxSizing: "border-box",
    resize: multi ? "vertical" : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <Label>{label}</Label>}
      {multi ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={base} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
    </div>
  );
}

export function Tag({ label, color, bg }) {
  const c = color || T.blue;
  return (
    <span
      style={{
        background: bg || c + "14",
        color: c,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 20,
        letterSpacing: "0.03em",
        border: `1px solid ${c}28`,
      }}
    >
      {label}
    </span>
  );
}

export function ScoreBar({ label, score, target = 75, note }) {
  const color = score >= target ? T.green : score >= target - 15 ? T.amberAccent : T.red;
  return (
    <div style={{ marginBottom: 14 }}>
      <Row justify="space-between" style={{ marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{label}</span>
          {note && <span style={{ fontSize: 11, color: T.muted, marginLeft: 6 }}>{note}</span>}
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color }}>{score}</span>
      </Row>
      <div style={{ background: T.surface, borderRadius: 999, height: 6, overflow: "hidden", border: `1px solid ${T.border}` }}>
        <div style={{ background: color, width: `${Math.min(score, 100)}%`, height: "100%", borderRadius: 999, transition: "width 0.8s ease-out" }} />
      </div>
    </div>
  );
}

export function Modal({ title, children, onClose, maxWidth = 520 }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: T.overlay,
        backdropFilter: "blur(3px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: 28,
          maxWidth,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: T.shadowFloat,
        }}
      >
        <Row justify="space-between" style={{ marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.text }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: T.muted, lineHeight: 1 }}
          >
            ×
          </button>
        </Row>
        {children}
      </div>
    </div>
  );
}

export function Empty({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: T.muted }}>
      <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.7 }}>{icon}</div>
      <div style={{ fontSize: 15, color: T.text, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{sub}</div>
    </div>
  );
}

export function StorageMeter({ count, limit, warn, label, color }) {
  const pct = Math.min((count / limit) * 100, 100);
  const barColor = count >= limit ? T.red : count >= warn ? T.amberAccent : color || T.green;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ fontSize: 10, fontFamily: T.mono, color: T.muted }}>
          {count}/{limit}
        </span>
      </div>
      <div style={{ background: T.surface, borderRadius: 3, height: 4 }}>
        <div style={{ background: barColor, width: `${pct}%`, height: "100%", borderRadius: 3, transition: "width 0.4s ease-out" }} />
      </div>
    </div>
  );
}
