import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, '..');
const dashboardDir = path.join(projectDir, 'apps/dashboard');
const rawArgs = process.argv.slice(2);

const hasFlag = (flag) => rawArgs.includes(flag);
const args = ['vite'];

if (!hasFlag('--host')) {
  args.push('--host', '0.0.0.0');
}

if (!hasFlag('--port')) {
  args.push('--port', '5173');
}

args.push(...rawArgs);

const child = spawn('npx', args, {
  cwd: dashboardDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
