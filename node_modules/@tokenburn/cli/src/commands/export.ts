import { writeFileSync } from 'fs';
import chalk from 'chalk';
import { getDb, getSessions } from '../recorder/db.js';
import type { Session } from '../types.js';

function toCSV(sessions: Session[]): string {
  const headers = [
    'id', 'date', 'task', 'category', 'tokens_sent', 'tokens_optimal',
    'quality', 'prompt_raw', 'prompt_compressed', 'waste_breakdown', 'insight', 'created_at',
  ];
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = sessions.map((s) =>
    headers.map((h) => escape((s as unknown as Record<string, unknown>)[h])).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function runExport(format: string, output: string): void {
  if (format !== 'json' && format !== 'csv') {
    console.error(chalk.red('Error: --format must be "json" or "csv"'));
    process.exit(1);
  }

  const db = getDb();
  const sessions = getSessions(db, 1_000_000);

  let content: string;
  if (format === 'json') {
    content = JSON.stringify(sessions, null, 2);
  } else {
    content = toCSV(sessions);
  }

  writeFileSync(output, content, 'utf-8');
  console.log(chalk.green(`✓ Exported ${sessions.length} sessions to ${output}`));
}
