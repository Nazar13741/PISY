const fs = require('node:fs');
const path = require('node:path');
const initSqlJs = require('sql.js');
const { config, ROOT } = require('./config');
const log = require('./logger').child('База');

const MIGRATIONS = [
`
CREATE TABLE characters (
 id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT NOT NULL, user_id TEXT NOT NULL,
 name TEXT NOT NULL, race TEXT NOT NULL, class TEXT NOT NULL, age TEXT, description TEXT,
 appearance TEXT, avatar_file TEXT, stats TEXT NOT NULL DEFAULT '{}', free_points INTEGER NOT NULL DEFAULT 0,
 level INTEGER NOT NULL DEFAULT 1, xp INTEGER NOT NULL DEFAULT 0, sanity INTEGER NOT NULL DEFAULT 100,
 madness TEXT, madness_until INTEGER, is_active INTEGER NOT NULL DEFAULT 0,
 created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX idx_char_owner ON characters(guild_id, user_id);
CREATE TABLE reputation (
 character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
 faction TEXT NOT NULL, value INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (character_id, faction)
);
CREATE TABLE message_xp (
 guild_id TEXT NOT NULL, user_id TEXT NOT NULL, last_at INTEGER NOT NULL DEFAULT 0,
 day TEXT, day_xp INTEGER NOT NULL DEFAULT 0, last_hash TEXT, PRIMARY KEY (guild_id, user_id)
);
`,
`
CREATE TABLE curators (
 guild_id TEXT NOT NULL, user_id TEXT NOT NULL, added_by TEXT, added_at INTEGER NOT NULL,
 PRIMARY KEY (guild_id, user_id)
);
`
];

class Database {
 constructor(file) {
  this.file = path.isAbsolute(file) ? file : path.join(ROOT, file);
  this.depth = 0;
  this.db = null;
  this.ready = this.initialize();
 }
 async initialize() {
  fs.mkdirSync(path.dirname(this.file), { recursive: true });
  const SQL = await initSqlJs();
  const bytes = fs.existsSync(this.file) ? fs.readFileSync(this.file) : null;
  this.db = bytes && bytes.length ? new SQL.Database(bytes) : new SQL.Database();
  this.db.run('PRAGMA foreign_keys = ON');
  this.migrate();
  this.flush();
  return this;
 }
 migrate() {
  const current = this.db.exec('PRAGMA user_version')[0]?.values?.[0]?.[0] || 0;
  for (let v = current; v < MIGRATIONS.length; v++) {
   this.transaction(() => {
    this.db.run(MIGRATIONS[v]);
    this.db.run(`PRAGMA user_version = ${v + 1}`);
   });
   log.info(`Применена миграция базы v${v + 1}`);
  }
 }
 assertReady() {
  if (!this.db) throw new Error('База данных ещё загружается');
 }
 clean(params) {
  return params.map(p => p === undefined ? null : typeof p === 'boolean' ? Number(p) : p);
 }
 run(sql, ...params) {
  this.assertReady();
  this.db.run(sql, this.clean(params));
  const changes = this.db.getRowsModified();
  const lastInsertRowid = this.db.exec('SELECT last_insert_rowid()')[0]?.values?.[0]?.[0] ?? 0;
  if (!this.depth) this.flush();
  return { changes, lastInsertRowid };
 }
 get(sql, ...params) {
  this.assertReady();
  const stmt = this.db.prepare(sql);
  try {
   stmt.bind(this.clean(params));
   return stmt.step() ? stmt.getAsObject() : undefined;
  } finally { stmt.free(); }
 }
 all(sql, ...params) {
  this.assertReady();
  const stmt = this.db.prepare(sql), rows = [];
  try {
   stmt.bind(this.clean(params));
   while (stmt.step()) rows.push(stmt.getAsObject());
   return rows;
  } finally { stmt.free(); }
 }
 transaction(fn) {
  this.assertReady();
  const outer = this.depth === 0;
  if (outer) this.db.run('BEGIN TRANSACTION');
  this.depth++;
  try {
   const result = fn();
   this.depth--;
   if (outer) { this.db.run('COMMIT'); this.flush(); }
   return result;
  } catch (error) {
   this.depth--;
   if (outer) this.db.run('ROLLBACK');
   throw error;
  }
 }
 flush() {
  this.assertReady();
  const temp = `${this.file}.tmp`;
  fs.writeFileSync(temp, Buffer.from(this.db.export()));
  fs.renameSync(temp, this.file);
 }
 async backup() {
  await this.ready;
  const dir = path.join(path.dirname(this.file), 'backups');
  fs.mkdirSync(dir, { recursive: true });
  this.flush();
  const name = `bot-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
  fs.copyFileSync(this.file, path.join(dir, name));
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.db')).sort();
  while (files.length > config.database.keepBackups) fs.unlinkSync(path.join(dir, files.shift()));
  log.info(`Резервная копия базы: data/backups/${name}`);
 }
 close() {
  if (!this.db) return;
  this.flush();
  this.db.close();
  this.db = null;
 }
}
module.exports = new Database(config.database.file);
