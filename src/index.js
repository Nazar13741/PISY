const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const projectRoot = path.resolve(__dirname, '..');
const requiredPackages = ['discord.js', 'sql.js', '@napi-rs/canvas'];
const missingPackages = requiredPackages.filter((name) => {
    try { require.resolve(name, { paths: [projectRoot] }); return false; } catch { return true; }
});
if (missingPackages.length) {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const install = spawnSync(npm, ['install', '--no-save', '--no-package-lock', '--no-audit', '--no-fund', 'discord.js@^14.27.0', 'sql.js@^1.13.0', '@napi-rs/canvas@^1.0.13'], {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: process.platform === 'win32'
    });
    if (install.error || install.status !== 0) {
        process.stderr.write('Не удалось установить зависимости. Проверьте доступ хостинга к npm registry.\\n');
        process.exit(1);
    }
}
const databaseFile = path.join(__dirname, 'core', 'database.js');
const databaseTemplate = path.join(__dirname, 'core', 'database.node20.js');
if (fs.existsSync(databaseFile) && fs.existsSync(databaseTemplate)) {
    const currentDatabase = fs.readFileSync(databaseFile, 'utf8');
    if (currentDatabase.includes('node:sqlite') || currentDatabase.includes('DatabaseSync') || currentDatabase.includes('better-sqlite3')) {
        fs.copyFileSync(databaseTemplate, databaseFile);
    }
}

// Точка входа бота. Запуск: npm start

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { config, env, errors, warnings } = require('./core/config');
const logger = require('./core/logger');

if (errors.length) {
    logger.error('Бот не может запуститься - исправьте настройки:');
    errors.forEach((e) => logger.error(' • ' + e));
    process.exit(1);
}
warnings.forEach((w) => logger.warn(w));

const db = require('./core/database');
const loader = require('./core/loader');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
    partials: [Partials.Channel],
});
client.commands = new Collection();
client.components = new Collection();

loader.loadCommands(client);
loader.loadComponents(client);
loader.loadEvents(client);
logger.attachClient(client);
logger.cleanupOldLogs();

process.on('unhandledRejection', (e) => logger.error('Необработанная ошибка (Promise):', e));
process.on('uncaughtException', (e) => logger.error('Необработанная ошибка:', e));
client.on('error', (e) => logger.error('Ошибка клиента Discord:', e));

const shutdown = async (signal) => {
    logger.info(`Получен ${signal}, останавливаю бота…`);
    await client.destroy();
    db.db.close();
    process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

(async () => {
    await db.ready;
    if (config.database.backupOnStart) await db.backup().catch((e) => logger.warn('Резервная копия не создана:', e.message));
    await client.login(env.token);
})().catch((e) => {
    logger.error('Не удалось войти в Discord. Проверьте DISCORD_TOKEN в .env и что у бота включены интенты MESSAGE CONTENT и SERVER MEMBERS.', e);
    process.exit(1);
});
