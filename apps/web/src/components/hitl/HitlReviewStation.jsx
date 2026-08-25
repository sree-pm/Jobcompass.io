import React, { useState, useMemo } from "react";
import { T } from "../common/Theme.js";
import { Card, Row, Btn, Tag, ScoreBar } from "../common/UiPrimitives.jsx";
import { tailorResumeApi, generatePdf, updateApplication } from "../../lib/cloudflareApi.js";
import { ApplicationDossierView } from "../dossier/ApplicationDossierView.jsx";
import { ApplyDispatchDrawer } from "./ApplyDispatchDrawer.jsx";
import { InterviewPrepModal } from "./InterviewPrepModal.jsx";
import { useToast } from "../common/Toast.jsx";

export function HitlReviewStation({ job, candidate, masterResume, constraintsDoc, fieldLocks, onJobUpdated, credits = 0, onOpenBuyCredits }) {
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState(null);
  const [error, setError] = useState("");
  const [userSignedOff, setUserSignedOff] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showApplyDrawer, setShowApplyDrawer] = useState(false);
  const [showPrepModal, setShowPrepModal] = useState(false);
  const toast = useToast();

  if (!job) {
    return (
      <div style={{ maxWidth: 800, margin: "60px auto", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text }}>No Job Selected</h2>
        <p style={{ fontSize: 13, color: T.muted }}>
          Select an application from the Job Pipeline to enter the Human-In-The-Loop review station.
        </p>
      </div>
    );
  }

  const hasJd = Boolean(job.job_description || job.jd);
  const tailorDisabled = isTailoring || !hasJd;
  const tailorTooltip = !hasJd
    ? "Add a job description to enable tailoring"
    : credits < 1
      ? "Top up credits to tailor (1 credit per run)"
      : `Cost 1 credit — balance ${credits}`;

  const runTailor = async () => {
    if (credits < 1) {
      toast?.error("Insufficient credits — top up to tailor");
      onOpenBuyCredits?.();
      return;
    }
    setIsTailoring(true);
    setError("");
    setUserSignedOff(false);
    try {
      const res = await tailorResumeApi(masterResume.id, {
        jobDescription: job.job_description || job.jd || "",
        constraintsDoc,
        applicationId: job.id,
        company: job.company,
        targetRole: job.role || job.title,
        fieldLocks,
      });
      setTailorResult(res);
      onJobUpdated?.();
      toast?.success("Tailor & Verifier completed");
    } catch (e) {
      const msg = e.message || String(e);
      setError(msg);
      toast?.error(msg);
    } finally {
      setIsTailoring(false);
    }
  };

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const r = await generatePdf(job.id);
      if (r.htmlPreview) {
        const w = window.open("", "_blank");
        if (w) {
          w.document.write(r.htmlPreview);
          w.document.close();
          w.onload = () => { try { w.print(); } catch {} };
          setTimeout(() => { try { w.print(); } catch {} }, 500);
        }
      }
      toast?.success(`PDF generated — ${r.key || "stored to R2"}`);
    } catch (e) {
      toast?.error("PDF failed: " + e.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleApplyCompleted = async () => {
    try {
      await updateApplication(job.id, { status: "applied", applied_date: new Date().toISOString() });
      onJobUpdated?.();
      toast?.success("Marked as Applied — good luck!");
    } catch (e) {
      toast?.error(e.message);
    }
  };

  const verifier = tailorResult?.verifier;

  // group verifier issues by severity for right pane
  const grouped = useMemo(() => {
    if (!verifier?.issues?.length) return null;
    const g = { error: [], warning: [], info: [] };
    for (const iss of verifier.issues) {
      const k = iss.severity === "error" ? "error" : iss.severity === "warning" ? "warning" : "info";
      g[k].push(iss);
    }
    return g;
  }, [verifier]);

  const correctiveByPath = useMemo(() => {
    const m = new Map();
    for (const op of verifier?.correctiveOperations || []) {
      if (op?.path) m.set(op.path, op);
    }
    return m;
  }, [verifier]);

  const onFix = (path) => {
    const op = correctiveByPath.get(path);
    if (!op) {
      toast?.info("No auto-fix available for " + path);
      return;
    }
    toast?.success(`Fix queued for ${path} — re-run Tailor to apply`);
  };

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "20px 0" }}>
      <style>{`
        .hitl-grid { display:grid; gap:16px; grid-template-columns:1fr; }
        @media(min-width:768px){ .hitl-grid{ grid-template-columns:1fr 1fr; } }
        @media(min-width:1024px){ .hitl-grid{ grid-template-columns:1fr 1.2fr 1fr; } }
      `}</style>

      {/* Top bar */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="center" style={{ flexWrap: "wrap", gap: 16 }}>
          <div style={{ minWidth: 220, flex: 1 }}>
            <Row gap={8} align="center" wrap>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: T.text, lineHeight: 1.2 }}>
                {job.company} — {job.role || job.title}
              </h2>
              <Tag label={job.status || "saved"} color={T.blue} />
            </Row>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
              Location: {job.location || "UK"} · Salary: {job.salary || "GBP"} · Source: {job.source || "Direct"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 240 }}>
            <Row gap={8} wrap justify="flex-end">
              {job.source_url && (
                <Btn variant="outline" size="sm" onClick={() => window.open(job.source_url, "_blank", "noopener,noreferrer")}>
                  Open Portal
                </Btn>
              )}
              {credits < 1 ? (
                <Btn onClick={onOpenBuyCredits} variant="danger" title="Top up to tailor — 1 credit per run">
                  Top Up Credits to Tailor
                </Btn>
              ) : (
                <span title={tailorTooltip}>
                  <Btn onClick={runTailor} disabled={tailorDisabled} variant="primary">
                    {isTailoring ? "Running Two-Pass Agent…" : "Tailor"}
                  </Btn>
                </span>
              )}
            </Row>
            <div style={{ fontSize: 11, color: T.muted }} title={tailorTooltip}>
              Cost: 1 Credit (Balance: {credits})
            </div>
          </div>
        </Row>
      </Card>

      {error && (
        <div style={{ padding: 12, background: T.redLight, border: `1px solid ${T.redMid}`, borderRadius: 8, color: T.red, fontSize: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="hitl-grid">
        {/* Left: Job Spec & Ground Truth */}
        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px", color: T.text }}>
            1. Target Job Description
          </h3>
          <div
            style={{
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: 12,
              maxHeight: 520,
              overflowY: "auto",
              fontSize: 12,
              color: T.text,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {job.job_description || job.jd || "No job description text provided."}
          </div>
        </Card>

        {/* Center: Application Dossier with tabs + ScoreBar */}
        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px", color: T.text }}>
            2. Application Dossier
          </h3>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>Patches · Cover Letter · Screening · Scores</div>
          {tailorResult ? (
            <ApplicationDossierView tailorResult={tailorResult} />
          ) : (
            <div style={{ textAlign: "center", padding: "40px 10px", color: T.muted, fontSize: 12, border: `1px dashed ${T.border}`, borderRadius: 8, background: T.bg }}>
              Click &ldquo;Tailor&rdquo; to generate atomic bullet patches.
            </div>
          )}
        </Card>

        {/* Right: Verifier Audit & HITL Sign-off */}
        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px", color: T.text }}>
            3. Verifier Audit & Sign-Off
          </h3>

          {verifier ? (
            <div>
              <ScoreBar
                label="Confidence Score"
                score={verifier.confidenceScore ?? 0}
                target={75}
                note={verifier.confidenceScore >= 75 ? "DID-verified" : "Review needed"}
              />

              <div style={{ fontSize: 12, marginBottom: 12 }}>
                <strong>Status: </strong>
                <span style={{ color: verifier.passed ? T.green : T.red, fontWeight: 700 }}>
                  {verifier.passed ? "✓ Passed all UK compliance checks" : "⚠ Issues found by auditor"}
                </span>
              </div>

              {/* Issues grouped by severity */}
              {grouped && (grouped.error.length || grouped.warning.length || grouped.info.length) ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  {[
                    { key: "error", label: "Errors", color: T.red, bg: T.redLight, border: T.redMid },
                    { key: "warning", label: "Warnings", color: T.yellow, bg: T.yellowLight, border: T.yellowMid },
                    { key: "info", label: "Info", color: T.purple, bg: T.purpleLight, border: T.purpleMid },
                  ].map(group => {
                    const items = grouped[group.key];
                    if (!items.length) return null;
                    return (
                      <div key={group.key} style={{ border: `1px solid ${group.border}`, borderRadius: 8, overflow: "hidden" }}>
                        <div style={{ background: group.bg, padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: group.color, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            {group.label} · {items.length}
                          </span>
                        </div>
                        <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                          {items.map((iss, i) => {
                            const hasFix = Boolean(iss.fix || correctiveByPath.has(iss.path));
                            return (
                              <div key={i} style={{ padding: "8px 10px", borderRadius: 6, background: T.card, border: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {iss.path && (
                                    <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, wordBreak: "break-all", marginBottom: 2 }}>
                                      {iss.path}
                                    </div>
                                  )}
                                  <div style={{ fontSize: 12, color: T.text, lineHeight: 1.4 }}>{iss.message}</div>
                                </div>
                                {hasFix && (
                                  <Btn size="xs" variant="subtle" onClick={() => onFix(iss.path)} title={iss.fix ? JSON.stringify(iss.fix) : correctiveByPath.get(iss.path)?.value?.toString().slice(0, 80)}>
                                    Fix
                                  </Btn>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: T.muted, padding: "8px 0 12px" }}>
                  No verifier issues — ready for sign-off.
                </div>
              )}

              {/* Corrective ops not attached to an issue */}
              {verifier.correctiveOperations?.length > 0 && (
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>
                  {verifier.correctiveOperations.length} corrective operation(s) available — Fix buttons above apply them on next Tailor run.
                </div>
              )}

              {/* HITL Explicit Sign-off Gate — greenLight border */}
              <div
                style={{
                  border: `1px solid ${userSignedOff ? T.greenMid : T.borderStrong}`,
                  background: userSignedOff ? T.greenLight : T.bg,
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 6 }}>
                  Human-In-The-Loop Sign-Off
                </div>
                <p style={{ fontSize: 11, color: T.muted, margin: "0 0 10px", lineHeight: 1.5 }}>
                  Confirm that all tailored bullets accurately represent your experience before dispatch.
                </p>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.text }}>
                  <input type="checkbox" checked={userSignedOff} onChange={e => setUserSignedOff(e.target.checked)} />
                  I verify and approve these tailored points
                </label>
              </div>

              {/* Post-tailor actions: Generate PDF secondary vs Apply Dispatch primary */}
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <Btn variant="outline" onClick={handleGeneratePdf} disabled={isGeneratingPdf} title="Generate A4 PDF to R2">
                  {isGeneratingPdf ? "Generating…" : "Generate PDF"}
                </Btn>
                <Btn variant="indigo" onClick={() => setShowApplyDrawer(true)} disabled={!userSignedOff} title={!userSignedOff ? "Sign off above to enable dispatch" : "Open 1-click dispatch helper"}>
                  Apply Dispatch
                </Btn>
                {!userSignedOff && (
                  <div style={{ fontSize: 11, color: T.muted, textAlign: "center" }}>
                    Sign off to enable Apply Dispatch
                  </div>
                )}
                <Btn variant="ghost" size="sm" onClick={() => setShowPrepModal(true)}>
                  View STAR Interview Prep
                </Btn>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 10px", color: T.muted, fontSize: 12 }}>
              Awaiting tailoring run to perform second-pass audit.
            </div>
          )}
        </Card>
      </div>

      {showApplyDrawer && (
        <ApplyDispatchDrawer
          job={job}
          candidate={candidate}
          tailorResult={tailorResult}
          onClose={() => setShowApplyDrawer(false)}
          onAppliedSuccess={() => {
            handleApplyCompleted();
            setShowApplyDrawer(false);
          }}
        />
      )}

      {showPrepModal && (
        <InterviewPrepModal job={job} onClose={() => setShowPrepModal(false)} />
      )}
    </div>
  );
}
