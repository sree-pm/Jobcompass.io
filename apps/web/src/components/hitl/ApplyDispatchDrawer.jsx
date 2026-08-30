import React, { useState } from "react";
import { T } from "../common/Theme.js";
import { Row, Btn, Card } from "../common/UiPrimitives.jsx";
import { generatePdf } from "../../lib/cloudflareApi.js";
import { useToast } from "../common/Toast.jsx";

export function ApplyDispatchDrawer({ job, candidate, tailorResult, onClose, onAppliedSuccess }) {
  const [copiedField, setCopiedField] = useState("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const toast = useToast();

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiedField(label);
    toast?.success(`Copied ${label}`);
    setTimeout(() => setCopiedField(""), 1800);
  };

  const downloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await generatePdf(job.id);
      if (res.htmlPreview) {
        const w = window.open("", "_blank");
        if (w) {
          w.document.write(res.htmlPreview);
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
      toast?.success(`PDF opened — ${res.key || "stored to R2"}`);
    } catch (e) {
      toast?.error("PDF failed: " + e.message);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const coverLetter = tailorResult?.coverLetter || tailorResult?.dossier?.coverLetter || "";
  const qa = tailorResult?.screeningAnswers || tailorResult?.dossier?.screeningAnswers || {};

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: T.overlay,
          backdropFilter: "blur(2px)",
          zIndex: 1000,
        }}
      />
      {/* sheet */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          maxWidth: "100vw",
          background: T.card,
          borderLeft: `1px solid ${T.border}`,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          boxShadow: T.shadowFloat,
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          fontFamily: T.sans,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            background: T.stripeBg,
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.textStrong }}>1-Click Apply Dispatch Helper</div>
            <div style={{ fontSize: 11, color: T.muted }}>Sequential clipboard helper for {job.company} portal</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 18,
              color: T.muted,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 18, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: 14, background: T.card }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: T.textStrong }}>1. Candidate Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Btn size="xs" variant="ghost" onClick={() => copy(candidate.full_name || candidate.fullName || "", "name")}>
                {copiedField === "name" ? "✓ Name Copied" : "Copy Name"}
              </Btn>
              <Btn size="xs" variant="ghost" onClick={() => copy(candidate.email || "", "email")}>
                {copiedField === "email" ? "✓ Email Copied" : "Copy Email"}
              </Btn>
              <Btn size="xs" variant="ghost" onClick={() => copy(candidate.phone || candidate.phone_number || "", "phone")}>
                {copiedField === "phone" ? "✓ Phone Copied" : candidate.phone || candidate.phone_number ? "Copy Phone" : "No phone saved"}
              </Btn>
              <Btn size="xs" variant="ghost" onClick={() => copy(candidate.right_to_work || "British Citizen", "rtw")}>
                {copiedField === "rtw" ? "✓ RTW Copied" : "Copy Right to Work"}
              </Btn>
            </div>
          </Card>

          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: T.textStrong }}>2. Tailored A4 Resume</div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>British English · money in pounds · nothing made up</div>
            <Btn size="sm" variant="success" onClick={downloadPdf} disabled={isDownloadingPdf} style={{ width: "100%" }}>
              {isDownloadingPdf ? "Opening PDF…" : "Open Verified A4 PDF"}
            </Btn>
          </Card>

          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: T.textStrong }}>3. Understated UK Cover Letter</div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>300–340 words tailored to {job.company}</div>
            <Btn size="sm" variant="outline" onClick={() => copy(coverLetter, "cover")} style={{ width: "100%" }}>
              {copiedField === "cover" ? "✓ Cover Letter Copied!" : "Copy Complete Cover Letter"}
            </Btn>
          </Card>

          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: T.textStrong }}>4. ATS Screening Answers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn size="xs" variant="ghost" onClick={() => copy(qa.why_this_role || "Proven record of delivery in UK tech.", "qa1")}>
                {copiedField === "qa1" ? "✓ Copied" : `Copy: “Why ${job.company}?”`}
              </Btn>
              <Btn size="xs" variant="ghost" onClick={() => copy(qa.key_achievement || "Delivered architecture overhaul with 24% gain.", "qa2")}>
                {copiedField === "qa2" ? "✓ Copied" : "Copy: Key Project Achievement"}
              </Btn>
              <Btn size="xs" variant="ghost" onClick={() => copy(qa.availability_salary || "1 month notice, target salary in GBP.", "qa3")}>
                {copiedField === "qa3" ? "✓ Copied" : "Copy: Salary & Notice"}
              </Btn>
            </div>
          </Card>
        </div>

        <div
          style={{
            padding: 16,
            background: T.stripeBg,
            borderTop: `1px solid ${T.border}`,
            position: "sticky",
            bottom: 0,
          }}
        >
          <Btn variant="indigo" size="md" onClick={onAppliedSuccess} style={{ width: "100%", background: T.indigo, borderColor: T.indigo }}>
            I’ve applied on the company’s site
          </Btn>
        </div>
      </div>
    </>
  );
}
