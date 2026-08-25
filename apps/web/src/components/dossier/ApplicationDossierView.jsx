import React, { useState } from "react";
import { T } from "../common/Theme.js";
import { Card, Row, Btn, Tag, ScoreBar } from "../common/UiPrimitives.jsx";
import { DiffView } from "../FieldLocks.jsx";
import { useToast } from "../common/Toast.jsx";

export function ApplicationDossierView({ tailorResult }) {
  const [activeTab, setActiveTab] = useState("patches");
  const [copiedKey, setCopiedKey] = useState("");
  const toast = useToast();

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiedKey(key);
    toast?.success(key === "cover" ? "Cover letter copied" : "Copied to clipboard");
    setTimeout(() => setCopiedKey(""), 1800);
  };

  const verifier = tailorResult?.verifier;
  const coverLetter = tailorResult?.coverLetter || tailorResult?.dossier?.coverLetter || "";
  const qa = tailorResult?.screeningAnswers || tailorResult?.dossier?.screeningAnswers || {};
  const analysis = tailorResult?.analysis || tailorResult?.dossier?.analysis || {};
  const scores = analysis.scores || {};
  const gap = analysis.gap || {};

  const tabs = [
    { id: "patches", label: "Patches" },
    { id: "cover", label: "Cover Letter" },
    { id: "screening", label: "Screening" },
    { id: "scores", label: "Scores" },
  ];

  return (
    <div>
      {/* ScoreBar summary — visible when verifier present */}
      {verifier && (
        <div style={{ marginBottom: 14 }}>
          <ScoreBar
            label="Verifier Confidence"
            score={verifier.confidenceScore ?? 0}
            target={75}
            note={verifier.confidenceScore >= 75 ? "DID-verified" : "Review needed"}
          />
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          borderBottom: `1px solid ${T.border}`,
          paddingBottom: 8,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: active ? `1px solid ${T.blueMid}` : "1px solid transparent",
                background: active ? T.blueLight : "transparent",
                color: active ? T.blue : T.text,
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                fontFamily: T.sans,
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Patches */}
      {activeTab === "patches" && (
        <div>
          {tailorResult?.operations?.length ? (
            <DiffView operations={tailorResult.operations} verifier={verifier} />
          ) : (
            <div style={{ textAlign: "center", padding: "28px 10px", color: T.muted, fontSize: 12 }}>
              No patch operations — run Tailor to generate atomic bullet patches.
            </div>
          )}
        </div>
      )}

      {/* Cover Letter */}
      {activeTab === "cover" && (
        <Card style={{ padding: 14 }}>
          <Row justify="space-between" align="center" style={{ marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.text }}>UK Cover Letter</h4>
              <div style={{ fontSize: 11, color: T.muted }}>300–340 words · Understated British tone · Specific interview CTA</div>
            </div>
            <Btn
              size="sm"
              variant={copiedKey === "cover" ? "success" : "outline"}
              onClick={() => copyToClipboard(coverLetter, "cover")}
            >
              {copiedKey === "cover" ? "✓ Copied" : "Copy"}
            </Btn>
          </Row>
          <div
            style={{
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: 16,
              fontSize: 13,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              color: T.text,
              fontFamily: T.sans,
              maxHeight: 420,
              overflowY: "auto",
            }}
          >
            {coverLetter || "No cover letter generated yet — run Tailor first."}
          </div>
        </Card>
      )}

      {/* Screening */}
      {activeTab === "screening" && (
        <Card style={{ padding: 14 }}>
          <div style={{ marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.text }}>Screening Q&A Helper</h4>
            <div style={{ fontSize: 11, color: T.muted }}>One-click copy answers for Workday, Greenhouse, and Lever.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: 12 }}>
              <Row justify="space-between" align="center" style={{ marginBottom: 4, gap: 8 }}>
                <strong style={{ fontSize: 12, color: T.text }}>1. &ldquo;Why this role &amp; company?&rdquo;</strong>
                <Btn size="xs" variant="ghost" onClick={() => copyToClipboard(qa.why_this_role || "Passionate about high-impact engineering in the UK FinTech space.", "qa1")}>
                  {copiedKey === "qa1" ? "✓ Copied" : "Copy"}
                </Btn>
              </Row>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
                {qa.why_this_role || "Extensive experience solving large-scale architecture challenges with measurable UK impact."}
              </div>
            </div>
            <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: 12 }}>
              <Row justify="space-between" align="center" style={{ marginBottom: 4, gap: 8 }}>
                <strong style={{ fontSize: 12, color: T.text }}>2. &ldquo;Key achievement relevant to this role&rdquo;</strong>
                <Btn size="xs" variant="ghost" onClick={() => copyToClipboard(qa.key_achievement || "Delivered architecture overhaul resulting in 24% reliability gain and £400k savings.", "qa2")}>
                  {copiedKey === "qa2" ? "✓ Copied" : "Copy"}
                </Btn>
              </Row>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
                {qa.key_achievement || "Delivered architecture overhaul resulting in 24% reliability gain and £400k savings."}
              </div>
            </div>
            <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: 12 }}>
              <Row justify="space-between" align="center" style={{ marginBottom: 4, gap: 8 }}>
                <strong style={{ fontSize: 12, color: T.text }}>3. &ldquo;Notice period &amp; salary expectations&rdquo;</strong>
                <Btn size="xs" variant="ghost" onClick={() => copyToClipboard(qa.availability_salary || "1 month notice period. Expected salary £75,000 – £85,000 GBP.", "qa3")}>
                  {copiedKey === "qa3" ? "✓ Copied" : "Copy"}
                </Btn>
              </Row>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
                {qa.availability_salary || "1 month notice period. Target salary £75,000 – £85,000 GBP."}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Scores */}
      {activeTab === "scores" && (
        <Card style={{ padding: 14 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: T.text }}>4-Vector Fit Scoring</h4>
          {(scores.atsScore == null && scores.experienceScore == null && scores.readabilityScore == null && scores.constraintsScore == null) ? (
            <div style={{ textAlign: "center", padding: "28px 10px", color: T.muted, fontSize: 12 }}>
              Run Tailor & Verifier to generate fit analysis scores.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <ScoreBar label="ATS Keyword Match" score={scores.atsScore ?? 0} target={75} note="Terminology parity" />
              <ScoreBar label="Experience & Seniority" score={scores.experienceScore ?? 0} target={75} note="Scope match" />
              <ScoreBar label="UK Compliance & Structure" score={scores.readabilityScore ?? 0} target={80} note="A4 2-page fit" />
              <ScoreBar label="Constraints Alignment" score={scores.constraintsScore ?? 0} target={80} note="0 Hallucination" />
            </div>
          )}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
            <strong style={{ fontSize: 12, color: T.text }}>Strengths</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "6px 0 12px" }}>
              {(!gap.matches || gap.matches.length === 0) ? (
                <span style={{ fontSize: 12, color: T.muted }}>Matches will appear after analysis.</span>
              ) : (
                gap.matches.map((m, i) => <Tag key={i} label={`✓ ${m}`} color={T.green} />)
              )}
            </div>
            {gap.gaps?.length > 0 && (
              <div>
                <strong style={{ fontSize: 12, color: T.text }}>Gaps to address in interview</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {gap.gaps.map((g, i) => <Tag key={i} label={`⚠ ${g}`} color={T.yellow} />)}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
