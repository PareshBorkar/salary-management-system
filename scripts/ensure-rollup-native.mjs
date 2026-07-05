import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";

const linuxRollupPackage = "@rollup/rollup-linux-x64-gnu";
const linuxRollupVersion = "4.62.2";

if (process.platform !== "linux" || process.arch !== "x64") {
  process.exit(0);
}

const requireFromWorkspace = createRequire(join(process.cwd(), "package.json"));

try {
  requireFromWorkspace.resolve(linuxRollupPackage);
  process.exit(0);
} catch {
  console.log(`Installing missing ${linuxRollupPackage} for Linux build...`);
}

const result = spawnSync(
  "npm",
  ["install", "--no-save", `${linuxRollupPackage}@${linuxRollupVersion}`],
  {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: process.platform === "win32"
  }
);

process.exit(result.status ?? 1);
