## 1. Monorepo Scaffold

- [x] 1.1 Create root `package.json` with npm workspaces config (`packages/*`), root scripts (`dev`, `build`, `test`, `seed`, `link`), and Node ≥ 18 engine field
- [x] 1.2 Create `packages/cli/package.json` with name `@tokenburn/cli`, bin entry `tburn → bin/tburn.js`, TypeScript strict config, and all CLI dependencies (`commander`, `chalk`, `cli-table3`, `inquirer`, `open`, `tiktoken`, `better-sqlite3`, `express`)
- [x] 1.3 Create `packages/dashboard/package.json` with React 18, Vite, TypeScript strict config
- [x] 1.4 Create root `tsconfig.json` and per-package `tsconfig.json` files with `strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`
- [x] 1.5 Create `packages/cli/bin/tburn.js` shebang entry point that imports the compiled CLI main
- [x] 1.6 Create `vitest.config.ts` at repo root configured to run tests in `packages/cli/src/**/*.test.ts`
- [x] 1.7 Create `.github/copilot-instructions/` directory and five preset files: `nextjs.md`, `python-api.md`, `go-service.md`, `nestjs.md`, `rails-api.md` — each under 200 tokens, imperative tense, with NEVER section
- [x] 1.8 Create `templates/` directory with `crud.md`, `auth.md`, `testing.md`, `refactor.md` — each using the TASK/STACK/CONSTRAINTS/OUTPUT/NEVER format

## 2. Shared Types

- [x] 2.1 Create `packages/cli/src/types.ts` defining `Session`, `Pattern`, `WastePattern` (union type of seven pattern IDs), `WasteResult`, `KPIs` — all with strict TypeScript, zero `any`

## 3. Token Estimator

- [x] 3.1 Create `packages/cli/src/estimator/index.ts` with lazy `getEncoder()` factory (caches tiktoken instance after first call)
- [x] 3.2 Implement `estimateTokens(text: string): number` using cl100k_base encoding
- [x] 3.3 Implement `computeSavings(raw: string): { tokensSent: number; tokensOptimal: number; savingsPct: number }` — calls compressor then re-estimates; clamps savingsPct to 0 minimum

## 4. Spec Compressor

- [x] 4.1 Create `packages/cli/src/compressor/index.ts` with `compress(input: string): string` — pure function, no side effects
- [x] 4.2 Implement Rule 1: strip inline comments that restate the variable name (regex on `//` comments)
- [x] 4.3 Implement Rule 2: collapse multi-line description blocks to one structured line
- [x] 4.4 Implement Rule 3: replace verbose CRUD phrases with REST shorthand (`GET /users`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id`)
- [x] 4.5 Implement Rule 4: remove filler phrases (please, make sure to, you should, it is important, note that, keep in mind, remember to, be sure to) — case-insensitive, fix spacing and capitalization after removal
- [x] 4.6 Implement Rule 5: deduplicate repeated constraint lines (`- ` or `* ` prefix), keep first occurrence
- [x] 4.7 Implement Rule 6: replace example blocks with typed signatures when a type signature is present in the same section
- [x] 4.8 Implement Rule 7: collapse consecutive blank lines to a single blank line
- [x] 4.9 Ensure code blocks (``` and ~~~) are skipped by all rules — parse block ranges before applying transformations
- [x] 4.10 Write vitest snapshot tests: `compress.test.ts` with at least 5 fixtures covering filler removal, CRUD shorthand, deduplication, code-block preservation, and combined rules

## 5. Waste Analyzer

