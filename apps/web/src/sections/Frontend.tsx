import { T } from "../components/common/Theme.js";
import styles from "./Frontend.module.css";
export function Frontend() {
  const routes = ["/", "/how-it-works", "/pricing", "/jobs", "/companies", "/blog", "/docs", "/status"];
  return (
    <section className={styles.wrap} style={{ background: T.cream2, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: T.mutedStrong, letterSpacing: "0.08em" }}>
            DESIGNED AS ONE SYSTEM · SHIPPED DAILY
          </div>
          <h2 className={`serif ${styles.h2}`} style={{ color: T.ink }}>One design system. Every page consistent.</h2>
          <div className={styles.routeCard} style={{ background: T.onColor, borderColor: T.creamBorder }}>
            <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.ink }}>
              Public pages — every route on one system
            </div>
            <div className={styles.routePills}>
              {routes.map((r) => (
                <span key={r} className="mono" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, background: T.surfaceCool, border: `1px solid ${T.creamBorder}`, color: T.ink }}>
                  {r}
                </span>
              ))}
            </div>
            <div className="mono" style={{ fontSize: 9, color: T.mutedStrong, marginTop: 12, letterSpacing: "0.02em" }}>
              Every public page, one consistent layout
            </div>
          </div>
          <div className={styles.threeCol}>
            <div className={styles.infoCard} style={{ background: T.onColor, borderColor: T.creamBorder }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.ink }}>
                Design System
              </div>
              <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, color: T.ink70 }}>One token source drives every page — consistent type, colour and spacing across the whole site.</div>
              <div className="mono" style={{ fontSize: 9, color: T.mutedStrong, marginTop: 12, letterSpacing: "0.02em" }}>
                Consistency by construction, not by review
              </div>
            </div>
            <div className={styles.infoCard} style={{ background: T.onColor, borderColor: T.creamBorder }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.ink }}>
                API Client
              </div>
              <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, color: T.ink70 }}>One secure connection to your data — signed-in pages stay signed-in.</div>
              <div className="mono" style={{ fontSize: 9, color: T.mutedStrong, marginTop: 12, letterSpacing: "0.02em" }}>
                Your session, protected end to end
              </div>
            </div>
            <div className={styles.infoCard} style={{ background: T.onColor, borderColor: T.creamBorder }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.ink }}>
                AI Router
              </div>
              <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, color: T.ink70 }}>The right model for each job — drafting, checking and verifying are handled by different specialists.</div>
              <div className="mono" style={{ fontSize: 9, color: T.mutedStrong, marginTop: 12, letterSpacing: "0.02em" }}>
                No single point of failure
              </div>
            </div>
          </div>
        </div>
        <div className={styles.deployCard} style={{ background: T.ink, color: T.onColor, border: `1px solid ${T.white20}` }}>
          <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.onColor }}>
            Deployed · Live
          </div>
          <div className="mono" style={{ fontSize: 9, color: T.white60, marginTop: 4, letterSpacing: "0.02em" }}>
            wrangler.toml · Cloudflare Workers · production
          </div>
          <div className={`mono ${styles.deployList}`}>
            <div className={styles.deployRow}><span style={{ color: T.white60 }}>api</span><span>jobcompass-api.infonaut.workers.dev</span></div>
            <div className={styles.deployRow}><span style={{ color: T.white60 }}>web</span><span>jobcompass-web.infonaut.workers.dev</span></div>
            <div className={styles.deployRow}><span style={{ color: T.white60 }}>domain</span><span>jobcompass.io</span></div>
            <div className={styles.deployRow}><span style={{ color: T.white60 }}>status</span><span style={{ color: T.onColor }}>Status verified at deploy</span></div>
          </div>
          <div className="mono" style={{ fontSize: 9, color: T.white60, marginTop: 12, letterSpacing: "0.02em" }}>
            Status verified at deploy
          </div>
        </div>
      </div>
    </section>
  );
}
