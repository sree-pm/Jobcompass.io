import React, { useState } from "react";
import { tailorResumeApi, generatePdf } from "../lib/cloudflareApi.js";
import { DiffView } from "./FieldLocks.jsx";

const T = { bg: "#FAF9F5", card: "#FFFFFF", border: "#E5E2D9", text: "#1C1917", muted: "#78716C", blue: "#D97857", green: "#15803d", red: "#dc2626" };

export function TailorPanel({ masterResumeId, candidateId, job, constraintsDoc, fieldLocks, onTailored }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await tailorResumeApi(masterResumeId, {
        jobDescription: job.jd || job.jobDescription || job.description || "",
        constraintsDoc,
        applicationId: job.id,
        company: job.company,
        targetRole: job.title || job.role,
        fieldLocks,
      });
      setResult(res);
      onTailored?.(res);
    } catch (e) { setError(e.message || String(e)); }
    finally { setLoading(false); }
  };

  const createPdf = async () => {
    try {
      const r = await generatePdf(job.id);
      if (r.htmlPreview) window.open(`data:text/html,${encodeURIComponent(r.htmlPreview)}`, "_blank");
      alert(`PDF artifact stored: ${r.key}`);
    } catch (e) { alert(e.message); }
  };

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, background: T.card, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", background: T.bg, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Agentic Tailor — bullet-level patches + verifier</div>
          <div style={{ fontSize: 11, color: T.muted }}>Editable fields only · British spelling · £ metrics · second-pass audit</div>
        </div>
        <button
          onClick={run}
          disabled={loading || !job?.jd && !job?.jobDescription}
          style={{ padding: "8px 16px", borderRadius: 7, background: loading ? T.muted : T.blue, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Tailoring…" : "Tailor for this role"}
        </button>
      </div>

      {error && <div style={{ margin: 12, padding: "10px 12px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 7, color: T.red, fontSize: 12 }}>{error}</div>}

      {result && (
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          <DiffView operations={result.operations} verifier={result.verifier} />
          {result.warnings?.length > 0 && (
            <div style={{ padding: "10px 12px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 7, fontSize: 11, color: "#92400e" }}>
              <strong>Warnings:</strong> {result.warnings.join(" · ")}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={createPdf} style={{ padding: "7px 14px", borderRadius: 7, background: T.green, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Generate A4 PDF (R2)</button>
            <span style={{ fontSize: 11, color: T.muted, alignSelf: "center" }}>Tailored ID: {result.tailoredResumeId?.slice(0, 8)}… · Confidence {result.verifier?.confidenceScore}%</span>
          </div>
        </div>
      )}

      {!result && !error && (
        <div style={{ padding: "18px 14px", fontSize: 12, color: T.muted, textAlign: "center" }}>
          JD length: {(job?.jd || job?.jobDescription || "").length} chars · Locks: {Object.values(fieldLocks || {}).filter(Boolean).length} locked · Click Tailor to run two-pass agent.
        </div>
      )}
    </div>
  );
}
