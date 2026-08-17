import { rm } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targets = ["dist", ".next", ".wrangler", "tsconfig.tsbuildinfo"];

for (const target of targets) {
  const absolute = resolve(root, target);
  const pathFromRoot = relative(root, absolute);
  if (!pathFromRoot || pathFromRoot.startsWith("..") || resolve(dirname(absolute)) !== root) {
    throw new Error(`Refusing to clean unsafe path: ${absolute}`);
  }
  await rm(absolute, { recursive: true, force: true });
}

console.log(`Cleaned ${targets.join(", ")}`);
