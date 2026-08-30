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
            <span className="mono">10 free jobs · no card needed</span>
          </div>
          <h1 className={`${styles.h1} serif`}>
            You've got the CV.{" "}
            <span style={{ color: T.lavenderAA }}>We make the version</span>{" "}
            <span className={styles.italic}>that gets</span> interviews.
          </h1>
          <p className={styles.sub} style={{ color: T.ink70 }}>
            Your first 10 tailored CVs are free. British spelling, one page, checked twice. You approve every word.
          </p>
          <div className={styles.actions}>
            <a href="#start" onClick={onPricing} className={styles.primary} style={{ background: T.ink, color: T.onColor }}>
              Start free — your first 10 jobs are on us
            </a>
            <span className="mono" style={{ fontSize: 11, color: T.mutedStrong, alignSelf: "center" }}>
              Your first CV in 7 minutes.
            </span>
          </div>
          <p className="mono" style={{ marginTop: 8, fontSize: 10, color: T.mutedStrong }}>
            30 live UK roles today. Every employer checked first.
          </p>
          <div className={styles.badges}>
            {["Made for UK jobs", "Checked twice", "You approve everything"].map((b) => (
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
                APPLICATION 03 · UK VERIFIED
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
                    ["Found in 0.3 seconds", "Real employer"],
                    ["Written for this job", "Not generic"],
                    ["Your details stay locked", "Name and school never change"],
                    ["Ready to print", "One page A4"],
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
                  {["A4 one page", "British spelling", "Companies House checked"].map((p) => (
                    <span key={p} className={styles.pill}>
                      {p}
                    </span>
                  ))}
                </div>
                <div className={styles.status} style={{ background: T.success, color: T.onColor }}>
                  <span className="mono">Applied · 10 jobs free · you pressed send</span>
                  <span>âœ“</span>
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
                  Job match 92%
                </div>
              </div>
            </div>
            <div className={styles.cardFoot} style={{ borderColor: T.white10 }}>
              <span className="mono" style={{ color: T.white60, fontSize: 9 }}>
                Made in the UK
              </span>
              <span className="mono" style={{ color: T.white60, fontSize: 9 }}>
                Your data stays yours
              </span>
            </div>
          </div>
          <div className={styles.floatedBadges} aria-hidden="true">
            <div className={styles.floated}>
              <span style={{ color: T.success }}>âœ“</span> Companies House
            </div>
            <div className={styles.floated}>
              <span style={{ color: T.lavenderAA }}>âœ¦</span> British spelling
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
