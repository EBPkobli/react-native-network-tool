import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(rootDir, '..');
const bridgeEntry = path.join(projectDir, 'apps/bridge/src/index.ts');
const args = process.argv.slice(2);

const child = spawn('npx', ['tsx', bridgeEntry, ...args], {
  cwd: projectDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
