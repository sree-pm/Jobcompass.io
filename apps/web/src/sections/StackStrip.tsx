import { T } from "../components/common/Theme.js";
import styles from "./StackStrip.module.css";
export function StackStrip() {
  return (
    <section className={styles.strip} style={{ background: T.cream, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <p style={{ maxWidth: 640, fontSize: 14, lineHeight: 1.5, color: T.ink70 }}>
          One good CV does more than fifty rushed ones. We make each one count.
        </p>
        <span className="mono" style={{ fontSize: 11, color: T.mutedStrong, marginLeft: "auto" }}>
          First 10 free →
        </span>
      </div>
    </section>
  );
}
