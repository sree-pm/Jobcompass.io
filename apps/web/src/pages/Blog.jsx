import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
const POSTS=[
  { slug:"british-cv-vs-resume", title:"British CV vs résumé — what UK employers expect", excerpt:"One page. A4. British spelling. That's what UK employers expect.", body:"UK employers look for a Personal Profile, clear job history and one page. US résumés often use different headings and paper size. Print a US résumé on A4 and it looks wrong. Every JobCompass CV is one page, A4, British spelling — ready for UK desks." },
  { slug:"ats-keywords-uk", title:"The two-time rule that gets interviews", excerpt:"If a job ad says it twice, your CV should too. Most people forget. We don't.", body:"If a job advert mentions 'customer service' twice, your CV should too. Most people forget. Our helper counts for you and fixes the gaps — then a second helper double-checks." },
  { slug:"tell-the-truth-once", title:"Tell the truth once, then let the tool remember", excerpt:"Tell us what you did — and what you didn't. Our score drops when we're unsure.", body:"Tell us what you did — and what you didn't. Our score drops when we're unsure, so you always know which CV is ready. No made-up facts, ever." },
  { slug:"companies-house-trust", title:"Check the company before you apply", excerpt:"Some job ads are fake. We check every employer before you waste an evening.", body:"Some job ads are fake. We check every employer against the UK's official company register. Active company? Good sign. Closed company? You'll know before you waste an evening." },
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
        <h1 style={{ fontSize:28, fontWeight:800 }}>CV advice for UK jobs</h1>
        <p style={{ color:T.muted }}>Short guides. Each one shows how JobCompass works.</p>
        <div style={{ display:"grid", gap:12, marginTop:16 }}>
          {POSTS.map(card)}
        </div>
      </section>
    </MarketingLayout>
  );
}
