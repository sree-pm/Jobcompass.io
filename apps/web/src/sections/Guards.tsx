import { T } from "../components/common/Theme.js";
import styles from "./Guards.module.css";
const guards = [
  ["Your CV stays truthful", "We never invent experience you don't have"],
  ["Your details stay locked", "Name and school never change"],
  ["British spelling, always", "US spellings get fixed"],
  ["An honest match score", "We show a lower score when we're unsure"],
  ["No empty clichés", "\"Team player\" never ships"],
  ["Private by default", "Photo, birthday and NI number never added"],
  ["Fair billing", "You only pay when it works"],
  ["Safe sign-in", "Only you can use your email"],
  ["Only our apps connect", "Strangers can't talk to your account"],
  ["Your session, your control", "Sign-in codes work once, then expire"],
  ["A record of every application", "Nothing happens silently"],
  ["You always press send", "We never apply without you"],
];
export function Guards() {
  return (
    <section className={styles.wrap} style={{ background: T.ink, color: T.onColor }}>
      <div className={styles.inner}>
        <div className="mono" style={{ fontSize: 10, color: T.white60 }}>
          SAFETY · BUILT IN
        </div>
        <h2 className={`serif ${styles.h2}`}>Twelve promises. All kept.</h2>
        <div className={styles.grid}>
          {guards.map(([a, b]) => (
            <div key={a} className={styles.card} style={{ borderColor: T.white20, background: T.white08 }}>
              <span className={styles.iconWrap} style={{ background: T.white10, color: T.success, border: `1px solid ${T.white10}` }} aria-hidden="true">
                ✓
              </span>
              <div>
                <div className="mono" style={{ fontSize: 11, lineHeight: 1.3, color: T.onColor }}>
                  {a}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.45, color: T.white50 }}>{b}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
