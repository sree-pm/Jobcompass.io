import { Link } from "react-router-dom";
import { MarketingLayout } from "../components/marketing/MarketingLayout";
import { Hero } from "../sections/Hero";
import { Pipeline } from "../sections/Pipeline";
import { LogoStrip } from "../components/marketing/LogoStrip";
import { JobsTicker } from "../components/marketing/JobsTicker";
import { Calculator as HireCalculator } from "../sections/Calculator";
import { SocialProof } from "../sections/SocialProof";
import { FreeTools } from "../components/marketing/FreeTools";
import { T } from "../components/common/Theme.js";

export default function Landing() {
  return (
    <MarketingLayout>
      <Hero />
      <Pipeline />
      <JobsTicker />
      <LogoStrip />
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 24px" }}><HireCalculator /></section>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Why we beat $1M ARR apps</h2>
        <div style={{ overflowX: "auto", marginTop: 12, border: `1px solid ${T.border}`, borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ background: T.surface, textAlign: "left" }}>{["Tool","Pricing","Loop","Weakness we win"].map(h=> <th key={h} style={{ padding: "10px 12px", borderBottom: `1px solid ${T.border}`, color: T.muted }}>{h}</th>)}</tr></thead>
            <tbody>
              {[
                ["Teal","free + $9/w","tracker only","No auto-apply — we tailor + verifier proof"],
                ["JobScan","$24–49/mo","score only","Scores but doesn't fix — we auto-fix 10 ops"],
                ["Huntr","~$40/mo","kanban","No apply, expensive — £0.10/app forever"],
                ["Sonara","$80/mo","same CV blast","Generic = ATS fail — we per-bullet keyword 2×"],
                ["JobCompass","£10/100","agentic 12-stage","UK-first + sign-off gate = trust"],
              ].map(r=> <tr key={r[0]} style={{ background: r[0]==="JobCompass"? T.greenPale: T.card }} >{r.map(c=> <td key={c} style={{ padding: "10px 12px", borderBottom: `1px solid ${T.border}`, fontWeight: r[0]==="JobCompass"&&c===r[0]?700:400 }}>{c}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      </section>
      <section style={{ background: T.eggshell, borderTop:`1px solid ${T.chalk}`, borderBottom:`1px solid ${T.chalk}`, padding:"12px 0" }}><SocialProof /></section>
      <section style={{ background: T.surface, borderTop:`1px solid ${T.border}` }}><FreeTools /></section>
    </MarketingLayout>
  );
}
