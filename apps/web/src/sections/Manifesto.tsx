import { T } from "../components/common/Theme.js";
import styles from "./Manifesto.module.css";
export function Manifesto() {
  return (
    <section className={styles.wrap} style={{ background: T.cream, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div>
          <p className="mono" style={{ fontSize: 10, color: T.mutedStrong, marginBottom: 12 }}>
            YOU'VE DONE THE HARD PART
          </p>
          <h2 className={`serif ${styles.h2}`}>
            You don't need more applications. You need <span style={{ color: T.ink }}>one that proves every claim.</span>
          </h2>
        </div>
        <div className={styles.right}>
          <p style={{ color: T.ink70 }}>
            You've got the shifts. The £400k migration. The British spelling you fixed twice.
          </p>
          <p style={{ color: T.ink70, marginTop: 12 }}>
            Every week, someone lands on your CV trying to trust one bullet. Most leave in 6 seconds. Not because you lack skill — because your page didn't prove it fast, trust deep, or give them a reason to stay.
          </p>
          <p style={{ color: T.ink, fontWeight: 600, marginTop: 16 }}>
            The gap between your effort and your interviews isn't a content problem. It's one missing receipt.
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px 32px" }}>
        <div className={styles.pains}>
          <div style={{ borderLeft: `2px solid ${T.creamBorder}`, paddingLeft: 16 }}>
            <strong>The £400k bullet you couldn't claim.</strong> You shipped it. Your CV still says "helped with".
          </div>
          <div style={{ borderLeft: `2px solid ${T.creamBorder}`, paddingLeft: 16 }}>
            <strong>The dissolved LTD you almost joined.</strong> Trust 80/100 would have warned you.
          </div>
          <div style={{ borderLeft: `2px solid ${T.creamBorder}`, paddingLeft: 16 }}>
            <strong>The photo/DOB you shouldn't have sent.</strong> Blocked in the UK — but your tool didn't know.
          </div>
        </div>
      </div>
    </section>
  );
}
