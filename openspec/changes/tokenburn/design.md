## Context

Developers using GitHub Copilot agent mode have no visibility into how inefficiently their specs are written. Tokens are burned on redundant context, verbose phrasing, and patterns that Copilot ignores anyway. TokenBurn is a developer-local tool — no cloud, no auth, no SaaS — that sits alongside a developer's workflow and builds a personal coaching loop over time.

The project is greenfield. There is no existing codebase to migrate; constraints are purely about correct architecture choices from day one.

## Goals / Non-Goals

**Goals:**
- CLI that can be invoked on any spec file in under 200 ms (lazy-load heavy deps)
- Deterministic compressor with reproducible output (snapshot-testable)
- SQLite persistence scoped entirely to `~/.tokenburn/` — no shared state
- React dashboard served by a local Express process, consuming the same SQLite file
- Full TypeScript strict mode, zero `any`
- Vitest snapshot tests covering the compressor
- Seed script for 20 mock sessions for dashboard development

**Non-Goals:**
- Cloud sync, authentication, or multi-user support
- Real Copilot API interception (token counts are estimated, not measured)
- LLM-based insight generation (insights are rule-based)
- Cross-platform packaging / auto-update / code signing
- UI library — custom CSS only

## Decisions

### 1. npm workspaces monorepo (not Turborepo, not pnpm)

**Decision:** Use native npm workspaces with two packages: `packages/cli` and `packages/dashboard`.

