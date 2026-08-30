import { Link } from "react-router-dom";
import { T } from "../components/common/Theme.js";
import styles from "./Jobs.module.css";

const Wm = [
  { role: "Sales Representative", company: "Tesco", loc: "Manchester", type: "Full-time", salary: "£28k – £35k", trust: 84, source: "Greenhouse" },
  { role: "Data Scientist", company: "Monzo", loc: "London", type: "Remote", salary: "£65k – £85k", trust: 92, source: "Lever" },
  { role: "Product Manager", company: "Starling Bank", loc: "London", type: "Hybrid", salary: "£70k – £90k", trust: 89, source: "Ashby" },
  { role: "Marketing Manager", company: "Ocado", loc: "Hatfield", type: "Full-time", salary: "£45k – £60k", trust: 81, source: "Adzuna" },
  { role: "Software Engineer", company: "Skyscanner", loc: "Edinburgh", type: "Remote", salary: "£60k – £80k", trust: 90, source: "Reed" },
  { role: "Finance Analyst", company: "Barclays", loc: "Birmingham", type: "Full-time", salary: "£50k – £65k", trust: 87, source: "CV-Library" },
  { role: "Customer Support Lead", company: "Revolut", loc: "Leeds", type: "Hybrid", salary: "£32k – £40k", trust: 79, source: "Greenhouse" },
  { role: "HR Manager", company: "John Lewis", loc: "London", type: "Full-time", salary: "£42k – £55k", trust: 83, source: "Lever" },
  { role: "Operations Manager", company: "Deliveroo", loc: "London", type: "Full-time", salary: "£48k – £62k", trust: 85, source: "Adzuna" },
  { role: "UX Designer", company: "BBC", loc: "Manchester", type: "Hybrid", salary: "£44k – £58k", trust: 88, source: "Reed" },
  { role: "Account Executive", company: "Wise", loc: "London", type: "Remote", salary: "£38k – £50k + OTE", trust: 82, source: "Ashby" },
  { role: "Compliance Officer", company: "HSBC", loc: "Birmingham", type: "Full-time", salary: "£40k – £55k", trust: 86, source: "Greenhouse" },
];

export function Jobs() {
  const today = new Date().toLocaleDateString("en-GB");
  return (
    <section id="jobs" className={styles.wrap} style={{ background: T.cream2, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: T.mutedStrong }}>
              LIVE UK JOB BOARD
            </div>
            <h2 className={`serif ${styles.h2}`}>30 live UK roles, all functions.</h2>
            <p className="mono" style={{ marginTop: 12, fontSize: 10, color: T.mutedStrong }}>
              Fresh jobs every morning. Each employer checked before you apply.
            </p>
          </div>
          <a href="#companies" className={styles.viewBtn} style={{ borderColor: T.creamBorder, background: T.onColor, color: T.ink }}>
            View companies <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className={styles.grid} role="list">
          {Wm.map((u) => (
            <div key={u.role + u.company} className={styles.card} role="listitem">
              <div className={styles.cardHead}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2, margin: 0 }}>{u.role}</h3>
                  <div className="mono" style={{ fontSize: 10, color: T.mutedStrong, marginTop: 4, display: "flex", gap: 4, alignItems: "center" }}>
                    {u.company} · {u.loc} · {u.type}
                  </div>
                </div>
                <span className={`mono ${styles.trustBadge}`} aria-label={`Trust score ${u.trust} of 100`} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, background: T.successBg, color: T.success }}>
                  {u.trust}/100
                </span>
              </div>
              <div style={{ marginTop: 12, fontSize: 13, fontWeight: 500 }}>{u.salary}</div>
              <div className={styles.pills}>
                <span className="mono" style={{ fontSize: 9, padding: "4px 8px", borderRadius: 999, background: T.surfaceCool, border: `1px solid ${T.creamBorder}` }}>
                  {u.source}
                </span>
                <span className="mono" style={{ fontSize: 9, padding: "4px 8px", borderRadius: 999, background: T.ink, color: T.onColor }}>
                  UK verified
                </span>
                <span className="mono" style={{ fontSize: 9, padding: "4px 8px", borderRadius: 999, border: `1px solid ${T.creamBorder}` }}>
                  Employer check
                </span>
              </div>
              <div className={styles.divider} style={{ background: T.creamBorder }} />
              <div className={styles.cardFoot}>
                <span className="mono" style={{ fontSize: 9, color: T.mutedStrong }}>
                  Posted · {today}
                </span>
                <Link to="/jobs" className="mono" style={{ fontSize: 9, color: T.ink, display: "flex", gap: 4, alignItems: "center", textDecoration: "none", minHeight: 44 }}>
                  Apply <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
