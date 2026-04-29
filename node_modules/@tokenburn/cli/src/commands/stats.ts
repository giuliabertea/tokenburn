import chalk from 'chalk';
import { getDb, getKPIs } from '../recorder/db.js';

export function runStats(): void {
  const db = getDb();
  const kpis = getKPIs(db);

  console.log('\n' + chalk.bold('TokenBurn · KPI Summary'));
  console.log(chalk.dim('──────────────────────────────'));

  if (kpis.totalSessions === 0) {
    console.log(chalk.dim('No sessions recorded yet. Run `tburn record` to get started.\n'));
    return;
  }

  const label = (s: string) => chalk.dim(s.padEnd(26));

  console.log(`${label('Total Sessions:')}${chalk.white(kpis.totalSessions)}`);
  console.log(`${label('Total Tokens Sent:')}${chalk.white(kpis.totalTokensSent.toLocaleString())}`);
  console.log(`${label('Total Tokens Saved:')}${chalk.green(kpis.totalTokensSaved.toLocaleString())}`);
  console.log(`${label('Avg Savings %:')}${chalk.green(kpis.avgSavingsPct + '%')}`);
  console.log(`${label('Avg Quality:')}${chalk.yellow(kpis.avgQuality > 0 ? kpis.avgQuality.toFixed(1) : 'N/A')}`);
  console.log(`${label('Top Waste Pattern:')}${chalk.red(kpis.topPattern ?? 'N/A')}`);
  console.log();
}
