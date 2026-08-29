import { T } from "../components/common/Theme.js";
import styles from "./StackStrip.module.css";
export function StackStrip() {
  return (
    <section className={styles.strip} style={{ background: T.cream, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <p style={{ maxWidth: 640, fontSize: 14, lineHeight: 1.5, color: T.ink70 }}>
          One dossier carries your whole hire. Every post, every email, every referral funnels to one A4. A weak post costs you views. A weak dossier costs you the business you should have.
        </p>
        <span className="mono" style={{ fontSize: 11, color: T.mutedStrong, marginLeft: "auto" }}>
          One page. One receipt. All traffic →
        </span>
      </div>
    </section>
  );
}
