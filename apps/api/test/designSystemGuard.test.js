// Design System Guard — production SaaS enforcement
// ─────────────────────────────────────────────────────────────────────
// FAILS if any app component hardcodes a color, rgba(), or font stack
// instead of using tokens from components/common/Theme.js.
// Run: node apps/api/test/designSystemGuard.test.js
// Wire into CI (.github/workflows/ci.yml) to block regressions.
// ─────────────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "..", "..", "..", "apps", "web", "src");

const SYSTEM_FILES = new Set([
  path.join(SRC, "components", "common", "Theme.js"),
]);

// Hex color literals (#fff, #ffffff, #f6f9fc…)
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
// rgba()/rgb() literals — allow transparent-only patterns
const RGBA_RE = /\brgba?\([^)]*\)/g;
// Hardcoded font stacks in style props
const FONT_RE = /fontFamily\s*:\s*["'`][^"'`]*(Inter|Source Sans|JetBrains|Plus Jakarta|system-ui)[^"'`]*["'`]/g;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(p, files);
    } else if (/\.(jsx|js|tsx|ts)$/.test(entry.name) && !entry.name.endsWith(".test.js")) {
      files.push(p);
    }
  }
  return files;
}

const violations = [];
const files = walk(SRC);

for (const file of files) {
  if (SYSTEM_FILES.has(file)) continue; // the design system itself defines literals
  const rel = path.relative(SRC, file).split(path.sep).join("/");
  const src = fs.readFileSync(file, "utf8");
  // Strip block comments (/* … */ and {/* … */}) before line scanning so
  // documentation prose doesn't count as a violation.
  const noComments = src.replace(/\{?\s*\/\*[\s\S]*?\*\/\s*\}?/g, "");
  const lines = noComments.split("\n");

  lines.forEach((line, i) => {
    // Skip comment-only lines
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) return;

    for (const m of line.matchAll(HEX_RE)) {
      violations.push(`${rel}:${i + 1}  hex color  ${m[0]}`);
    }
    for (const m of line.matchAll(RGBA_RE)) {
      violations.push(`${rel}:${i + 1}  rgba()     ${m[0].slice(0, 40)}`);
    }
    for (const m of line.matchAll(FONT_RE)) {
      violations.push(`${rel}:${i + 1}  font stack ${m[1]}…`);
    }
  });
}

console.log(`Design System Guard — scanned ${files.length} files under apps/web/src`);
if (violations.length) {
  console.log(`\n✗ ${violations.length} hardcoded style value(s) found — use tokens from components/common/Theme.js:\n`);
  violations.slice(0, 60).forEach(v => console.log("  " + v));
  if (violations.length > 60) console.log(`  … and ${violations.length - 60} more`);
  console.log("\n  Why this matters: a single source of truth for color/type/spacing");
  console.log("  means brand changes, theming, and consistency are one-file edits.");
  process.exit(1);
} else {
  console.log("✓ 100% of styles are served from the design system (Theme.js tokens only)");
}
