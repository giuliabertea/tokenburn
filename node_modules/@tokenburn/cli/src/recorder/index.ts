import { readFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import chalk from 'chalk';
import type { Session, WasteResult } from '../types.js';

const CATEGORIES = ['feature', 'bugfix', 'refactor', 'auth', 'api', 'testing', 'database', 'infra', 'docs', 'other'];

export async function runRecordFlow(): Promise<void> {
  const { default: inquirer } = await import('inquirer');
  const { getDb, insertSession, upsertPattern } = await import('./db.js');
  const { analyzeWaste } = await import('../analyzer/index.js');
  const { computeSavings } = await import('../estimator/index.js');
  const { generateInsight } = await import('../analyzer/insight.js');
  const { getSessions } = await import('./db.js');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'task',
      message: 'Task description:',
      validate: (v: string) => v.trim().length > 0 || 'Required',
    },
    {
      type: 'list',
      name: 'category',
      message: 'Category:',
      choices: CATEGORIES,
    },
    {
      type: 'input',
      name: 'specFile',
      message: 'Spec file path (optional, press Enter to skip):',
    },
    {
      type: 'number',
      name: 'quality',
      message: 'Quality rating (1–5, or 0 to skip):',
      default: 0,
      validate: (v: number) => (v >= 0 && v <= 5) || 'Enter 0–5',
    },
  ]);

  const db = getDb();
  const history = getSessions(db, 10);

  let promptRaw: string | null = null;
  let promptCompressed: string | null = null;
  let wasteBreakdown: WasteResult[] | null = null;
  let tokensSent = 0;
  let tokensOptimal = 0;
  let insight: string | null = null;

  const specFile = (answers['specFile'] as string | undefined)?.trim() ?? '';
  if (specFile && existsSync(specFile)) {
    console.log(chalk.dim('\nAnalyzing spec...'));
    promptRaw = readFileSync(specFile, 'utf-8');
    const { compress } = await import('../compressor/index.js');
    promptCompressed = compress(promptRaw);
    const savings = await computeSavings(promptRaw);
    tokensSent = savings.tokensSent;
    tokensOptimal = savings.tokensOptimal;
    wasteBreakdown = analyzeWaste(promptRaw);

    const session: Session = {
      id: randomUUID(),
      date: new Date().toISOString().split('T')[0] ?? new Date().toISOString(),
      task: answers['task'] as string,
      category: answers['category'] as string,
      tokens_sent: tokensSent,
      tokens_optimal: tokensOptimal,
      quality: null,
      prompt_raw: promptRaw,
      prompt_compressed: promptCompressed,
      waste_breakdown: wasteBreakdown,
      insight: null,
      created_at: new Date().toISOString(),
    };
    insight = generateInsight(session, history);
    session.insight = insight;

    console.log(chalk.bold(`\nTokens: ${tokensSent} → ${tokensOptimal} (-${savings.savingsPct}%)`));
    if (wasteBreakdown.length > 0) {
      console.log(chalk.yellow('Top waste:'));
      for (const w of wasteBreakdown.slice(0, 3)) {
        console.log(chalk.yellow(`  ${w.pattern} (${w.tokensSaved}t)`));
      }
    }
    if (insight) console.log(chalk.cyan(`\n💡 ${insight}`));
  }

  const finalSession: Session = {
    id: randomUUID(),
    date: new Date().toISOString().split('T')[0] ?? new Date().toISOString(),
    task: answers['task'] as string,
    category: answers['category'] as string,
    tokens_sent: tokensSent,
    tokens_optimal: tokensOptimal,
    quality: (answers['quality'] as number) > 0 ? (answers['quality'] as number) : null,
    prompt_raw: promptRaw,
    prompt_compressed: promptCompressed,
    waste_breakdown: wasteBreakdown,
    insight,
    created_at: new Date().toISOString(),
  };

  insertSession(db, finalSession);
  if (wasteBreakdown) {
    for (const w of wasteBreakdown) {
      upsertPattern(db, w.pattern, w.tokensSaved);
    }
  }
  console.log(chalk.green('\n✓ Session recorded.'));
}
