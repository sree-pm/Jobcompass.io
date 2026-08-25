import React from "react";
import { T, STAGES, STAGE_COLOR } from "../common/Theme.js";
import { Row } from "../common/UiPrimitives.jsx";
import { JobCard } from "./JobCard.jsx";
import * as api from "../../lib/cloudflareApi.js";

const EMPTY_COPY = {
  Saved: { icon: "📥", title: "No saved jobs", desc: "Add a role or scrape from a URL to get started." },
  Tailored: { icon: "✨", title: "Nothing tailored yet", desc: "Tailor a saved job to create your first tailored CV." },
  Applied: { icon: "📨", title: "No applications sent", desc: "Jobs move here after you apply." },
  Interview: { icon: "🎤", title: "No interviews", desc: "Track upcoming interviews here." },
  Offer: { icon: "🎉", title: "No offers yet", desc: "Offers will appear here — keep going!" },
  Rejected: { icon: "↩", title: "No rejections", desc: "Rejections are tracked here for learning." },
  "Awaiting Response": { icon: "⏳", title: "Awaiting response", desc: "Follow-ups live here." },
};

function normalizeStage(raw) {
  const s = String(raw || "saved").toLowerCase();
  if (s === "awaiting_response" || s === "awaiting response") return "Tailored";
  // map any existing API values to UI stages
  const map = {
    saved: "Saved",
    tailored: "Tailored",
    applied: "Applied",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
  };
  return map[s] || "Saved";
}

function toApiStatus(stage) {
  // UI stage -> API status value
  const s = String(stage).toLowerCase();
  if (s === "tailored") return "tailored";
  if (s === "saved") return "saved";
  if (s === "applied") return "applied";
  if (s === "interview") return "interview";
  if (s === "offer") return "offer";
  if (s === "rejected") return "rejected";
  return s;
}

