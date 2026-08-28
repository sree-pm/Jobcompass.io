import { T } from "../components/common/Theme.js";
import styles from "./Frontend.module.css";
export function Frontend() {
  const routes = ["/", "/how-it-works", "/pricing", "/uk-advantage", "/security", "/jobs", "/companies", "/docs", "/blog", "/changelog", "/status", "/privacy", "/auth", "/app/*", "/404"];
  return (
    <section className={styles.wrap} style={{ background: T.cream2, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: T.mutedArtifact }}>
            FRONTEND MONO-REPO · apps/web · 15 ROUTES Router.jsx:1
          </div>
          <h2 className={`serif ${styles.h2}`}>Vite 6.4 · React 19 · Theme.js single token.</h2>
          <div className={styles.routeCard}>
            <div className="mono" style={{ fontSize: 10 }}>
              Router.jsx 15 routes
            </div>
            <div className={styles.routePills}>
              {routes.map((r) => (
                <span key={r} className="mono" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, background: T.surfaceCool, border: `1px solid ${T.creamBorder}` }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.threeCol}>
            <div className={styles.infoCard}>
              <div className="mono" style={{ fontSize: 10 }}>
                MarketingLayout.jsx
              </div>
              <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>Hero+Pipeline+Ticker+Strip+Calculator+wall+tools · sitemap.xml robots.txt llms.txt og-1200x630.svg</div>
            </div>
            <div className={styles.infoCard}>
              <div className="mono" style={{ fontSize: 10 }}>
                lib/cloudflareApi.js:1
              </div>
              <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>VITE_API_URL · agentic_cv_uk_token · RequireAuth gate · updateCandidate</div>
            </div>
            <div className={styles.infoCard}>
              <div className="mono" style={{ fontSize: 10 }}>
                AI Router · packages/ai/src/index.ts:217
              </div>
              <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>tailor deepseek-chat · verifier claude-3-5-haiku · creative gpt-4o-mini · llama-3.3-70b · bge-small</div>
            </div>
          </div>
        </div>
        <div className={styles.deployCard} style={{ background: T.ink, color: T.onColor }}>
          <div className="mono" style={{ fontSize: 10, color: T.white40 }}>
            DEPLOY · REAL
          </div>
          <div className={`mono ${styles.deployList}`}>
            <div className={styles.deployRow}><span style={{ color: T.white40 }}>api</span><span>51f76b8d · jobcompass-api.infonaut.workers.dev</span></div>
            <div className={styles.deployRow}><span style={{ color: T.white40 }}>web</span><span>ab2c2f35 · jobcompass-web.infonaut.workers.dev</span></div>
            <div className={styles.deployRow}><span style={{ color: T.white40 }}>domain</span><span>jobcompass.io</span></div>
            <div className={styles.deployRow}><span style={{ color: T.white40 }}>health</span><span style={{ color: T.success }}>200</span></div>
            <div className={styles.deployRow}><span style={{ color: T.white40 }}>jobs</span><span style={{ color: T.success }}>200 public</span></div>
            <div className={styles.deployRow}><span style={{ color: T.white40 }}>auth request-code</span><span style={{ color: T.success }}>200</span></div>
          </div>
          <div className="mono" style={{ marginTop: 24, borderRadius: 12, background: T.white10, border: `1px solid ${T.white10}`, padding: 16, fontSize: 10, lineHeight: 1.5 }}>
            Secrets wrangler secret put --config apps/api/wrangler.toml JWT_SECRET API_KEY STRIPE_* DEEPSEEK ANTHROPIC OPENAI ACCOUNT_ID AI_GATEWAY COMPANIES_HOUSE BRAVE ADZUNA REED APIFY GREENHOUSE_BOARDS LEVER ASHBY
            <br />web needs none, only VITE_API_URL:10
          </div>
        </div>
      </div>
    </section>
  );
}
