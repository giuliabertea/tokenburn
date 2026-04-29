import { homedir } from 'os';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { createRequire } from 'module';
import { randomUUID } from 'crypto';
import type BetterSqlite3 from 'better-sqlite3';
import type { Session, Pattern, WastePattern } from '../packages/cli/src/types.js';
import { initDb, insertSession, upsertPattern } from '../packages/cli/src/recorder/db.js';

const DB_PATH = join(homedir(), '.tokenburn', 'tokenburn.db');
mkdirSync(join(homedir(), '.tokenburn'), { recursive: true });

const require = createRequire(import.meta.url);
const BetterSQLite = require('better-sqlite3') as typeof BetterSqlite3;
const db = new BetterSQLite(DB_PATH);
initDb(db);

db.exec('DELETE FROM sessions; DELETE FROM patterns;');

const categories = ['feature', 'bugfix', 'refactor', 'auth', 'api', 'testing'];
const wastePatterns: WastePattern[] = [
  'verbose_spec_style',
  'redundant_context',
  'repeated_instructions',
  'over_commented_spec',
  'unnecessary_examples',
  'dead_code_in_scope',
  'off_scope_context',
];

const tasks = [
  'Implement user authentication with JWT',
  'Add pagination to the products endpoint',
  'Refactor order processing pipeline',
  'Create admin dashboard UI',
  'Fix session timeout bug',
  'Add Stripe payment integration',
  'Write integration tests for checkout flow',
  'Implement search with Elasticsearch',
  'Migrate from REST to GraphQL',
  'Add email notification service',
  'Implement role-based access control',
  'Create data export functionality',
  'Fix N+1 query in user list',
  'Add rate limiting middleware',
  'Implement file upload with S3',
  'Create webhook handler for Stripe events',
  'Refactor authentication middleware',
  'Add Redis caching layer',
  'Implement soft delete across models',
  'Create API documentation with Swagger',
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

for (let i = 0; i < 20; i++) {
  const tokensSent = randomInt(300, 1200);
  const savingsPct = randomInt(15, 65);
  const tokensOptimal = Math.round(tokensSent * (1 - savingsPct / 100));
  const numPatterns = randomInt(1, 3);
  const wasteBreakdown = Array.from({ length: numPatterns }, () => ({
    pattern: randomFrom(wastePatterns),
    tokensSaved: randomInt(30, 250),
    occurrences: randomInt(1, 5),
  })).sort((a, b) => b.tokensSaved - a.tokensSaved);

  const createdAt = daysAgo(randomInt(0, 30));
  const date = createdAt.split('T')[0] ?? createdAt;

  const session: Session = {
    id: randomUUID(),
    date,
    task: tasks[i] ?? `Task ${i + 1}`,
    category: randomFrom(categories),
    tokens_sent: tokensSent,
    tokens_optimal: tokensOptimal,
    quality: Math.random() > 0.3 ? randomInt(2, 5) : null,
    prompt_raw: null,
    prompt_compressed: null,
    waste_breakdown: wasteBreakdown,
    insight: `"${wasteBreakdown[0]?.pattern ?? 'verbose_spec_style'}" detected — use templates/auth.md as a starting point for this type of task.`,
    created_at: createdAt,
  };

  insertSession(db, session);
  for (const w of wasteBreakdown) {
    upsertPattern(db, w.pattern, w.tokensSaved);
  }
}

console.log('✓ Seeded 20 mock sessions into', DB_PATH);
