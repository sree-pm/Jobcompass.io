import { T } from "../components/common/Theme.js";
import styles from "./Frontend.module.css";
export function Frontend() {
  const routes = ["/", "/how-it-works", "/pricing", "/jobs", "/companies", "/blog", "/docs", "/status"];
  return (
    <section className={styles.wrap} style={{ background: T.cream2, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: T.mutedStrong, letterSpacing: "0.08em" }}>
            BUILT CAREFULLY · SHIPPED DAILY
          </div>
          <h2 className={`serif ${styles.h2}`} style={{ color: T.ink }}>One clean design. On every page.</h2>
          <div className={styles.routeCard} style={{ background: T.onColor, borderColor: T.creamBorder }}>
            <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.ink }}>
              Every page you'll see
            </div>
            <div className={styles.routePills}>
              {routes.map((r) => (
                <span key={r} className="mono" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, background: T.surfaceCool, border: `1px solid ${T.creamBorder}`, color: T.ink }}>
                  {r}
                </span>
              ))}
            </div>
            <div className="mono" style={{ fontSize: 9, color: T.mutedStrong, marginTop: 12, letterSpacing: "0.02em" }}>
              Same clean look on all of them
            </div>
          </div>
          <div className={styles.threeCol}>
            <div className={styles.infoCard} style={{ background: T.onColor, borderColor: T.creamBorder }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.ink }}>
              Design
            </div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, color: T.ink70 }}>One look, everywhere — no surprises.</div>
            <div className="mono" style={{ fontSize: 9, color: T.mutedStrong, marginTop: 12, letterSpacing: "0.02em" }}>
              Same type, colour and spacing on every page
            </div>
            </div>
            <div className={styles.infoCard} style={{ background: T.onColor, borderColor: T.creamBorder }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.ink }}>
              Your account
            </div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, color: T.ink70 }}>Your jobs and CVs in one place.</div>
            <div className="mono" style={{ fontSize: 9, color: T.mutedStrong, marginTop: 12, letterSpacing: "0.02em" }}>
              One sign-in keeps you signed in
            </div>
            </div>
            <div className={styles.infoCard} style={{ background: T.onColor, borderColor: T.creamBorder }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.ink }}>
              Smart helpers
            </div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, color: T.ink70 }}>Two AI helpers check every word.</div>
            <div className="mono" style={{ fontSize: 9, color: T.mutedStrong, marginTop: 12, letterSpacing: "0.02em" }}>
              You approve before anything sends
            </div>
            </div>
          </div>
        </div>
        <div className={styles.deployCard} style={{ background: T.ink, color: T.onColor, border: `1px solid ${T.white20}` }}>
          <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.onColor }}>
            Ready for you
          </div>
          <div className="mono" style={{ fontSize: 9, color: T.white60, marginTop: 4, letterSpacing: "0.02em" }}>
            Checked and running right now
          </div>
          <div className={`mono ${styles.deployList}`}>
            <div className={styles.deployRow}><span style={{ color: T.white60 }}>Website</span><span>Live</span></div>
            <div className={styles.deployRow}><span style={{ color: T.white60 }}>Job board</span><span>Live</span></div>
            <div className={styles.deployRow}><span style={{ color: T.white60 }}>Sign-in</span><span>Live</span></div>
          </div>
          <div className="mono" style={{ fontSize: 9, color: T.white60, marginTop: 12, letterSpacing: "0.02em" }}>
            Everything working
          </div>
        </div>
      </div>
    </section>
  );
}
