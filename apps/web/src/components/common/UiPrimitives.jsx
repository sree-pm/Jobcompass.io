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

export function Btn({ onClick, children, variant = "primary", size = "md", disabled = false, style = {} }) {
  const V = {
    primary: { background: T.blue, color: "#fff", border: `1px solid ${T.blue}` },
    success: { background: T.green, color: "#fff", border: `1px solid ${T.green}` },
    ghost: { background: "transparent", color: T.muted, border: `1px solid ${T.border}` },
    outline: { background: "transparent", color: T.blue, border: `1px solid ${T.blueMid}` },
    danger: { background: T.red, color: "#fff", border: `1px solid ${T.red}` },
    subtle: { background: T.blueLight, color: T.blue, border: `1px solid ${T.blueMid}` },
    indigo: { background: T.indigo, color: "#fff", border: `1px solid ${T.indigo}` },
  };
  const S = {
    xs: { padding: "3px 9px", fontSize: 11, borderRadius: 5 },
    sm: { padding: "5px 11px", fontSize: 12, borderRadius: 6 },
    md: { padding: "8px 16px", fontSize: 13, borderRadius: 7 },
    lg: { padding: "10px 22px", fontSize: 14, borderRadius: 8 },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        ...V[variant],
        ...S[size],
        fontWeight: 600,
        fontFamily: T.sans,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
        transition: "all 0.15s ease",
        ...style,
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
    background: T.bg,
    border: `1px solid ${T.border}`,
    borderRadius: 7,
    padding: "9px 13px",
    color: T.text,
    fontSize: 13,
    fontFamily: T.sans,
    outline: "none",
    boxSizing: "border-box",
    resize: multi ? "vertical" : "none",
    transition: "border-color 0.15s",
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

export function Tag({ label, color = T.blue, bg }) {
  return (
    <span
      style={{
        background: bg || color + "18",
        color,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 20,
        letterSpacing: "0.03em",
      }}
    >
      {label}
    </span>
  );
}

export function ScoreBar({ label, score, target = 75, note }) {
  const color = score >= target ? T.green : score >= target - 15 ? T.yellow : T.red;
  return (
    <div style={{ marginBottom: 14 }}>
      <Row justify="space-between" style={{ marginBottom: 4 }}>
        <div>
          <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{label}</span>
          {note && <span style={{ fontSize: 11, color: T.muted, marginLeft: 6 }}>{note}</span>}
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color }}>{score}</span>
      </Row>
      <div style={{ background: T.surface, borderRadius: 4, height: 6 }}>
        <div style={{ background: color, width: `${Math.min(score, 100)}%`, height: "100%", borderRadius: 4, transition: "width 0.8s ease-out" }} />
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
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(2px)",
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
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
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
  const barColor = count >= limit ? T.red : count >= warn ? T.yellow : color || T.green;
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
