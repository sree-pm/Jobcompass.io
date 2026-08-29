import * as React from "react";
import { T } from "../components/common/Theme.js";
import styles from "./Cta.module.css";
export function Cta() {
  const [toast, setToast] = React.useState<string | null>(null);
  React.useEffect(() => { if (!toast) return; const t=setTimeout(()=>setToast(null),2600); return ()=>clearTimeout(t);},[toast]);
  return (
    <section id="start" className={styles.wrap} style={{ background: T.ink, color: T.onColor }}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        <div className="mono" style={{ fontSize: 10, padding: "6px 12px", borderRadius: 999, border: `1px solid ${T.white10}`, background: T.white06, display: "inline-flex" }}>
          WHO'S BEHIND JOBCOMPASS
        </div>
        <h2 className={`serif ${styles.h2}`}>Two humans. One system that collects.</h2>
        <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6, color: T.white60, maxWidth: "48ch", marginInline: "auto" }}>
          You've done the hard part — the shifts, the proof. We fix what's costing you interviews: a receipt that proves every bullet, British, A4, Companies House trusted.
        </p>
        <div className={styles.actions}>
          <button onClick={() => { setToast("Check your email for your 5-credit sign-in code"); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); }} className={styles.primary} style={{ background: T.onColor, color: T.ink }}>
            Start free — 5 credits <span aria-hidden="true">→</span>
          </button>
          <span className="mono" style={{ fontSize: 11, color: T.white60, alignSelf: "center" }}>
            On the House — first 5, no card.
          </span>
        </div>
        <div className="mono" style={{ marginTop: 16, fontSize: 10, color: T.white60 }}>
          £0.10/job · you keep them · never expire
        </div>
        {toast && <div className={styles.toast} role="status" aria-live="polite" style={{ background: T.ink, color: T.onColor }}>{toast}</div>}
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "left", maxWidth: 640, marginInline: "auto" }}>
          <div style={{ background: T.white04, border: `1px solid ${T.white10}`, borderRadius: 16, padding: 16 }}>
            <div className="mono" style={{ fontSize: 10, color: T.white60 }}>FOUNDER — PRODUCT</div>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>Sales & Funnels</div>
            <div style={{ fontSize: 12, color: T.white60 }}>Owns the leak diagnosis → offer → copy.</div>
          </div>
          <div style={{ background: T.white04, border: `1px solid ${T.white10}`, borderRadius: 16, padding: 16 }}>
            <div className="mono" style={{ fontSize: 10, color: T.white60 }}>FOUNDER — DESIGN</div>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>Conversion Design</div>
            <div style={{ fontSize: 12, color: T.white60 }}>Owns the trust layer — one token system.</div>
          </div>
        </div>
        <details style={{ marginTop: 24, maxWidth: 640, marginInline: "auto", textAlign: "left" }}>
          <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600 }}>7 questions, zero fluff</summary>
          <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.6, color: T.white60 }}>
            <p><strong>How much?</strong> £10/100 — £0.10/app, never expire.</p>
            <p><strong>How long?</strong> Your first receipt in 7 minutes.</p>
            <p><strong>Hired help before?</strong> They designed. We diagnosed first.</p>
            <p><strong>My time?</strong> One email, one approve.</p>
            <p><strong>Have a CV?</strong> We keep it — we just add proof.</p>
            <p><strong>What do I own?</strong> Every A4 PDF in your private library — forever.</p>
            <p><strong>What happens on start?</strong> One email code, then we tailor, verify and send your first receipt.</p>
          </div>
        </details>
        <div className={styles.foot} style={{ borderColor: T.white10, color: T.white60 }}>
          <span>Ready to stop leaving interviews on the page? You've done the hard part.</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>Start free — 5 credits <span aria-hidden="true">→</span></span>
        </div>
      </div>
    </section>
  );
}
