import { homedir } from 'os';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { createRequire } from 'module';
import type BetterSqlite3 from 'better-sqlite3';
import type { Session, Pattern, WastePattern, KPIs } from '../types.js';

type Database = BetterSqlite3.Database;

const DB_PATH = join(homedir(), '.tokenburn', 'tokenburn.db');

let _db: Database | null = null;

export function getDb(): Database {
  if (_db) return _db;
  const require = createRequire(import.meta.url);
  const BetterSQLite = require('better-sqlite3') as typeof BetterSqlite3;
  mkdirSync(join(homedir(), '.tokenburn'), { recursive: true });
  const db = new BetterSQLite(DB_PATH);
  initDb(db);
  _db = db;
  return db;
}

export function initDb(db: Database): void {
  db.pragma('journal_mode=WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id                 TEXT PRIMARY KEY,
      date               TEXT NOT NULL,
      task               TEXT NOT NULL,
      category           TEXT NOT NULL,
      tokens_sent        INTEGER NOT NULL,
      tokens_optimal     INTEGER NOT NULL,
      quality            INTEGER,
      prompt_raw         TEXT,
      prompt_compressed  TEXT,
      waste_breakdown    TEXT,
      insight            TEXT,
      created_at         TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patterns (
      id           TEXT PRIMARY KEY,
      waste_type   TEXT NOT NULL,
      total_tokens INTEGER NOT NULL,
      occurrences  INTEGER NOT NULL,
      last_seen    TEXT NOT NULL
    );
  `);
}

export function insertSession(db: Database, session: Session): void {
  const stmt = db.prepare(`
    INSERT INTO sessions
      (id, date, task, category, tokens_sent, tokens_optimal, quality, prompt_raw, prompt_compressed, waste_breakdown, insight, created_at)
    VALUES
      (@id, @date, @task, @category, @tokens_sent, @tokens_optimal, @quality, @prompt_raw, @prompt_compressed, @waste_breakdown, @insight, @created_at)
  `);
  stmt.run({
    ...session,
    waste_breakdown: session.waste_breakdown ? JSON.stringify(session.waste_breakdown) : null,
  });
}

export function upsertPattern(db: Database, wasteType: WastePattern, tokensSaved: number): void {
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id FROM patterns WHERE id = ?').get(wasteType);
  if (existing) {
    db.prepare(`
      UPDATE patterns SET total_tokens = total_tokens + ?, occurrences = occurrences + 1, last_seen = ? WHERE id = ?
    `).run(tokensSaved, now, wasteType);
  } else {
    db.prepare(`
      INSERT INTO patterns (id, waste_type, total_tokens, occurrences, last_seen)
      VALUES (?, ?, ?, 1, ?)
    `).run(wasteType, wasteType, tokensSaved, now);
  }
}

export function getSessions(db: Database, limit: number): Session[] {
  const rows = db.prepare('SELECT * FROM sessions ORDER BY created_at DESC LIMIT ?').all(limit) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    ...(r as Omit<Session, 'waste_breakdown'>),
    waste_breakdown: typeof r['waste_breakdown'] === 'string'
      ? (JSON.parse(r['waste_breakdown']) as Session['waste_breakdown'])
      : null,
  }));
}

export function getSessionById(db: Database, id: string): Session | null {
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    ...(row as Omit<Session, 'waste_breakdown'>),
    waste_breakdown: typeof row['waste_breakdown'] === 'string'
      ? (JSON.parse(row['waste_breakdown']) as Session['waste_breakdown'])
      : null,
  };
}

export function getPatterns(db: Database): Pattern[] {
  return db.prepare('SELECT * FROM patterns ORDER BY total_tokens DESC').all() as Pattern[];
}

export function getKPIs(db: Database): KPIs {
  const sessions = db.prepare('SELECT tokens_sent, tokens_optimal, quality FROM sessions').all() as Array<{ tokens_sent: number; tokens_optimal: number; quality: number | null }>;
  if (sessions.length === 0) {
    return { totalSessions: 0, totalTokensSent: 0, totalTokensSaved: 0, avgSavingsPct: 0, avgQuality: 0, topPattern: null };
  }
  const totalTokensSent = sessions.reduce((s, r) => s + r.tokens_sent, 0);
  const totalTokensSaved = sessions.reduce((s, r) => s + (r.tokens_sent - r.tokens_optimal), 0);
  const savingsPcts = sessions.map((r) =>
    r.tokens_sent > 0 ? Math.round((1 - r.tokens_optimal / r.tokens_sent) * 100) : 0
  );
  const avgSavingsPct = Math.round(savingsPcts.reduce((s, v) => s + v, 0) / savingsPcts.length);
  const qualitySessions = sessions.filter((r) => r.quality !== null);
  const avgQuality =
    qualitySessions.length > 0
      ? Math.round((qualitySessions.reduce((s, r) => s + (r.quality ?? 0), 0) / qualitySessions.length) * 10) / 10
      : 0;
  const topPatternRow = db.prepare('SELECT waste_type FROM patterns ORDER BY total_tokens DESC LIMIT 1').get() as { waste_type: WastePattern } | undefined;
  return {
    totalSessions: sessions.length,
    totalTokensSent,
    totalTokensSaved,
    avgSavingsPct,
    avgQuality,
    topPattern: topPatternRow?.waste_type ?? null,
  };
}

export function updateQuality(db: Database, id: string, quality: number): boolean {
  const result = db.prepare('UPDATE sessions SET quality = ? WHERE id = ?').run(quality, id);
  return result.changes > 0;
}
