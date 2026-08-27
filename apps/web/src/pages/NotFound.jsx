import React from "react";
import { Link } from "react-router-dom";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
export default function NotFound(){
  React.useEffect(()=>{ document.title="404 — JobCompass"; },[]);
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 800, margin:"0 auto", padding:"80px 24px", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>404</div>
        <h1 style={{ fontSize:24, fontWeight:800 }}>Page not found</h1>
        <p style={{ color:T.muted, marginTop:8 }}>The page you requested does not exist. Try one of these instead.</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:16, flexWrap:"wrap" }}>
          <Link to="/uk-advantage" style={{ background:T.card, border:`1px solid ${T.border}`, padding:"10px 14px", borderRadius:8, textDecoration:"none", color:T.text, fontWeight:600 }}>UK advantage</Link>
          <Link to="/jobs" style={{ background:T.card, border:`1px solid ${T.border}`, padding:"10px 14px", borderRadius:8, textDecoration:"none", color:T.text, fontWeight:600 }}>Jobs</Link>
          <Link to="/docs" style={{ background:T.card, border:`1px solid ${T.border}`, padding:"10px 14px", borderRadius:8, textDecoration:"none", color:T.text, fontWeight:600 }}>Docs</Link>
          <Link to="/" style={{ background:T.blue, color:T.onColor, padding:"10px 16px", borderRadius:8, textDecoration:"none", fontWeight:700 }}>Go home →</Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