- [x] 5.1 Create `packages/cli/src/analyzer/index.ts` with `analyzeWaste(text: string): WasteResult[]`
- [x] 5.2 Implement `redundant_context` detection: noun phrase matching across sections
- [x] 5.3 Implement `verbose_spec_style` detection: average words per non-heading, non-code-block line > 20
- [x] 5.4 Implement `repeated_instructions` detection: same phrase appearing ≥ 2 times across sections
- [x] 5.5 Implement `over_commented_spec` detection: comment lines / total non-blank lines > 0.4
- [x] 5.6 Implement `unnecessary_examples` detection: example block mirrors type signature in same section
- [x] 5.7 Implement `dead_code_in_scope` detection: TODO or commented-out code blocks in referenced files
- [x] 5.8 Implement `off_scope_context` detection: files referenced in context not mentioned by spec
- [x] 5.9 Implement `topWaste(results: WasteResult[], n = 3): WasteResult[]` returning top N by tokensSaved descending
- [x] 5.10 Ensure results returned by `analyzeWaste` are sorted by tokensSaved descending

## 6. Insight Engine

- [x] 6.1 Create `packages/cli/src/analyzer/insight.ts` with `generateInsight(session: Session, history: Session[]): string`
- [x] 6.2 Implement recurring pattern detection: pattern in > 2 of last 10 history sessions → recurring
- [x] 6.3 Implement pattern-to-template map and include template path in recurring insight text
- [x] 6.4 Implement efficiency comparison: compute per-session ratio and compare to history average; include percentage delta in insight
- [x] 6.5 Implement first-session fallback: if history is empty, name the top pattern and explain it without comparison
- [x] 6.6 Ensure no code path returns a generic string — every branch names a specific pattern

## 7. Database Layer

- [x] 7.1 Create `packages/cli/src/recorder/db.ts` with lazy `getDb()` factory using `better-sqlite3`
- [x] 7.2 Implement `initDb(db)`: create sessions and patterns tables if not exist; set `PRAGMA journal_mode=WAL`
- [x] 7.3 Implement `insertSession(db, session: Session): void`
- [x] 7.4 Implement `upsertPattern(db, wasteType: WastePattern, tokensSaved: number): void` — INSERT OR REPLACE with incremented counts
- [x] 7.5 Implement `getSessions(db, limit: number): Session[]` ordered by created_at descending
- [x] 7.6 Implement `getSessionById(db, id: string): Session | null`
- [x] 7.7 Implement `getPatterns(db): Pattern[]` ordered by total_tokens descending
- [x] 7.8 Implement `getKPIs(db): KPIs`
- [x] 7.9 Implement `updateQuality(db, id: string, quality: number): boolean`

## 8. Session Recorder CLI Flow

- [x] 8.1 Create `packages/cli/src/recorder/index.ts` with the `tburn record` interactive flow using inquirer
- [x] 8.2 Prompt for: task description (text), category (list), spec file path (optional file path), quality (1–5)
- [x] 8.3 If spec file provided: run estimator + analyzer + insight engine; display results before saving
- [x] 8.4 Generate session ID via `crypto.randomUUID()`; set `date` to ISO date string; set `created_at` to ISO timestamp
- [x] 8.5 Call `insertSession` and `upsertPattern` for each detected waste pattern

## 9. CLI Commands

- [x] 9.1 Create `packages/cli/src/index.ts` as Commander program entry point; register all commands; do NOT import tiktoken/better-sqlite3 at top level
- [x] 9.2 Implement `analyze <file>` command: read file, run estimator + analyzer + insight, print formatted colored output matching the canonical template
- [x] 9.3 Implement `compress <file>` command with `--output` and `--dry-run` flags
- [x] 9.4 Implement `record` command: delegate to recorder interactive flow
- [x] 9.5 Implement `dashboard [--port]` command: spawn Express server, health-check poll (2 s / 100 ms interval), call `open()`
- [x] 9.6 Implement `patterns [--top]` command: print cli-table3 table from patterns table
- [x] 9.7 Implement `history [--limit]` command: print cli-table3 table from sessions, compute Savings % column
- [x] 9.8 Implement `stats` command: compute and display KPIs with chalk labels; handle empty database
- [x] 9.9 Implement `export --format --output` command: write all session columns to JSON or CSV
- [x] 9.10 Implement `report --week` command: generate Markdown report for past 7 days; write to `~/.tokenburn/reports/YYYY-MM-DD.md`; print file path

## 10. Express API Server

