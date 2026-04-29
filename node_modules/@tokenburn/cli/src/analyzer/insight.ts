import type { Session, WastePattern } from '../types.js';

const PATTERN_TO_TEMPLATE: Record<WastePattern, string> = {
  verbose_spec_style: 'templates/auth.md',
  redundant_context: 'templates/crud.md',
  repeated_instructions: 'templates/refactor.md',
  over_commented_spec: 'templates/testing.md',
  unnecessary_examples: 'templates/crud.md',
  dead_code_in_scope: 'templates/refactor.md',
  off_scope_context: 'templates/crud.md',
};

const PATTERN_EXPLANATIONS: Record<WastePattern, string> = {
  verbose_spec_style: 'instructions averaging over 20 words each — Copilot processes, but doesn\'t benefit from, the extra words',
  redundant_context: 'the same entity described in multiple sections — Copilot sees the same info twice and you pay for it twice',
  repeated_instructions: 'phrases repeated across sections — consolidate into a single constraint list',
  over_commented_spec: 'comment-to-instruction ratio over 40% — strip explanatory comments and let the type signatures speak',
  unnecessary_examples: 'example blocks that mirror type signatures already present in the same section',
  dead_code_in_scope: 'TODO markers or commented-out code in referenced files — Copilot reads these as context',
  off_scope_context: 'files referenced in context that the spec never actually mentions',
};

function getTopPattern(session: Session): WastePattern | null {
  if (!session.waste_breakdown || session.waste_breakdown.length === 0) return null;
  return session.waste_breakdown[0]?.pattern ?? null;
}

function countRecurring(pattern: WastePattern, history: Session[]): number {
  return history.slice(0, 10).filter((s) => {
    if (!s.waste_breakdown) return false;
    return s.waste_breakdown.some((w) => w.pattern === pattern);
  }).length;
}

function efficiencyRatio(session: Session): number {
  if (session.tokens_sent === 0) return 1;
  return session.tokens_optimal / session.tokens_sent;
}

function avgEfficiencyRatio(history: Session[]): number {
  const recent = history.slice(0, 10).filter((s) => s.tokens_sent > 0);
  if (recent.length === 0) return 0;
  return recent.reduce((sum, s) => sum + efficiencyRatio(s), 0) / recent.length;
}

export function generateInsight(session: Session, history: Session[]): string {
  const topPattern = getTopPattern(session);

  if (history.length === 0) {
    if (!topPattern) {
      return 'First session recorded. Start tracking your specs to build a personal efficiency baseline.';
    }
    const explanation = PATTERN_EXPLANATIONS[topPattern];
    return `First session recorded — top pattern detected: "${topPattern}" (${explanation}). Run \`tburn compress\` on your spec to see a leaner version.`;
  }

  if (!topPattern) {
    const avgRatio = avgEfficiencyRatio(history);
    const currentRatio = efficiencyRatio(session);
    const pctDiff = Math.round(Math.abs(currentRatio - avgRatio) * 100);
    if (currentRatio <= avgRatio) {
      return `This spec is ${pctDiff}% less efficient than your average — no dominant waste pattern detected, but overall verbosity is high. Tighten instruction lines to under 20 words each.`;
    }
    return `No waste detected — this spec is ${pctDiff}% more efficient than your average. Keep this structure as a reference for future sessions.`;
  }

  const occurrences = countRecurring(topPattern, history);
  const isRecurring = occurrences > 2;
  const template = PATTERN_TO_TEMPLATE[topPattern];
  const avgRatio = avgEfficiencyRatio(history);
  const currentRatio = efficiencyRatio(session);
  const pctDiff = Math.round(Math.abs(currentRatio - avgRatio) * 100);
  const efficiencyNote = currentRatio < avgRatio
    ? `${pctDiff}% less efficient than your average`
    : `${pctDiff}% more efficient than your average`;

  if (isRecurring) {
    return `"${topPattern}" is your recurring pattern — present in ${occurrences} of your last ${Math.min(history.length, 10)} sessions (${efficiencyNote}). Use \`${template}\` as your starting point to avoid this pattern.`;
  }

  const explanation = PATTERN_EXPLANATIONS[topPattern];
  return `Top waste: "${topPattern}" — ${explanation} (${efficiencyNote}). This is the 2nd time you've hit this pattern; if it recurs, switch to \`${template}\`.`;
}
