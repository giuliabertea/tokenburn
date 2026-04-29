# TokenBurn · Spec Intelligence

> Intercept GitHub Copilot agent sessions, estimate token usage, detect waste patterns in specs, and coach you toward leaner prompts over time.

## Install

```bash
git clone <repo>
cd tokenburn
npm install
npm run build
npm run link   # links `tburn` globally
```

**Requirements:** Node.js ≥ 18

## Commands

### `tburn analyze <file>`
Analyze a spec for token waste. Prints token counts, top 3 waste patterns, and a personalized insight.

```
TokenBurn · Spec Intelligence
──────────────────────────────
📄 File:        ./spec.md
🔢 Tokens:      820  →  310  (-62%)
🔥 Top waste:   verbose_spec_style   (240t)
                redundant_context    (180t)
                dead_code_in_scope   ( 90t)

💡 Insight: "verbose_spec_style" is your recurring pattern…
```

### `tburn compress <file>`
Apply 7 deterministic compression rules to produce a leaner spec.

```bash
tburn compress ./spec.md --output ./spec.min.md
tburn compress ./spec.md --dry-run   # preview without writing
```

### `tburn record`
Interactively record a Copilot session. Prompts for task, category, spec file, and quality rating.

### `tburn dashboard [--port 4242]`
Start the local analytics dashboard and open it in your browser.

```bash
tburn dashboard
tburn dashboard --port 3000
```

### `tburn patterns [--top 5]`
Show a table of your top waste patterns by total tokens burned.

### `tburn history [--limit 20]`
Show recent session history with savings % per session.

### `tburn stats`
Display aggregate KPIs: total sessions, tokens sent, tokens saved, average savings %, top pattern.

### `tburn export --format <json|csv> --output <file>`
Export all sessions to JSON or CSV.

```bash
tburn export --format csv --output sessions.csv
tburn export --format json --output sessions.json
```

### `tburn report --week`
Generate a Markdown coaching report for the past 7 days. Written to `~/.tokenburn/reports/YYYY-MM-DD.md`.

## Dashboard

```bash
npm run seed     # populate 20 mock sessions
tburn dashboard  # opens http://localhost:4242
```

**Sessions tab** — clickable session list with animated RadialGauge, WasteBars, and insight card.

**Patterns tab** — category × day heatmap, efficiency sparkline, biggest leak card.

**Templates tab** — lean spec templates with one-click copy.

_[Dashboard screenshot placeholder]_

## Data Directory

All data is stored locally at `~/.tokenburn/`:

```
~/.tokenburn/
├── tokenburn.db        # SQLite database
└── reports/            # Weekly Markdown reports
```

No cloud, no auth, no telemetry.

## Development

```bash
npm run dev          # CLI dev mode + dashboard dev mode (concurrently)
npm run dev:cli      # CLI only with hot reload
npm run dev:dashboard # Vite dev server only
npm test             # run vitest (compressor snapshots)
npm run seed         # seed 20 mock sessions
```

## Templates

Lean spec templates live in [`templates/`](templates/):
- `crud.md` — REST CRUD endpoints
- `auth.md` — user authentication (register + login)
- `testing.md` — unit + integration tests
- `refactor.md` — safe refactoring with interface preservation

## Copilot Instructions

Stack-specific Copilot instruction presets live in [`.github/copilot-instructions/`](.github/copilot-instructions/):
- `nextjs.md` — Next.js 14 App Router
- `python-api.md` — FastAPI + Pydantic v2
- `go-service.md` — Go + chi router
- `nestjs.md` — NestJS + TypeORM
- `rails-api.md` — Rails 7 API mode
