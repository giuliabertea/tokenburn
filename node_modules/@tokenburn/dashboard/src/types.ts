export type WastePattern =
  | 'redundant_context'
  | 'verbose_spec_style'
  | 'dead_code_in_scope'
  | 'repeated_instructions'
  | 'over_commented_spec'
  | 'unnecessary_examples'
  | 'off_scope_context';

export interface WasteResult {
  pattern: WastePattern;
  tokensSaved: number;
  occurrences: number;
}

export interface Session {
  id: string;
  date: string;
  task: string;
  category: string;
  tokens_sent: number;
  tokens_optimal: number;
  quality: number | null;
  prompt_raw: string | null;
  prompt_compressed: string | null;
  waste_breakdown: WasteResult[] | null;
  insight: string | null;
  created_at: string;
}

export interface Pattern {
  id: string;
  waste_type: WastePattern;
  total_tokens: number;
  occurrences: number;
  last_seen: string;
}

export interface KPIs {
  totalSessions: number;
  totalTokensSent: number;
  totalTokensSaved: number;
  avgSavingsPct: number;
  avgQuality: number;
  topPattern: WastePattern | null;
}

export interface Template {
  name: string;
  content: string;
  tokenCount: number;
}
