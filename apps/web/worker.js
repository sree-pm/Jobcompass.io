// jobcompass-web front worker — intelligent 404 handling.
// Known SPA routes (/app/*, /auth) fall back to index.html (client router owns them).
// Everything else: let the static asset layer decide — real 404.html for unknown paths.
const SPA_PREFIXES = ["/app", "/auth"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    // Static assets (files with extensions) — serve directly.
    if (/\.[a-zA-Z0-9]+$/.test(path)) return env.ASSETS.fetch(request);

    // Known SPA client routes → index.html (client router renders).
    if (SPA_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }

    // Marketing routes exist as SPA routes too — serve index.html for the
    // canonical marketing paths (and any /blog/:slug style deep link).
    const KNOWN = new Set([
      "/", "/how-it-works", "/pricing", "/uk-advantage", "/security",
      "/jobs", "/companies", "/docs", "/blog", "/changelog", "/status",
      "/privacy", "/terms", "/cookies", "/gdpr", "/refunds", "/about", "/contact",
    ]);
    if (KNOWN.has(path) || path.startsWith("/blog/") || path.startsWith("/jobs/")) {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }

    // Unknown → real 404 (not_found_handling = "404-page" serves dist/404.html).
    return env.ASSETS.fetch(request);
  },
};