export function PipelineKanban({ jobs = [], selectedJobId, onSelectJob, onStatusChange }) {
  const [query, setQuery] = React.useState("");
  const [locFilter, setLocFilter] = React.useState("");
  const [dragId, setDragId] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);

  const locations = React.useMemo(() => {
    const set = new Set();
    jobs.forEach((j) => {
      if (j.location) set.add(String(j.location).trim());
    });
    return Array.from(set).slice(0, 12);
  }, [jobs]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      const matchesSearch =
        !q ||
        String(j.company || "").toLowerCase().includes(q) ||
        String(j.role || j.title || "").toLowerCase().includes(q);
      const matchesLoc = !locFilter || String(j.location || "").trim() === locFilter;
      return matchesSearch && matchesLoc;
    });
  }, [jobs, query, locFilter]);

  const jobsByStage = React.useMemo(() => {
    const acc = STAGES.reduce((a, s) => ({ ...a, [s]: [] }), {});
    filtered.forEach((j) => {
      const stage = normalizeStage(j.status);
      if (!acc[stage]) acc[stage] = [];
      acc[stage].push(j);
    });
    return acc;
  }, [filtered]);

  const totalCount = jobs.length;
  const filteredCount = filtered.length;

  async function handleDrop(e, stage) {
    e.preventDefault();
    setDragOver(null);
    const jobId = e.dataTransfer.getData("text/plain") || dragId;
    if (!jobId) return;
    const job = jobs.find((j) => String(j.id) === String(jobId));
    if (!job) return;
    const currentNorm = normalizeStage(job.status);
    if (currentNorm === stage) return;
    const apiStatus = toApiStatus(stage);
    try {
      await api.updateApplication(job.id, { status: apiStatus });
    } catch (err) {
      // fallback: allow tailored to be applied if API rejects, try applied
      if (String(apiStatus) === "tailored") {
        try { await api.updateApplication(job.id, { status: "applied" }); } catch {}
      }
      // surface quietly
      // eslint-disable-next-line no-console
      console.warn("status change failed", err);
    } finally {
      setDragId(null);
      if (typeof onStatusChange === "function") onStatusChange(job.id, apiStatus);
    }
  }

  return (
    <div style={{ padding: "12px 0 20px" }}>
      {/* Filters */}
      <div
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "10px 12px",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 360 }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: T.hint,
              fontSize: 13,
            }}
          >
            ⌕
          </span>
          <input
            aria-label="Search by company or role"
            placeholder="Search by company or role…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px 8px 30px",
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: T.bg,
              color: T.text,
              fontSize: 13,
              fontFamily: T.sans,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", flex: "1 1 260px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.04em", textTransform: "uppercase", marginRight: 2 }}>
            Location
          </span>
          <button
            onClick={() => setLocFilter("")}
            aria-pressed={locFilter === ""}
            style={{
              padding: "4px 10px",
              borderRadius: 20,
              border: `1px solid ${locFilter === "" ? T.blue : T.border}`,
              background: locFilter === "" ? T.blue : T.card,
              color: locFilter === "" ? "#fff" : T.muted,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            All
          </button>
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocFilter((prev) => (prev === loc ? "" : loc))}
              aria-pressed={locFilter === loc}
              title={loc}
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                border: `1px solid ${locFilter === loc ? T.blue : T.border}`,
                background: locFilter === loc ? T.blueLight : T.card,
                color: locFilter === loc ? T.blue : T.text,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                maxWidth: 140,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {loc}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: T.muted, fontFamily: T.mono }}>
            {filteredCount} / {totalCount}
          </span>
          {(query || locFilter) && (
            <button
              onClick={() => {
                setQuery("");
                setLocFilter("");
              }}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.blue,
                background: T.blueLight,
                border: `1px solid ${T.blueMid}`,
                padding: "4px 8px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Kanban columns */}
      <div
        role="region"
        aria-label="Job pipeline kanban"
        style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}
      >
        <div style={{ display: "flex", gap: 16, minWidth: 1080, alignItems: "flex-start" }}>
          {STAGES.map((stage) => {
            const list = jobsByStage[stage] || [];
            const empty = EMPTY_COPY[stage] || { icon: "📄", title: "No jobs", desc: "Jobs in this stage will appear here." };
            const isOver = dragOver === stage;
            return (
              <section
                key={stage}
                aria-label={`${stage} column`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(stage);
                }}
                onDragLeave={() => setDragOver((prev) => (prev === stage ? null : prev))}
                onDrop={(e) => handleDrop(e, stage)}
                style={{
                  flex: 1,
                  minWidth: 176,
                  maxWidth: 220,
                  background: isOver ? T.blueLight : T.surface,
                  borderRadius: 10,
                  border: `1px solid ${isOver ? T.blueMid : T.border}`,
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "calc(100vh - 210px)",
                  minHeight: 260,
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <header
                  style={{
                    padding: "10px 12px",
                    borderBottom: `1px solid ${T.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "sticky",
                    top: 0,
                    background: isOver ? T.blueLight : T.surface,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    zIndex: 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                    <span
                      aria-hidden
                      style={{ width: 8, height: 8, borderRadius: "50%", background: STAGE_COLOR[stage] || T.blue, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 800, color: T.text, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
                      {stage}
                    </span>
                  </div>
                  <span
                    aria-label={`${list.length} jobs in ${stage}`}
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: list.length ? T.text : T.muted,
                      background: list.length ? T.card : "transparent",
                      border: `1px solid ${list.length ? T.border : "transparent"}`,
                      padding: "1px 7px",
                      borderRadius: 10,
                      minWidth: 22,
                      textAlign: "center",
                    }}
                  >
                    {list.length}
                  </span>
                </header>

                <div role="list" aria-label={`${stage} jobs`} style={{ padding: 8, overflowY: "auto", flex: 1, minHeight: 120 }}>
                  {list.length === 0 ? (
                    <div
                      role="status"
                      aria-live="polite"
                      style={{
                        textAlign: "center",
                        padding: "22px 10px",
                        border: `1px dashed ${T.borderStrong}`,
                        borderRadius: 8,
                        background: T.card,
                        marginTop: 4,
                      }}
                    >
                      <div aria-hidden style={{ fontSize: 20, marginBottom: 6 }}>
                        {empty.icon}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>{empty.title}</div>
                      <div style={{ fontSize: 11, color: T.hint, lineHeight: 1.4 }}>{empty.desc}</div>
                    </div>
                  ) : (
                    list.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSelected={selectedJobId === job.id}
                        onClick={() => onSelectJob?.(job)}
                        draggable
                        onDragStart={(e) => {
                          setDragId(String(job.id));
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", String(job.id));
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setDragOver(null);
                        }}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
