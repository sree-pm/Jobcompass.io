import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T, PACK_BADGE } from "../components/common/Theme.js";
import { Link } from "react-router-dom";

const PACKS = [
  { id:"pack_starter", name:"Starter", credits:100, price:"£10", badge: PACK_BADGE.Starter, blurb:"Try the full pipeline. Recommended first purchase." },
  { id:"pack_active", name:"Active", credits:250, price:"£25", badge: PACK_BADGE.Active, blurb:"Most chosen — 250 tailored dossiers." },
  { id:"pack_power", name:"Power", credits:500, price:"£50", badge: PACK_BADGE.Power, blurb:"Maximum search — power users." },
];

export default function Pricing() {
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", textAlign:"center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Simple, GBP — credits never expire</h1>
        <p style={{ color: T.muted }}>1 credit = 1 tailored dossier (tailor+verifier+cover letter+screening). Sonara $80/mo, Huntr $40, JobScan $49/mo subscription — we charge per outcome.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 16, marginTop: 28, textAlign:"left" }}>
          {PACKS.map(p=> (
            <div key={p.id} style={{ background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20, boxShadow: T.shadowSm }}>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:"0.06em", background:p.badge.bg, border:`1px solid ${p.badge.border}`, color:p.badge.color, padding:"4px 8px", borderRadius:999 }}>{p.name.toUpperCase()}</span>
              <div style={{ fontSize:36, fontWeight:800, marginTop:12 }}>{p.price}</div>
              <div style={{ fontSize:13, fontWeight:700 }}>{p.credits} credits</div>
              <div style={{ fontSize:11, fontFamily: T.mono, color:T.muted }}>£0.10 / app</div>
              <div style={{ fontSize:12, color:T.muted, marginTop:8, lineHeight:1.5 }}>{p.blurb}</div>
              <Link to="/app" style={{ display:"block", marginTop:16, textAlign:"center", background:T.blue, color:T.onColor, fontWeight:700, padding:"10px 12px", borderRadius:8, textDecoration:"none" }}>Buy in app →</Link>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, background:T.greenPale, border:`1px solid ${T.greenMid}`, borderRadius:10, padding:12, fontSize:12, color:T.green, fontWeight:600 }}>🔒 Stripe · GBP · Cards, Apple Pay, Google Pay · Receipt via noreply@jobcompass.io · Refund on failed tailor (deduct after validate)</div>
        <details style={{ marginTop: 20, textAlign:"left", background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
          <summary style={{ fontWeight:700, cursor:"pointer" }}>FAQ — credits, refunds, trial</summary>
          <div style={{ fontSize:12, color:T.muted, marginTop:8, lineHeight:1.6 }}>
            <p><b>5 trial credits</b> on signup (`lib/credits.ts:9`). No card.</p>
            <p><b>Refund:</b> if tailor blocked or throws after deduct, `addCredits(refund)` auto-refunds (`routes/resumes.ts:102`).</p>
            <p><b>Idempotency:</b> Stripe `session.id` guarded by `UNIQUE reference_id` (`schema.sql:111`), so retries never double-credit.</p>
            <p><b>Whop vs subscription:</b> Teal $9/w, Huntr $40/mo — we never expire, pay only when you tailor.</p>
          </div>
        </details>
      </section>
    </MarketingLayout>
  );
}
