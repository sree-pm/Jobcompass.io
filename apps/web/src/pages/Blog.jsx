import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
const POSTS=[
  { slug:"british-cv-vs-resume", title:"British CV vs Resume — what UK ATS expects", excerpt:"UK recruiters expect Personal Profile, Core Competencies, A4 with no photo. US Letter templates clip when printed.", body:"UK recruiters expect a Personal Profile, Core Competencies and a clean A4 page with no photo. US Letter templates clip when printed — every JobCompass CV renders A4 at 16/18mm margins." },
  { slug:"ats-keywords-uk", title:"ATS keywords UK — the 2× rule that gets interviews", excerpt:"Every keyword appearing twice in a job description should appear twice in your CV — we enforce it, not just score it.", body:"Keywords appearing twice in a job description should appear twice in your CV. Our drafts enforce it and a second model audits coverage before you see the diff." },
  { slug:"did-did-not-ground-truth", title:"DID / DID NOT — stop hallucinating your CV", excerpt:"Tell us what you did and did not do — honesty is built into your confidence score.", body:"Tell us what you did and did not do. Without that evidence your confidence score is capped at 70 — honesty is built in." },
  { slug:"companies-house-trust", title:"Companies House trust — not all UK jobs are real", excerpt:"Every employer is checked at Companies House before you apply.", body:"Every employer is checked at Companies House. Active companies score higher; dissolved ones warn you before you apply." },
];
export default function Blog({ slug: slugProp }){
  const params = useParams();
  const slug = slugProp || params.slug;
  const post = slug ? POSTS.find(p=>p.slug===slug) : null;
  useEffect(()=>{
    document.title = post ? `${post.title} — JobCompass` : "Blog — JobCompass UK CV advice";
  },[post]);
  const card = p => (
    <article key={p.slug} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:18 }}>
      <Link to={`/blog/${p.slug}`} style={{ textDecoration:"none", color:"inherit", display:"block" }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.06em", color:T.hint }}>Guide</div>
        <div style={{ fontWeight:800, fontSize:16, marginTop:4 }}>{p.title}</div>
        <div style={{ fontSize:13, color:T.text, marginTop:6, lineHeight:1.6 }}>{p.excerpt}</div>
        <div style={{ fontSize:12, color:T.blue, fontWeight:700, marginTop:8 }}>Read guide →</div>
      </Link>
    </article>
  );
  if(post){
    return (
      <MarketingLayout>
        <section style={{ maxWidth: 800, margin:"0 auto", padding:"40px 24px" }}>
          <Link to="/blog" style={{ fontSize:12, color:T.blue, textDecoration:"none" }}>← All guides</Link>
          <h1 style={{ fontSize:28, fontWeight:800, marginTop:8 }}>{post.title}</h1>
          <div style={{ marginTop:16, fontSize:15, color:T.text, lineHeight:1.8, background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>{post.body}</div>
          <div style={{ marginTop:20, display:"grid", gap:12 }}>
            {POSTS.filter(p=>p.slug!==post.slug).map(card)}
          </div>
        </section>
      </MarketingLayout>
    );
  }
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 900, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>Blog — UK CV advice that beats US tools</h1>
        <p style={{ color:T.muted }}>Straight-talking UK CV guides, each one tied to how JobCompass actually works.</p>
        <div style={{ display:"grid", gap:12, marginTop:16 }}>
          {POSTS.map(card)}
        </div>
      </section>
    </MarketingLayout>
  );
}
