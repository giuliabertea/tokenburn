import { program } from 'commander';

program
  .name('tburn')
  .description('TokenBurn · Spec Intelligence')
  .version('0.1.0');

program
  .command('analyze <file>')
  .description('Analyze a spec file for token waste')
  .action(async (file: string) => {
    const { runAnalyze } = await import('./commands/analyze.js');
    await runAnalyze(file);
  });

program
  .command('compress <file>')
  .description('Compress a spec file')
  .option('-o, --output <path>', 'Output file path')
  .option('--dry-run', 'Print compressed output without writing')
  .action(async (file: string, opts: { output?: string; dryRun?: boolean }) => {
    const { runCompress } = await import('./commands/compress.js');
    await runCompress(file, opts);
  });

program
  .command('record')
  .description('Record a new session interactively')
  .action(async () => {
    const { runRecordFlow } = await import('./recorder/index.js');
    await runRecordFlow();
  });

program
  .command('dashboard')
  .description('Start the TokenBurn dashboard')
  .option('-p, --port <number>', 'Port to listen on', '4242')
  .action(async (opts: { port: string }) => {
    const { runDashboard } = await import('./commands/dashboard.js');
    await runDashboard(parseInt(opts.port, 10));
  });

program
  .command('patterns')
  .description('Show waste pattern summary')
  .option('--top <n>', 'Number of top patterns to show', '5')
  .action(async (opts: { top: string }) => {
    const { runPatterns } = await import('./commands/patterns.js');
    await runPatterns(parseInt(opts.top, 10));
  });

program
  .command('history')
  .description('Show session history')
  .option('--limit <n>', 'Number of sessions to show', '20')
  .action(async (opts: { limit: string }) => {
    const { runHistory } = await import('./commands/history.js');
    await runHistory(parseInt(opts.limit, 10));
  });

program
  .command('stats')
  .description('Show KPI summary')
  .action(async () => {
    const { runStats } = await import('./commands/stats.js');
    await runStats();
  });

program
  .command('export')
  .description('Export sessions to JSON or CSV')
  .requiredOption('--format <type>', 'Export format: json or csv')
  .requiredOption('--output <path>', 'Output file path')
  .action(async (opts: { format: string; output: string }) => {
    const { runExport } = await import('./commands/export.js');
    await runExport(opts.format, opts.output);
  });

program
  .command('report')
  .description('Generate a coaching report')
  .option('--week', 'Generate weekly report')
  .action(async (opts: { week?: boolean }) => {
    const { runReport } = await import('./commands/report.js');
    await runReport({ week: opts.week ?? false });
  });

program.parse();
