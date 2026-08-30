import React, { useState, useEffect } from "react";
import { T, STAGES } from "./components/common/Theme.js";
import { Card, Row, Btn, Field, Modal, Empty, StorageMeter } from "./components/common/UiPrimitives.jsx";
import { Navbar } from "./components/layout/Navbar.jsx";
import { OnboardingWizard } from "./components/onboarding/OnboardingWizard.jsx";
import { ConstraintsBuilder } from "./components/onboarding/ConstraintsBuilder.jsx";
import { PipelineKanban } from "./components/pipeline/PipelineKanban.jsx";
import { HitlReviewStation } from "./components/hitl/HitlReviewStation.jsx";
import { SettingsView } from "./components/settings/SettingsView.jsx";
import { FieldLocks } from "./components/FieldLocks.jsx";
import { BuyCreditsModal } from "./components/billing/BuyCreditsModal.jsx";
import * as api from "./lib/cloudflareApi.js";
import { store } from "./lib/storage.js";
import { LoginView } from "./components/auth/LoginView.jsx";

// RequireAuth guard — enforces JWT presence; redirects to LoginView if missing token/candidate.
// Keeps x-api-key dev path intact at API layer; UI onboarding always requires a valid JWT.
export function RequireAuth({ candidate, onLogin, children }) {
  const token = localStorage.getItem("agentic_cv_uk_token");
  if (!token || !candidate) {
    return <LoginView onLogin={onLogin} />;
  }
  return children;
}

