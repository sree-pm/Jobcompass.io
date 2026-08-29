import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
import { usePageMeta } from "../lib/usePageMeta.js";
export default function Security(){
  usePageMeta("Security — JobCompass", "Field locks, a two-pass AI verifier, confidence caps and UK/EU-region Cloudflare hosting — how JobCompass protects your CV.", "/security");
  React.useEffect(()=>{ document.title="Security — JobCompass"; },[]);
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 900, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:32, fontWeight:800 }}>Security — field locks, verifier, confidence</h1>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12, marginTop:20 }}>
          {[
            ["Field locks", "Lock any bullet. Identity, education and photo fields can never be unlocked — enforced for every tailor run."],
            ["Two-pass audit", "One model drafts, a second model audits. Every locked field is re-checked, US spelling flagged, £ metrics verified."],
            ["Confidence cap", "Without your DID ground truth we cap confidence at 70 and show amber 'Review needed' until you add evidence."],
            ["Credits", "Atomic billing — we deduct only after checks pass. If the tailor fails after charging, you are refunded automatically."],
            ["Strict origins", "Only jobcompass.io may talk to our API. Unknown websites and apps are refused outright, not merely limited."],
            ["Auth", "6-digit PIN by email (10 minute expiry), a 24-hour session, and sign-in attempts limited to 3 tries per 10 minutes."],
          ].map(([t,d])=> <div key={t} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}><div style={{ fontWeight:700, fontSize:13 }}>{t}</div><div style={{ fontSize:12, color:T.muted, marginTop:6, lineHeight:1.5 }}>{d}</div></div>)}
        </div>
        <div style={{ marginTop:20, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
          <div style={{ fontWeight:700, fontSize:13 }}>GDPR</div>
          <div style={{ fontSize:12, color:T.muted, lineHeight:1.6, marginTop:6 }}>Your data stays in the UK on Cloudflare. You can hard-delete any CV at any time. We never auto-apply — you dispatch via the employer's site. Email is PIN codes and Stripe receipts only.</div>
        </div>
        <div style={{ marginTop:16, background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
          <div style={{ fontWeight:700 }}>Built on Cloudflare</div>
          <div style={{ fontSize:12, color:T.muted, marginTop:6 }}>A modern, fully managed Cloudflare stack — your data stays in a single UK/EU region on up-to-date infrastructure, with job listings refreshed daily at 06:00 UTC.</div>
        </div>
      </section>
    </MarketingLayout>
  );
}
