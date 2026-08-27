import React from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import Pricing from "./pages/Pricing.jsx";
import UkAdvantage from "./pages/UkAdvantage.jsx";
import Security from "./pages/Security.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import Companies from "./pages/Companies.jsx";
import Docs from "./pages/Docs.jsx";
import Blog from "./pages/Blog.jsx";
import Changelog from "./pages/Changelog.jsx";
import Status from "./pages/Status.jsx";
import { Privacy, Terms, Cookies, Gdpr, Refunds, About, Contact } from "./pages/Legal.jsx";
import App from "./App.jsx";
import NotFound from "./pages/NotFound.jsx";
import { LoginView } from "./components/auth/LoginView.jsx";

// Wrapper to keep App's internal activeTab in sync with URL /app/* for deep linking
function AppRoute() {
  const loc = useLocation();
  // /app, /app/master-cv, /app/constraints, /app/settings, /app/billing, /app/pipeline, /app/hitl
  // App.jsx still owns its own tab state; we just mount it. For launch, /app covers all.
  return <App />;
}

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/uk-advantage" element={<UkAdvantage />} />
      <Route path="/security" element={<Security />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/companies" element={<Companies />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<Blog />} />
      <Route path="/changelog" element={<Changelog />} />
      <Route path="/status" element={<Status />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/gdpr" element={<Gdpr />} />
      <Route path="/refunds" element={<Refunds />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/auth" element={<LoginView onLogin={(res)=>{ if(res.token) localStorage.setItem("agentic_cv_uk_token", res.token); window.location.href="/app"; }} />} />
      <Route path="/app/*" element={<AppRoute />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