**Rationale:** The project has exactly two packages with a simple dependency topology (dashboard doesn't import cli at runtime). Turborepo adds caching complexity that isn't needed at this scale. pnpm's isolated `node_modules` would complicate the `tburn link` global dev workflow. npm workspaces keep the toolchain minimal and the `scripts` section in the root `package.json` readable.

**Alternatives considered:** Turborepo — rejected because build caching is overkill for a two-package repo with fast builds. pnpm — rejected because `better-sqlite3` native bindings sometimes misbehave with pnpm's symlinking strategy.

---

### 2. tiktoken for token counting (cl100k_base encoding)

**Decision:** Use the `tiktoken` npm package with `cl100k_base` encoding for all token estimates.

**Rationale:** cl100k_base is the encoding used by GPT-4 and Codex models, which is the closest public proxy for GitHub Copilot's tokenizer. It is deterministic and fast enough for CLI use (< 5 ms for typical specs). The Rust WASM build in the npm package avoids native compilation issues on Windows and Mac.

**Alternatives considered:** Character-based heuristic (tokens ≈ chars / 4) — rejected because it is inaccurate enough to make the "% saved" metric misleading. `gpt-3-encoder` — rejected because it is unmaintained and produces incorrect counts for code.

---

### 3. SQLite via better-sqlite3 (sync API)

**Decision:** Use `better-sqlite3` with its synchronous API for all database operations.

**Rationale:** The CLI is a short-lived process. Async SQLite (e.g., `sql.js`, `node-sqlite3`) adds callback/promise overhead with no benefit in a single-user local tool. The sync API makes the recorder, exporter, and API server code straightforward to reason about and test. `better-sqlite3` is the fastest Node.js SQLite binding and supports WAL mode, which prevents locking when the dashboard Express server and CLI run simultaneously.

**Alternatives considered:** PostgreSQL / MySQL — rejected (requires a running server, defeats "fully offline"). `sql.js` (pure JS) — rejected (no persistent file, everything in-memory unless manually serialized). `node-sqlite3` (async) — rejected (unnecessary complexity, slower).

---

### 4. Lazy-loading tiktoken and better-sqlite3

**Decision:** Both heavy dependencies are imported inside the function bodies where they are first needed, not at the top of the module.

**Rationale:** `tburn` must start in under 200 ms. `tiktoken`'s WASM binary takes ~80 ms to initialize; `better-sqlite3` native bindings take ~30 ms to load. Commands like `tburn help` and `tburn compress --help` must not pay this cost. Dynamic `import()` inside the function ensures the CLI entry point stays fast.

**Trade-off:** Slightly less idiomatic module structure. Mitigated by keeping all lazy-load calls inside dedicated `getDb()` and `getEncoder()` factory functions that cache the result after first call.

---

### 5. Compressor as a pure deterministic function

**Decision:** The compressor is implemented as a pure function `compress(input: string): string` that applies seven rules in a fixed order with no randomness or LLM calls.

**Rationale:** Determinism is required for vitest snapshot testing. The compressor must produce the same output for the same input across Node.js versions and operating systems. Rules are applied as sequential string transformations (regex + replace), not as an AST or ML model.

**Rule order (highest impact first):**
1. Strip inline comments that restate the variable name
2. Collapse multi-line descriptions to one structured line
3. Replace verbose CRUD descriptions with REST shorthand
4. Remove filler phrases (please, make sure to, you should, etc.)
5. Deduplicate repeated constraints across sections
6. Replace example blocks with typed signatures
7. Collapse excessive whitespace

---

### 6. Express as the local API server (not a bundled server or Vite plugin)

**Decision:** A standalone Express process serves the dashboard API on `localhost:4242`. The React Vite dev server proxies `/api/*` to it.

**Rationale:** Separating the API server from the Vite dev server means the same Express binary is used in both dev and production (when `tburn dashboard` spawns it). No special Vite plugin, no mock layer, no divergence between dev and prod API behavior. The Express process reads the live SQLite file, so the dashboard always reflects real data.

**Alternatives considered:** Vite plugin that directly reads SQLite — rejected because it would create a dev-only code path. Electron — rejected (heavyweight, out of scope).

---

### 7. Dashboard design system — custom CSS only, CSS variables

**Decision:** All visual styling uses a single `design-tokens.css` file with CSS custom properties; no UI library, no Tailwind.

**Rationale:** The design system is fully specified (color palette, fonts, spacing). A UI library would fight against custom styling and add bundle weight. CSS variables make theming trivial and keep component styles co-located. The palette is dark-first (`--bg-base: #0d1017`) with a consistent accent color (`--accent: #748ffc`).

---

### 8. Insight engine — rule-based, not LLM

**Decision:** `generateInsight(session, history)` is a deterministic function that compares metrics and returns a templated string. No LLM calls.

**Rationale:** LLM calls would require an API key, add latency, and break the offline constraint. A rule-based engine is faster, testable, and sufficient for the coaching use case. The insight must always name a specific pattern and suggest a concrete action — generic fallback strings are banned.

---

### 9. Monorepo shared types via a lightweight internal package

**Decision:** Shared TypeScript types (session, pattern, KPI shapes) live in `packages/cli/src/types.ts` and are imported by the dashboard via the API response shapes — not via a shared package import at build time.

**Rationale:** Adding a third workspace (`packages/shared`) for types alone adds tooling overhead. The dashboard consumes data over HTTP; it defines its own local TypeScript interfaces that mirror the API response. This is intentionally loose coupling — the dashboard is a UI consumer, not a library consumer.

## Risks / Trade-offs

**[Risk] tiktoken WASM fails to load on some Node.js versions or architectures**
→ Mitigation: Pin `tiktoken` to a known-good version in `package.json`. Add a startup check that falls back to a character-based estimate with a console warning if WASM init throws.

**[Risk] better-sqlite3 native bindings fail to compile on Windows without build tools**
→ Mitigation: Document prerequisite (`npm install --global windows-build-tools` or VS Build Tools) in README. The prebuilt binaries in the `better-sqlite3` package cover Node 18/20/22 on x64 Windows without recompilation.

**[Risk] CLI and dashboard Express server both hold SQLite file open simultaneously**
→ Mitigation: Enable WAL mode (`PRAGMA journal_mode=WAL`) on database open. WAL allows concurrent readers with one writer.

**[Risk] Compressor over-aggressively strips content that looks like filler but is load-bearing**
→ Mitigation: Rules are applied only to comment lines, description blocks, and filler-phrase patterns — never to code blocks or type signatures. Snapshot tests catch regressions. `--dry-run` flag on `tburn compress` lets users preview before writing.

**[Risk] `tburn dashboard` opens a browser tab but the Express server isn't ready yet**
→ Mitigation: Perform a health-check poll (up to 2 s, 100 ms intervals) against `localhost:4242/api/kpis` before calling `open()`.

**[Risk] 30% minimum compression ratio not met on all specs**
→ Mitigation: Acceptance criteria applies to the provided test fixtures (which are written to include at least two detectable waste patterns). Real-world specs may compress less — the UI shows the actual ratio, not a target.

## Migration Plan

This is a greenfield project — no migration required.

**Local dev setup:**
1. `git clone` → `npm install` → `npm run seed` → `npm run dev`
2. `npm run link` links `tburn` globally via `npm link`

**No rollback strategy needed** — all data is local to `~/.tokenburn/`; uninstalling the package leaves user data intact.

## Open Questions

- Should `tburn record` support piping (`cat spec.md | tburn record`) or always prompt interactively? **Decision deferred to implementation** — default to interactive, add stdin detection later.
- Should the `report --week` Markdown report be auto-opened in the browser or written silently? **Decision:** Write silently and print the file path; let the user open it.
