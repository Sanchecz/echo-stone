import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2] ?? "check";

if (!new Set(["test", "check", "release"]).has(mode)) {
  console.error("Usage: node scripts/quality.mjs <test|check|release>");
  process.exit(2);
}

function run(label, script, args = []) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(process.execPath, [resolve(root, script), ...args], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (mode === "release") run("Clean generated output", "scripts/clean.mjs");

if (mode !== "test") {
  run("TypeScript", "node_modules/typescript/bin/tsc", ["--noEmit", "--pretty", "false"]);
  run("ESLint", "node_modules/eslint/bin/eslint.js", [
    ".",
    "--ignore-pattern",
    "dist",
    "--ignore-pattern",
    ".next",
    "--max-warnings=0",
  ]);
}

run("Unit tests", "tests/run-unit-tests.mjs");
run("Production build", "scripts/vinext.mjs", ["build"]);
run("SSR and security integration tests", "tests/rendered-html.test.mjs");

console.log(`\nQuality cycle completed (${mode}).`);
