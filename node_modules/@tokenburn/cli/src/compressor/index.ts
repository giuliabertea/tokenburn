const FILLER_PATTERNS = [
  /\bplease\b[,]?\s*/gi,
  /\bmake sure to\b\s*/gi,
  /\byou should\b\s*/gi,
  /\bit is important\b\s*(that\s*)?/gi,
  /\bnote that\b\s*/gi,
  /\bkeep in mind\b\s*(that\s*)?/gi,
  /\bremember to\b\s*/gi,
  /\bbe sure to\b\s*/gi,
];

const CRUD_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b(get|fetch|retrieve|list)\s+all\s+(\w+)\b/gi, 'GET /$2'],
  [/\b(create|add)\s+(a\s+)?new\s+(\w+)\b/gi, 'POST /$3'],
  [/\b(update|edit|modify)\s+(\w+)\s+by\s+(id|ID|identifier)\b/gi, 'PUT /$2/:id'],
  [/\b(delete|remove)\s+(\w+)\s+by\s+(id|ID|identifier)\b/gi, 'DELETE /$2/:id'],
  [/\b(delete|remove)\s+(a\s+)?(\w+)\b/gi, 'DELETE /$3/:id'],
  [/\b(update|edit|modify)\s+(a\s+)?(\w+)\b/gi, 'PUT /$3/:id'],
];

function getCodeBlockRanges(lines: string[]): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let inBlock = false;
  let blockStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (!inBlock && (line.trimStart().startsWith('```') || line.trimStart().startsWith('~~~'))) {
      inBlock = true;
      blockStart = i;
    } else if (inBlock && (line.trimStart().startsWith('```') || line.trimStart().startsWith('~~~'))) {
      ranges.push([blockStart, i]);
      inBlock = false;
    }
  }
  return ranges;
}

function isInCodeBlock(lineIndex: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([start, end]) => lineIndex >= start && lineIndex <= end);
}

function rule1StripRedundantComments(lines: string[], ranges: Array<[number, number]>): string[] {
  return lines.map((line, i) => {
    if (isInCodeBlock(i, ranges)) return line;
    return line.replace(/\/\/\s*\w+\s*$/g, (match) => {
      const comment = match.replace(/^\/\/\s*/, '').trim().toLowerCase();
      const varMatch = line.match(/(?:const|let|var|=)\s+(\w+)/i);
      if (varMatch) {
        const varName = (varMatch[1] ?? '').toLowerCase().replace(/_/g, '');
        const commentNorm = comment.replace(/[\s_]/g, '');
        if (varName === commentNorm || commentNorm.includes(varName)) return '';
      }
      return match;
    });
  });
}

function rule2CollapseMultiLineDescriptions(lines: string[], ranges: Array<[number, number]>): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (isInCodeBlock(i, ranges) || line.startsWith('#') || line.trimStart().startsWith('-') || line.trimStart().startsWith('*')) {
      result.push(line);
      i++;
      continue;
    }
    if (line.trim() === '') {
      result.push(line);
      i++;
      continue;
    }
    let collected = line.trimEnd();
    while (
      i + 1 < lines.length &&
      (lines[i + 1] ?? '').trim() !== '' &&
      !(lines[i + 1] ?? '').startsWith('#') &&
      !(lines[i + 1] ?? '').trimStart().startsWith('-') &&
      !(lines[i + 1] ?? '').trimStart().startsWith('*') &&
      !isInCodeBlock(i + 1, ranges)
    ) {
      i++;
      const next = (lines[i] ?? '').trim();
      if (next.length > 0) collected += ' ' + next;
    }
    result.push(collected);
    i++;
  }
  return result;
}

function rule3CrudShorthand(lines: string[], ranges: Array<[number, number]>): string[] {
  return lines.map((line, i) => {
    if (isInCodeBlock(i, ranges)) return line;
    let out = line;
    for (const [pattern, replacement] of CRUD_REPLACEMENTS) {
      out = out.replace(pattern, replacement);
    }
    return out;
  });
}

function rule4RemoveFiller(lines: string[], ranges: Array<[number, number]>): string[] {
  return lines.map((line, i) => {
    if (isInCodeBlock(i, ranges)) return line;
    let out = line;
    for (const pattern of FILLER_PATTERNS) {
      out = out.replace(pattern, '');
    }
    out = out.replace(/  +/g, ' ').trimEnd();
    if (out.length > 0 && line.length > 0 && /^[a-z]/.test(out) && /^[A-Z]/.test(line)) {
      out = out.charAt(0).toUpperCase() + out.slice(1);
    }
    return out;
  });
}

function rule5DeduplicateConstraints(lines: string[], ranges: Array<[number, number]>): string[] {
  const seen = new Set<string>();
  return lines.map((line, i) => {
    if (isInCodeBlock(i, ranges)) return line;
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (seen.has(trimmed)) return null as unknown as string;
      seen.add(trimmed);
    }
    return line;
  }).filter((line): line is string => line !== null);
}

function rule6ReplaceExamplesWithSignatures(lines: string[], ranges: Array<[number, number]>): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const isExampleHeading = /^#+\s*(example|e\.g\.)/i.test(line.trim()) ||
      /^[-*]\s*(example|e\.g\.)/i.test(line.trim());

    if (isExampleHeading && !isInCodeBlock(i, ranges)) {
      let j = i + 1;
      let exampleContent = '';
      while (j < lines.length && (lines[j] ?? '').trim() !== '' && !isInCodeBlock(j, ranges)) {
        exampleContent += (lines[j] ?? '') + '\n';
        j++;
      }
      const hasTypeSignature = exampleContent.includes(':') &&
        /\w+\s*:\s*\w+/.test(exampleContent);
      if (hasTypeSignature) {
        i = j;
        continue;
      }
    }
    result.push(line);
    i++;
  }
  return result;
}

function rule7CollapseBlankLines(lines: string[]): string[] {
  const result: string[] = [];
  let prevBlank = false;
  for (const line of lines) {
    const isBlank = line.trim() === '';
    if (isBlank && prevBlank) continue;
    result.push(line);
    prevBlank = isBlank;
  }
  return result;
}

export function compress(input: string): string {
  let lines = input.split('\n');
  const ranges = getCodeBlockRanges(lines);

  lines = rule1StripRedundantComments(lines, ranges);
  lines = rule2CollapseMultiLineDescriptions(lines, ranges);
  const ranges2 = getCodeBlockRanges(lines);
  lines = rule3CrudShorthand(lines, ranges2);
  lines = rule4RemoveFiller(lines, ranges2);
  lines = rule5DeduplicateConstraints(lines, ranges2);
  lines = rule6ReplaceExamplesWithSignatures(lines, ranges2);
  lines = rule7CollapseBlankLines(lines);

  return lines.join('\n');
}
