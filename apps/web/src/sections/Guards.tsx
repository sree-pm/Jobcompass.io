import { T } from "../components/common/Theme.js";
import styles from "./Guards.module.css";
const guards = [
  ["tailor.ts:27 injection", "Prompt injection blocked · JD sanitised"],
  ["validatePatchOperations:160", "isPathEditable + 422 + banned 'team player'"],
  ["quickVerify:127 deterministic", "No AI · locks, metrics, overlap"],
  ["verifier hard diff 95", "Hard diff locked fields · confidence cap 70"],
  ["checkBritishSpelling 194 \\b optimise", "British spelling guard · organisation colour"],
  ["isPathEditable", "never unlocks identity · picture uk_forbidden"],
  ["agentGuards.test.js:1 5/5", "All guard tests passing"],
  ["designSystemGuard.test.js:1 50 files 100% T.*", "Single token source Theme.js:10"],
  ["CORS allowlist index.ts:23", "RateLimiter 190 auth rate 3/600"],
  ["credits atomic deduct WHERE balance>=?", "add balance+? reference_id UNIQUE"],
  ["ssrf extract redirect follow", "URL validation + timeout 10s"],
  ["billing HMAC timestamp 300s", "Stripe webhook v1 · non-blocking receipt"],
];
export function Guards() {
  return (
    <section className={styles.wrap} style={{ background: T.ink, color: T.onColor }}>
      <div className={styles.inner}>
        <div className="mono" style={{ fontSize: 10, color: T.white40 }}>
          SECURITY GUARDS · 5/5 · 50 FILES 100% T.*
        </div>
        <h2 className={`serif ${styles.h2}`}>Guardrails, not prompts.</h2>
        <div className={styles.grid}>
          {guards.map(([a, b]) => (
            <div key={a} className={styles.card} style={{ borderColor: T.white10, background: T.white04 }}>
              <span style={{ color: T.success, flexShrink: 0, marginTop: 2 }}>✓</span>
              <div>
                <div className="mono" style={{ fontSize: 11, lineHeight: 1.3 }}>
                  {a}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.4, color: T.white50 }}>{b}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
