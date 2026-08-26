import React from "react";
import { T, STAGES, STAGE_COLOR } from "../common/Theme.js";
import { JobCard } from "./JobCard.jsx";
import * as api from "../../lib/cloudflareApi.js";

const EMPTY_COPY = {
  Saved: { title: "No saved jobs", desc: "Add a role or scrape from a URL to get started." },
  Tailored: { title: "Nothing tailored yet", desc: "Tailor a saved job to create your first tailored CV." },
  Applied: { title: "No applications sent", desc: "Jobs move here after you apply." },
  Interview: { title: "No interviews", desc: "Track upcoming interviews here." },
  Offer: { title: "No offers yet", desc: "Offers will appear here — keep going!" },
  Rejected: { title: "No rejections", desc: "Rejections are tracked here for learning." },
};

function normalizeStage(raw) {
  const s = String(raw || "saved").toLowerCase();
  if (s === "awaiting_response" || s === "awaiting response") return "Tailored";
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
  return String(stage).toLowerCase();
}

export function PipelineKanban({ jobs = [], selectedJobId, onSelectJob, onStatusChange }) {
  const [query, setQuery] = React.useState("");
  const [locFilter, setLocFilter] = React.useState("");
  const [dragId, setDragId] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const searchRef = React.useRef(null);

  // ⌘K focus
  React.useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
      // eslint-disable-next-line no-console
      console.warn("status change failed", err);
    } finally {
      setDragId(null);
      if (typeof onStatusChange === "function") onStatusChange(job.id, apiStatus);
    }
  }

  return (
    <div style={{ padding: "14px 0 20px" }}>
      {/* Header row: Pipeline 22px #061b31 w600 + count + search 320x36 6px #e5edf5 focus #533afd ⌘K + location pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {/* left: title + result count */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexShrink: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 600,
              color: T.ink,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              fontFamily: T.sans,
            }}
          >
            Pipeline
          </h2>
          <span
            aria-label={`${filteredCount} results`}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: T.slate,
              fontFamily: T.sans,
            }}
          >
            {query || locFilter ? `${filteredCount} of ${totalCount}` : `${totalCount} ${totalCount === 1 ? "job" : "jobs"}`}
          </span>
        </div>

        {/* right: search + pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flex: 1, justifyContent: "flex-end", minWidth: 280 }}>
          {/* search input 320px 36px 6px #e5edf5 focus #533afd ⌘K hint */}
          <div style={{ position: "relative", width: 320, maxWidth: "100%", flexShrink: 0 }}>
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: T.hint,
                fontSize: 13,
                pointerEvents: "none",
                lineHeight: 1,
              }}
            >
              ⌕
            </span>
            <input
              ref={searchRef}
              aria-label="Search by company or role"
              placeholder="Search company or role"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: "100%",
                height: 36,
                padding: "0 44px 0 30px",
                borderRadius: 6,
                border: `1px solid ${searchFocused ? T.violet : T.border}`,
                background: T.card,
                color: T.ink,
                fontSize: 13,
                fontFamily: T.sans,
                outline: "none",
                boxSizing: "border-box",
                boxShadow: searchFocused ? `0 0 0 3px ${T.violet}20` : "none",
                transition: "border-color 150ms, box-shadow 150ms",
              }}
            />
            <span
              aria-hidden
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                background: T.pillBg,
                border: `1px solid ${T.border}`,
                borderRadius: 5,
                padding: "2px 6px",
                fontSize: 11,
                fontWeight: 600,
                color: T.slate,
                fontFamily: T.mono,
                lineHeight: 1,
                pointerEvents: "none",
              }}
            >
              ⌘K
            </span>
          </div>

          {/* location pills: 6px pill? spec 6px pill radius, #f6f9fc → #533afd active */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => setLocFilter("")}
              aria-pressed={locFilter === ""}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${locFilter === "" ? T.violet : T.border}`,
                background: locFilter === "" ? T.violet : T.pillBg,
                color: locFilter === "" ? T.onColor : T.slate,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                lineHeight: 1,
                transition: "all 150ms",
                fontFamily: T.sans,
              }}
            >
              All
            </button>
            {locations.map((loc) => {
              const active = locFilter === loc;
              return (
                <button
                  key={loc}
                  onClick={() => setLocFilter((prev) => (prev === loc ? "" : loc))}
                  aria-pressed={active}
                  title={loc}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1px solid ${active ? T.violet : T.border}`,
                    background: active ? T.violet : T.pillBg,
                    color: active ? T.onColor : T.slate,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    maxWidth: 160,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                    transition: "all 150ms",
                    fontFamily: T.sans,
                  }}
                >
                  {loc}
                </button>
              );
            })}
            {(query || locFilter) && (
              <button
                onClick={() => {
                  setQuery("");
                  setLocFilter("");
                }}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.violet,
                  background: T.violetLight,
                  border: `1px solid ${T.violetMid}`,
                  padding: "6px 10px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: T.sans,
                  lineHeight: 1,
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban columns: Linear 280px fixed 12px gap */}
      <div role="region" aria-label="Job pipeline kanban" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 8 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: "max-content" }}>
          {STAGES.map((stage) => {
            const list = jobsByStage[stage] || [];
            const empty = EMPTY_COPY[stage] || { title: "No jobs", desc: "Jobs in this stage will appear here." };
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
                  width: 280,
                  minWidth: 280,
                  maxWidth: 280,
                  flex: "0 0 280px",
                  background: isOver ? T.violetLight : T.surface,
                  borderRadius: 10,
                  border: `1px solid ${isOver ? T.violetMid : T.border}`,
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "calc(100vh - 180px)",
                  minHeight: 360,
                  transition: "background 150ms, border-color 150ms",
                }}
              >
                {/* column header 13px Inter 510 #64748d + count badge #f6f9fc + dot STAGE_COLOR */}
                <header
                  style={{
                    padding: "12px 12px 10px",
                    borderBottom: `1px solid ${T.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "sticky",
                    top: 0,
                    background: isOver ? T.violetLight : T.surface,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    zIndex: 1,
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                    <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: STAGE_COLOR[stage] || T.violet, flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 510,
                        color: T.slate,
                        fontFamily: T.inter,
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stage}
                    </span>
                  </div>
                  <span
                    aria-label={`${list.length} jobs in ${stage}`}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.slate,
                      background: T.pillBg,
                      border: `1px solid ${T.border}`,
                      padding: "2px 7px",
                      borderRadius: 6,
                      minWidth: 22,
                      textAlign: "center",
                      fontFamily: T.mono,
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1.2,
                    }}
                  >
                    {list.length}
                  </span>
                </header>

                {/* column body 8px gap */}
                <div
                  role="list"
                  aria-label={`${stage} jobs`}
                  style={{
                    padding: 8,
                    overflowY: "auto",
                    flex: 1,
                    minHeight: 200,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {list.length === 0 ? (
                    <div
                      role="status"
                      aria-live="polite"
                      style={{
                        textAlign: "center",
                        padding: "28px 12px 18px",
                        border: `1px dashed ${T.borderStrong}`,
                        borderRadius: 8,
                        background: T.card,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {/* empty illustration */}
                      <div
                        aria-hidden
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: T.pillBg,
                          border: `1px solid ${T.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          color: T.hint,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ opacity: 0.9 }}>◇</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{empty.title}</div>
                      <div style={{ fontSize: 11, color: T.hint, lineHeight: 1.4, maxWidth: 180 }}>{empty.desc}</div>
                      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: T.slate, background: T.pillBg, border: `1px solid ${T.border}`, padding: "4px 10px", borderRadius: 999 }}>
                        Drop here
                      </div>
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
