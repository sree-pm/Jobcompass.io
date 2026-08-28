import { T } from "../components/common/Theme.js";
import styles from "./UkAdvantage.module.css";
export function UkAdvantage() {
  const cards = [
    { meta: "COMPANIES_HOUSE_API_KEY 600/5min", title: "Companies House Verified", body: "sic-industry-map trust 80 active 20 + BRAVE_API website lookup. No shell companies. Trust_score ordered." },
    { meta: "checkBritishSpelling \\b optimise", title: "British Spelling & Format", body: "optimise, organisation, programme, colour · Right-to-work line · 2-page max · Calibri 10pt A4 16/18mm · No photo/DOB/NI." },
    { meta: "classifyJobs.ts:38 + job-classifier", title: "UK Region + Salary Band", body: "Seniority/work_mode/region uk_region · salary_band · title 60% · dead-phrase detection · ruleScore+25 + routeChat verify_job." },
  ];
  return (
    <section id="uk" className={styles.wrap} style={{ background: T.ink, color: T.onColor }}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: T.white40 }}>
              UK ADVANTAGE · ALL ROLES
            </div>
            <h2 className={`serif ${styles.h2}`}>Built for UK hiring, not US wishlists.</h2>
          </div>
          <div className="mono" style={{ fontSize: 10, color: T.white40, maxWidth: "36ch" }}>
            Companies House 600/5min · BRAVE_API · sic-industry-map trust 80 active 20 · classifyJobs uk_region · verifyJob 10s · British spelling.
          </div>
        </div>
        <div className={styles.grid}>
          {cards.map((c) => (
            <div key={c.title} className={styles.card} style={{ borderColor: T.white10, background: T.white04 }}>
              <div className="mono" style={{ fontSize: 10, color: T.white40, marginTop: 16 }}>
                {c.meta}
              </div>
              <div className={`serif ${styles.cardTitle}`}>{c.title}</div>
              <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.6, color: T.white60 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
