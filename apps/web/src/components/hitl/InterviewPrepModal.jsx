import React, { useState, useEffect } from "react";
import { T } from "../common/Theme.js";
import { Modal, Row, Btn, Tag, Card } from "../common/UiPrimitives.jsx";
import { getInterviewPrep } from "../../lib/cloudflareApi.js";

export function InterviewPrepModal({ job, onClose }) {
  const [prep, setPrep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    async function loadPrep() {
      setLoading(true);
      try {
        const res = await getInterviewPrep(job.id);
        setPrep(res);
      } catch (e) {
        console.error("Failed to load prep", e);
      } finally {
        setLoading(false);
      }
    }
    if (job?.id) loadPrep();
  }, [job]);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <Modal title={`🎯 Interview Preparation & Follow-Up — ${job.company}`} onClose={onClose} maxWidth={680}>
      {loading ? (
        <div style={{ textAlign: "center", padding: 30, color: T.muted }}>
          Generating 5 tailored STAR questions & model answers...
        </div>
      ) : prep ? (
        <div>
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.blue }}>ROLE: {prep.role} @ {prep.company}</span>
            <div style={{ fontSize: 11, color: T.muted }}>Tailored model answers based on your ground-truth constraints doc.</div>
          </div>

          {/* STAR Questions */}
          <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {prep.starQuestions.map((q, i) => (
              <Card key={i} style={{ padding: 12, background: T.bg }}>
                <Row justify="space-between" align="center" style={{ marginBottom: 4 }}>
                  <Tag label={q.category} color={T.indigo} />
                  <span style={{ fontSize: 10, color: T.muted }}>STAR Framework</span>
                </Row>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: "4px 0 8px" }}>
                  {i + 1}. {q.question}
                </div>
                <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, background: T.card, padding: 8, borderRadius: 6 }}>
                  <div><strong>Situation & Task:</strong> {q.modelAnswer.situation} {q.modelAnswer.task}</div>
                  <div style={{ marginTop: 3 }}><strong>Action:</strong> {q.modelAnswer.action}</div>
                  <div style={{ marginTop: 3, color: T.green }}><strong>Result:</strong> {q.modelAnswer.result}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* 7-Day Follow-Up Email */}
          <Card style={{ padding: 12, border: `1px solid ${T.blueMid}`, background: "#FFFBF8" }}>
            <Row justify="space-between" align="center" style={{ marginBottom: 6 }}>
              <div>
                <strong style={{ fontSize: 12, color: T.text }}>📅 7-Day Post-Application Check-In Email</strong>
                <div style={{ fontSize: 10, color: T.muted }}>Send if no recruiter response after 7 working days</div>
              </div>
              <Btn size="xs" variant="outline" onClick={() => copy(prep.followUpEmail.body, "email")}>
                {copiedKey === "email" ? "✓ Copied!" : "📋 Copy Email Template"}
              </Btn>
            </Row>
            <div style={{ fontSize: 11, color: T.text, whiteSpace: "pre-wrap", lineHeight: 1.5, background: T.card, padding: 8, borderRadius: 4 }}>
              <strong>Subject:</strong> {prep.followUpEmail.subject}
              {"\n\n"}{prep.followUpEmail.body}
            </div>
          </Card>
        </div>
      ) : null}
    </Modal>
  );
}
