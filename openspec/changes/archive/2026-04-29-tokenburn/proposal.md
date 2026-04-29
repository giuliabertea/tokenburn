## Why

Developer prompt engineering is invisible — there is no feedback loop between how you write specs for Copilot and how many tokens you burn doing it. TokenBurn makes waste visible and teachable by intercepting Copilot sessions, quantifying inefficiency, and coaching developers toward leaner specs over time.

## What Changes

- Introduce a new monorepo (`tokenburn/`) with two workspaces: `packages/cli` and `packages/dashboard`
- Add a `tburn` CLI with commands: `analyze`, `compress`, `record`, `dashboard`, `patterns`, `history`, `stats`, `export`, `report`
- Implement a token estimator using tiktoken (cl100k_base) and a deterministic spec compressor with seven ordered rules
- Detect seven waste patterns in specs: redundant context, verbose style, dead code in scope, repeated instructions, over-commented specs, unnecessary examples, off-scope context
- Persist sessions and patterns in a local SQLite database at `~/.tokenburn/`
- Serve a React 18 + Vite dashboard on `localhost:4242` with Sessions, Patterns, and Templates tabs
- Ship five Copilot instruction presets (`.github/copilot-instructions/`) and four task templates (`templates/`)
- Expose a local Express API (`/api/sessions`, `/api/patterns`, `/api/kpis`, `/api/templates`) consumed only by the dashboard

## Capabilities

### New Capabilities

- `token-estimator`: Count tokens in a spec file using tiktoken cl100k_base; compute optimal token estimate and savings percentage
- `spec-compressor`: Apply seven deterministic compression rules to a spec and output a leaner version; vitest snapshot-tested
- `waste-analyzer`: Detect and score the seven waste patterns in a spec; produce a ranked breakdown with token counts per pattern
- `insight-engine`: Generate a 1–2 sentence, pattern-specific coaching insight by comparing a session against personal history
- `session-recorder`: Persist analyzed sessions and aggregated pattern data to SQLite; support `tburn record` interactive flow
- `cli-commands`: Implement all nine `tburn` commands with colored terminal output, formatted tables, and Markdown report generation
- `local-api`: Express server exposing six REST endpoints consumed by the dashboard; GET and POST routes over SQLite
- `dashboard-ui`: React 18 + Vite SPA with Sessions, Patterns, and Templates tabs; custom CSS design system; animated components; fully offline

### Modified Capabilities

<!-- No existing specs — this is a greenfield project -->

## Impact

- **New dependencies**: `tiktoken`, `better-sqlite3`, `commander`, `chalk`, `cli-table3`, `inquirer`, `open`, `express`, `react`, `vite`, `vitest`
- **Data layer**: All data stored locally under `~/.tokenburn/`; zero cloud, zero auth
- **CLI startup**: Must stay under 200 ms — tiktoken and better-sqlite3 are lazy-loaded
- **No external APIs**: Dashboard is fully offline; no telemetry
- **Node.js ≥ 18** required (native fetch, ESM support)
