import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
export default function Security(){
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 900, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:32, fontWeight:800 }}>Security — field locks, verifier, confidence</h1>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:20 }}>
          {[
            ["🔒 Field locks", "FieldLocks.jsx:1 lock per exp.0.bullet.2. applyUserLocks never unlocks identity/education/uk_forbidden."],
            ["🛡️ Two-pass audit", "Tailor DeepSeek → Verifier Haiku. Hard diff of every locked field + US spelling scan + £ metric check."],
            ["📉 Confidence cap", "verifier.ts:116 + matcher.ts:73 cap 70 without DID. Amber badge 'Review needed' until ground truth added."],
            ["💳 Credits", "Atomic deduct WHERE balance>=? lib/credits.ts:46. Atomic add balance=balance+? + idempotent reference_id. Refund on fail."],
            ["🌐 CORS allowlist", "index.ts:20 defaults jobcompass.io + www + workers.dev + localhost + CORS_ORIGINS env, maxAge 86400."],
            ["🔐 Auth", "PIN SHA-256 KV TTL 600 auth.ts:31, JWT HS256 24h auth.ts:42, rate limit 3/10min auth.ts:120."],
          ].map(([t,d])=> <div key={t} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}><div style={{ fontWeight:700, fontSize:13 }}>{t}</div><div style={{ fontSize:11, color:T.muted, marginTop:6, lineHeight:1.5, fontFamily: T.mono }}>{d}</div></div>)}
        </div>
        <div style={{ marginTop:20, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
          <div style={{ fontWeight:700, fontSize:13 }}>GDPR</div>
          <div style={{ fontSize:12, color:T.muted, lineHeight:1.6, marginTop:6 }}>Data in D1 `jobcompass-db` + R2 `jobcompass-pdfs` (single region). DELETE /resumes/:id hard delete. No auto-apply — you dispatch via sourceUrl. Email only PIN + receipt via Cloudflare Email Sending `email.ts:1`.</div>
        </div>
        <div style={{ marginTop:16, background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
          <div style={{ fontWeight:700 }}>Cloudflare-native</div>
          <div style={{ fontSize:11, color:T.muted, fontFamily: T.mono, marginTop:6 }}>D1 jobcompass-db 58eb5864…, KV jobcompass-cache 6e7fa960…, Queue jobcompass-ingest-queue + DLQ jobcompass-ingest-dlq, Vectorize jobcompass-jobs 384 cosine, AI binding, EMAIL noreply@jobcompass.io, Cron 0 6 * * *</div>
        </div>
      </section>
    </MarketingLayout>
  );
}
