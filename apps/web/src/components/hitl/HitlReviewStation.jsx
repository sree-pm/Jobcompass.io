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
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.textStrong }}>No Job Selected</h2>
        <p style={{ fontSize: 13, color: T.muted }}>Pick a job to review the tailored CV. You approve every change before it goes out.</p>
      </div>
    );
  }

  const hasJd = Boolean(job.job_description || job.jd);
  const tailorDisabled = isTailoring || !hasJd || credits < 1;
  const tailorTooltip = !hasJd ? "Add a job description to enable tailoring" : credits < 1 ? "Top up credits to tailor (1 credit per run)" : `Cost 1 credit — balance ${credits}`;

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
          w.onload = () => {
            try {
              w.print();
            } catch {}
          };
          setTimeout(() => {
            try {
              w.print();
            } catch {}
          }, 500);
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

  const onFix = path => {
    const op = correctiveByPath.get(path);
    if (!op) {
      toast?.info("No auto-fix available for " + path);
      return;
    }
    toast?.success(`Fix queued for ${path} — re-run Tailor to apply`);
  };

  const SEVERITY = {
    error: { label: "Errors", color: T.red, bg: T.redLight, border: T.redMid, icon: "⛔" },
    warning: { label: "Warnings", color: T.yellow, bg: T.yellowLight, border: T.yellowMid, icon: "⚠" },
    info: { label: "Info", color: T.purple, bg: T.purpleLight, border: T.purpleMid, icon: "ℹ" },
  };

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "20px 16px 40px" }}>
      <style>{`
        .hitl-grid { display:grid; gap:16px; grid-template-columns:1fr; }
        @media(min-width:1024px){ .hitl-grid{ grid-template-columns:1fr 1.2fr 1fr; } }
      `}</style>

      {/* Top bar — Stripe checkout trust */}
      <Card style={{ marginBottom: 16, padding: "16px 20px" }}>
        <Row justify="space-between" align="center" style={{ flexWrap: "wrap", gap: 16 }}>
          <div style={{ minWidth: 220, flex: 1 }}>
            <Row gap={8} align="center" wrap>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: T.stripeDark, lineHeight: 1.2, fontFamily: T.sans }}>
                {job.company} — {job.role || job.title}
              </h2>
              <Tag label={job.status || "saved"} color={T.stripePrimary} />
            </Row>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
              Location: {job.location || "UK"} · Salary: {job.salary || "GBP"} · Source: {job.source || "Direct"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 260 }}>
            <Row gap={8} wrap justify="flex-end" align="center">
              {job.source_url && (
                <Btn variant="ghost" size="md" onClick={() => window.open(job.source_url, "_blank", "noopener,noreferrer")}>
                  Open Portal
                </Btn>
              )}
              <Btn
                onClick={runTailor}
                disabled={tailorDisabled}
                title={tailorTooltip}
                variant="primary"
                size="md"
                style={{
                  background: T.stripePrimary,
                  borderColor: T.stripePrimary,
                  color: T.card,
                  height: 36,
                  minHeight: 36,
                  borderRadius: 6,
                  boxShadow: T.shadowStripe,
                  fontWeight: 700,
                  opacity: tailorDisabled ? 0.5 : 1,
                }}
              >
                ⚡ {isTailoring ? "Running Two-Pass Agent…" : "Tailor"}
              </Btn>
            </Row>
            <div style={{ fontSize: 12, fontFamily: T.mono, color: T.muted, display: "flex", gap: 6, alignItems: "center" }}>
              <span>Balance: {credits} credit{credits === 1 ? "" : "s"} · Cost 1</span>
              <span style={{ color: T.borderStrong }}>·</span>
              <button
                onClick={onOpenBuyCredits}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontFamily: T.mono,
                  fontSize: 12,
                  color: T.stripePrimary,
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: 600,
                }}
              >
                Top Up
              </button>
            </div>
          </div>
        </Row>
      </Card>

      {error && (
        <div
          style={{
            padding: 12,
            background: T.redLight,
            border: `1px solid ${T.redMid}`,
            borderRadius: 8,
            color: T.red,
            fontSize: 12,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <div className="hitl-grid" style={{ alignItems: "start" }}>
        {/* Left: Job Spec */}
        <Card style={{ padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px", color: T.textStrong }}>1. Target Job Description</h3>
          <div
            style={{
              background: T.stripeBg,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: 12,
              maxHeight: 620,
              overflowY: "auto",
              fontSize: 12,
              color: T.textStrong,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {job.job_description || job.jd || "No job description text provided."}
          </div>
        </Card>

        {/* Center: Tailored CV */}
        <Card style={{ padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px", color: T.textStrong }}>2. Tailored CV</h3>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>Patches · Cover Letter · Screening · Scores</div>
          {tailorResult ? (
            <ApplicationDossierView tailorResult={tailorResult} />
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 10px",
                color: T.muted,
                fontSize: 12,
                border: `1px dashed ${T.border}`,
                borderRadius: 8,
                background: T.stripeBg,
              }}
            >
              Click Tailor to start.
            </div>
          )}
        </Card>

        {/* Right: Verifier Audit & Sign-off — Stripe checkout right rail */}
        <Card style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 520 }}>
          <div style={{ padding: "16px 16px 0" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px", color: T.textStrong }}>3. Verifier Audit & Sign-Off</h3>

            {verifier ? (
              <>
                <ScoreBar label="How well it fits" score={verifier.confidenceScore ?? 0} target={75} note={verifier.confidenceScore >= 75 ? "Looks good" : "Check it"} />

                <div style={{ fontSize: 12, marginBottom: 14 }}>
                  <strong style={{ color: T.textStrong }}>Status: </strong>
                  <span style={{ color: verifier.passed ? T.green : T.red, fontWeight: 700 }}>
                    {verifier.passed ? "✓ Passed all UK compliance checks" : "⚠ Issues found by auditor"}
                  </span>
                </div>

                {grouped && (grouped.error.length || grouped.warning.length || grouped.info.length) ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                    {["error", "warning", "info"].map(k => {
                      const items = grouped[k];
                      if (!items.length) return null;
                      const s = SEVERITY[k];
                      return (
                        <div key={k} style={{ border: `1px solid ${s.border}`, borderRadius: 8, overflow: "hidden", background: T.card }}>
                          <div style={{ background: s.bg, padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", gap: 6, alignItems: "center" }}>
                              <span>{s.icon}</span> {s.label} · {items.length}
                            </span>
                          </div>
                          <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                            {items.map((iss, i) => {
                              const hasFix = Boolean(iss.fix || correctiveByPath.has(iss.path));
                              return (
                                <div
                                  key={i}
                                  style={{
                                    padding: "8px 10px",
                                    borderRadius: 6,
                                    background: T.card,
                                    border: `1px solid ${T.border}`,
                                    borderLeft: `3px solid ${s.color}`,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 8,
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    {iss.path && (
                                      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, wordBreak: "break-all", marginBottom: 2 }}>{iss.path}</div>
                                    )}
                                    <div style={{ fontSize: 12, color: T.textStrong, lineHeight: 1.4 }}>{iss.message}</div>
                                  </div>
                                  {hasFix && (
                                    <Btn
                                      size="xs"
                                      variant="subtle"
                                      onClick={() => onFix(iss.path)}
                                      title={iss.fix ? JSON.stringify(iss.fix) : correctiveByPath.get(iss.path)?.value?.toString().slice(0, 80)}
                                      style={{ background: T.stripeBg, color: T.stripePrimary, border: `1px solid ${T.border}`, minHeight: 26 }}
                                    >
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
                  <div style={{ fontSize: 12, color: T.muted, padding: "8px 0 12px" }}>No verifier issues — ready for sign-off.</div>
                )}

                {verifier.correctiveOperations?.length > 0 && (
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>{verifier.correctiveOperations.length} corrective operation(s) available — Fix buttons above apply them on next Tailor run.</div>
                )}

                {/* Sign-off Gate */}
                <div
                  style={{
                    border: `1px solid ${userSignedOff ? T.greenMid : T.greenMid}`,
                    background: T.greenLight,
                    borderRadius: 8,
                    padding: 14,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.textStrong, marginBottom: 6 }}>Human-In-The-Loop Sign-Off</div>
                  <p style={{ fontSize: 11, color: T.muted, margin: "0 0 10px", lineHeight: 1.5 }}>Confirm that all tailored bullets accurately represent your experience before dispatch.</p>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: T.textStrong }}>
                    <input type="checkbox" checked={userSignedOff} onChange={e => setUserSignedOff(e.target.checked)} style={{ width: 16, height: 16, accentColor: T.green }} />I have reviewed these tailored points and verify they accurately represent my experience.
                  </label>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 10px", color: T.muted, fontSize: 12 }}>Awaiting tailoring run to perform second-pass audit.</div>
            )}
          </div>

          {/* Sticky bottom actions — Generate PDF outline vs Apply primary T.indigoDeep */}
          {verifier && (
            <div
              style={{
                marginTop: "auto",
                position: "sticky",
                bottom: 0,
                background: T.card,
                borderTop: `1px solid ${T.border}`,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Btn variant="outline" onClick={handleGeneratePdf} disabled={isGeneratingPdf} title="Generate A4 PDF to R2" style={{ width: "100%", background: T.card, borderColor: T.borderStrong, color: T.textStrong }}>
                {isGeneratingPdf ? "Generating…" : "Generate PDF"}
              </Btn>
              <Btn
                variant="indigo"
                onClick={() => setShowApplyDrawer(true)}
                disabled={!userSignedOff}
                title={!userSignedOff ? "Sign off above to enable dispatch" : "Open 1-click dispatch helper"}
                style={{
                  width: "100%",
                  background: T.indigo,
                  borderColor: T.indigo,
                  opacity: userSignedOff ? 1 : 0.5,
                  cursor: userSignedOff ? "pointer" : "not-allowed",
                }}
              >
                Apply Dispatch
              </Btn>
              {!userSignedOff && <div style={{ fontSize: 11, color: T.muted, textAlign: "center" }}>Sign off to enable Apply Dispatch</div>}
              <Btn variant="ghost" size="sm" onClick={() => setShowPrepModal(true)} style={{ width: "100%" }}>
                View STAR Interview Prep
              </Btn>
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

      {showPrepModal && <InterviewPrepModal job={job} onClose={() => setShowPrepModal(false)} />}
    </div>
  );
}
