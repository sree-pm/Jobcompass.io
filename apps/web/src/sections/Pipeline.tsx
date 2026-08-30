import styles from "./Pipeline.module.css";
const PILLARS = [
  { title: "No made-up facts", desc: "Two AI helpers check every word. You approve before anything sends.", badge: "✓" },
  { title: "Made for UK jobs", desc: "A4, pounds, British spelling. Photo, date of birth and NI number are never added. Every employer checked at Companies House.", badge: "🇬🇧" },
  { title: "You control every line", desc: "Lock anything you never want touched. Your name and school never change.", badge: "🔒" },
  { title: "10p per job, forever", desc: "£10 buys 100 jobs. They never expire. No subscription.", badge: "GBP" },
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
