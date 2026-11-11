const { spawnSync } = require('node:child_process');
const path = require('node:path');
const required = ['discord.js', 'sql.js', '@napi-rs/canvas'];
const missing = required.filter(name => {
 try { require.resolve(name); return false; } catch { return true; }
});
if (missing.length) {
 const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
 const result = spawnSync(npm, ['install', '--omit=dev'], { stdio: 'inherit', cwd: path.resolve(__dirname, '..'), shell: process.platform === 'win32' });
 if (result.status !== 0) process.exit(result.status || 1);
}
