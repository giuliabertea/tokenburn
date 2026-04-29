## ADDED Requirements

### Requirement: tburn analyze <file> — colored token analysis output
The system SHALL implement `tburn analyze <file>` which reads the file, runs the estimator and waste analyzer, generates an insight, and prints a formatted report to stdout. Output SHALL use chalk colors and match the canonical format:

```
TokenBurn · Spec Intelligence
──────────────────────────────
📄 File:        ./spec.md
🔢 Tokens:      820  →  310  (-62%)
🔥 Top waste:   verbose_spec_style   (240t)
                redundant_context    (180t)
                dead_code_in_scope   ( 90t)

💡 Insight: "<insight text>"

Run `tburn compress ./spec.md` to apply fixes.
```

#### Scenario: Analyze a spec with detectable waste
- **WHEN** `tburn analyze ./spec.md` is run on a file with verbose style and redundant context
- **THEN** stdout contains token counts, top 3 waste patterns with token values, and a non-generic insight

#### Scenario: File not found
- **WHEN** `tburn analyze ./nonexistent.md` is run
- **THEN** the process exits with code 1 and prints an error message to stderr

### Requirement: tburn compress <file> — write compressed output
The system SHALL implement `tburn compress <file>` which applies the compressor and writes the result. With `--output <path>` the result is written to the specified path; without it, the result overwrites the source file after confirmation. A `--dry-run` flag SHALL print the compressed output to stdout without writing any file.

#### Scenario: Compress with --output flag
- **WHEN** `tburn compress ./spec.md --output ./spec.min.md` is run
- **THEN** `./spec.min.md` is created with compressed content and token savings are printed

#### Scenario: Compress with --dry-run
- **WHEN** `tburn compress ./spec.md --dry-run` is run
- **THEN** compressed content is printed to stdout and no files are written

### Requirement: tburn dashboard [--port <n>] — start server and open browser
The system SHALL implement `tburn dashboard` which starts the Express API server, serves the built dashboard bundle, health-checks the server (up to 2 s), then calls `open()` to open the browser. Default port is 4242. `--port` overrides the default.

#### Scenario: Dashboard starts and opens browser
- **WHEN** `tburn dashboard` is run
- **THEN** the Express server starts, health check passes, and the default browser opens `http://localhost:4242`

#### Scenario: Port override
- **WHEN** `tburn dashboard --port 3000` is run
- **THEN** the server listens on port 3000 and the browser opens `http://localhost:3000`

### Requirement: tburn patterns [--top <n>] — display pattern summary table
The system SHALL implement `tburn patterns` which reads the patterns table and prints a cli-table3 table with columns: Waste Type, Total Tokens, Occurrences, Last Seen. `--top <n>` limits to top N rows by total_tokens. Default is 5.

#### Scenario: Patterns displayed in table format
- **WHEN** `tburn patterns` is run and the database has 3 pattern rows
- **THEN** a formatted table with all 3 rows is printed to stdout

### Requirement: tburn history [--limit <n>] — display session history table
The system SHALL implement `tburn history` which reads sessions ordered by created_at descending and prints a cli-table3 table with columns: Date, Task, Category, Tokens Sent, Savings %, Quality. `--limit <n>` controls row count. Default is 20.

#### Scenario: History displayed newest first
- **WHEN** `tburn history --limit 5` is run
- **THEN** the 5 most recent sessions are shown with Savings % computed from tokens_sent and tokens_optimal

### Requirement: tburn stats — formatted KPI summary
The system SHALL implement `tburn stats` which computes and displays: total sessions, total tokens sent, total tokens saved, average savings %, average quality rating, and most frequent waste pattern. Output SHALL use chalk with clear labels.

#### Scenario: Stats with no sessions
- **WHEN** `tburn stats` is run on an empty database
- **THEN** the output shows zeroes and a message that no sessions have been recorded

### Requirement: tburn export --format <json|csv> --output <file>
The system SHALL implement `tburn export` which exports all sessions to the specified file in JSON or CSV format. All columns of the sessions table SHALL be included. The `--format` and `--output` flags are both required.

#### Scenario: Export to CSV
- **WHEN** `tburn export --format csv --output ./export.csv` is run
- **THEN** a valid CSV file is written with a header row and one row per session, with all columns present

#### Scenario: Export to JSON
- **WHEN** `tburn export --format json --output ./export.json` is run
- **THEN** a valid JSON array is written where each element is a session object with all fields

### Requirement: tburn report --week — generate Markdown coaching report
The system SHALL implement `tburn report --week` which generates a Markdown coaching report for the past 7 days. The report SHALL include: summary stats, top waste patterns for the week, efficiency trend, and per-session insights. The file SHALL be written to `~/.tokenburn/reports/YYYY-MM-DD.md` and the path printed to stdout.

#### Scenario: Weekly report generated
- **WHEN** `tburn report --week` is run and there are sessions in the past 7 days
- **THEN** a Markdown file is written to `~/.tokenburn/reports/` with the current date in the filename

#### Scenario: No sessions in past week
- **WHEN** `tburn report --week` is run and no sessions exist in the past 7 days
- **THEN** the report is still written with a "No sessions recorded this week" message

### Requirement: CLI startup under 200 ms
The system SHALL not import tiktoken or better-sqlite3 at the top level. All commands SHALL lazy-load these dependencies only when the command actually executes.

#### Scenario: tburn --help completes in under 200 ms
- **WHEN** `tburn --help` is run
- **THEN** the process exits in under 200 ms (measured from process start to exit)