export default function App() {
  const [candidate, setCandidate] = useState(null);
  const [masterResume, setMasterResume] = useState(null);
  const [constraints, setConstraints] = useState({ content: "", didList: [], didNotList: [] });
  const [fieldLocks, setFieldLocks] = useState({});
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState("jobs"); // "jobs" | "review" | "master_cv" | "constraints" | "settings"
  const [isLoading, setIsLoading] = useState(true);

  // Add Job Modal State
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJob, setNewJob] = useState({ company: "", role: "", location: "London, UK", salary: "£75,000", sourceUrl: "", jobDescription: "" });
  const [isIngestingUrl, setIsIngestingUrl] = useState(false);
  const [isSavingJob, setIsSavingJob] = useState(false);
  
  // Credits State
  const [credits, setCredits] = useState(0);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);

  // Initial load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("agentic_cv_uk_token");
        if (token) {
          const res = await api.getMe();
          if (res.candidate) {
            setCandidate(res.candidate);
            setCredits(res.credits || 0);
            await refreshCandidateData(res.candidate.id);
          }
        }
      } catch (e) {
        console.error("Auth check failed", e);
        localStorage.removeItem("agentic_cv_uk_token");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  async function refreshCandidateData(candId) {
    try {
      // 1. Load Resumes
      const resumes = await api.listResumes(candId).catch(() => []);
      const master = resumes.find(r => r.is_master) || resumes[0];
      if (master) {
        const fullMaster = await api.getResume(master.id).catch(() => master);
        setMasterResume(fullMaster);
      }

      // 2. Load Constraints
      const cons = await api.getConstraints(candId).catch(() => ({ content: "", didList: [], didNotList: [] }));
      setConstraints(cons);

      // 3. Load Applications
      const apps = await api.listApplications(candId).catch(() => []);
      setApplications(apps);
      if (apps.length > 0 && !selectedJob) {
        setSelectedJob(apps[0]);
      }

      // 4. Load Credits
      const balanceRes = await api.getCreditBalance(candId).catch(() => ({ balance: 0 }));
      setCredits(balanceRes.balance || 0);
    } catch (err) {
      console.error("Refresh error", err);
    }
  }

  // Handle Onboarding Completion — uses existing candidate from JWT (updateCandidate, not createCandidate)
  // Requires valid agentic_cv_uk_token; redirects to LoginView if missing.
  const handleOnboardingComplete = async ({ profile, cvText, didList: wizardDidList, didNotList: wizardDidNotList, fieldLocks: wizardLocks }) => {
    const token = localStorage.getItem("agentic_cv_uk_token");
    if (!token) {
      setCandidate(null);
      return;
    }
    // Resolve existing candidate from JWT — may need to recover via /auth/me if state is stale
    let effectiveCandidate = candidate;
    if (!effectiveCandidate?.id) {
      try {
        const res = await api.getMe();
        if (res.candidate) {
          effectiveCandidate = res.candidate;
          setCandidate(res.candidate);
        }
      } catch {
        // token invalid/expired — redirect to login
        localStorage.removeItem("agentic_cv_uk_token");
        setCandidate(null);
        return;
      }
    }
    if (!effectiveCandidate?.id) {
      setCandidate(null);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Update existing candidate in D1 (from JWT), do not create a new one
      const updatedCand = await api.updateCandidate(effectiveCandidate.id, profile);
      // Merge updated fields with existing candidate data for UI continuity
      const mergedCand = { ...effectiveCandidate, ...updatedCand };
      setCandidate(mergedCand);
      await store.set("candidate", mergedCand);

      // 2. Parse CV text into structured data (or use fallback)
      let resumeData;
      if (cvText && cvText.trim().length >= 50) {
        try {
          resumeData = await api.parseCvText(cvText, profile);
          // Ensure basics are populated from profile
          if (!resumeData.basics) resumeData.basics = {};
          resumeData.basics.name = resumeData.basics.name || profile.fullName;
          resumeData.basics.email = resumeData.basics.email || profile.email;
          resumeData.basics.location = resumeData.basics.location || profile.location;
          resumeData.basics.rightToWork = resumeData.basics.rightToWork || profile.rightToWork;
          resumeData.basics.phone = resumeData.basics.phone || profile.phone || "";
        } catch (parseErr) {
          console.error("CV parse failed, using fallback", parseErr);
          resumeData = null;
        }
      }

      if (!resumeData) {
        // Fallback: minimal structure from profile (no fake experience)
        resumeData = {
          basics: {
            name: profile.fullName,
            email: profile.email,
            phone: profile.phone || "",
            location: profile.location,
            rightToWork: profile.rightToWork,
          },
          summary: { content: cvText ? cvText.slice(0, 500) : "" },
          sections: {
            experience: { items: [] },
            skills: { items: [] },
            education: { items: [] },
          },
        };
      }

      const createdResume = await api.createResume(mergedCand.id, resumeData, "Master CV");
      const fullResume = await api.getResume(createdResume.id);
      setMasterResume(fullResume);

      // 3. Save initial starter constraints (prefer wizard-provided DID/DID NOT when present)
      const initialConstraints = (wizardDidList?.length || wizardDidNotList?.length)
        ? {
            content: [
              "YOUR CV DETAILS — UK",
              "",
              "WHAT YOU ACTUALLY DID (with numbers):",
              ...(wizardDidList?.length ? wizardDidList.map((d) => `• ${d}`) : ["• [none yet]"]),
              "",
              "WHAT YOU DID NOT DO:",
              ...(wizardDidNotList?.length ? wizardDidNotList.map((d) => `• ${d}`) : ["• [none yet]"]),
              "",
              `RIGHT TO WORK: ${profile.rightToWork || "British Citizen"}${profile.rightToWorkExpiry ? ` (expiry ${profile.rightToWorkExpiry})` : ""}`,
              "UK RULES: one page, A4, British spelling. Nothing made up.",
            ].join("\n"),
            didList: wizardDidList || [],
            didNotList: wizardDidNotList || [],
          }
        : {
        content: `YOUR CV DETAILS — UK\nDID:\n• Led key architecture migration with 24% gain (£400k saved)\n• Delivered core features\n\nDID NOT:\n• Did not manage people/hiring\n• Did not write mobile code\n\nUK RULES: one page, A4, British spelling. Nothing made up.`,
        didList: ["Led key architecture migration with 24% gain (£400k saved)", "Delivered core features"],
        didNotList: ["Did not manage people/hiring", "Did not write mobile code"],
      };
      await api.saveConstraints(mergedCand.id, initialConstraints);
      setConstraints(initialConstraints);
      // Persist wizard field locks if provided
      if (wizardLocks && Object.keys(wizardLocks).length && fullResume?.id) {
        try { await api.putFieldLocks(fullResume.id, wizardLocks); setFieldLocks(wizardLocks); } catch {}
      }

      // 4. Create a sample initial application
      const sampleApp = await api.createApplication({
        candidateId: mergedCand.id,
        resumeId: createdResume.id,
        company: "Stripe UK",
        role: profile.targetRole || "Senior Engineer",
        location: "London (Hybrid)",
        salary: "£85,000",
        source: "adzuna",
        sourceUrl: "https://stripe.com/jobs",
        jobDescription: `Stripe is looking for a ${profile.targetRole || "Senior Engineer"} in London. Requirements: Strong past experience delivering critical systems, British English communication, proven track record with quantitative metrics.`,
        tags: ["UK", "FinTech"],
        status: "saved",
      });
      setApplications([sampleApp]);
      setSelectedJob(sampleApp);
      setActiveTab("jobs");
    } catch (e) {
      alert("Setup didn't work: " + (e?.message || "please try again"));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Save Constraints
  const handleSaveConstraints = async (newConstraints) => {
    if (!candidate) return;
    await api.saveConstraints(candidate.id, newConstraints);
    setConstraints(newConstraints);
  };

  // Handle Toggle Field Lock
  const handleToggleLock = async (fieldId, locked) => {
    if (!masterResume) return;
    const updated = { ...fieldLocks, [fieldId]: locked };
    setFieldLocks(updated);
    await api.putFieldLocks(masterResume.id, updated);
  };

  // Handle Add New Job
  const handleAddJobSubmit = async () => {
    if (!candidate || !newJob.company || !newJob.role) {
      alert("Add a company name and a role title to continue.");
      return;
    }
    setIsSavingJob(true);
    try {
      const created = await api.createApplication({
        candidateId: candidate.id,
        resumeId: masterResume?.id || null,
        company: newJob.company,
        role: newJob.role,
        location: newJob.location,
        salary: newJob.salary,
        sourceUrl: newJob.sourceUrl,
        jobDescription: newJob.jobDescription,
        status: "saved",
      });
      setApplications([created, ...applications]);
      setSelectedJob(created);
      setShowAddJobModal(false);
      setNewJob({ company: "", role: "", location: "London, UK", salary: "£75,000", sourceUrl: "", jobDescription: "" });
      setActiveTab("review");
    } catch (e) {
      alert("Couldn't add the job: " + (e?.message || "try again"));
    } finally {
      setIsSavingJob(false);
    }
  };

  // Extract JD from URL
  const handleExtractFromUrl = async () => {
    if (!newJob.sourceUrl) return;
    setIsIngestingUrl(true);
    try {
      const res = await api.ingestExtract({ url: newJob.sourceUrl });
      if (res.text) {
        setNewJob(prev => ({ ...prev, jobDescription: res.text }));
      }
    } catch (e) {
      alert("Couldn't read that page: " + (e?.message || "paste the job ad text instead"));
    } finally {
      setIsIngestingUrl(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🇬🇧</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Loading JobCompass…</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Setting up your workspace…</div>
        </div>
      </div>
    );
  }

  // RequireAuth guard — redirects to sign-in if no candidate or no valid sign-in code.
  if (!candidate) {
    return <LoginView onLogin={(res) => {
      // LoginView already stores the sign-in code; mirror here for safety
      if (res.token) localStorage.setItem("agentic_cv_uk_token", res.token);
      setCandidate(res.candidate);
      setCredits(res.credits || 0);
      if (!res.isNewUser) refreshCandidateData(res.candidate.id);
    }} />;
  }

  // If candidate but no master resume -> OnboardingWizard (guarded: requires token)
  if (!masterResume) {
    const token = localStorage.getItem("agentic_cv_uk_token");
    if (!token) {
      return <LoginView onLogin={(res) => {
        if (res.token) localStorage.setItem("agentic_cv_uk_token", res.token);
        setCandidate(res.candidate);
        setCredits(res.credits || 0);
        if (!res.isNewUser) refreshCandidateData(res.candidate.id);
      }} />;
    }
    return (
      <RequireAuth candidate={candidate} onLogin={(res) => {
        if (res.token) localStorage.setItem("agentic_cv_uk_token", res.token);
        setCandidate(res.candidate);
        setCredits(res.credits || 0);
        if (!res.isNewUser) refreshCandidateData(res.candidate.id);
      }}>
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </RequireAuth>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.sans, color: T.text }}>
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        candidate={candidate}
        onOpenNewJob={() => setShowAddJobModal(true)}
        credits={credits}
        onOpenBuyCredits={() => setShowBuyCreditsModal(true)}
        onLogout={() => { localStorage.removeItem("agentic_cv_uk_token"); setCandidate(null); setMasterResume(null); }}
      />

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        {activeTab === "jobs" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 10px" }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: T.text }}>
                  📊 Your jobs
                </h1>
                <p style={{ fontSize: 12, color: T.muted, margin: "2px 0 0" }}>
                  Click any role to review and tailor it. You approve before anything sends.
                </p>
              </div>

              <Btn variant="primary" size="sm" onClick={() => setShowAddJobModal(true)}>
                + Add / Scrape Job
              </Btn>
            </div>

            <PipelineKanban
              jobs={applications}
              selectedJobId={selectedJob?.id}
              onSelectJob={job => {
                setSelectedJob(job);
                setActiveTab("review");
              }}
              onStatusChange={() => refreshCandidateData(candidate.id)}
            />
          </div>
        )}

        {activeTab === "review" && (
          <HitlReviewStation
            job={selectedJob}
            candidate={candidate}
            masterResume={masterResume}
            constraintsDoc={constraints.content}
            fieldLocks={fieldLocks}
            onJobUpdated={() => refreshCandidateData(candidate.id)}
            credits={credits}
            onOpenBuyCredits={() => setShowBuyCreditsModal(true)}
          />
        )}

        {activeTab === "master_cv" && (
          <div style={{ maxWidth: 900, margin: "24px auto" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: "0 0 6px" }}>
              📄 Your CV and locks
            </h2>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
              Choose what we can change. Your name, school and photo stay as you wrote them, every time.
            </p>

            {masterResume?.registry ? (
              <FieldLocks
                registry={masterResume.registry}
                locks={fieldLocks}
                onToggle={handleToggleLock}
              />
            ) : (
              <Card>
                <div style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: 20 }}>
                  Master CV loaded. Version {masterResume?.version || 1}.
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === "constraints" && (
          <ConstraintsBuilder
            constraintsDoc={constraints.content}
            didList={constraints.didList || []}
            didNotList={constraints.didNotList || []}
            onSave={handleSaveConstraints}
            isSaving={false}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            candidate={candidate}
            onUpdateCandidate={() => refreshCandidateData(candidate.id)}
          />
        )}
      </main>

      {/* Add / Ingest Job Modal */}
      {showAddJobModal && (
        <Modal title="Add a job to tailor" onClose={() => setShowAddJobModal(false)} maxWidth={560}>
          <div style={{ marginBottom: 12 }}>
            <Label>1. Add from job ad link (Optional)</Label>
            <Row gap={8}>
              <div style={{ flex: 1 }}>
                <input
                  type="url"
                  placeholder="https://boards.greenhouse.io/... or company/jobs"
                  value={newJob.sourceUrl}
                  onChange={e => setNewJob({ ...newJob, sourceUrl: e.target.value })}
                  style={{
                    width: "100%",
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 7,
                    padding: "9px 12px",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <Btn size="sm" variant="outline" onClick={handleExtractFromUrl} disabled={isIngestingUrl || !newJob.sourceUrl}>
                {isIngestingUrl ? "Reading…" : "Get job ad"}
              </Btn>
            </Row>
          </div>

          <Row gap={12}>
            <div style={{ flex: 1 }}>
              <Field label="Company" value={newJob.company} onChange={v => setNewJob({ ...newJob, company: v })} placeholder="e.g. Monzo Bank" />
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Role Title" value={newJob.role} onChange={v => setNewJob({ ...newJob, role: v })} placeholder="e.g. Lead Engineer" />
            </div>
          </Row>

          <Row gap={12}>
            <div style={{ flex: 1 }}>
              <Field label="Location" value={newJob.location} onChange={v => setNewJob({ ...newJob, location: v })} placeholder="London / Remote" />
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Salary (£ GBP)" value={newJob.salary} onChange={v => setNewJob({ ...newJob, salary: v })} placeholder="e.g. £80,000" />
            </div>
          </Row>

          <Field
            label="Job Description"
            value={newJob.jobDescription}
            onChange={v => setNewJob({ ...newJob, jobDescription: v })}
            placeholder="Paste the job requirements, responsibilities and qualifications…"
            multi
            rows={6}
          />

          <Row justify="flex-end" gap={10} style={{ marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setShowAddJobModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAddJobSubmit} disabled={isSavingJob || !newJob.company || !newJob.role}>
              {isSavingJob ? "Saving…" : "Add to pipeline"}
            </Btn>
          </Row>
        </Modal>
      )}

      {showBuyCreditsModal && (
        <BuyCreditsModal
          candidateId={candidate.id}
          currentBalance={credits}
          onClose={() => setShowBuyCreditsModal(false)}
          onPurchased={(newBal) => setCredits(newBal)}
        />
      )}
    </div>
  );
}
