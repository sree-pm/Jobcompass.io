import * as React from "react";
import { T } from "../components/common/Theme.js";
import styles from "./Kanban.module.css";

const Qm = [
  { id: "saved", label: "Saved", count: 12 },
  { id: "tailored", label: "Tailored", count: 8 },
  { id: "applied", label: "Applied", count: 24 },
  { id: "interview", label: "Interview", count: 5 },
  { id: "offer", label: "Offer", count: 2 },
  { id: "rejected", label: "Closed", count: 9 },
];

const initialCards = [
  { id: "1", col: "saved", role: "Sales Executive", company: "Tesco", loc: "Manchester", salary: "£35k", score: 92 },
  { id: "2", col: "saved", role: "Data Analyst", company: "Monzo", loc: "London", salary: "£52k", score: 88 },
  { id: "3", col: "tailored", role: "Product Manager", company: "Starling", loc: "Remote", salary: "£68k", score: 91 },
  { id: "4", col: "applied", role: "Marketing Manager", company: "Ocado", loc: "Hatfield", salary: "£48k", score: 84 },
  { id: "5", col: "interview", role: "Software Engineer", company: "Skyscanner", loc: "Edinburgh", salary: "£75k", score: 94 },
  { id: "6", col: "offer", role: "Finance Analyst", company: "Barclays", loc: "London", salary: "£60k", score: 90 },
];

export function Kanban() {
  const [cards, setCards] = React.useState(initialCards);
  const [dragId, setDragId] = React.useState<string | null>(null);
  return (
    <section id="how" className={styles.wrap} style={{ background: T.ink, color: T.onColor }}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: T.white40 }}>
              PIPELINE KANBAN · SAVED-&gt;OFFER
            </div>
            <h2 className={`serif ${styles.h2}`}>Drag. Review. Dispatch.</h2>
          </div>
          <div className="mono" style={{ fontSize: 10, color: T.white50, maxWidth: "40ch" }}>
            280px cols · PipelineKanban.jsx · JobCard drag updateApplication · HitlReviewStation tailorResumeApi · HitlReviewStation.jsx:34
          </div>
        </div>
        <div className={styles.scroller}>
          <div className={styles.row}>
            {Qm.map((col) => (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId) setCards((prev) => prev.map((c) => (c.id === dragId ? { ...c, col: col.id } : c)));
                }}
                className={styles.column}
                style={{ background: T.white04, borderColor: T.white10 }}
              >
                <div className={styles.colHead}>
                  <span className="mono" style={{ fontSize: 11 }}>
                    {col.label}
                  </span>
                  <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: T.white10 }}>
                    {cards.filter((c) => c.col === col.id).length}
                  </span>
                </div>
                <div className={styles.colBody}>
                  {cards
                    .filter((c) => c.col === col.id)
                    .map((c) => (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={() => setDragId(c.id)}
                        onDragEnd={() => setDragId(null)}
                        className={styles.card}
                        style={{ background: T.card, borderColor: T.creamBorder }}
                      >
                        <div className={styles.cardHead}>
                          <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2, color: T.ink }}>{c.role}</span>
                          <span className="mono" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 999, background: T.successBg, color: T.success }}>
                            {c.score}%
                          </span>
                        </div>
                        <div className="mono" style={{ fontSize: 10, color: T.mutedArtifact, marginTop: 4 }}>
                          {c.company} · {c.loc} · {c.salary}
                        </div>
                        <div className={styles.cardPills}>
                          <span className="mono" style={{ fontSize: 8, padding: "4px 8px", borderRadius: 999, background: T.surfaceCool, border: `1px solid ${T.creamBorder}` }}>
                            optimise
                          </span>
                          <span className="mono" style={{ fontSize: 8, padding: "4px 8px", borderRadius: 999, background: T.surfaceCool, border: `1px solid ${T.creamBorder}` }}>
                            35k
                          </span>
                        </div>
                      </div>
                    ))}
                  {cards.filter((c) => c.col === col.id).length === 0 && (
                    <div className={styles.empty} style={{ borderColor: T.white10, color: T.white40 }}>
                      Drop to move · updateApplication
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
