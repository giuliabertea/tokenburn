import chalk from 'chalk';
import Table from 'cli-table3';
import { getDb, getPatterns } from '../recorder/db.js';

export function runPatterns(top: number): void {
  const db = getDb();
  const patterns = getPatterns(db).slice(0, top);

  if (patterns.length === 0) {
    console.log(chalk.dim('No patterns recorded yet. Run `tburn record` to get started.'));
    return;
  }

  const table = new Table({
    head: [chalk.bold('Waste Type'), chalk.bold('Total Tokens'), chalk.bold('Occurrences'), chalk.bold('Last Seen')],
    style: { head: [], border: [] },
  });

  for (const p of patterns) {
    table.push([p.waste_type, p.total_tokens.toLocaleString(), p.occurrences, p.last_seen.split('T')[0] ?? p.last_seen]);
  }

  console.log('\nTokenBurn · Waste Patterns\n');
  console.log(table.toString());
  console.log();
}
