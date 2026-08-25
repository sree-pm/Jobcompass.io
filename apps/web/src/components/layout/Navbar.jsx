import React, { useState, useMemo, useEffect, useRef } from "react";
import { T } from "../common/Theme.js";
import { Row, Btn } from "../common/UiPrimitives.jsx";

function initialsFromCandidate(candidate) {
  const raw = (candidate?.full_name || candidate?.fullName || candidate?.email || "U").trim();
  if (!raw) return "U";
  if (raw.includes("@") && !raw.includes(" ")) return raw[0].toUpperCase();
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const TABS = [
  { id: "pipeline", label: "Pipeline" },
  { id: "hitl", label: "HITL" },
  { id: "master_cv", label: "Master CV" },
  { id: "constraints", label: "Constraints" },
  { id: "settings", label: "Settings" },
];

export function Navbar({ activeTab, onTabChange, candidate, onOpenNewJob, credits = 0, onOpenBuyCredits, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef(null);

  const initials = useMemo(() => initialsFromCandidate(candidate), [candidate]);

  const handleLogout = () => {
    if (onLogout) return onLogout();
    localStorage.removeItem("agentic_cv_uk_token");
    window.location.reload();
  };

  // close avatar menu on outside click
  useEffect(() => {
    if (!avatarMenuOpen) return;
    const onDocClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [avatarMenuOpen]);

  // Cmd+K handler — focus search trigger (visual only, extensible)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // placeholder: could open command palette
        document.getElementById("navbar-cmdk-trigger")?.focus();
      }
      if (e.key === "Escape") {
        setMobileOpen(false);
        setAvatarMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // lock body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  return (
    <>
      <header
        role="banner"
        style={{
          height: 56,
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: T.navBg,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${T.borderNav}`,
          // ensure blur stacks above content
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            boxSizing: "border-box",
          }}
        >
          {/* Left: Logotype */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, minWidth: 0 }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onTabChange?.("pipeline"); }}
              style={{ display: "flex", alignItems: "baseline", gap: 8, textDecoration: "none", flexShrink: 0 }}
              aria-label="Agentic CV home"
            >
              <span
                style={{
                  fontFamily: T.sansDisplay,
                  fontSize: 17,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: T.textStrong,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                Agentic CV
              </span>
              <span
                style={{
                  fontFamily: T.sansTabs,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: T.tabInactive,
                  borderLeft: `1px solid ${T.borderNav}`,
                  paddingLeft: 8,
                  lineHeight: 1,
                }}
              >
                UK
              </span>
            </a>
          </div>

          {/* Center: Tabs (desktop) */}
          <nav
            aria-label="Primary"
            className="nav-tabs-desktop"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              justifyContent: "center",
              height: "100%",
              minWidth: 0,
            }}
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <div key={tab.id} style={{ position: "relative", display: "flex", alignItems: "center", height: "100%" }}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-current={active ? "page" : undefined}
                    onClick={() => onTabChange(tab.id)}
                    className="nav-tab-btn"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid transparent",
                      background: active ? T.pillBg : "transparent",
                      color: active ? T.textStrong : T.tabInactive,
                      fontFamily: T.sansTabs,
                      fontSize: 13,
                      fontWeight: 510,
                      lineHeight: "20px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "background 150ms ease, color 150ms ease, box-shadow 150ms ease",
                      outline: "none",
                      position: "relative",
                    }}
                  >
                    {tab.label}
                  </button>
                  {active && (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: 6,
                        right: 6,
                        bottom: 0,
                        height: 2,
                        background: T.primary,
                        borderRadius: 999,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Cmd+K search trigger */}
            <button
              id="navbar-cmdk-trigger"
              type="button"
              aria-label="Search (Cmd+K)"
              onClick={() => {
                // placeholder — dispatch custom event for future command palette
                window.dispatchEvent(new CustomEvent("agentic-cv:open-command-palette"));
              }}
              className="nav-cmdk nav-cmdk-desktop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 6,
                background: T.pillBg,
                border: `1px solid ${T.borderNav}`,
                color: T.tabInactive,
                fontFamily: T.sansTabs,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span aria-hidden style={{ fontSize: 12, opacity: 0.9 }}>⌕</span>
                <span style={{ color: T.tabInactive }}>Search</span>
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2px 6px",
                  borderRadius: 6,
                  background: T.card,
                  border: `1px solid ${T.borderNav}`,
                  fontFamily: T.sansTabs,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  color: T.tabInactive,
                  lineHeight: 1,
                }}
              >
                ⌘K
              </span>
            </button>

            {/* Credit pill */}
            <button
              type="button"
              onClick={onOpenBuyCredits}
              title={`${credits} credits — click to top up`}
              aria-label={`${credits} credits`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${T.greenMid}`,
                background: T.greenLight,
                color: T.green,
                fontFamily: T.sansTabs,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                lineHeight: 1,
                transition: "transform 120ms ease",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: T.green,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span>{credits} credits</span>
            </button>

            {/* Top up ghost */}
            <button
              type="button"
              onClick={onOpenBuyCredits}
              className="nav-topup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "7px 12px",
                borderRadius: 6,
                background: "transparent",
                border: `1px solid ${T.borderNav}`,
                color: T.textStrong,
                fontFamily: T.sansTabs,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 150ms ease, border-color 150ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.pillBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Top up
            </button>

            {/* Add Job primary — Stripe luxury */}
            <button
              type="button"
              onClick={onOpenNewJob}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 6,
                background: T.primary,
                color: "#fff",
                border: `1px solid ${T.primary}`,
                fontFamily: T.sansTabs,
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: T.shadowStripe,
                transition: "background 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 120ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.primaryHover;
                e.currentTarget.style.borderColor = T.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = T.primary;
                e.currentTarget.style.borderColor = T.primary;
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(1px)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span aria-hidden style={{ fontSize: 12, lineHeight: 1 }}>+</span> Add Job
            </button>

            {/* Avatar initials */}
            {candidate ? (
              <div ref={avatarRef} style={{ position: "relative", display: "flex", alignItems: "center", marginLeft: 2 }} className="nav-avatar-wrap">
                <button
                  type="button"
                  onClick={() => setAvatarMenuOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={avatarMenuOpen}
                  title={candidate.full_name || candidate.fullName || candidate.email || "Account"}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: T.primary,
                    color: "#fff",
                    border: `1px solid ${T.primary}`,
                    fontFamily: T.sansTabs,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    letterSpacing: "0.04em",
                    overflow: "hidden",
                  }}
                >
                  {initials}
                </button>
                {avatarMenuOpen && (
                  <div
                    role="menu"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      background: T.card,
                      border: `1px solid ${T.borderNav}`,
                      borderRadius: 10,
                      padding: 8,
                      boxShadow: T.shadowLg,
                      minWidth: 220,
                      zIndex: 200,
                    }}
                  >
                    <div style={{ padding: "8px 10px", borderBottom: `1px solid ${T.borderNav}`, marginBottom: 6 }}>
                      <div style={{ fontFamily: T.sansTabs, fontSize: 13, fontWeight: 700, color: T.textStrong, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {candidate.full_name || candidate.fullName || "Candidate"}
                      </div>
                      <div style={{ fontFamily: T.sansTabs, fontSize: 11, color: T.tabInactive, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {candidate.email || ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "none",
                        background: T.redLight,
                        color: T.red,
                        fontFamily: T.sansTabs,
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
              <span style={{ fontFamily: T.sansTabs, fontSize: 11, color: T.hint }}>Not signed in</span>
            )}

            {/* Hamburger (mobile) */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="navbar-mobile-drawer"
              onClick={() => setMobileOpen((v) => !v)}
              className="nav-hamburger"
              style={{
                display: "none",
                width: 36,
                height: 36,
                borderRadius: 6,
                border: `1px solid ${T.borderNav}`,
                background: T.card,
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: T.textStrong,
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide drawer */}
      <div
        aria-hidden={!mobileOpen}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
          pointerEvents: mobileOpen ? "auto" : "none",
          visibility: mobileOpen ? "visible" : "hidden",
          transition: "visibility 200ms ease",
        }}
      >
        {/* overlay */}
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(6,27,49,0.32)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            opacity: mobileOpen ? 1 : 0,
            transition: "opacity 220ms ease",
          }}
        />
        {/* panel */}
        <div
          id="navbar-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "min(360px, 86vw)",
            height: "100%",
            background: T.card,
            borderLeft: `1px solid ${T.borderNav}`,
            boxShadow: T.shadowFloat,
            transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 260ms cubic-bezier(0.32,0.72,0,1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: `1px solid ${T.borderNav}`, flexShrink: 0 }}>
            <span style={{ fontFamily: T.sansDisplay, fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: T.textStrong }}>Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: `1px solid ${T.borderNav}`,
                background: T.pillBg,
                color: T.textStrong,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Tabs */}
            <nav aria-label="Mobile primary" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { onTabChange(tab.id); setMobileOpen(false); }}
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      borderRadius: 6,
                      border: `1px solid ${active ? T.borderNav : T.borderNav}`,
                      background: active ? T.pillBg : T.card,
                      color: active ? T.textStrong : T.tabInactive,
                      fontFamily: T.sansTabs,
                      fontSize: 13,
                      fontWeight: active ? 600 : 510,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: active ? `inset 0 -2px 0 ${T.primary}` : "none",
                    }}
                  >
                    <span>{tab.label}</span>
                    {active && <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: T.primary }} />}
                  </button>
                );
              })}
            </nav>

            {/* Search trigger mobile */}
            <button
              type="button"
              onClick={() => { setMobileOpen(false); window.dispatchEvent(new CustomEvent("agentic-cv:open-command-palette")); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 6,
                background: T.pillBg,
                border: `1px solid ${T.borderNav}`,
                color: T.tabInactive,
                fontFamily: T.sansTabs,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><span aria-hidden>⌕</span> Search</span>
              <span style={{ padding: "2px 6px", borderRadius: 6, background: T.card, border: `1px solid ${T.borderNav}`, fontSize: 11, fontWeight: 600 }}>⌘K</span>
            </button>

            <div style={{ height: 1, background: T.borderNav }} />

            {/* Credits + actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 999, background: T.greenLight, border: `1px solid ${T.greenMid}`, color: T.green, fontFamily: T.sansTabs, fontSize: 12, fontWeight: 600 }}>
                <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: T.green, display: "inline-block" }} />
                {credits} credits
                <span style={{ marginLeft: "auto", fontSize: 11, opacity: 0.8 }}>● live</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); onOpenBuyCredits?.(); }}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 6, border: `1px solid ${T.borderNav}`, background: T.card, color: T.textStrong, fontFamily: T.sansTabs, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Top up
                </button>
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); onOpenNewJob?.(); }}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 6, border: `1px solid ${T.primary}`, background: T.primary, color: "#fff", fontFamily: T.sansTabs, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: T.shadowStripe }}
                >
                  + Add Job
                </button>
              </div>
            </div>

            {candidate && (
              <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${T.borderNav}`, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 999, background: T.primary, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.sansTabs, fontSize: 11, fontWeight: 800 }}>{initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: T.sansTabs, fontSize: 12, fontWeight: 700, color: T.textStrong, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{candidate.full_name || candidate.fullName || "Candidate"}</div>
                    <div style={{ fontFamily: T.sansTabs, fontSize: 11, color: T.tabInactive, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{candidate.email || ""}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ padding: "10px 12px", borderRadius: 6, border: `1px solid ${T.redMid}`, background: T.redLight, color: T.red, fontFamily: T.sansTabs, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  ⎋ Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .nav-tab-btn:focus-visible {
          outline: 2px solid ${T.primary};
          outline-offset: 2px;
          box-shadow: 0 0 0 3px rgba(83,58,253,0.18);
        }
        .nav-cmdk:focus-visible, .nav-topup:focus-visible {
          outline: 2px solid ${T.primary};
          outline-offset: 2px;
        }
        @media (max-width: 980px) {
          .nav-tabs-desktop { display: none !important; }
          .nav-hamburger { display: inline-flex !important; }
          .nav-cmdk-desktop { display: none !important; }
          .nav-topup { display: none !important; }
          .nav-avatar-wrap { display: none !important; }
        }
        @media (min-width: 981px) {
          #navbar-mobile-drawer { display: none !important; }
        }
      `}</style>
    </>
  );
}
