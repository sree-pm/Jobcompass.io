import React from "react";
import { Link, useLocation } from "react-router-dom";
import { T } from "../common/Theme.js";

const NAV_LINKS = [
  { to: "/#dossier", label: "Product" },
  { to: "/#how", label: "How it works" },
  { to: "/#uk", label: "UK Advantage" },
  { to: "/pricing", label: "Pricing" },
  { to: "/jobs", label: "Jobs" },
  { to: "/companies", label: "Companies" },
];

const DRAWER_LINKS = [
  ...NAV_LINKS,
  { to: "/docs", label: "Docs" },
  { to: "/changelog", label: "Changelog" },
  { to: "/security", label: "Security" },
  { to: "/auth", label: "Log in" },
];

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const magnetRef = React.useRef<HTMLAnchorElement>(null);
  const firstDrawerLinkRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstDrawerLinkRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const onMagnetMove = (e: React.MouseEvent) => {
    const el = magnetRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.12}px, ${y * 0.2}px)`;
  };
  const onMagnetLeave = () => {
    if (magnetRef.current) magnetRef.current.style.transform = "translate(0,0)";
  };
  const goPricing = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setToast("Check your email for your sign-in code — your first 10 jobs are on us");
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.href = "/#pricing";
  };

  const jobsBadge = (
    <span style={{ marginLeft: 4, fontSize: 10, background: T.ink, color: T.onColor, padding: "2px 6px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.12em" }}>30 live</span>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: T.sans, color: T.ink, WebkitFontSmoothing: "antialiased" as any }}>
      <a href="#main" className="skipLink">Skip to content</a>
      <style>{`
        .serif { font-family: 'Instrument Serif', Georgia, serif; letter-spacing: -0.04em; line-height: 0.9; }
        .mono { font-family: 'JetBrains Mono', monospace; letter-spacing: 0.12em; text-transform: uppercase; }
        .grid-pattern { background-image: linear-gradient(${T.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${T.gridLine} 1px, transparent 1px); background-size: 32px 32px; }
        .skipLink { position: absolute; left: -9999px; top: 0; background: ${T.ink}; color: ${T.onColor}; padding: 10px 16px; z-index: 400; border-radius: 0 0 8px 0; }
        .skipLink:focus { left: 0; }
        .mdShow { display: none; }
        @media (min-width: 768px) { .mdShow { display: inline-flex; } }
        .vh { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
        :focus-visible { outline: 2px solid ${T.lavenderAA}; outline-offset: 2px; }
        [id] { scroll-margin-top: 88px; }
      `}</style>

      {toast && (
        <div role="status" aria-live="polite" style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 300, maxWidth: "92vw" }}>
          <div style={{ borderRadius: 999, background: T.ink, color: T.onColor, padding: "12px 20px", fontSize: 13, boxShadow: `0 8px 32px ${T.shadowToast}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: T.success, display: "inline-block" }} /> {toast}
          </div>
        </div>
      )}

      <header style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: `1px solid ${T.creamBorder}`, background: T.creamTrans, backdropFilter: "blur(24px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", height: T.navHeight, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <Link to="/" style={{ display: "flex", alignItems: "baseline", gap: 12, textDecoration: "none", color: T.ink }}>
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1 }}>JobCompass</span>
            </Link>
            <nav style={{ display: "none", gap: 24, alignItems: "center" }} className="lg:flex" aria-label="Primary">
              {NAV_LINKS.map(n => (
                <Link key={n.to} to={n.to} style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em", color: T.ink80, textDecoration: "none" }}>
                  {n.label} {n.label === "Jobs" && jobsBadge}
                </Link>
              ))}
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/auth" style={{ display: "none", height: 44, padding: "0 20px", borderRadius: 999, border: `1px solid ${T.creamBorder}`, background: "white", fontSize: 13, fontWeight: 500, alignItems: "center", textDecoration: "none", color: T.ink }} className="md:inline-flex">Log in</Link>
            <a ref={magnetRef} className="mdShow" onMouseMove={onMagnetMove} onMouseLeave={onMagnetLeave} onClick={goPricing} href="#start" style={{ height: 44, padding: "0 24px", borderRadius: 999, background: T.ink, color: T.onColor, fontSize: 13, fontWeight: 500, alignItems: "center", gap: 8, textDecoration: "none", boxShadow: `0 8px 32px ${T.shadowHeader}`, transition: "transform 0.3s" }}>
              <span>Start free — your first 10 jobs are on us</span> <span aria-hidden="true">â†’</span>
            </a>
            <button onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open} aria-controls="mobile-menu" style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${T.creamBorder}`, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }} className="lg:hidden">
              <span aria-hidden="true">{open ? "âœ•" : "â˜°"}</span>
              <span className="vh">{open ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>
        {open && (
          <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" style={{ borderTop: `1px solid ${T.creamBorder}`, background: T.cream, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {DRAWER_LINKS.map((n, i) => (
                <Link key={n.to} to={n.to} ref={i === 0 ? firstDrawerLinkRef : undefined} onClick={() => setOpen(false)} style={{ padding: "10px 0", fontSize: 15, fontWeight: 500, textDecoration: "none", color: T.ink }}>
                  {n.label} {n.label === "Jobs" && jobsBadge}
                </Link>
              ))}
            </div>
            <div style={{ borderRadius: 16, border: `1px solid ${T.creamBorder}`, background: "white", padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>Credits</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>10 free jobs • £0.10/app</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="#start" onClick={(e) => { setOpen(false); goPricing(e); }} style={{ height: 44, borderRadius: 999, background: T.ink, color: T.onColor, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Start free — your first 10 jobs are on us <span aria-hidden="true">â†’</span></a>
              <span style={{ fontSize: 10, textAlign: "center", color: T.mutedArtifact, letterSpacing: "0.08em", textTransform: "uppercase" }}>£0.33/day • you keep them • never expire</span>
            </div>
          </div>
        )}
      </header>

      <main id="main">{children}</main>

      <footer style={{ borderTop: `1px solid ${T.creamBorder}`, background: T.surface, marginTop: 64 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 20px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Job<span style={{ color: T.lavenderAA }}>Compass</span> <span style={{ fontSize: 10, background: T.surfaceCool, border: `1px solid ${T.border}`, padding: "2px 6px", borderRadius: 999 }}>Infonaut</span></div>
            <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>One good CV does more than fifty rushed ones. We make each one count.</p>
            <div style={{ marginTop: 12, fontSize: 11, color: T.hint }}>© {new Date().getFullYear()} Infonaut · jobcompass.io · Cloudflare Workers</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10 }}>Product</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              {[{ to: "/how-it-works", label: "How it works" }, { to: "/pricing", label: "Pricing" }, { to: "/uk-advantage", label: "UK advantage" }, { to: "/security", label: "Security" }, { to: "/jobs", label: "Jobs" }, { to: "/companies", label: "Companies" }].map(n => <Link key={n.to} to={n.to} style={{ color: T.muted, textDecoration: "none" }}>{n.label}</Link>)}
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
            <div className="mono" style={{ marginTop: 14, fontSize: 10, color: T.hint, lineHeight: 1.6, letterSpacing: "0.06em", textTransform: "none" }}>
              Company No. 00000000 · VAT GB000
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
