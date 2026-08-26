import React, { useState, useMemo, useCallback } from "react";
import { T } from "./common/Theme.js";

// ── Section order — Linear density, Stripe clarity ──────────────────────────
// Spec order: Experience / Skills / Projects / Summary / Basics / Education / custom
const SECTION_META = {
  experience:     { label: "Experience",         order: 1 },
  skills:         { label: "Skills",             order: 2 },
  projects:       { label: "Projects",           order: 3 },
  summary:        { label: "Summary",            order: 4 },
  basics:         { label: "Basics / Identity",  order: 5 },
  education:      { label: "Education",          order: 6 },
  certifications: { label: "Certifications",     order: 7 },
  custom:         { label: "Custom",             order: 8 },
  metadata:       { label: "Metadata",           order: 9 },
};

// ── Always-locked predicate ─────────────────────────────────────────────────
// Mirrors UK forbidden logic: /basics, /picture, education|certifications, equality act
function isAlwaysLocked(f) {
  const r = f.lockReason || "";
  if (r.includes("Identity") || r.includes("Equality Act") || r.includes("Locked to A4")) return true;
  if (r.includes("Education") || r.includes("factual")) return true;
  if (f.path?.startsWith("/basics") || f.path?.includes("/picture") || f.path?.startsWith("/metadata/page/format")) return true;
  if (f.path?.startsWith("/sections/education") || f.path?.startsWith("/sections/certifications")) return true;
  return false;
}

// ── Stripe checkbox (16px square, 4px radius) ───────────────────────────────
function StripeCheck({ checked, disabled, alwaysLocked }) {
  return (
    <span
      aria-hidden
      style={{
        width: 16, height: 16, minWidth: 16, minHeight: 16,
        borderRadius: 4,
        border: `1.5px solid ${checked ? T.blue : T.borderStrong}`,
        background: checked ? T.blue : T.card,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        transition: "background 0.14s, border-color 0.14s, opacity 0.14s",
        opacity: disabled ? 0.6 : 1,
        filter: alwaysLocked ? "grayscale(0.2)" : "none",
        // subtle inner shadow when unchecked
        boxShadow: checked ? "none" : `inset 0 0 0 1px ${T.overlayLight}`,
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2.2 5.1L4.1 7L7.9 3.1" stroke={T.card} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

// ── Memoised row — 40px, 6px radius, hover T.surface ─────────────────────────
const FieldRow = React.memo(function FieldRow({ f, onToggle }) {
  const locked = f.isLocked;
  const always = f.alwaysLocked;
  const canToggle = f.canToggle;

  const handleToggle = useCallback(() => {
    if (!canToggle) return;
    onToggle(f.id, !locked);
  }, [canToggle, f.id, locked, onToggle]);

  const tooltip = always
    ? (f.lockReason || "Always locked — Equality Act 2010 / GDPR: identity, photo/DOB and education are factual and cannot be edited by agents.")
    : (f.lockReason || (locked ? "Locked — agent cannot patch this field" : "Editable — agent may tailor this field"));

  return (
    <div
      title={tooltip}
      onClick={canToggle ? handleToggle : undefined}
      role={canToggle ? "button" : undefined}
      tabIndex={canToggle ? 0 : undefined}
      onKeyDown={canToggle ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggle(); } } : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        minHeight: 40,
        height: 40,
        padding: "0 12px",
        borderRadius: 6,
        background: always ? T.surfaceAlt : "transparent",
        opacity: always ? 0.6 : 1,
        filter: always ? "grayscale(0.2)" : "none",
        cursor: canToggle ? "pointer" : "default",
        transition: "background 0.12s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => { if (!always) e.currentTarget.style.background = T.surface; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = always ? T.surfaceAlt : "transparent"; }}
    >
      {/* Checkbox — left */}
      {canToggle ? (
        <StripeCheck checked={locked} disabled={false} alwaysLocked={false} />
      ) : (
        <StripeCheck checked={true} disabled={true} alwaysLocked={true} />
      )}

      {/* Label + path */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
        <span style={{
          fontSize: 13,
          fontWeight: 500,
          color: T.text,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          lineHeight: "16px",
          fontFamily: T.sans,
          filter: always ? "grayscale(0.2)" : "none",
        }}>
          {f.label || f.id}
        </span>
        <span style={{
          fontSize: 11,
          color: T.hint,
          fontFamily: T.mono,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          lineHeight: "13px",
        }}>
          {f.path}{f.bullet ? " · bullet" : ""}{f.requiresMetric ? " · needs £/%" : ""}
        </span>
      </div>

      {/* Right: badge or lock state hint */}
      {always ? (
        <span
          title="Always locked — Equality Act 2010 / GDPR: identity, photo, education and factual fields are permanently locked and cannot be tailored."
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: T.hint,
            background: T.surfaceCool,
            border: `1px solid ${T.border}`,
            borderRadius: 999,
            padding: "3px 8px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            cursor: "help",
          }}
        >
          Always locked
        </span>
      ) : (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: locked ? T.muted : T.blue,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {locked ? "Locked" : "Editable"}
        </span>
      )}
    </div>
  );
});

// ── Accordion section header — 13px sans 510 T.muted, chevron ▼ ────────────
function SectionAccordionHeader({ meta, count, lockedCount, collapsed, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        background: T.surface,
        border: "none",
        borderBottom: collapsed ? "none" : `1px solid ${T.border}`,
        cursor: "pointer",
        textAlign: "left",
        borderRadius: 0,
        // top radius handled by parent overflow hidden
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: T.muted,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 14, height: 14,
          transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
          transition: "transform 0.15s ease",
          flexShrink: 0,
        }}
        aria-hidden
      >
        ▼
      </span>
      <span style={{
        fontSize: 13,
        fontWeight: 510,
        fontFamily: T.sans,
        color: T.muted,
        letterSpacing: "0.01em",
        flexShrink: 0,
      }}>
        {meta.label}
      </span>
      <span style={{
        fontSize: 11,
        fontFamily: T.mono,
        color: T.muted,
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 999,
        padding: "1px 7px",
        lineHeight: "16px",
        flexShrink: 0,
      }}>
        {lockedCount}/{count}
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 11, fontFamily: T.mono, color: T.hint, fontWeight: 500 }}>
        {collapsed ? "Expand" : "Collapse"}
      </span>
    </button>
  );
}

