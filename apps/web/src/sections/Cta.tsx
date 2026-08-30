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
        <h2 className={`serif ${styles.h2}`}>Two people built this. Ten free jobs say try it.</h2>
        <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6, color: T.white60, maxWidth: "48ch", marginInline: "auto" }}>
          You've done the hard part. Your first 10 tailored CVs are free — no card, no catch.
        </p>
        <div className={styles.actions}>
          <button onClick={() => { setToast("Check your email for your sign-in code — your first 10 jobs are on us"); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); }} className={styles.primary} style={{ background: T.onColor, color: T.ink }}>
            Start free — your first 10 jobs are on us <span aria-hidden="true">â†’</span>
          </button>
          <span className="mono" style={{ fontSize: 11, color: T.white60, alignSelf: "center" }}>
            No card needed.
          </span>
        </div>
        <div className="mono" style={{ marginTop: 16, fontSize: 10, color: T.white60 }}>
          10 free jobs · then 10p each · never expire
        </div>
        {toast && <div className={styles.toast} role="status" aria-live="polite" style={{ background: T.ink, color: T.onColor }}>{toast}</div>}
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "left", maxWidth: 640, marginInline: "auto" }}>
          <div style={{ background: T.white04, border: `1px solid ${T.white10}`, borderRadius: 16, padding: 16 }}>
            <div className="mono" style={{ fontSize: 10, color: T.white60 }}>Built by</div>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>Someone who fixed their own job hunt.</div>
          </div>
          <div style={{ background: T.white04, border: `1px solid ${T.white10}`, borderRadius: 16, padding: 16 }}>
            <div className="mono" style={{ fontSize: 10, color: T.white60 }}>Designed by</div>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>Someone who believes clean design builds trust.</div>
          </div>
        </div>
        <details style={{ marginTop: 24, maxWidth: 640, marginInline: "auto", textAlign: "left" }}>
          <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600 }}>7 questions, zero fluff</summary>
          <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.6, color: T.white60 }}>
            <p><strong>How much does it cost?</strong> Your first 10 jobs are free. After that, 10p per job.</p>
            <p><strong>How long does it take?</strong> Your first tailored CV takes about 7 minutes.</p>
            <p><strong>I've tried other tools. Why is this different?</strong> We check every word twice and show you everything. Nothing sends without you.</p>
            <p><strong>How much of my time will this take?</strong> About 7 minutes for your first CV. Less after that.</p>
            <p><strong>I already have a CV. Can I use it?</strong> Yes. Paste it in — we improve it, we never rewrite your history.</p>
            <p><strong>What do I own?</strong> Every CV we make for you. Download and keep them forever.</p>
            <p><strong>How do I start?</strong> Type your email. We send you a code. That's it.</p>
          </div>
        </details>
        <div className={styles.foot} style={{ borderColor: T.white10, color: T.white60 }}>
          <span>Your first 10 jobs are free. Start today.</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>Start free — your first 10 jobs are on us <span aria-hidden="true">â†’</span></span>
        </div>
      </div>
    </section>
  );
}
