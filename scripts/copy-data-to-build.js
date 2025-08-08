const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFileSyncVerbose(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`Copied ${path.basename(src)} -> ${dest}`);
}

(function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const sourceDir = path.join(projectRoot, 'server', 'data');
  const targetDir = path.join(projectRoot, 'build', 'data');

  if (!fs.existsSync(sourceDir)) {
    console.warn(`No source data directory found at ${sourceDir}. Skipping data copy.`);
    return;
  }

  ensureDir(targetDir);

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  entries.forEach((entry) => {
    if (!entry.isFile()) return;
    if (!entry.name.endsWith('.json')) return;

    const src = path.join(sourceDir, entry.name);
    const dest = path.join(targetDir, entry.name);
    copyFileSyncVerbose(src, dest);
  });

  console.log(`Data copied to ${targetDir}`);
})();