// ── Ghost bulk button — T.surface → T.blue hover ──────────────────────────────
function GhostBulkBtn({ children, onClick, disabled, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: "0 12px",
        height: 30,
        borderRadius: 6,
        border: `1px solid ${T.border}`,
        background: T.surface,
        color: disabled ? T.hint : T.muted,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: T.sans,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        whiteSpace: "nowrap",
        transition: "all 0.14s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = T.blue;
        e.currentTarget.style.color = T.card;
        e.currentTarget.style.borderColor = T.blue;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = T.surface;
        e.currentTarget.style.color = T.muted;
        e.currentTarget.style.borderColor = T.border;
      }}
    >
      {children}
    </button>
  );
}

// ── Main FieldLocks — Stripe clarity + Linear density ────────────────────────
export function FieldLocks(props) {
  // Support both contracts:
  //  - legacy: { registry, locks, onToggle }
  //  - spec:   { candidate, fieldLocks, onToggle, storageMeter }
  const registry = props.registry ?? props.candidate?.registry ?? [];
  const locks = props.locks ?? props.fieldLocks ?? {};
  const onToggle = props.onToggle;
  const storageMeter = props.storageMeter ?? null;

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [collapsed, setCollapsed] = useState({});

  // effective lock state — preserve original contract: locks[id]===true => locked
  const effective = useMemo(() => registry.map((f) => {
    const alwaysLocked = isAlwaysLocked(f);
    const canToggle = !alwaysLocked;
    // alwaysLocked forces true; otherwise explicit locks[id] wins, fallback to !editable
    const effectiveLocked = alwaysLocked ? true : (locks[f.id] !== undefined ? locks[f.id] : !f.editable);
    return { ...f, alwaysLocked, isLocked: effectiveLocked, canToggle };
  }), [registry, locks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return effective;
    return effective.filter((f) =>
      (f.label || f.id).toLowerCase().includes(q) ||
      f.path.toLowerCase().includes(q) ||
      (f.lockReason || "").toLowerCase().includes(q)
    );
  }, [effective, query]);

  const groups = useMemo(() => {
    const map = {};
    for (const f of filtered) {
      const key = f.section || "custom";
      if (!map[key]) map[key] = [];
      map[key].push(f);
    }
    const entries = Object.entries(map).sort((a, b) => {
      const ao = SECTION_META[a[0]]?.order ?? 99;
      const bo = SECTION_META[b[0]]?.order ?? 99;
      return ao - bo;
    });
    return entries;
  }, [filtered]);

  const totalLocked = effective.filter((f) => f.isLocked).length;
  const totalLockedEditable = effective.filter((f) => f.canToggle && f.isLocked).length;
  const totalEditable = effective.filter((f) => f.canToggle).length;

  const handleBulk = useCallback((sectionKey, lock) => {
    const fields = effective.filter((f) => (f.section || "custom") === sectionKey && f.canToggle);
    fields.forEach((f) => { if (f.isLocked !== lock) onToggle?.(f.id, lock); });
  }, [effective, onToggle]);

  const handleGlobalBulk = useCallback((lock) => {
    effective.filter((f) => f.canToggle && f.isLocked !== lock).forEach((f) => onToggle?.(f.id, lock));
  }, [effective, onToggle]);

  const toggleCollapse = useCallback((key) => setCollapsed((s) => ({ ...s, [key]: !s[key] })), []);

  const allEditableLocked = totalEditable > 0 && totalLockedEditable === totalEditable;
  const allEditableUnlocked = totalLockedEditable === 0;

  return (
    <div
      style={{
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusMd,
        overflow: "hidden",
        background: T.card,
        boxShadow: T.shadowSm,
      }}
    >
      {/* ── Header: 18px T.heading 600 + subtitle + right actions ─────────── */}
      <div
        style={{
          padding: "16px 16px 12px",
          background: T.card,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 180, flex: "1 1 auto" }}>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: T.heading,
            fontFamily: T.sans,
            letterSpacing: "-0.02em",
            lineHeight: "22px",
          }}>
            Field locks
          </div>
          <div style={{
            fontSize: 13,
            color: T.muted,
            fontFamily: T.sans,
            marginTop: 3,
            lineHeight: "16px",
          }}>
            Choose what agents may tailor — locked bullets stay verbatim.
          </div>
        </div>

        {/* Right actions: Search + Clear + bulk */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span style={{
              position: "absolute", left: 10, pointerEvents: "none",
              fontSize: 12, color: T.hint, lineHeight: 1,
            }}>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search fields…"
              aria-label="Search fields"
              style={{
                width: 280,
                height: 36,
                padding: "0 12px 0 28px",
                borderRadius: 6,
                border: `1px solid ${focused ? T.blue : T.border}`,
                boxShadow: focused ? `0 0 0 3px ${T.blue}14` : "none",
                background: T.card,
                color: T.text,
                fontSize: 13,
                fontFamily: T.sans,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.14s, box-shadow 0.14s",
              }}
            />
          </div>

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              style={{
                height: 36,
                padding: "0 12px",
                borderRadius: 6,
                border: `1px solid ${T.border}`,
                background: T.card,
                color: T.muted,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: T.sans,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.14s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.borderStrong; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; }}
            >
              Clear
            </button>
          )}

          <GhostBulkBtn
            onClick={() => handleGlobalBulk(true)}
            disabled={allEditableLocked}
            title="Lock all editable fields"
          >
            Lock all
          </GhostBulkBtn>
          <GhostBulkBtn
            onClick={() => handleGlobalBulk(false)}
            disabled={allEditableUnlocked}
            title="Unlock all editable fields"
          >
            Unlock all
          </GhostBulkBtn>
        </div>
      </div>

      {/* ── Stats row: 12px mono T.muted ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          padding: "8px 16px",
          background: T.card,
          borderBottom: `1px solid ${T.border}`,
          fontSize: 12,
          fontFamily: T.mono,
          color: T.muted,
          lineHeight: "16px",
        }}
      >
        <span>{filtered.length}/{effective.length} shown</span>
        <span style={{ width: 3, height: 3, borderRadius: 999, background: T.borderStrong, display: "inline-block" }} />
        <span>{totalLocked} locked</span>
        <span style={{ width: 3, height: 3, borderRadius: 999, background: T.borderStrong, display: "inline-block" }} />
        <span>{effective.length - totalLocked} editable</span>
        {query && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: T.borderStrong, display: "inline-block" }} />
            <span style={{ color: T.text, fontWeight: 600 }}>filter: “{query}”</span>
          </>
        )}
        <span style={{ flex: 1 }} />
        {storageMeter ? <span style={{ fontFamily: T.sans }}>{storageMeter}</span> : null}
      </div>

      {/* ── Body: grouped accordion ──────────────────────────────────────── */}
      <div style={{ maxHeight: 520, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 8, background: T.card }}>
        {groups.length === 0 && (
          <div style={{ padding: 28, textAlign: "center", fontSize: 13, color: T.muted, fontFamily: T.sans, border: `1px dashed ${T.border}`, borderRadius: T.radiusMd, background: T.surface }}>
            No fields match “{query}”
          </div>
        )}
        {groups.map(([key, fields]) => {
          const meta = SECTION_META[key] || { label: key.charAt(0).toUpperCase() + key.slice(1), order: 99 };
          const lockedCount = fields.filter((f) => f.isLocked).length;
          const isCollapsed = !!collapsed[key];
          return (
            <div
              key={key}
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusMd,
                overflow: "hidden",
                background: T.card,
              }}
            >
              <SectionAccordionHeader
                meta={meta}
                count={fields.length}
                lockedCount={lockedCount}
                collapsed={isCollapsed}
                onToggle={() => toggleCollapse(key)}
              />
              {!isCollapsed && (
                <div style={{ padding: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* per-section bulk (subtle, Linear density) */}
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", padding: "4px 6px 6px" }}>
                    <button
                      type="button"
                      onClick={() => handleBulk(key, true)}
                      disabled={fields.every((f) => !f.canToggle || f.isLocked)}
                      style={{
                        fontSize: 11, fontWeight: 600, fontFamily: T.sans,
                        color: T.muted, background: "transparent", border: "none",
                        cursor: "pointer", padding: "2px 6px", borderRadius: 4,
                        opacity: fields.every((f) => !f.canToggle || f.isLocked) ? 0.45 : 1,
                      }}
                    >
                      Lock all
                    </button>
                    <span style={{ color: T.border, fontSize: 11, lineHeight: "18px" }}>·</span>
                    <button
                      type="button"
                      onClick={() => handleBulk(key, false)}
                      disabled={fields.every((f) => !f.canToggle || !f.isLocked)}
                      style={{
                        fontSize: 11, fontWeight: 600, fontFamily: T.sans,
                        color: T.muted, background: "transparent", border: "none",
                        cursor: "pointer", padding: "2px 6px", borderRadius: 4,
                        opacity: fields.every((f) => !f.canToggle || !f.isLocked) ? 0.45 : 1,
                      }}
                    >
                      Unlock all
                    </button>
                  </div>
                  {fields.map((f) => (
                    <FieldRow key={f.id} f={f} onToggle={onToggle} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer legend — subtle, Linear density */}
      <div style={{
        padding: "9px 16px",
        fontSize: 11,
        color: T.muted,
        fontFamily: T.sans,
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
        lineHeight: "14px",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, border: `1.5px solid ${T.blue}`, background: T.blue, display: "inline-block" }} />
          Locked
        </span>
        <span style={{ color: T.borderStrong }}>·</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, border: `1.5px solid ${T.borderStrong}`, background: T.card, display: "inline-block" }} />
          Editable
        </span>
        <span style={{ color: T.borderStrong }}>·</span>
        <span title="Always locked rows are T.surfaceAlt, grayscale 0.2, opacity 0.6 — Equality Act 2010 / GDPR: identity, photo/DOB and education cannot be unlocked." style={{ cursor: "help", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 2 }}>
          Always locked = Equality Act — not toggleable
        </span>
      </div>
    </div>
  );
}

export function DiffView({ original, patched, operations, verifier }) {
  if (!operations?.length) return null;
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: T.radiusMd, overflow: "hidden", background: T.card, boxShadow: T.shadowSm }}>
      <div style={{ padding: "12px 16px", background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: ".04em", textTransform: "uppercase", fontFamily: T.sans }}>
          Changes — {operations.length} patch operations
        </span>
        {verifier && (
          <span style={{ fontSize: 12, color: verifier.passed ? T.green : T.red, fontWeight: 700, fontFamily: T.sans }}>
            Verifier: {verifier.passed ? "✓ Passed" : "✗ Issues"} · Confidence {verifier.confidenceScore}%
          </span>
        )}
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {operations.map((op, i) => (
          <div key={i} style={{ padding: "9px 11px", borderRadius: 6, background: op.path?.includes("summary") ? T.blueLight : T.surface, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.mono }}>
            <span style={{ color: T.muted }}>{op.op}</span> <strong style={{ color: T.text }}>{op.path}</strong>
            <div style={{ marginTop: 5, color: T.text, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: T.sans, fontSize: 12 }}>
              {typeof op.value === "string" ? op.value.slice(0, 280) : JSON.stringify(op.value)?.slice(0, 280)}
            </div>
          </div>
        ))}
        {verifier?.issues?.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8, fontFamily: T.sans }}>Verifier issues</div>
            {verifier.issues.map((iss, i) => (
              <div key={i} style={{ padding: "7px 11px", borderRadius: 6, background: iss.severity === "error" ? T.redLight : iss.severity === "warning" ? T.yellowLight : T.purpleLight, border: `1px solid ${T.border}`, fontSize: 12, marginBottom: 6, fontFamily: T.sans }}>
                <strong style={{ color: iss.severity === "error" ? T.red : iss.severity === "warning" ? T.amber : T.indigo }}>[{iss.severity}]</strong> {iss.path && <span style={{ fontFamily: T.mono, color: T.muted }}>{iss.path} — </span>}{iss.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
