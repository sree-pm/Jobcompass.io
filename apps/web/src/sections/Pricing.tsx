import * as React from "react";
import { T } from "../components/common/Theme.js";
import styles from "./Pricing.module.css";
export function Pricing() {
  const [toast, setToast] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  const goPricing = () => {
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const packs = [
    { name: "Starter", credits: 100, price: "£10", per: "£0.10/app", highlight: false },
    { name: "Active", credits: 250, price: "£25", per: "£0.10/app · popular", highlight: true },
    { name: "Power", credits: 500, price: "£50", per: "£0.10/app", highlight: false },
  ];
  return (
    <section id="pricing" className={styles.wrap} style={{ background: T.ink, color: T.onColor }}>
      {toast && <div className={styles.toast} style={{ background: T.ink, color: T.onColor }}>{toast}</div>}
      <div className={styles.inner}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: T.white40 }}>
            CREDIT PACKS · PER-DAY ANCHOR · NEVER EXPIRE
          </div>
          <h2 className={`serif ${styles.h2}`}>
            £0.33/day <span style={{ color: T.white40 }}>(and you keep them)</span>
          </h2>
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: T.white60, maxWidth: "44ch" }}>
            You do the shifts. We structure the proof. Atomic credits, pay only when it ships — and your page finally collects what your content earned.
          </p>
          <div className={styles.packs}>
            {packs.map((p) => (
              <div key={p.name} className={styles.pack} style={p.highlight ? { background: T.onColor, color: T.ink, borderColor: T.onColor, boxShadow: `0 8px 32px ${T.white10}` } : { background: T.white04, borderColor: T.white10, color: T.onColor }}>
                <div className="mono" style={{ fontSize: 10, opacity: 0.6 }}>
                  {p.name} · {p.credits} credits
                </div>
                <div className={`serif ${styles.price}`}>{p.price}</div>
                <div className="mono" style={{ fontSize: 10, marginTop: 8, opacity: 0.6 }}>
                  {p.per} · never expire
                </div>
                {p.highlight ? (
                  <button onClick={() => setToast(`Checkout: Buy ${p.credits} credits — ${p.price} · £0.33/day · never expire · Stripe gbp`)} className={styles.ctaDark} style={{ background: T.ink, color: T.onColor }}>
                    Buy 250 — £25 <span>→</span>
                  </button>
                ) : (
                  <button onClick={() => setToast(`Checkout: Buy ${p.credits} credits — ${p.price} · atomic deduct · reference_id UNIQUE`)} className={styles.ctaGhost}>
                    Buy {p.credits}
                  </button>
                )}
                <div className={`mono ${styles.perDay}`}>
                  £0.33/day • you keep them • never expire
                </div>
              </div>
            ))}
          </div>
          <div className={styles.vs} style={{ borderColor: T.white10, background: T.white04 }}>
            <span className="mono" style={{ fontSize: 10, color: T.white50 }}>
              VS
            </span>
            <span className="mono" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, background: T.white10 }}>
              Sonara $80/mo · expires
            </span>
            <span className="mono" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, background: T.white10 }}>
              Teal · no proof
            </span>
            <span className="mono" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, background: T.success, color: T.onColor }}>
              JobCompass £0.10/app · never expire
            </span>
          </div>
        </div>
        <div className={styles.billing} style={{ background: T.onColor, color: T.ink }}>
          <div className="mono" style={{ fontSize: 10, color: T.mutedArtifact }}>
            BILLING · routes/billing.ts:9 · CREDIT_PACKS
          </div>
          <div className={styles.billingList}>
            {[
              ["Atomic deduct", "WHERE balance>=? then balance+?"],
              ["Idempotent", "reference_id UNIQUE 111 race revert"],
              ["Stripe Checkout", "gbp client_reference_id webhook HMAC v1 300s"],
              ["Receipt", "sendReceiptEmail non-blocking EMAIL noreply@jobcompass.io"],
              ["Sandbox", "BuyCreditsModal if !STRIPE_SECRET_KEY dev"],
            ].map(([a, b]) => (
              <div key={a} className={styles.billingRow}>
                <span style={{ color: T.success }}>✓</span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{a}</span>{" "}
                  <span className="mono" style={{ fontSize: 10, color: T.mutedArtifact, marginLeft: 8 }}>
                    {b}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={goPricing} className={styles.startCta} style={{ background: T.ink, color: T.onColor }}>
            <div>
              <div className="serif" style={{ fontSize: 20, lineHeight: 1 }}>
                Start free — 5 credits
              </div>
              <div className="mono" style={{ fontSize: 10, color: T.white50, marginTop: 4 }}>
                £0.10/app · never expire · £0.33/day
              </div>
            </div>
            <span>→</span>
          </button>
          <div className="mono" style={{ marginTop: 12, textAlign: "center", fontSize: 10, color: T.mutedArtifact }}>
            Deploy api 51f76b8d web ab2c2f35 health 200 jobs 200 public
          </div>
        </div>
      </div>
    </section>
  );
}
