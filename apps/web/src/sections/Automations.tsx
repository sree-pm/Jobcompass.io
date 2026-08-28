import { T } from "../components/common/Theme.js";
import styles from "./Automations.module.css";
export function Automations() {
  return (
    <section className={styles.wrap} style={{ background: T.cream, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div className="mono" style={{ fontSize: 10, color: T.mutedArtifact }}>
          AUTOMATIONS · PLATFORM 06:00 GMT + PER-CANDIDATE
        </div>
        <h2 className={`serif ${styles.h2}`}>Cron, Queue, Vectorize. No black box.</h2>
        <div className={styles.grid}>
          <div className={styles.cardLight}>
            <div className={styles.cardTitle}>
              <span>◷</span>
              <span className="mono" style={{ fontSize: 11 }}>Platform 06:00 GMT · index.ts:240 scheduled BATCH 50</span>
            </div>
            <div className={`mono ${styles.monoList}`}>
              <div>→ GREENHOUSE_BOARDS, LEVER_COMPANIES, ASHBY_ORGS Promise.allSettled</div>
              <div>→ normaliseUrl:102 dedupe source_url -&gt; INSERT jobs</div>
              <div>→ enrichCompany:16 COMPANIES_HOUSE_API_KEY 600/5min company-enricher.ts:43 sic-industry-map trust 80 active 20 + BRAVE_API_KEY website</div>
              <div>→ classifyJobs:132 job-classifier.ts:38 hasAi?routeJson batch10 else heuristic seniority/work_mode/region uk_region + salary_band</div>
              <div>→ verifyJob:47 career-verifier.ts:60 fetch source_url 10s title 60% salary company dead-phrase ruleScore+25 + routeChat verify_job 50/50</div>
              <div>→ embedNewJobs:68 matchmaker.ts:85 workersAiEmbed bge-small 800 chars -&gt; VECTORIZE upsert -&gt; jobs.embedding_id=job.id never re-embed</div>
            </div>
            <div className={styles.pills}>
              {["D1", "Vectorize 384 cosine", "R2", "BRAVE"].map((p) => (
                <span key={p} className="mono" style={{ fontSize: 9, padding: "4px 8px", borderRadius: 999, background: T.surfaceCool, border: `1px solid ${T.creamBorder}` }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.cardDark} style={{ background: T.ink, color: T.onColor, borderColor: T.white10 }}>
            <div className={styles.cardTitle}>
              <span style={{ color: T.lavender }}>▣</span>
              <span className="mono" style={{ fontSize: 11, color: T.white60 }}>Per-candidate · index.ts:254 + Queue jobcompass-ingest-queue + DLQ 0435012c</span>
            </div>
            <div className={`mono ${styles.monoList}`} style={{ color: T.white60 }}>
              <div>→ Cron loops candidates target_role -&gt; INGEST_QUEUE.send candidateId,query,location max_batch_size 10 timeout 5 retries 2 DLQ wrangler.toml:38</div>
              <div>→ Consumer index.ts:272 queue:272 msg.ack only success else msg.retry() -&gt; DLQ</div>
              <div>→ packages/worker/src/ingest.ts:12 ADZUNA_APP_ID/KEY, REED_API_KEY, APIFY_TOKEN -&gt; searchAdzuna/Reed/Apify providers/*.ts:1</div>
              <div>→ dedupe normaliseUrl 59 -&gt; INSERT applications candidate_id+source_url ingest_runs</div>
              <div>→ Matchmaker A5 matchmaker.ts:126 GET /jobs/matches?candidateId workersAiEmbed profileText -&gt; VECTORIZE query top30 -&gt; D1 IN ids -&gt; hasLlmKeys?routeJson creative top10 re-rank score/reason else SQL fallback hiring_confidence60 location LIKE first_seen DESC 30</div>
            </div>
            <div className={styles.dlq} style={{ background: T.white10, borderColor: T.white10 }}>
              <span style={{ color: T.lavender }}>◈</span>
              <span className="mono" style={{ fontSize: 10 }}>Queue + DLQ ack only success · retry else DLQ · idempotent reference_id</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
