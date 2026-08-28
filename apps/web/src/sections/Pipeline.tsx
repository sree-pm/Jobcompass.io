import styles from "./Pipeline.module.css";
const PILLARS = [
  { title: "No hallucination, provably", desc: "Two-pass: tailor (DeepSeek) → verifier (Claude Haiku) + hard guards. Diff + errors/warnings + correctiveOps shown; sign-off gate before dispatch.", badge: "HITL ✓" },
  { title: "UK-first, not ported", desc: "A4, GBP, British spelling, Equality Act (photo/DOB/NI blocked), Companies House trust 80/20.", badge: "🇬🇧" },
  { title: "Per-bullet control", desc: "FieldLocks per exp.0.bullet.2 — lock any bullet. Identity/education never unlockable. 40% finer than Teal/Huntr.", badge: "🔒" },
  { title: "£0.10/app, forever", desc: "Starter £10/100, Active £25/250, Power £50/500. Credits never expire. Sonara $80, Huntr $40, JobScan $49 — subscription trap.", badge: "GBP" },
];
export function Pipeline() {
  return (
    <section className={styles.wrap}>
      {PILLARS.map(p=> (
        <div key={p.title} className={styles.card}>
          <span className={styles.badge}>{p.badge}</span>
          <div className={styles.title}>{p.title}</div>
          <div className={styles.desc}>{p.desc}</div>
        </div>
      ))}
    </section>
  );
}
