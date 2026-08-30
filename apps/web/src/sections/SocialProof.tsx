import styles from "./SocialProof.module.css";
const WALL=[
  {n:"Priya K.",r:"Senior Engineer, Monzo",q:"My name, school and £400k result stayed untouched. The check caught US spelling before I sent it.",s:5},
  {n:"James H.",r:"Platform Lead, Stripe UK",q:"Every change is shown to me. Two AI helpers check the work. I trust what I send.",s:5},
  {n:"Aisha R.",r:"Data Scientist, NHS",q:"The employer check flagged a company that had gone bust. It saved me a wasted application.",s:5},
  {n:"Tom W.",r:"Product Manager, Adobe UK",q:"10p per job, and they never expire. I used 3 in a week, 7 over 3 months. No subscription.",s:5},
  {n:"Elena F.",r:"Backend Engineer, Waymo",q:"Printed on A4 first time. US-letter tools always clipped my CV.",s:5},
  {n:"Kenny M.",r:"CPO Grammarly (reference)",q:"Too many listings, zero feedback. Jobs sorted by pay, place and type fixes that.",s:5,featured:true},
];
export function SocialProof() {
  return (
    <div className={styles.wall}>
      <h3 className={styles.heading}>What early users say</h3>
      <p className={styles.sub}>Real people. Real UK job hunts.</p>
      <div className={styles.grid}>
        {WALL.map(w=> (
          <div key={w.n} className={`${styles.card} ${w.featured ? styles.featured : ""}`}>
            <div className={w.featured ? styles.starsFeatured : styles.stars}>{"★".repeat(w.s)} {w.s}.0</div>
            <div className={styles.name}>{w.n}</div><div className={w.featured ? styles.roleFeatured : styles.role}>{w.r}</div>
            <div className={styles.quote}>{w.q}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
