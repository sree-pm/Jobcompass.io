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
  const [dragOver, setDragOver] = React.useState<string | null>(null);
  const moveCard = (cardId: string, dir: number) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const i = Qm.findIndex((q) => q.id === c.col);
        const next = Qm[Math.min(Qm.length - 1, Math.max(0, i + dir))];
        return next.id === c.col ? c : { ...c, col: next.id };
      })
    );
  };
  return (
    <section id="how" className={styles.wrap} style={{ background: T.ink, color: T.onColor }}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: T.white60 }}>
              YOUR JOBS · SAVED → OFFER
            </div>
            <h2 className={`serif ${styles.h2}`}>Drag each job to where it is.</h2>
          </div>
          <div className="mono" style={{ fontSize: 10, color: T.white60, maxWidth: "40ch" }}>
            See your whole search at a glance.
          </div>
        </div>
        <div className={styles.scroller} role="region" aria-label="Your job search">
          <div className={styles.row}>
            {Qm.map((col) => (
              <div
                key={col.id}
                role="group"
                aria-label={col.label}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(col.id);
                }}
                onDragLeave={() => setDragOver((prev) => (prev === col.id ? null : prev))}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  if (dragId) setCards((prev) => prev.map((c) => (c.id === dragId ? { ...c, col: col.id } : c)));
                  setDragId(null);
                }}
                className={styles.column}
                style={{ background: T.white08, borderColor: dragOver === col.id ? T.lavenderAA : T.white20 }}
              >
                <div className={styles.colHead}>
                  <span className="mono" style={{ fontSize: 11 }}>
                    {col.label}
                  </span>
                  <span aria-live="polite" className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: T.white10 }}>
                    {cards.filter((c) => c.col === col.id).length}
                  </span>
                </div>
                <div className={styles.colBody} role="list">
                  {cards
                    .filter((c) => c.col === col.id)
                    .map((c) => (
                      <div
                        key={c.id}
                        role="listitem"
                        tabIndex={0}
                        draggable
                        aria-label={`${c.role} at ${c.company}, ${col.label}`}
                        onDragStart={() => setDragId(c.id)}
                        onDragEnd={() => {
                          setDragId(null);
                          setDragOver(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowRight") {
                            e.preventDefault();
                            moveCard(c.id, 1);
                          }
                          if (e.key === "ArrowLeft") {
                            e.preventDefault();
                            moveCard(c.id, -1);
                          }
                        }}
                        className={styles.card}
                        style={{ background: T.card, borderColor: T.creamBorder }}
                      >
                        <div className={styles.cardHead}>
                          <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2, color: T.ink }}>{c.role}</span>
                          <span className="mono" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 999, background: T.successBg, color: T.success }}>
                            {c.score}%
                          </span>
                        </div>
                        <div className="mono" style={{ fontSize: 10, color: T.mutedStrong, marginTop: 4 }}>
                          {c.company} · {c.loc} · {c.salary}
                        </div>
                      </div>
                    ))}
                  {cards.filter((c) => c.col === col.id).length === 0 && (
                    <div className={styles.empty} style={{ borderColor: T.white10, color: T.white60 }}>
                      No jobs here yet
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
