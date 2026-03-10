import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bridgeDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(bridgeDir, '..', '..');
const sourceDir = path.join(repoRoot, 'apps', 'dashboard', 'dist');
const targetDir = path.join(bridgeDir, 'public', 'dashboard');

if (!fs.existsSync(sourceDir)) {
  console.error(
    '[bridge] dashboard build not found at apps/dashboard/dist. Run `npm run build:dashboard` first.',
  );
  process.exit(1);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

console.log(`[bridge] synced dashboard assets -> ${targetDir}`);
