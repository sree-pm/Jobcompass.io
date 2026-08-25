// Production storage: localStorage adapter with same API as Artifact's window.storage
// Swappable to Reactive Resume API via adapter below.

const LS_PREFIX = "agentic_cv_uk_";

export const store = {
  async get(k) {
    try {
      const raw = localStorage.getItem(LS_PREFIX + k);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  async set(k, v) {
    try { localStorage.setItem(LS_PREFIX + k, JSON.stringify(v)); } catch (e) {
      if (e.message?.includes("quota") || e.name === "QuotaExceededError") {
        throw new Error("Storage quota exceeded — remove old jobs");
      }
      throw e;
    }
  },
  async remove(k) {
    localStorage.removeItem(LS_PREFIX + k);
  }
};

// Reactive adapter (optional, when REACTIVE_API_URL is set)
export function createReactiveAdapter({ apiUrl, apiKey }) {
  const headers = apiKey ? { "x-api-key": apiKey, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  return {
    async listResumes() {
      const r = await fetch(`${apiUrl}/resumes`, { headers });
      if (!r.ok) throw new Error(`listResumes ${r.status}`);
      return r.json();
    },
    async patchResume(id, operations) {
      const r = await fetch(`${apiUrl}/resumes/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ operations })
      });
      if (!r.ok) throw new Error(`patchResume ${r.status}: ${await r.text()}`);
      return r.json();
    },
    async listApplications() {
      const r = await fetch(`${apiUrl}/applications`, { headers });
      if (!r.ok) throw new Error(`listApplications ${r.status}`);
      return r.json();
    }
  };
}
