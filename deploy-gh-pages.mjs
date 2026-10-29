import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const remoteUrl = "https://github.com/minasar326-rgb/Zaker-MB.git";

console.log("Preparing gh-pages deployment from:", distDir);

// Ensure .nojekyll exists
fs.writeFileSync(path.join(distDir, ".nojekyll"), "");

// Ensure 404.html is a copy of index.html
fs.copyFileSync(path.join(distDir, "index.html"), path.join(distDir, "404.html"));

const gitCmd = (cmd) => {
  console.log(`> ${cmd}`);
  return execSync(cmd, { cwd: distDir, stdio: "inherit" });
};

// Initialize repo in dist
if (fs.existsSync(path.join(distDir, ".git"))) {
  fs.rmSync(path.join(distDir, ".git"), { recursive: true, force: true });
}

gitCmd("git init");
gitCmd("git config user.name \"minasar326-rgb\"");
gitCmd("git config user.email \"saryanymina@gmail.com\"");
gitCmd("git checkout -b gh-pages");
gitCmd("git add -A");
gitCmd("git commit -m \"deploy: 100% offline study planner PWA for Zaker-MB\"");
gitCmd(`git remote add origin ${remoteUrl}`);
gitCmd("git push -f origin gh-pages");

console.log("Successfully deployed Zaker study planner to gh-pages branch of Zaker-MB!");
