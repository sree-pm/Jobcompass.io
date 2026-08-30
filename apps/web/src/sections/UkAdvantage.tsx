import { T } from "../components/common/Theme.js";
import styles from "./UkAdvantage.module.css";
export function UkAdvantage() {
  const cards = [
    { title: "Companies House Verified", body: "We check every employer against the UK's official company register. No fake companies, no wasted applications." },
    { title: "British Spelling & Format", body: "Optimise, colour, centre. Your CV speaks British — and prints perfectly on A4." },
    { title: "UK Region + Salary Band", body: "Search by UK region and real salary bands. No guessing what a job pays." },
  ];
  return (
    <section id="uk" className={styles.wrap} style={{ background: T.ink, color: T.onColor }}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: T.white60 }}>
              UK ADVANTAGE · ALL ROLES
            </div>
            <h2 className={`serif ${styles.h2}`}>Built for UK hiring, not US wishlists.</h2>
          </div>
          <div className="mono" style={{ fontSize: 10, color: T.white60, maxWidth: "36ch" }}>
            Verified employers, British CV standards, and search tuned to how the UK actually hires.
          </div>
        </div>
        <div className={styles.grid}>
          {cards.map((c) => (
            <div key={c.title} className={styles.card} style={{ borderColor: T.white20, background: T.white04 }}>
              <div className={`serif ${styles.cardTitle}`}>{c.title}</div>
              <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.6, color: T.white60 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
