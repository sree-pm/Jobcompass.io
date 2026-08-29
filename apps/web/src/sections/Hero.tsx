import { T } from "../components/common/Theme.js";
import styles from "./Hero.module.css";

export function Hero() {
  const onPricing = (e?: React.MouseEvent) => {
    e?.preventDefault();
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <section className={styles.hero} style={{ background: T.cream }}>
      <div className={styles.bgGlow} aria-hidden />
      <div className={styles.gridPattern} aria-hidden style={{ opacity: 0.03 }} />
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.eyebrow}>
            <span className={styles.dot} style={{ background: T.success }} />
            <span className="mono">£0.10/job applied · PAYG credits · never expire</span>
          </div>
          <h1 className={`${styles.h1} serif`}>
            You've got the CV.{" "}
            <span style={{ color: T.lavenderAA }}>We build the receipt</span>{" "}
            <span className={styles.italic}>that collects</span> interviews.
          </h1>
          <p className={styles.sub} style={{ color: T.ink70 }}>
            You've done the hard part — the skills, the shifts, the £400k migration. A done-for-you UK apply system from the team behind 12-stage proof. For UK jobseekers, not US templates.
          </p>
          <div className={styles.actions}>
            <a href="#start" onClick={onPricing} className={styles.primary} style={{ background: T.ink, color: T.onColor }}>
              Start free — 5 credits
            </a>
            <span className="mono" style={{ fontSize: 11, color: T.mutedStrong, alignSelf: "center" }}>
              Your proof in 7 minutes.
            </span>
          </div>
          <p className="mono" style={{ marginTop: 8, fontSize: 10, color: T.mutedStrong }}>
            Trusted by early Infonaut teams — 30 live UK roles verified.
          </p>
          <div className={styles.badges}>
            {["One PIN · one approve · we handle the rest"].map((b) => (
              <span key={b} className={styles.badge}>
                {b}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.rightWrap} aria-hidden="true">
          <div className={styles.card} aria-hidden="true" style={{ background: T.inkCard }}>
            <div className={styles.cardGlow} aria-hidden />
            <div className={styles.cardSheen} aria-hidden />
            <div className={styles.cardHead}>
              <span className="mono" style={{ color: T.white50, fontSize: 10, letterSpacing: "0.14em" }}>
                APPLICATION RECEIPT 03 · UK VERIFIED
              </span>
              <span className={styles.liveDot} style={{ background: T.success }} />
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardMain}>
                <div className="serif" style={{ color: T.onColor, fontSize: 22, lineHeight: 1.1 }}>
                  Sales Executive @ Tesco
                </div>
                <div className="mono" style={{ color: T.white50, fontSize: 10, marginTop: 4 }}>
                  Manchester · £35k · Greenhouse · 0.3s found
                </div>
                <div className={styles.proofGrid}>
                  {[
                    ["Found 0.3s Greenhouse", "Source verified"],
                    ["Tailored optimise +23%", "British spelling"],
                    ["Field locks protected", "Identity safe"],
                    ["Screenshot proof", "Trust 80/100"],
                  ].map(([a, b]) => (
                    <div key={a} className={styles.proofCell} style={{ borderColor: T.white08, background: T.white04 }}>
                      <div style={{ color: T.onColor, fontSize: 12, fontWeight: 500 }}>{a}</div>
                      <div className="mono" style={{ color: T.white60, fontSize: 9, marginTop: 4 }}>
                        {b}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.pills}>
                  {["A4 PDF, ATS-ready", "British spelling", "Companies House verified"].map((p) => (
                    <span key={p} className={styles.pill}>
                      {p}
                    </span>
                  ))}
                </div>
                <div className={styles.status} style={{ background: T.success, color: T.onColor }}>
                  <span className="mono">Status · Applied · Receipt #03</span>
                  <span>✓</span>
                </div>
              </div>
              <div className={styles.dialWrap}>
                <div className={styles.dial} style={{ background: `conic-gradient(from 0deg, ${T.lavenderAA} 0deg, ${T.lavenderAA} 331deg, ${T.success} 331deg, ${T.success} 360deg)` }}>
                  <div className={styles.dialInner} style={{ background: T.inkCard }}>
                    <span className="serif" style={{ color: T.onColor, fontSize: 28, lineHeight: 1 }}>
                      92%
                    </span>
                    <span className="mono" style={{ color: T.white50, fontSize: 8, marginTop: 4 }}>
                      MATCH
                    </span>
                  </div>
                </div>
                <div className="mono" style={{ color: T.white60, fontSize: 9, lineHeight: 1.3 }}>
                  ATS 50<br />Exp 30<br />Const 20
                </div>
              </div>
            </div>
            <div className={styles.cardFoot} style={{ borderColor: T.white10 }}>
              <span className="mono" style={{ color: T.white60, fontSize: 9 }}>
                Verified application · Receipt #03
              </span>
              <span className="mono" style={{ color: T.white60, fontSize: 9 }}>
                UK · GDPR
              </span>
            </div>
          </div>
          <div className={styles.floatedBadges} aria-hidden="true">
            <div className={styles.floated}>
              <span style={{ color: T.success }}>✓</span> Companies House
            </div>
            <div className={styles.floated}>
              <span style={{ color: T.lavenderAA }}>✦</span> British spelling
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
