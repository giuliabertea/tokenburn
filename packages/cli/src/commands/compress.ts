import { readFileSync, writeFileSync, existsSync } from 'fs';
import chalk from 'chalk';
import { compress } from '../compressor/index.js';
import { estimateTokens } from '../estimator/index.js';

export async function runCompress(
  file: string,
  opts: { output?: string; dryRun?: boolean }
): Promise<void> {
  if (!existsSync(file)) {
    console.error(chalk.red(`Error: File not found: ${file}`));
    process.exit(1);
  }

  const raw = readFileSync(file, 'utf-8');
  const compressed = compress(raw);
  const [tokensBefore, tokensAfter] = await Promise.all([
    estimateTokens(raw),
    estimateTokens(compressed),
  ]);
  const savingsPct = Math.max(0, Math.round((1 - tokensAfter / tokensBefore) * 100));

  if (opts.dryRun) {
    console.log(compressed);
    console.log();
    console.log(chalk.dim(`Tokens: ${tokensBefore} → ${tokensAfter} (-${savingsPct}%) [dry run — not written]`));
    return;
  }

  let outPath: string;
  if (opts.output) {
    outPath = opts.output;
  } else {
    const { default: inquirer } = await import('inquirer');
    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      { type: 'confirm', name: 'confirm', message: `Overwrite ${file}?`, default: false },
    ]);
    if (!confirm) {
      console.log(chalk.dim('Aborted.'));
      return;
    }
    outPath = file;
  }
  writeFileSync(outPath, compressed, 'utf-8');
  console.log(chalk.green(`✓ Written to ${outPath}`));
  console.log(chalk.dim(`  Tokens: ${tokensBefore} → ${tokensAfter} (-${savingsPct}%)`));
}
