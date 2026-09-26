import { spawnSync } from "node:child_process";

const siteId = "4aabb6da-a88f-4d33-bbd4-cea51c3416e2";
const result = spawnSync(
  "npx",
  ["--yes", "netlify-cli@23.4.3", "api", "createSiteBuild", "--data", JSON.stringify({ site_id: siteId, clear_cache: true })],
  { stdio: "inherit", shell: false, cwd: process.cwd() },
);
process.exit(result.status ?? 1);
