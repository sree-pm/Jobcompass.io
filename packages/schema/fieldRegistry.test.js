import { buildFieldRegistry, validatePatchOperations, applyUserLocks, checkBritishSpelling } from "./fieldRegistry.js";

function assert(cond, msg) { if (!cond) throw new Error(msg); }

const sample = {
  basics: { name: "Aisha Khan", email: "a@ex.com", phone: "+44", location: "London" },
  summary: { content: "summary" },
  sections: {
    experience: { items: [
      { company: "Acme", title: "PM", date: "01/2022 - Present", description: ["Led X by 10% (£1M)", "Shipped Y"] },
      { company: "Beta", title: "APM", date: "01/2020 - 12/2021", description: "Did Z" }
    ]},
    skills: { items: ["SQL", "Roadmapping"] },
    education: { items: [{ degree: "BSc", institution: "UCL" }] },
    certifications: { items: [{ name: "AWS" }] },
    projects: { items: [{ description: "Proj 1" }] }
  },
  customSections: [{ type: "cover-letter", name: "Cover Letter", items: [] }],
  picture: "url",
  metadata: { page: { format: "a4" } }
};

console.log("Test 1: registry builds per-bullet");
const reg = buildFieldRegistry(sample);
assert(reg.some(f => f.id === "exp.0.bullet.0" && f.editable), "bullet 0 should be editable");
assert(reg.some(f => f.id === "exp.0.bullet.1"), "bullet 1 exists");
assert(reg.find(f => f.id === "basics.name")?.editable === false, "basics.name locked");
assert(reg.find(f => f.id === "education.0")?.editable === false, "education locked");
console.log(" ✓ registry");

console.log("Test 2: validatePatchOperations blocks forbidden");
let errs = validatePatchOperations([{ op: "replace", path: "/basics/name", value: "Hacked" }], reg);
assert(errs.length > 0 && errs[0].includes("Forbidden"), "should block basics/name " + JSON.stringify(errs));
errs = validatePatchOperations([{ op: "replace", path: "/summary/content", value: "I am a team player" }], reg);
assert(errs.some(e => e.includes("Banned phrase")), "should block banned phrase");
console.log(" ✓ forbidden / banned");

console.log("Test 3: British spelling");
errs = validatePatchOperations([{ op: "replace", path: "/summary/content", value: "I optimize systems" }], reg);
assert(errs.some(e => e.includes("British spelling")), "should flag optimize");
assert(checkBritishSpelling("organization").length > 0, "us->gb");
console.log(" ✓ british spelling");

console.log("Test 4: applyUserLocks");
const locked = applyUserLocks(reg, { "exp.0.bullet.0": true });
assert(locked.find(f => f.id === "exp.0.bullet.0")?.editable === false, "user lock");
const unlockedAttempt = applyUserLocks(reg, { "basics.name": false });
assert(unlockedAttempt.find(f => f.id === "basics.name")?.editable === false, "identity never unlockable");
console.log(" ✓ locks");

console.log("Test 5: valid patch passes");
errs = validatePatchOperations([{ op: "replace", path: "/summary/content", value: "Senior Product Manager with 6 years in fintech, optimised checkout." }], reg);
assert(errs.length === 0, "valid summary should pass but got " + JSON.stringify(errs));
errs = validatePatchOperations([{ op: "replace", path: "/sections/experience/items/0/description/0", value: "Led checkout rebuild, reducing failures by 18% (£1.2M recovered)" }], reg);
assert(errs.length === 0, "valid bullet should pass");
console.log(" ✓ valid passes");

console.log("Test 6: word-boundary British spelling");
assert(checkBritishSpelling("programmer").length === 0, "programmer must NOT trigger program");
assert(checkBritishSpelling("program").some(s => s.includes("program → programme")), "program must trigger");
const wb = checkBritishSpelling("customise program");
assert(wb.length === 1 && wb[0].includes("program → programme"), "customise program only flags program, got " + JSON.stringify(wb));
console.log(" ✓ word-boundary");

console.log("\nAll tests passed.");
