import { T } from "../components/common/Theme.js";
import styles from "./Calculator.module.css";
export function Calculator(){
  return (
    <div className={styles.wrap}>
      <div className={styles.kicker}>SEE WHAT A JOB HUNT REALLY COSTS</div>
      <h3 className={styles.title}>What your job hunt costs now</h3>
      <div className={styles.grid}>
        {[
          ["A recruiter", "They take 20% of your first year's salary", false],
          ["Job boards", "£100s, and your CV still looks like everyone else's", false],
          ["JobCompass", "10p per job. First 10 free", true],
        ].map(([k, v, accent]) => (
          <div key={k as string} className={accent ? styles.cardAccent : styles.cardMuted} style={{ borderColor: accent ? T.lime : T.border } as any}>
            <div className={styles.cardLabel}>{k as string}</div>
            <div className={styles.cardValue} style={{ color: accent ? T.lime : T.muted } as any}>{v as string}</div>
          </div>
        ))}
      </div>
      <div className={styles.foot}>Your first 10 jobs are free. No card needed. <span className={styles.accent}>10p per job after that — they never expire</span></div>
    </div>
  );
}
