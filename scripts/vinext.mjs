import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const command = process.argv[2];
const allowedCommands = new Set(["dev", "build", "start"]);

if (!command || !allowedCommands.has(command)) {
  console.error("Usage: node scripts/vinext.mjs <dev|build|start>");
  process.exitCode = 2;
} else {
  const cli = fileURLToPath(new URL("../node_modules/vinext/dist/cli.js", import.meta.url));
  const child = spawn(process.execPath, [cli, command, ...process.argv.slice(3)], {
    stdio: "inherit",
    env: {
      ...process.env,
      WRANGLER_LOG_PATH: process.env.WRANGLER_LOG_PATH ?? ".wrangler/wrangler.log",
    },
  });

  child.on("error", (error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exitCode = code ?? 1;
  });
}
