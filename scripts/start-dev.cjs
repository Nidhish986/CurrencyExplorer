const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
const out = fs.openSync(path.join(cwd, 'vite-dev.log'), 'a');
const err = fs.openSync(path.join(cwd, 'vite-dev-error.log'), 'a');
const vite = path.join(cwd, 'node_modules', '.bin', 'vite.cmd');
const child = spawn(vite, ['--host', '127.0.0.1'], {
  cwd,
  detached: true,
  windowsHide: true,
  stdio: ['ignore', out, err]
});
child.unref();
console.log(`PID=${child.pid}`);
