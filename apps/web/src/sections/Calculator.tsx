import { useState } from "react";
import { T } from "../components/common/Theme.js";
import styles from "./Calculator.module.css";
export function Calculator(){
  const [salary,setSalary]=useState(60000);
  const agency = Math.round(salary*0.2);
  const boards = 2750; const sourcing=4000;
  return (
    <div className={styles.wrap}>
      <div className={styles.kicker}>SEE WHAT A HIRE REALLY COSTS</div>
      <h3 className={styles.title}>Jobright-style calculator — UK-ified</h3>
      <div className={styles.controls}>
        <label className={styles.label}>Salary <input type="range" min={30000} max={120000} step={5000} value={salary} onChange={e=>setSalary(Number(e.target.value))} /> <span className={styles.value}>£{salary.toLocaleString("en-GB")}</span></label>
        <span className={styles.hint}>1 hire · sliders live</span>
      </div>
      <div className={styles.grid}>
        {[
          ["Headhunter 20%", `£${agency.toLocaleString("en-GB")}`, T.red, false],
          ["Job boards", `£${boards.toLocaleString("en-GB")} ~`, T.muted, false],
          ["Sourcing tool", `£${sourcing.toLocaleString("en-GB")} ~`, T.muted, false],
          ["JobCompass", "£10", T.lime, true],
        ].map(([k,v,c,accent])=> (
          <div key={k as string} className={accent ? styles.cardAccent : styles.cardMuted} style={{ borderColor: accent ? T.lime : T.border } as any}>
            <div className={styles.cardLabel}>{k as string}</div><div className={styles.cardValue} style={{ color: c as string } as any}>{v as string}</div>
          </div>
        ))}
      </div>
      <div className={styles.foot}>Same hire. A fraction of the cost — you skip the sorting, fakes and chasing. <span className={styles.accent}>Credits never expire — use in 1 day or 12 months</span></div>
      <div className={styles.foot2}>LoopCV €9.99 → €3.33/day · JobCopilot $28 → $0.93/day · JobCompass £10 = 100 apps → £0.33/day over 30 days (and you keep them)</div>
    </div>
  );
}
