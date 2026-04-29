import type { Tiktoken } from 'tiktoken';

let _encoder: Tiktoken | null = null;

async function getEncoder(): Promise<Tiktoken> {
  if (_encoder) return _encoder;
  const { get_encoding } = await import('tiktoken');
  _encoder = get_encoding('cl100k_base');
  return _encoder;
}

export async function estimateTokens(text: string): Promise<number> {
  const enc = await getEncoder();
  return enc.encode(text).length;
}

export async function computeSavings(raw: string): Promise<{
  tokensSent: number;
  tokensOptimal: number;
  savingsPct: number;
}> {
  const { compress } = await import('../compressor/index.js');
  const compressed = compress(raw);
  const [tokensSent, tokensOptimal] = await Promise.all([
    estimateTokens(raw),
    estimateTokens(compressed),
  ]);
  const savingsPct = Math.max(
    0,
    Math.round((1 - tokensOptimal / tokensSent) * 100)
  );
  return { tokensSent, tokensOptimal, savingsPct };
}
