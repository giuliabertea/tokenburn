import { readFileSync, existsSync } from 'fs';
import chalk from 'chalk';
import { analyzeWaste, topWaste } from '../analyzer/index.js';
import { computeSavings } from '../estimator/index.js';
import { generateInsight } from '../analyzer/insight.js';
import { getDb, getSessions } from '../recorder/db.js';
import type { Session } from '../types.js';

export async function runAnalyze(file: string): Promise<void> {
  if (!existsSync(file)) {
    console.error(chalk.red(`Error: File not found: ${file}`));
    process.exit(1);
  }

  const text = readFileSync(file, 'utf-8');
  const [savings, wasteResults] = await Promise.all([
    computeSavings(text),
    Promise.resolve(analyzeWaste(text)),
  ]);

  const db = getDb();
  const history = getSessions(db, 10);

  const tempSession: Session = {
    id: '',
    date: new Date().toISOString().split('T')[0] ?? '',
    task: file,
    category: 'feature',
    tokens_sent: savings.tokensSent,
    tokens_optimal: savings.tokensOptimal,
    quality: null,
    prompt_raw: text,
    prompt_compressed: null,
    waste_breakdown: wasteResults,
    insight: null,
    created_at: new Date().toISOString(),
  };
  const insight = generateInsight(tempSession, history);

  const top = topWaste(wasteResults, 3);

  console.log();
  console.log(chalk.bold('TokenBurn · Spec Intelligence'));
  console.log(chalk.dim('──────────────────────────────'));
  console.log(`${chalk.dim('📄 File:')}        ${file}`);
  console.log(
    `${chalk.dim('🔢 Tokens:')}     ${chalk.white(savings.tokensSent)}  →  ${chalk.green(savings.tokensOptimal)}  (${chalk.green('-' + savings.savingsPct + '%')})`
  );

  if (top.length > 0) {
    console.log(`${chalk.dim('🔥 Top waste:')}  ${chalk.yellow(top[0]?.pattern.padEnd(20) ?? '')} (${top[0]?.tokensSaved ?? 0}t)`);
    for (const w of top.slice(1)) {
      console.log(`                ${chalk.yellow(w.pattern.padEnd(20))} (${w.tokensSaved}t)`);
    }
  }

  console.log();
  console.log(`${chalk.cyan('💡 Insight:')} ${insight}`);
  console.log();
  console.log(chalk.dim(`Run \`tburn compress ${file}\` to apply fixes.`));
  console.log();
}
