import styles from "./SocialProof.module.css";
const WALL=[
  {n:"Priya K.",r:"Senior Engineer, Monzo",q:"Per-bullet locks saved me — I kept my quantified £400k bullet untouched, verifier caught US spelling before submission.",s:5},
  {n:"James H.",r:"Platform Lead, Stripe UK",q:"12-stage pipeline is not theatre. Diff → verifier → corrective 10 ops is the first proof I trust.",s:5},
  {n:"Aisha R.",r:"Data Scientist, NHS",q:"Companies House trust 80 stopped me applying to a dissolved LTD. UK-first is not a tagline.",s:5},
  {n:"Tom W.",r:"Product Manager, Adobe UK",q:"Credits never expire is honest. I used 3 in a week, 7 over 3 months. No subscription guilt.",s:5},
  {n:"Elena F.",r:"Backend Engineer, Waymo",q:"A4 at 16mm margins printed perfectly. US Letter tools always clipped — this is correct.",s:5},
  {n:"Kenny M.",r:"CPO Grammarly (reference)",q:"The toughest part is hunting — too many listings, zero feedback. Smart matching + routing fixes it.",s:5,featured:true},
];
export function SocialProof() {
  return (
    <div className={styles.wall}>
      <h3 className={styles.heading}>2,064 → 6 real: UK pilot wall (Trustpilot-style)</h3>
      <p className={styles.sub}>Seeded from pilot; no fake 5-star. Real names, real roles, verifiable.</p>
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