- [x] 10.1 Create `packages/cli/src/server/index.ts` as the Express app factory; configure CORS for localhost
- [x] 10.2 Implement `GET /api/sessions` with `?limit` query param (default 50); parse waste_breakdown JSON
- [x] 10.3 Implement `GET /api/sessions/:id`; return 404 if not found
- [x] 10.4 Implement `GET /api/patterns`
- [x] 10.5 Implement `GET /api/kpis`
- [x] 10.6 Implement `GET /api/templates`: read `templates/*.md`, count tokens per file, return array
- [x] 10.7 Implement `POST /api/sessions/:id/quality`: validate 1–5 range; return 400 on invalid; call updateQuality
- [x] 10.8 Add static file serving for built dashboard bundle from `packages/dashboard/dist`

## 11. Seed Script

- [x] 11.1 Create `scripts/seed.ts` that inserts 20 mock sessions with varied categories, dates, waste patterns, and quality ratings; also seeds patterns table; idempotent (clears existing data before seeding)
- [x] 11.2 Wire `npm run seed` root script to run `ts-node scripts/seed.ts` (or `tsx`)

## 12. Dashboard — Project Setup

- [x] 12.1 Configure `packages/dashboard/vite.config.ts`: proxy `/api/*` to `http://localhost:4242`, set base `./`
- [x] 12.2 Create `packages/dashboard/src/design-tokens.css` with all CSS custom properties from the design system spec
- [x] 12.3 Bundle JetBrains Mono and Syne fonts locally (via npm packages or local font files in `public/fonts/`); reference from CSS
- [x] 12.4 Create `packages/dashboard/index.html` referencing the design tokens CSS and app entry

## 13. Dashboard — Data Layer

- [x] 13.1 Create `packages/dashboard/src/hooks/useSessionData.ts` with generic fetch hook returning `{ data, loading, error }`
- [x] 13.2 Create typed interfaces for `Session`, `Pattern`, `KPIs`, `Template` mirroring API response shapes

## 14. Dashboard — Components

- [x] 14.1 Create `SessionList` component: scrollable list of sessions with date, task, category, savings % chip; highlight selected row
- [x] 14.2 Create `RadialGauge` component: SVG arc animated from 0 to target over 800 ms; color threshold logic (success/warning/danger)
- [x] 14.3 Create `WasteBreakdown` component: horizontal bars for each waste pattern, bars animate width from 0 to final value on mount
- [x] 14.4 Create `SparkLine` component: SVG polyline of efficiency ratio over time, animated path draw on mount
- [x] 14.5 Create `PatternHeatmap` component: grid of category × day-of-week, cell color intensity from `--bg-elevated` to `--danger` based on tokens wasted
- [x] 14.6 Apply fade-in + slide-up animation (300 ms ease-out) to all top-level view components on mount via CSS keyframes

## 15. Dashboard — Views

- [x] 15.1 Create `packages/dashboard/src/views/Sessions.tsx`: split layout with SessionList left, SessionDetail right; fetch sessions on mount; handle no-selection state
- [x] 15.2 Implement SessionDetail: RadialGauge + WasteBreakdown + InsightCard + editable quality stars + metadata (task, category, date)
- [x] 15.3 Create `packages/dashboard/src/views/Patterns.tsx`: PatternHeatmap + SparkLine + top waste WasteBars + biggest-leak card
- [x] 15.4 Create Templates view: fetch GET /api/templates; render list with name, token count, Copy button; show clipboard confirmation on copy
- [x] 15.5 Create `packages/dashboard/src/App.tsx`: tab bar + view router + global design token import

## 16. Quality and Docs

- [x] 16.1 Verify TypeScript strict compilation passes with zero errors across both packages (`tsc --noEmit`)
- [x] 16.2 Run `npm test` and confirm all vitest snapshots pass
- [x] 16.3 Verify `tburn --help` completes in under 200 ms (measure with `time tburn --help`)
- [x] 16.4 Write `README.md` with: install instructions, usage examples for all nine commands, dashboard screenshot placeholder, `~/.tokenburn/` data directory note
