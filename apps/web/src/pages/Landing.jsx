import React from "react";
import { Link } from "react-router-dom";
import { T } from "../components/common/Theme.js";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { AgentFlowDiagram } from "../components/marketing/AgentFlowDiagram.jsx";

export default function Landing() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 32px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 32, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", gap: 6, alignItems: "center", background: T.blueLight, border: `1px solid ${T.blueMid}`, color: T.blue, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", padding: "5px 10px", borderRadius: 999 }}>🇬🇧 UK-FIRST · A4 · GBP · Companies House</div>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "16px 0 12px", color: T.text }}>
            UK job search, <span style={{ color: T.blue }}>done properly</span>.
          </h1>
          <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.6, maxWidth: 560 }}>
            Agentic tailoring you can trust, not volume you regret. Per-bullet field locks, two-pass hallucination audit, DID ground truth, A4 British CVs — on Cloudflare D1/R2/Queue.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <Link to="/app" style={{ background: T.blue, color: T.onColor, fontWeight: 700, padding: "12px 20px", borderRadius: 8, textDecoration: "none", boxShadow: T.shadowSm }}>Start tailoring — 5 free credits →</Link>
            <Link to="/how-it-works" style={{ background: T.card, border: `1px solid ${T.borderStrong}`, color: T.text, fontWeight: 600, padding: "12px 20px", borderRadius: 8, textDecoration: "none" }}>See agentic proof</Link>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 12, color: T.hint }}>
            <span>✓ £0.10/app · credits never expire</span><span>·</span><span>✓ No hallucination — provably</span><span>·</span><span>✓ Human sign-off required</span>
          </div>
          {/* 12-stage mini */}
          <div style={{ marginTop: 28, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: T.muted, marginBottom: 10 }}>12-STAGE AGENTIC PIPELINE</div>
            <AgentFlowDiagram />
          </div>
        </div>
        {/* A4 preview */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadowFloat, padding: 20, position: "relative" }}>
          <div style={{ position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 700, background: T.greenLight, border: `1px solid ${T.greenMid}`, color: T.green, padding: "3px 8px", borderRadius: 999 }}>✓ Verifier passed · 84 confidence</div>
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

      {/* Pillars */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { title: "No hallucination, provably", desc: "Two-pass: tailor (DeepSeek) → verifier (Claude Haiku) + hard guards. Diff + errors/warnings + correctiveOps shown; sign-off gate before dispatch.", badge: "HITL ✓" },
          { title: "UK-first, not ported", desc: "A4, GBP, British spelling, Equality Act (photo/DOB/NI blocked), Companies House trust 80/20.", badge: "🇬🇧" },
          { title: "Per-bullet control", desc: "FieldLocks per exp.0.bullet.2 — lock any bullet. Identity/education never unlockable. 40% finer than Teal/Huntr.", badge: "🔒" },
          { title: "£0.10/app, forever", desc: "Starter £10/100, Active £25/250, Power £50/500. Credits never expire. Sonara $80, Huntr $40, JobScan $49 — subscription trap.", badge: "GBP" },
        ].map(p=> (
          <div key={p.title} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 800, background: T.blueLight, border: `1px solid ${T.blueMid}`, color: T.blue, padding: "3px 8px", borderRadius: 999 }}>{p.badge}</span>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 10 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 6, lineHeight: 1.5 }}>{p.desc}</div>
          </div>
        ))}
      </section>

      {/* Competitive table */}
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
    </MarketingLayout>
  );
}
