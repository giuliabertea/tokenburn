import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import { getDb, getSessions, getPatterns, getKPIs } from '../recorder/db.js';

export function runReport(opts: { week: boolean }): void {
  const db = getDb();
  const allSessions = getSessions(db, 1_000_000);
  const patterns = getPatterns(db);
  const kpis = getKPIs(db);

  const now = new Date();
  const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sessions = opts.week
    ? allSessions.filter((s) => new Date(s.created_at) >= cutoff)
    : allSessions;

  const dateStr = now.toISOString().split('T')[0] ?? now.toISOString();
  const reportsDir = join(homedir(), '.tokenburn', 'reports');
  mkdirSync(reportsDir, { recursive: true });
  const reportPath = join(reportsDir, `${dateStr}.md`);

  const period = opts.week ? 'Weekly' : 'All-time';
  const lines: string[] = [
    `# TokenBurn ${period} Report — ${dateStr}`,
    '',
    '## Summary',
    '',
  ];

  if (sessions.length === 0) {
    lines.push('No sessions recorded this week.\n');
  } else {
    const totalSent = sessions.reduce((s, r) => s + r.tokens_sent, 0);
    const totalSaved = sessions.reduce((s, r) => s + (r.tokens_sent - r.tokens_optimal), 0);
    const avgSavings = totalSent > 0 ? Math.round((totalSaved / totalSent) * 100) : 0;

    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Sessions | ${sessions.length} |`);
    lines.push(`| Tokens Sent | ${totalSent.toLocaleString()} |`);
    lines.push(`| Tokens Saved | ${totalSaved.toLocaleString()} |`);
    lines.push(`| Avg Savings | ${avgSavings}% |`);
    lines.push('');

    lines.push('## Top Waste Patterns');
    lines.push('');
    for (const p of patterns.slice(0, 5)) {
      lines.push(`- **${p.waste_type}**: ${p.total_tokens.toLocaleString()} tokens across ${p.occurrences} sessions`);
    }
    lines.push('');

    lines.push('## Session Insights');
    lines.push('');
    for (const s of sessions) {
      if (s.insight) {
        lines.push(`**${s.date} — ${s.task}**`);
        lines.push(`> ${s.insight}`);
        lines.push('');
      }
    }
  }

  writeFileSync(reportPath, lines.join('\n'), 'utf-8');
  console.log(chalk.green(`✓ Report written to ${reportPath}`));
}
