import React, { useState, useMemo } from "react";
import { T } from "../common/Theme.js";
import { Row, Btn } from "../common/UiPrimitives.jsx";

function initialsFromCandidate(candidate) {
  const raw = (candidate?.full_name || candidate?.fullName || candidate?.email || "U").trim();
  if (!raw) return "U";
  // if email without name, take first char
  if (raw.includes("@") && !raw.includes(" ")) return raw[0].toUpperCase();
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const TABS = [
  { id: "pipeline", label: "Pipeline", icon: "📊" },
  { id: "hitl", label: "HITL", icon: "🔍" },
  { id: "master_cv", label: "Master CV", icon: "📄" },
  { id: "constraints", label: "Constraints", icon: "🛡️" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function Navbar({ activeTab, onTabChange, candidate, onOpenNewJob, credits = 0, onOpenBuyCredits, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const initials = useMemo(() => initialsFromCandidate(candidate), [candidate]);

  const handleLogout = () => {
    if (onLogout) return onLogout();
    localStorage.removeItem("agentic_cv_uk_token");
    window.location.reload();
  };

  const lowCredits = credits <= 2;

  return (
    <header
      style={{
        background: T.card,
        borderBottom: `1px solid ${T.border}`,
        padding: "10px 20px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(28,25,23,0.04)",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        {/* left: brand + tabs (desktop) */}
        <Row gap={16} style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>🇬🇧</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 6 }}>
                Agentic CV
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.blue,
                    background: T.blueLight,
                    padding: "2px 6px",
                    borderRadius: 4,
                    border: `1px solid ${T.blueMid}`,
                    letterSpacing: "0.04em",
                  }}
                >
                  HITL Core
                </span>
              </div>
              <div style={{ fontSize: 10.5, color: T.muted, display: "none" }} className="nav-sub">UK-First · Factual Bullet Locks · Human In The Loop</div>
            </div>
          </div>

          {/* desktop tabs */}
          <nav
            className="nav-tabs-desktop"
            style={{ display: "flex", gap: 4, marginLeft: 12, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  style={{
                    padding: "7px 13px",
                    borderRadius: 7,
                    border: active ? `1px solid ${T.blueMid}` : "1px solid transparent",
                    background: active ? T.blueLight : "transparent",
                    color: active ? T.blue : T.text,
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ fontSize: 13 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </Row>

        {/* right: actions */}
        <Row gap={10} style={{ flexShrink: 0 }}>
          {/* credit pill */}
          <button
            onClick={onOpenBuyCredits}
            title={`${credits} credits — click to top up`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 20,
              border: `1px solid ${lowCredits ? T.redMid : T.border}`,
              background: lowCredits ? T.redLight : T.surface,
              color: lowCredits ? T.red : T.text,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <span>🪙</span>
            <span>{credits} Credits</span>
            {lowCredits && <span style={{ fontSize: 10, fontWeight: 800 }}>· Low</span>}
          </button>

          {/* Top up — secondary */}
          <Btn variant="outline" size="sm" onClick={onOpenBuyCredits} style={{ display: "inline-flex" }} className="nav-topup">
            Top up
          </Btn>

          {/* Primary: Add / Scrape Job */}
          <Btn onClick={onOpenNewJob} size="sm" variant="primary" style={{ whiteSpace: "nowrap" }}>
            <span className="nav-add-label-full">+ Add / Scrape Job</span>
            <span className="nav-add-label-short" style={{ display: "none" }}>
              + Add Job
            </span>
          </Btn>

          {/* avatar + logout (desktop) */}
          {candidate ? (
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }} className="nav-avatar-wrap">
              <button
                onClick={() => setAvatarMenuOpen((v) => !v)}
                title={candidate.full_name || candidate.fullName || candidate.email || "Account"}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 99,
                  background: T.blue,
                  color: "#fff",
                  border: `1px solid ${T.blue}`,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  letterSpacing: "0.04em",
                }}
              >
                {initials}
              </button>
              <div style={{ textAlign: "left", lineHeight: 1.2 }} className="nav-candidate-meta">
                <div style={{ fontSize: 11, fontWeight: 700, color: T.text, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {candidate.full_name || candidate.fullName || "Candidate"}
                </div>
                <div style={{ fontSize: 10, color: T.muted, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {(candidate.target_role || candidate.targetRole || "UK Tech") + " · "} <span style={{ fontFamily: T.mono, fontSize: 10 }}>{credits} cr</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                style={{
                  background: "transparent",
                  border: `1px solid ${T.border}`,
                  borderRadius: 6,
                  padding: "5px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.muted,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
                className="nav-logout-btn"
              >
                ⎋ Logout
              </button>

              {/* dropdown for mobile tap */}
              {avatarMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: T.card,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    padding: 8,
                    boxShadow: T.shadowLg,
                    minWidth: 200,
                    zIndex: 200,
                  }}
                >
                  <div style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}`, marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{candidate.full_name || candidate.fullName}</div>
                    <div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis" }}>{candidate.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "none",
                      background: T.redLight,
                      color: T.red,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ⎋ Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <span style={{ fontSize: 11, color: T.hint }}>Not signed in</span>
          )}

          {/* hamburger (mobile) */}
          <button
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="nav-hamburger"
            style={{
              display: "none",
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: T.card,
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: T.text,
              flexShrink: 0,
            }}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </Row>
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div
          className="nav-mobile-drawer"
          style={{
            marginTop: 12,
            padding: 12,
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileOpen(false);
                  }}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: active ? `1px solid ${T.blueMid}` : `1px solid ${T.border}`,
                    background: active ? T.blueLight : T.surface,
                    color: active ? T.blue : T.text,
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              );
            })}
          </div>
          <div style={{ height: 1, background: T.border, margin: "4px 0" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="outline" size="sm" onClick={() => { setMobileOpen(false); onOpenBuyCredits?.(); }} style={{ flex: 1 }}>
              🪙 {credits} · Top up
            </Btn>
            <Btn variant="primary" size="sm" onClick={() => { setMobileOpen(false); onOpenNewJob?.(); }} style={{ flex: 1 }}>
              + Add / Scrape Job
            </Btn>
          </div>
          {candidate && (
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${T.redMid}`,
                background: T.redLight,
                color: T.red,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ⎋ Logout — {candidate.email || initials}
            </button>
          )}
        </div>
      )}

      {/* responsive CSS */}
      <style>{`
        @media (max-width: 980px) {
          .nav-tabs-desktop { display: none !important; }
          .nav-hamburger { display: inline-flex !important; }
          .nav-candidate-meta { display: none !important; }
          .nav-logout-btn { display: none !important; }
        }
        @media (max-width: 640px) {
          .nav-topup { display: none !important; }
          .nav-add-label-full { display: none !important; }
          .nav-add-label-short { display: inline !important; }
        }
        @media (min-width: 981px) {
          .nav-mobile-drawer { display: none !important; }
        }
      `}</style>
    </header>
  );
}
