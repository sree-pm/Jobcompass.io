// PDF generation + R2 storage
// For Cloudflare Workers: use @react-pdf/renderer compatible shim or call external pdf service.
// Here we provide two modes:
// 1. Local/Node: direct @react-pdf/renderer
// 2. Workers: queue to PDF service or use Workers-compatible html-to-pdf (e.g. via Cloudflare Browser Rendering / external)
// For now we generate a simple A4 HTML and store as artifact; Worker renders via Browser Rendering API if available.

export async function storePdf(bucket: R2Bucket, key: string, content: string | ArrayBuffer, contentType = "application/pdf") {
  await bucket.put(key, content as any, { httpMetadata: { contentType } });
  return key;
}

export async function getPdf(bucket: R2Bucket, key: string) {
  const obj = await bucket.get(key);
  if (!obj) return null;
  return { body: await obj.arrayBuffer(), contentType: obj.httpMetadata?.contentType || "application/pdf" };
}

// Minimal A4 HTML → PDF via Cloudflare Browser Rendering (if binding present)
// Fallback: store HTML and let client print to PDF
function esc(s: string) { return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

// Generate PDF buffer via Cloudflare Browser Rendering, with HTML fallback.
// If env.BROWSER exists (Browser Rendering binding), launches @cloudflare/puppeteer
// to produce an A4 PDF. Otherwise returns the HTML as UTF-8 bytes so callers can
// store it as text/html and let the client print to PDF.
export async function generatePdfBuffer(html: string, env: any): Promise<{ buffer: Uint8Array | ArrayBuffer; contentType: string; ext: string }> {
  const browserBinding = env?.BROWSER;
  if (browserBinding) {
    try {
      // @ts-ignore - optional peer dep, only available when browser binding is configured
      const puppeteer = await import("@cloudflare/puppeteer");
      const browser = await (puppeteer as any).launch(browserBinding);
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdf: Uint8Array = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "16mm", bottom: "16mm", left: "18mm", right: "18mm" },
      });
      await browser.close();
      return { buffer: pdf, contentType: "application/pdf", ext: "pdf" };
    } catch (err) {
      console.warn("[generatePdfBuffer] Browser Rendering failed, falling back to HTML:", err);
      // fall through to HTML fallback
    }
  }
  // HTML fallback — caller should store as text/html
  const encoded = new TextEncoder().encode(html);
  return { buffer: encoded, contentType: "text/html", ext: "html" };
}

export function renderCvHtml(data: any): string {
  const basics = data.basics || {};
  const summary = data.summary?.content || "";
  const exp = data.sections?.experience?.items || [];
  const edu = data.sections?.education?.items || [];
  const skills = data.sections?.skills?.items || [];

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<title>${esc(basics.name || "Curriculum Vitae")}</title>
<style>
@page { size: A4; margin: 16mm 18mm; }
body {
  font-family: 'Calibri', 'Arial', sans-serif;
  font-size: 10pt;
  color: #1a1a1a;
  line-height: 1.45;
  max-width: 210mm;
  margin: 0 auto;
}
h1 { font-size: 18pt; margin: 0 0 4px; color: #111827; font-weight: 700; letter-spacing: -0.01em; }
h2 {
  font-size: 11pt;
  color: #1e3a5f;
  border-bottom: 1.5px solid #1e3a5f;
  padding-bottom: 2px;
  margin: 12px 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}
.meta-header { color: #4b5563; font-size: 9pt; margin-bottom: 8px; }
.meta-right-to-work { color: #15803d; font-size: 8.5pt; font-weight: 600; margin-top: 2px; }
.job-header { display: flex; justify-content: space-between; margin-bottom: 2px; }
.job-title { font-weight: 700; color: #111827; }
.job-date { color: #4b5563; font-size: 9pt; }
.bullet-list { margin: 3px 0 6px 16px; padding: 0; }
.bullet-item { margin: 2px 0; }
.skills-text { margin: 0; }
@media print { body { margin: 0; } }
</style>
</head>
<body>
  <div>
    <h1>${esc(basics.name || "")}</h1>
    <div class="meta-header">
      ${esc(basics.email || "")} · ${esc(basics.phone || "+44")} · ${esc(basics.location || "London, UK")}
      ${basics.website ? `· ${esc(basics.website)}` : ""}
      ${basics.rightToWork ? `<div class="meta-right-to-work">Right to Work: ${esc(basics.rightToWork)}</div>` : ""}
    </div>
  </div>

  ${summary ? `<h2>Personal Profile</h2><p style="margin:0 0 6px;">${esc(summary)}</p>` : ""}
  
  ${skills.length ? `<h2>Core Competencies</h2><p class="skills-text">${esc(Array.isArray(skills) ? skills.join(" · ") : skills)}</p>` : ""}

  ${exp.length ? `<h2>Professional Experience</h2>${exp.map((e: any) => `
    <div style="margin-bottom:8px;">
      <div class="job-header">
        <span class="job-title">${esc(e.title || "")} — ${esc(e.company || "")}</span>
        <span class="job-date">${esc(e.date || e.dates || "")}</span>
      </div>
      ${Array.isArray(e.description) ? `
        <ul class="bullet-list">
          ${e.description.map((b: string) => `<li class="bullet-item">${esc(b)}</li>`).join("")}
        </ul>
      ` : `<p style="margin:2px 0;">${esc(e.description || "")}</p>`}
    </div>`).join("")}` : ""}

  ${edu.length ? `<h2>Education & Credentials</h2>${edu.map((e: any) => `
    <div style="margin-bottom:4px;" class="job-header">
      <span class="job-title">${esc(e.degree || e.title || "")} — ${esc(e.institution || e.company || "")}</span>
      <span class="job-date">${esc(e.date || "")}</span>
    </div>`).join("")}` : ""}
</body>
</html>`;
}

export function renderCoverLetterHtml(letter: string, basics: any, company: string, role: string): string {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><style>@page{size:A4;margin:20mm}body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.6;color:#1a1a1a;max-width:210mm}</style></head><body>
<div style="text-align:right;font-size:9pt;color:#555">${esc(basics.name || "")} · ${esc(basics.email || "")} · ${esc(basics.phone || "")}<br>${esc(basics.location || "")}<br>${date}</div>
<p>Hiring Manager<br>${esc(company)}<br></p>
<p>Dear Hiring Manager,</p>
<p><strong>Re: ${esc(role)}</strong></p>
<div style="white-space:pre-wrap">${esc(letter)}</div>
<p>Yours sincerely,<br>${esc(basics.name || "")}</p>
</body></html>`;
}
