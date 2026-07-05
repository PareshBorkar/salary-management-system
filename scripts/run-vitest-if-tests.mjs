import { readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const testFilePattern = /\.(test|spec)\.[cm]?[jt]sx?$/;
const ignoredDirectories = new Set([".git", "coverage", "dist", "node_modules"]);

function hasTestFiles(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      if (!ignoredDirectories.has(basename(path)) && hasTestFiles(path)) {
        return true;
      }

      continue;
    }

    if (testFilePattern.test(entry)) {
      return true;
    }
  }

  return false;
}

if (!hasTestFiles(process.cwd())) {
  console.log(`No test files found in ${process.cwd()}; skipping Vitest.`);
  process.exit(0);
}

const result = spawnSync("npx", ["vitest", "run"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

process.exit(result.status ?? 1);
