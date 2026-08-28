import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { T } from "../components/common/Theme.js";
import { AgentFlowDiagram } from "../components/marketing/AgentFlowDiagram";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div>
        <div className={styles.badge}>🇬🇧 UK-FIRST · A4 · GBP · Companies House</div>
        <h1 className={styles.title}>
          UK job search, <span className={styles.titleAccent}>done properly</span>.
        </h1>
        <p className={styles.sub}>
          Agentic tailoring you can trust, not volume you regret. Per-bullet locks, two-pass audit, DID ground truth, A4 British CVs — on Cloudflare. The hero dashboard below is a 47-application clone at 0.88× — not a mock.
        </p>
        <div className={styles.sub} style={{ marginTop: 10, fontSize: 11, color: T.hint }}>Also on iMessage · WhatsApp · Claude · Codex · Chrome — like Tsenta’s 8 surfaces, UK-ified</div>
        <div className={styles.actions}>
          <Link to="/app" className={styles.btnPrimary}>Start tailoring — 5 free credits →</Link>
          <Link to="/how-it-works" className={styles.btnGhost}>See agentic proof</Link>
        </div>
        <div className={styles.meta}>
          <span>✓ £0.10/app · credits never expire</span><span>·</span><span>✓ No hallucination — provably</span><span>·</span><span>✓ Human sign-off required</span>
        </div>
        <div className={styles.pipelineBox}>
          <div className={styles.pipelineLabel}>12-STAGE AGENTIC PIPELINE</div>
          <AgentFlowDiagram />
        </div>
      </div>
      <div className={styles.preview}>
        <div className={styles.verifierBadge}>✓ Verifier passed · 84 confidence</div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: T.hint, marginBottom: 8 }}>PERSONAL PROFILE</div>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>Senior Engineer optimising platform reliability — delivered migration saving £400k (24% uplift), led 3 squads, British spelling throughout…</div>
        <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["optimise","organisation","£400k","24%","+3 squads"].map(x=> <span key={x} style={{ fontSize: 11, background: T.surface, border: `1px solid ${T.border}`, padding: "4px 8px", borderRadius: 999 }}>{x}</span>)}
        </div>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 10, textAlign:"center" }}><div style={{ fontSize: 18, fontWeight: 800, color: T.blue }}>100</div><div style={{ fontSize: 10, color: T.muted }}>ATS score</div></div>
          <div style={{ background: T.greenPale, border: `1px solid ${T.greenMid}`, borderRadius: 8, padding: 10, textAlign:"center" }}><div style={{ fontSize: 18, fontWeight: 800, color: T.green }}>✓</div><div style={{ fontSize: 10, color: T.muted }}>No hallucination</div></div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 10, textAlign:"center" }}><div style={{ fontSize: 18, fontWeight: 800 }}>A4</div><div style={{ fontSize: 10, color: T.muted }}>GBP £75k</div></div>
        </div>
        <div style={{ marginTop: 12, fontSize: 10, color: T.hint, textAlign: "center" }}>@page size:A4 · Calibri 10pt · 16mm margins</div>
      </div>
    </section>
  );
}
