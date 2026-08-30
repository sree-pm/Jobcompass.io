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
  const buy = () => {
    setToast("Checkout ready — redirecting to sign-in");
    window.setTimeout(() => { window.location.href = "/auth"; }, 900);
  };
  const packs = [
    { name: "Starter", jobs: 100, price: "£10", per: "10p each", highlight: false },
    { name: "Active", jobs: 250, price: "£25", per: "10p each · popular", highlight: true },
    { name: "Power", jobs: 500, price: "£50", per: "10p each", highlight: false },
  ];
  return (
    <section id="pricing" className={styles.wrap} style={{ background: T.ink, color: T.onColor }}>
      {toast && <div className={styles.toast} role="status" aria-live="polite" style={{ background: T.ink, color: T.onColor }}>{toast}</div>}
      <div className={styles.inner}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: T.white60 }}>
            PAY AS YOU GO · NO SUBSCRIPTION · NO EXPIRY
          </div>
          <h2 className={`serif ${styles.h2}`}>
            £10 for 100 jobs. <span style={{ color: T.white60 }}>Keep them forever.</span>
          </h2>
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: T.white60, maxWidth: "44ch" }}>
            Other tools charge you every month whether you use them or not. Here, one job costs 10p. Buy 100, use them this week or next year.
          </p>
          <div className={styles.packs}>
            {packs.map((p) => (
              <div key={p.name} className={styles.pack} style={p.highlight ? { background: T.onColor, color: T.ink, borderColor: T.onColor, boxShadow: `0 8px 32px ${T.white10}` } : { background: T.white08, borderColor: T.white20, color: T.onColor }}>
                <div className="mono" style={{ fontSize: 10, opacity: 0.6 }}>
                  {p.name} · {p.jobs} jobs
                </div>
                <div className={`serif ${styles.price}`}>{p.price}</div>
                <div className="mono" style={{ fontSize: 10, marginTop: 8, opacity: 0.6 }}>
                  {p.per} · never expire
                </div>
                {p.highlight ? (
                  <button onClick={buy} className={styles.ctaDark} style={{ background: T.ink, color: T.onColor }}>
                    Buy 250 — £25 <span aria-hidden="true">â†’</span>
                  </button>
                ) : (
                  <button onClick={buy} className={styles.ctaGhost}>
                    Buy {p.jobs} jobs
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className={styles.vs} style={{ borderColor: T.white20, background: T.white08 }}>
            <span className="mono" style={{ fontSize: 10, color: T.white50 }}>
              VS
            </span>
            <span className="mono" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, background: T.white10 }}>
              Sonara £65/mo · expires
            </span>
            <span className="mono" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, background: T.white10 }}>
              Teal · no proof
            </span>
            <span className="mono" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, background: T.success, color: T.onColor }}>
              JobCompass 10p per job · never expire
            </span>
          </div>
        </div>
        <div className={styles.billing} style={{ background: T.onColor, color: T.ink }}>
          <div className="mono" style={{ fontSize: 10, color: T.mutedStrong }}>
            BILLING · SIMPLE &amp; SECURE
          </div>
          <div className={styles.billingList}>
            {[
              ["Simple pricing", "10p per job. That's it."],
              ["Never expires", "Use them whenever you're ready"],
              ["Safe checkout", "Card, Apple Pay or Google Pay"],
              ["Email receipt", "Sent after every purchase"],
              ["Try before you buy", "10 free jobs, no card"],
            ].map(([a, b]) => (
              <div key={a} className={styles.billingRow}>
                <span aria-hidden="true" style={{ color: T.success }}>âœ“</span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{a}</span>{" "}
                  <span className="mono" style={{ fontSize: 10, color: T.mutedStrong, marginLeft: 8 }}>
                    {b}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={goPricing} className={styles.startCta} style={{ background: T.ink, color: T.onColor }}>
            <div>
              <div className="serif" style={{ fontSize: 20, lineHeight: 1 }}>
                Start free — your first 10 jobs are on us
              </div>
              <div className="mono" style={{ fontSize: 10, color: T.white60, marginTop: 4 }}>
                10 free jobs · then 10p each
              </div>
            </div>
            <span aria-hidden="true">â†’</span>
          </button>
          <div className="mono" style={{ marginTop: 12, textAlign: "center", fontSize: 10, color: T.mutedStrong }}>
            Live. Sign in and start.
          </div>
        </div>
      </div>
    </section>
  );
}
