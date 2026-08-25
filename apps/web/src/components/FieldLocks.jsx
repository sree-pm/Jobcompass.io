import React, { useState, useMemo } from "react";
import { T } from "./common/Theme.js";

// Bullet-level lock toggles — each bullet/paragraph is a field
// Props: registry: Field[], locks: Record<fieldId, boolean>, onToggle(fieldId, locked)

const SECTION_META = {
  experience: { label: "Experience", icon: "💼", order: 1 },
  skills:     { label: "Skills",     icon: "🛠️", order: 2 },
  projects:   { label: "Projects",   icon: "📦", order: 3 },
  summary:    { label: "Summary",    icon: "📝", order: 4 },
  // fallback sections
  basics:       { label: "Basics / Identity", icon: "👤", order: 10 },
  education:    { label: "Education",        icon: "🎓", order: 11 },
  certifications:{label:"Certifications",    icon: "📜", order: 12 },
  custom:       { label: "Custom",           icon: "📎", order: 13 },
  metadata:     { label: "Metadata",         icon: "⚙️", order: 14 },
};

function isAlwaysLocked(f) {
  const r = f.lockReason || "";
  if (r.includes("Identity") || r.includes("Equality Act") || r.includes("Locked to A4")) return true;
  if (r.includes("Education") || r.includes("factual")) return true;
  if (f.path.startsWith("/basics") || f.path.includes("/picture") || f.path.startsWith("/metadata/page/format")) return true;
  if (f.path.startsWith("/sections/education") || f.path.startsWith("/sections/certifications")) return true;
  return false;
}

function SectionHeader({ meta, count, lockedCount, collapsed, onToggleCollapse, onBulk }) {
  const allLocked = lockedCount === count;
  const allUnlocked = lockedCount === 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: "#F2F0EA", borderBottom: `1px solid ${T.border}`, cursor: "pointer", userSelect: "none" }} onClick={onToggleCollapse}>
      <span style={{ fontSize: 12, transition: "transform .15s", transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", display: "inline-block" }}>▼</span>
      <span style={{ fontSize: 13 }}>{meta.icon}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: T.text, letterSpacing: ".02em" }}>{meta.label}</span>
      <span style={{ fontSize: 11, color: T.muted, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 20, padding: "1px 7px" }}>{lockedCount}/{count} locked</span>
      <span style={{ flex: 1 }} />
      <span style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onBulk(true)}
          disabled={allLocked}
          title="Lock all editable fields in this section"
          style={{ padding: "3px 8px", borderRadius: 5, border: `1px solid ${T.border}`, background: allLocked ? "#F2F0EA" : "#fff", color: allLocked ? T.hint : T.muted, fontSize: 11, fontWeight: 600, cursor: allLocked ? "not-allowed" : "pointer", opacity: allLocked ? 0.6 : 1 }}
        >Lock all</button>
        <button
          onClick={() => onBulk(false)}
          disabled={allUnlocked}
          title="Unlock all editable fields in this section"
          style={{ padding: "3px 8px", borderRadius: 5, border: `1px solid ${T.green}`, background: allUnlocked ? "#F2F0EA" : T.green, color: allUnlocked ? T.hint : "#fff", fontSize: 11, fontWeight: 600, cursor: allUnlocked ? "not-allowed" : "pointer", opacity: allUnlocked ? 0.6 : 1 }}
        >Unlock all</button>
      </span>
    </div>
  );
}

