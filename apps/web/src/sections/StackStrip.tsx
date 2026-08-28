import { T } from "../components/common/Theme.js";
import styles from "./StackStrip.module.css";
export function StackStrip() {
  const chips = [
    "Hono Worker jobcompass-api",
    "D1 jobcompass-db 58eb5864",
    "R2 jobcompass-pdfs",
    "KV CACHE 6e7fa960",
    "Queue ingest + DLQ 0435012c",
    "Vectorize 384 cosine",
    "AI Gateway",
    "Cron 06:00 GMT",
    "Vite React 19",
  ];
  return (
    <section className={styles.strip} style={{ background: T.ink, color: T.onColor }}>
      <div className={styles.inner}>
        <span className={`mono ${styles.label}`} style={{ color: T.white40 }}>STACK</span>
        {chips.map((c) => (
          <span key={c} className={`mono ${styles.chip}`} style={{ borderColor: T.white10, background: T.white06 }}>
            {c}
          </span>
        ))}
        <span className={`mono ${styles.monoRight}`} style={{ color: T.white40 }}>apps/web + apps/api + packages/*:1 pnpm-workspace</span>
      </div>
    </section>
  );
}
