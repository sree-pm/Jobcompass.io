import React from "react";
import { Link, useLocation } from "react-router-dom";
import { T } from "../common/Theme.js";

const NAV = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/uk-advantage", label: "UK advantage" },
  { to: "/security", label: "Security" },
  { to: "/jobs", label: "Jobs" },
  { to: "/docs", label: "Docs" },
];

export function MarketingLayout({ children }) {
  const loc = useLocation();
  const isActive = (to) => loc.pathname === to || loc.pathname.startsWith(to + "/");
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.sans, color: T.text }}>
      {/* Top bar */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)", background: T.navBg, borderBottom: `1px solid ${T.border}`, height: T.navHeight, display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: T.text }}>Job<span style={{ color: T.blue }}>Compass</span></span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: T.blueLight, border: `1px solid ${T.blueMid}`, color: T.blue, padding: "2px 6px", borderRadius: 999 }}>UK</span>
          </Link>
          <nav style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            {NAV.map(n => (
              <Link key={n.to} to={n.to} style={{
                fontSize: 13, fontWeight: 600, padding: "6px 10px", borderRadius: 6, textDecoration: "none",
                color: isActive(n.to) ? T.blue : T.muted, background: isActive(n.to) ? T.blueLight : "transparent", border: `1px solid ${isActive(n.to) ? T.blueMid : "transparent"}`,
              }}>{n.label}</Link>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link to="/auth" style={{ fontSize: 13, fontWeight: 600, color: T.muted, textDecoration: "none", padding: "8px 12px" }}>Sign in</Link>
            <Link to="/app" style={{ fontSize: 13, fontWeight: 700, background: T.blue, color: T.onColor, padding: "10px 16px", borderRadius: 8, textDecoration: "none", boxShadow: T.shadowSm }}>Open app →</Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer style={{ borderTop: `1px solid ${T.border}`, background: T.surface, marginTop: 64 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 32px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Job<span style={{ color: T.blue }}>Compass</span> <span style={{ fontSize: 10, background: T.surfaceCool, border: `1px solid ${T.border}`, padding: "2px 6px", borderRadius: 999 }}>INfonaut</span></div>
            <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>UK job search, done properly — agentic tailoring you can trust, not volume you regret. A4, GBP, British spelling, Companies House, D1/R2/Queue native.</p>
            <div style={{ marginTop: 12, fontSize: 11, color: T.hint }}>© {new Date().getFullYear()} Infonaut · jobcompass.io · Cloudflare Workers</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10 }}>Product</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              {["/how-it-works","/pricing","/uk-advantage","/security","/jobs","/companies"].map(p=> <Link key={p} to={p} style={{ color: T.muted, textDecoration: "none" }}>{p.replace("/","").replace("-"," ")}</Link>)}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10 }}>Resources</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              <Link to="/docs" style={{ color: T.muted, textDecoration: "none" }}>Docs</Link>
              <Link to="/blog" style={{ color: T.muted, textDecoration: "none" }}>Blog</Link>
              <Link to="/changelog" style={{ color: T.muted, textDecoration: "none" }}>Changelog</Link>
              <Link to="/status" style={{ color: T.muted, textDecoration: "none" }}>Status</Link>
              <Link to="/about" style={{ color: T.muted, textDecoration: "none" }}>About</Link>
              <Link to="/contact" style={{ color: T.muted, textDecoration: "none" }}>Contact</Link>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10 }}>Legal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              <Link to="/privacy" style={{ color: T.muted, textDecoration: "none" }}>Privacy</Link>
              <Link to="/terms" style={{ color: T.muted, textDecoration: "none" }}>Terms</Link>
              <Link to="/cookies" style={{ color: T.muted, textDecoration: "none" }}>Cookies</Link>
              <Link to="/gdpr" style={{ color: T.muted, textDecoration: "none" }}>GDPR</Link>
              <Link to="/refunds" style={{ color: T.muted, textDecoration: "none" }}>Refunds</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
