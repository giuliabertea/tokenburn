import type { WastePattern, WasteResult } from '../types.js';

function getSections(text: string): string[] {
  return text.split(/^#+\s/m).filter(Boolean);
}

function getLines(text: string): string[] {
  return text.split('\n');
}

function isCodeBlockLine(line: string, inBlock: boolean): boolean {
  return inBlock || line.trimStart().startsWith('```') || line.trimStart().startsWith('~~~');
}

function getNonCodeNonBlankLines(text: string): string[] {
  const lines = getLines(text);
  const result: string[] = [];
  let inBlock = false;
  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inBlock = !inBlock;
      continue;
    }
    if (!inBlock && line.trim() !== '') result.push(line);
  }
  return result;
}

function estimateTokensSync(text: string): number {
  return Math.ceil(text.length / 4);
}

function detectRedundantContext(text: string): WasteResult | null {
  const sections = getSections(text);
  if (sections.length < 2) return null;

  const entityPattern = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/g;
  const sectionEntities: Set<string>[] = sections.map((s) => {
    const matches = s.match(entityPattern) ?? [];
    return new Set(matches.map((m) => m.toLowerCase()));
  });

  let duplicates = 0;
  const counted = new Set<string>();
  for (let i = 0; i < sectionEntities.length; i++) {
    for (let j = i + 1; j < sectionEntities.length; j++) {
      for (const entity of sectionEntities[i] ?? []) {
        if ((sectionEntities[j] ?? new Set()).has(entity) && !counted.has(entity)) {
          duplicates++;
          counted.add(entity);
        }
      }
    }
  }

  if (duplicates === 0) return null;
  const tokensSaved = duplicates * 15;
  return { pattern: 'redundant_context', tokensSaved, occurrences: duplicates };
}

function detectVerboseSpecStyle(text: string): WasteResult | null {
  const lines = getNonCodeNonBlankLines(text).filter(
    (l) => !l.startsWith('#') && !l.trimStart().startsWith('-') && !l.trimStart().startsWith('*')
  );
  if (lines.length === 0) return null;
  const totalWords = lines.reduce((sum, l) => sum + l.trim().split(/\s+/).length, 0);
  const avg = totalWords / lines.length;
  if (avg <= 20) return null;
  const excessWords = Math.round((avg - 20) * lines.length);
  return { pattern: 'verbose_spec_style', tokensSaved: excessWords, occurrences: lines.length };
}

function detectRepeatedInstructions(text: string): WasteResult | null {
  const sections = getSections(text);
  const phraseCounts = new Map<string, number>();

  for (const section of sections) {
    const lines = getNonCodeNonBlankLines(section);
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.length < 10) continue;
      const words = trimmed.split(/\s+/);
      for (let len = 3; len <= Math.min(6, words.length); len++) {
        for (let start = 0; start <= words.length - len; start++) {
          const phrase = words.slice(start, start + len).join(' ');
          phraseCounts.set(phrase, (phraseCounts.get(phrase) ?? 0) + 1);
        }
      }
    }
  }

  let totalRepeats = 0;
  for (const count of phraseCounts.values()) {
    if (count >= 2) totalRepeats += count - 1;
  }
  if (totalRepeats === 0) return null;
  return { pattern: 'repeated_instructions', tokensSaved: totalRepeats * 5, occurrences: totalRepeats };
}

function detectOverCommentedSpec(text: string): WasteResult | null {
  const lines = text.split('\n').filter((l) => l.trim() !== '');
  const commentLines = lines.filter((l) => {
    const t = l.trimStart();
    return t.startsWith('//') || t.startsWith('#');
  });
  if (lines.length === 0) return null;
  const ratio = commentLines.length / lines.length;
  if (ratio <= 0.4) return null;
  const excess = Math.round((ratio - 0.4) * lines.length);
  return { pattern: 'over_commented_spec', tokensSaved: excess * 8, occurrences: commentLines.length };
}

function detectUnnecessaryExamples(text: string): WasteResult | null {
  const sections = getSections(text);
  let count = 0;
  for (const section of sections) {
    const hasType = /\w+\s*:\s*\w+/.test(section);
    const hasExample = /^(example|e\.g\.)/im.test(section);
    if (hasType && hasExample) count++;
  }
  if (count === 0) return null;
  return { pattern: 'unnecessary_examples', tokensSaved: count * 20, occurrences: count };
}

function detectDeadCodeInScope(text: string): WasteResult | null {
  const todoPattern = /\bTODO\b|\bFIXME\b|\bXXX\b/;
  const commentedCode = /^\s*\/\/\s*(const|let|var|function|class|import|export)/m;
  const matches = (todoPattern.test(text) ? 1 : 0) + (commentedCode.test(text) ? 1 : 0);
  if (matches === 0) return null;
  return { pattern: 'dead_code_in_scope', tokensSaved: matches * 25, occurrences: matches };
}

function detectOffScopeContext(text: string): WasteResult | null {
  const fileRefs = text.match(/`[^`]+\.(ts|js|py|go|rb|json|yaml|yml)`/g) ?? [];
  const uniqueRefs = new Set(fileRefs);
  let offScope = 0;
  for (const ref of uniqueRefs) {
    const baseName = ref.replace(/`/g, '').split('/').pop() ?? '';
    if (!text.includes(baseName.replace(/\.[^.]+$/, ''))) offScope++;
  }
  if (offScope === 0) return null;
  return { pattern: 'off_scope_context', tokensSaved: offScope * 30, occurrences: offScope };
}

export function analyzeWaste(text: string): WasteResult[] {
  const detectors = [
    detectRedundantContext,
    detectVerboseSpecStyle,
    detectRepeatedInstructions,
    detectOverCommentedSpec,
    detectUnnecessaryExamples,
    detectDeadCodeInScope,
    detectOffScopeContext,
  ];

  const results: WasteResult[] = [];
  for (const detect of detectors) {
    const result = detect(text);
    if (result && result.tokensSaved > 0) results.push(result);
  }

  return results.sort((a, b) => b.tokensSaved - a.tokensSaved);
}

export function topWaste(results: WasteResult[], n = 3): WasteResult[] {
  return results.slice(0, n);
}
