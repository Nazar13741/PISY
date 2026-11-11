const { spawnSync, spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const entry = path.join(root, 'src', 'index.js');
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor !== 20) {
    process.stderr.write(`Требуется Node.js 20.x, обнаружена версия ${process.versions.node}\n`);
    process.exit(1);
}
try {
    require.resolve('better-sqlite3', { paths: [root] });
} catch {
    process.stdout.write('Установка зависимости базы данных для Node.js 20...\n');
    const install = spawnSync('npm', ['install', '--no-save', '--no-package-lock', '--no-audit', '--no-fund', 'better-sqlite3@11.10.0'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
    if (install.error || install.status !== 0) {
        process.stderr.write('Не удалось автоматически установить SQLite. Проверьте доступ хостинга к npm registry и перезапустите сервер.\n');
        process.exit(1);
    }
}
const child = spawn(process.execPath, [entry], { cwd: root, stdio: 'inherit', env: process.env });
child.on('error', error => { process.stderr.write(`${error.message}\n`); process.exit(1); });
child.on('exit', code => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
