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
          BOARD-READY RECEIPT · 90-DAY TRACKING · PROOF FIRST
        </div>
        <h2 className={`serif ${styles.h2}`}>Start your UK apply OS. Proof, not promises.</h2>
        <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6, color: T.white60, maxWidth: "48ch", marginInline: "auto" }}>
          For all roles — Sales, Data, Engineering, Marketing, Finance — across UK. British spelling optimised, Companies House verified, ATS Calibri 10pt A4 16/18mm. 5 credits trial, never expire, £0.10 per application, £0.33/day.
        </p>
        <div className={styles.actions}>
          <button onClick={() => { setToast("5-credit trial ready — check your email flow: POST /auth/request-code → PIN → JWT"); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); }} className={styles.primary} style={{ background: T.onColor, color: T.ink }}>
            Start free — 5 credits <span>→</span>
          </button>
          <button onClick={() => setToast("Demo booked — 30 mins GMT · Calendar invite sent · agentic_cv_uk_token")} className={styles.secondary} style={{ borderColor: T.white10, background: T.white06, color: T.onColor }}>
            Book Demo — 30 mins <span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>GMT</span>
          </button>
        </div>
        <div className="mono" style={{ marginTop: 16, fontSize: 10, color: T.white40 }}>
          £0.33/day · you keep them · never expire · Companies House · GDPR · Stripe · UK flag
        </div>
        {toast && <div className={styles.toast} style={{ background: T.ink, color: T.onColor }}>{toast}</div>}
        <div className={styles.grid}>
          {[
            ["Auth", "POST /auth/request-code RequestCodeSchema email -> CACHE auth:rate:3/600s -> generatePin crypto.getRandomValues -> hashPin SHA-256 hex KV auth:pin:600s -> EMAIL.send noreply@jobcompass.io"],
            ["Onboarding", "OnboardingWizard.jsx -> PUT /candidates/:id -> POST /resumes/parse-cv routeChat extract 3000tok -> POST /resumes is_master=1 -> PUT constraints did_list/did_not_list"],
            ["Data", "candidates -> resumes(is_master) -> field_locks unique -> constraints_docs unique -> applications tailored_pdf_key -> jobs source_url unique hiring_confidence embedding_id -> companies name unique trust_score"],
            ["Env", "Env lib/types.ts:3 · JWT_SECRET API_KEY STRIPE DEEPSEEK ANTHROPIC OPENAI ACCOUNT_ID AI_GATEWAY COMPANIES_HOUSE BRAVE ADZUNA REED APIFY BOARDS LEVER ASHBY"],
          ].map(([a, b]) => (
            <div key={a} className={styles.card} style={{ borderColor: T.white10, background: T.white04 }}>
              <div className="mono" style={{ fontSize: 10, color: T.white40 }}>{a}</div>
              <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.4, color: T.white60 }}>{b}</div>
            </div>
          ))}
        </div>
        <div className={styles.foot} style={{ borderColor: T.white10, color: T.white40 }}>
          <span>JobCompass · PROOF & PACE · 2025 · UK Apply OS · jobcompass.io · health 200 · jobs 200 public · auth request-code 200</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: T.success, display: "inline-block" }} /> All systems · 06:00 GMT ingest live</span>
        </div>
      </div>
    </section>
  );
}