export function FieldLocks({ registry = [], locks = {}, onToggle }) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState({}); // { sectionKey: boolean }

  // derived effective lock state
  const effective = useMemo(() => registry.map(f => {
    const alwaysLocked = isAlwaysLocked(f);
    const isLocked = alwaysLocked || (!f.editable) || locks[f.id] === true;
    // allow explicit unlock via locks[f.id]===false only if not alwaysLocked
    const canToggle = !alwaysLocked;
    const effectiveLocked = alwaysLocked ? true : (locks[f.id] !== undefined ? locks[f.id] : !f.editable);
    return { ...f, alwaysLocked, isLocked: effectiveLocked, canToggle };
  }), [registry, locks]);

  const filtered = useMemo(() => {
    if (!query.trim()) return effective;
    const q = query.toLowerCase();
    return effective.filter(f =>
      (f.label || f.id).toLowerCase().includes(q) ||
      f.path.toLowerCase().includes(q) ||
      (f.lockReason || "").toLowerCase().includes(q)
    );
  }, [effective, query]);

  // group filtered by section
  const groups = useMemo(() => {
    const map = {};
    for (const f of filtered) {
      const key = f.section || "custom";
      if (!map[key]) map[key] = [];
      map[key].push(f);
    }
    // sort groups by SECTION_META order
    const entries = Object.entries(map).sort((a, b) => {
      const ao = SECTION_META[a[0]]?.order ?? 99;
      const bo = SECTION_META[b[0]]?.order ?? 99;
      return ao - bo;
    });
    return entries;
  }, [filtered]);

  const totalLocked = effective.filter(f => f.isLocked).length;
  const totalEditable = effective.filter(f => f.canToggle).length;
  const totalLockedEditable = effective.filter(f => f.canToggle && f.isLocked).length;

  const handleBulk = (sectionKey, lock) => {
    const fields = effective.filter(f => (f.section || "custom") === sectionKey && f.canToggle);
    fields.forEach(f => {
      if (f.isLocked !== lock) onToggle(f.id, lock);
    });
  };
  const handleGlobalBulk = (lock) => {
    effective.filter(f => f.canToggle && f.isLocked !== lock).forEach(f => onToggle(f.id, lock));
  };

  const toggleCollapse = (key) => setCollapsed(s => ({ ...s, [key]: !s[key] }));

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", background: T.card }}>
      {/* Header bar: title + search + global bulk */}
      <div style={{ padding: "10px 14px", background: T.bg, borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          Field Locks — toggle what agents may edit
        </span>
        <span style={{ fontSize: 11, color: T.muted, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 20, padding: "1px 8px", whiteSpace: "nowrap" }}>
          {totalLocked} locked · {effective.length} fields
        </span>
        <span style={{ flex: 1, minWidth: 12 }} />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => handleGlobalBulk(true)} disabled={totalLockedEditable === totalEditable} title="Lock all editable fields"
            style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: "#fff", color: T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Lock all</button>
          <button onClick={() => handleGlobalBulk(false)} disabled={totalLockedEditable === 0} title="Unlock all editable fields"
            style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.green}`, background: T.green, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Unlock all</button>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${T.border}`, background: "#fff", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: T.hint }}>🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter by label, path or reason…  e.g.  bullet,  /experience,  Identity"
          style={{ flex: 1, border: "none", outline: "none", fontSize: 12, color: T.text, fontFamily: T.sans, background: "transparent" }}
        />
        {query && <button onClick={() => setQuery("")} style={{ border: `1px solid ${T.border}`, background: T.bg, borderRadius: 6, padding: "2px 8px", fontSize: 11, cursor: "pointer", color: T.muted }}>Clear</button>}
        <span style={{ fontSize: 10, color: T.hint, whiteSpace: "nowrap" }}>{filtered.length}/{effective.length}</span>
      </div>

      {/* Sections */}
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {groups.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: T.muted }}>No fields match “{query}”</div>
        )}
        {groups.map(([key, fields]) => {
          const meta = SECTION_META[key] || { label: key.charAt(0).toUpperCase() + key.slice(1), icon: "📄", order: 99 };
          const lockedCount = fields.filter(f => f.isLocked).length;
          const isCollapsed = !!collapsed[key];
          return (
            <div key={key} style={{ borderBottom: `1px solid ${T.border}` }}>
              <SectionHeader
                meta={meta}
                count={fields.length}
                lockedCount={lockedCount}
                collapsed={isCollapsed}
                onToggleCollapse={() => toggleCollapse(key)}
                onBulk={(lock) => handleBulk(key, lock)}
              />
              {!isCollapsed && (
                <div>
                  {fields.map(f => (
                    <div
                      key={f.id}
                      title={f.alwaysLocked ? (f.lockReason || "Always locked — Equality Act / factual identity") : f.lockReason || (f.isLocked ? "Locked — agent cannot patch" : "Editable — agent may tailor")}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
                        borderTop: `1px solid ${T.border}`,
                        background: f.alwaysLocked ? "#F5F5F4" : (f.isLocked ? "#FFF7ED" : "#F0FDF4"),
                        opacity: f.alwaysLocked ? 0.92 : 1,
                      }}
                    >
                      <span style={{ fontSize: 14, flexShrink: 0, filter: f.alwaysLocked ? "grayscale(0.6)" : "none" }}>{f.isLocked ? "🔒" : "✏️"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: f.alwaysLocked ? T.hint : T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.label || f.id}</div>
                        <div style={{ fontSize: 10, color: T.muted, fontFamily: T.mono, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.path} {f.bullet ? "· bullet" : ""} {f.requiresMetric ? "· needs £/%" : ""}</div>
                        {f.lockReason && <div style={{ fontSize: 10, color: f.isLocked ? (f.alwaysLocked ? T.hint : T.yellow) : T.green }}>{f.lockReason}</div>}
                      </div>
                      {f.canToggle ? (
                        <button
                          onClick={() => onToggle(f.id, !f.isLocked)}
                          style={{
                            padding: "4px 10px", borderRadius: 6, border: `1px solid ${f.isLocked ? T.border : T.green}`,
                            background: f.isLocked ? T.card : T.green, color: f.isLocked ? T.muted : "#fff",
                            fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0
                          }}
                        >
                          {f.isLocked ? "Unlock" : "Lock"}
                        </button>
                      ) : (
                        <span
                          title={f.lockReason || "Always locked — cannot be unlocked (Identity / Education / photo / Equality Act)"}
                          style={{
                            fontSize: 10, color: "#fff", fontWeight: 700, whiteSpace: "nowrap",
                            background: "#A8A29E", borderRadius: 20, padding: "3px 8px", cursor: "help", flexShrink: 0
                          }}
                        >
                          Always locked
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "8px 14px", fontSize: 11, color: T.muted, background: T.bg, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span>🔒 Locked = agent cannot patch.</span>
        <span style={{ color: T.borderStrong }}>·</span>
        <span>Blue/bullet fields are tailorable.</span>
        <span style={{ color: T.borderStrong }}>·</span>
        <span title="Identity, Education, photo/DOB and page format are permanently locked per Equality Act / GDPR">“Always locked” is greyed with tooltip — not unlockable.</span>
      </div>
    </div>
  );
}

export function DiffView({ original, patched, operations, verifier }) {
  if (!operations?.length) return null;
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", background: T.card }}>
      <div style={{ padding: "10px 14px", background: T.bg, borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: ".06em", textTransform: "uppercase" }}>Changes — {operations.length} patch operations</span>
        {verifier && (
          <span style={{ float: "right", fontSize: 11, color: verifier.passed ? T.green : T.red, fontWeight: 700 }}>
            Verifier: {verifier.passed ? "✓ Passed" : "✗ Issues"} · Confidence {verifier.confidenceScore}%
          </span>
        )}
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {operations.map((op, i) => (
          <div key={i} style={{ padding: "8px 10px", borderRadius: 6, background: op.path?.includes("summary") ? "#FEF3EC" : "#F0FDF4", border: `1px solid ${T.border}`, fontSize: 11, fontFamily: T.mono }}>
            <span style={{ color: T.muted }}>{op.op}</span> <strong style={{ color: T.text }}>{op.path}</strong>
            <div style={{ marginTop: 4, color: T.text, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "system-ui, sans-serif" }}>
              {typeof op.value === "string" ? op.value.slice(0, 280) : JSON.stringify(op.value)?.slice(0, 280)}
            </div>
          </div>
        ))}
        {verifier?.issues?.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 6 }}>Verifier issues</div>
            {verifier.issues.map((iss, i) => (
              <div key={i} style={{ padding: "6px 10px", borderRadius: 6, background: iss.severity === "error" ? "#FEF2F2" : iss.severity === "warning" ? "#FFFBEB" : "#F5F3FF", border: `1px solid ${T.border}`, fontSize: 11, marginBottom: 4 }}>
                <strong style={{ color: iss.severity === "error" ? T.red : iss.severity === "warning" ? T.yellow : "#6d28d9" }}>[{iss.severity}]</strong> {iss.path && <span style={{ fontFamily: T.mono, color: T.muted }}>{iss.path} — </span>}{iss.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
