import chalk from 'chalk';
import Table from 'cli-table3';
import { getDb, getSessions } from '../recorder/db.js';

export function runHistory(limit: number): void {
  const db = getDb();
  const sessions = getSessions(db, limit);

  if (sessions.length === 0) {
    console.log(chalk.dim('No sessions recorded yet. Run `tburn record` to get started.'));
    return;
  }

  const table = new Table({
    head: [chalk.bold('Date'), chalk.bold('Task'), chalk.bold('Category'), chalk.bold('Tokens Sent'), chalk.bold('Savings %'), chalk.bold('Quality')],
    style: { head: [], border: [] },
  });

  for (const s of sessions) {
    const savingsPct = s.tokens_sent > 0
      ? Math.round((1 - s.tokens_optimal / s.tokens_sent) * 100)
      : 0;
    const task = s.task.length > 40 ? s.task.slice(0, 37) + '...' : s.task;
    table.push([
      s.date,
      task,
      s.category,
      s.tokens_sent.toLocaleString(),
      `${savingsPct}%`,
      s.quality !== null ? '★'.repeat(s.quality) : '-',
    ]);
  }

  console.log('\nTokenBurn · Session History\n');
  console.log(table.toString());
  console.log();
}
