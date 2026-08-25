// Cloudflare API client — D1-backed resumes/applications + agentic tailor/verifier
// Replaces window.storage mock for production.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8789";

export async function req(path, options = {}) {
  const token = localStorage.getItem("agentic_cv_uk_token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let err = `API Error: ${res.status}`;
    try {
      const data = await res.json();
      err = data.error || err;
    } catch {}
    throw new Error(err);
  }
  return res.json();
}

// --- Auth ---
export async function requestCode(email) {
  return req("/auth/request-code", { method: "POST", body: JSON.stringify({ email }) });
}
export async function verifyCode(email, code) {
  return req("/auth/verify-code", { method: "POST", body: JSON.stringify({ email, code }) });
}
export async function getMe() {
  return req("/auth/me");
}


// Candidates
export async function createCandidate(profile) {
  return req("/candidates", { method: "POST", body: JSON.stringify(profile) });
}
export async function getCandidate(id) { return req(`/candidates/${id}`); }
export async function updateCandidate(id, data) {
  return req(`/candidates/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function saveConstraints(candidateId, { content, didList, didNotList }) {
  return req(`/candidates/${candidateId}/constraints`, { method: "PUT", body: JSON.stringify({ content, didList, didNotList }) });
}
export async function getConstraints(candidateId) { return req(`/candidates/${candidateId}/constraints`); }

// Resumes
export async function parseCvText(cvText, candidateProfile) {
  return req("/resumes/parse-cv", { method: "POST", body: JSON.stringify({ cvText, candidateProfile }) });
}
export async function listResumes(candidateId) { return req(`/resumes?candidateId=${candidateId}`); }
export async function createResume(candidateId, data, title) { return req("/resumes", { method: "POST", body: JSON.stringify({ candidateId, data, title }) }); }
export async function getResume(id) { return req(`/resumes/${id}`); }
export async function patchResume(id, operations, opts = {}) {
  return req(`/resumes/${id}`, { method: "PATCH", body: JSON.stringify({ operations, ...opts }) });
}
export async function tailorResumeApi(masterId, { jobDescription, constraintsDoc, applicationId, company, targetRole, fieldLocks }) {
  return req(`/resumes/${masterId}/tailor`, { method: "POST", body: JSON.stringify({ jobDescription, constraintsDoc, applicationId, company, targetRole, fieldLocks }) });
}
export async function putFieldLocks(resumeId, locks) {
  return req(`/resumes/${resumeId}/locks`, { method: "PUT", body: JSON.stringify({ locks }) });
}

// Applications
export async function listApplications(candidateId) { return req(`/applications?candidateId=${candidateId}`); }
export async function createApplication(data) { return req("/applications", { method: "POST", body: JSON.stringify(data) }); }
export async function updateApplication(id, data) { return req(`/applications/${id}`, { method: "PUT", body: JSON.stringify(data) }); }
export async function deleteApplication(id) { return req(`/applications/${id}`, { method: "DELETE" }); }
export async function generatePdf(applicationId) { return req(`/applications/${applicationId}/pdf`, { method: "POST" }); }
export async function getInterviewPrep(applicationId) {
  return req(`/applications/${applicationId}/interview-prep`, { method: "POST" });
}

// Ingest
export async function ingestSearch(candidateId, query, location) {
  return req("/ingest/search", { method: "POST", body: JSON.stringify({ candidateId, query, location }) });
}
export async function ingestExtract({ url, text }) {
  return req("/ingest/extract", { method: "POST", body: JSON.stringify({ url, text }) });
}

// Health
export async function health() { return req("/health"); }

// Billing & Credits
export async function getCreditBalance(candidateId) {
  return req(`/billing/balance?candidateId=${candidateId}`);
}
export async function getCreditPacks() {
  return req("/billing/packs");
}
export async function createCheckoutSession(candidateId, packId) {
  return req("/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ candidateId, packId, successUrl: window.location.origin, cancelUrl: window.location.origin }),
  });
}
