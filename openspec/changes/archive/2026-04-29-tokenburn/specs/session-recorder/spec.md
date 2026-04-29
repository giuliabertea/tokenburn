## ADDED Requirements

### Requirement: Persist sessions to SQLite at ~/.tokenburn/tokenburn.db
The system SHALL write session records to a SQLite database at `~/.tokenburn/tokenburn.db`. The database SHALL be created automatically on first use with WAL journal mode enabled. The sessions table schema SHALL match exactly:

```sql
CREATE TABLE sessions (
  id                 TEXT PRIMARY KEY,
  date               TEXT NOT NULL,
  task               TEXT NOT NULL,
  category           TEXT NOT NULL,
  tokens_sent        INTEGER NOT NULL,
  tokens_optimal     INTEGER NOT NULL,
  quality            INTEGER,
  prompt_raw         TEXT,
  prompt_compressed  TEXT,
  waste_breakdown    TEXT,
  insight            TEXT,
  created_at         TEXT NOT NULL
);
```

#### Scenario: Database created on first run
- **WHEN** no database file exists at `~/.tokenburn/tokenburn.db` and the recorder is invoked
- **THEN** the file is created, the schema is applied, and WAL mode is enabled

#### Scenario: Session is written with all required fields
- **WHEN** insertSession is called with a valid Session object
- **THEN** a row is written with id, date, task, category, tokens_sent, tokens_optimal, and created_at populated

### Requirement: Persist aggregated pattern data to the patterns table
The system SHALL upsert pattern records each time a session is recorded. The patterns table schema SHALL match exactly:

```sql
CREATE TABLE patterns (
  id           TEXT PRIMARY KEY,
  waste_type   TEXT NOT NULL,
  total_tokens INTEGER NOT NULL,
  occurrences  INTEGER NOT NULL,
  last_seen    TEXT NOT NULL
);
```

Pattern id is `waste_type`. On conflict, total_tokens and occurrences SHALL be incremented and last_seen updated.

#### Scenario: First occurrence of a pattern
- **WHEN** a session is recorded with `verbose_spec_style` detected for the first time
- **THEN** a pattern row is inserted with occurrences === 1

#### Scenario: Subsequent occurrence of a pattern
- **WHEN** a session is recorded with `verbose_spec_style` and the pattern row already exists
- **THEN** the existing row is updated: occurrences incremented by 1, total_tokens incremented, last_seen updated

### Requirement: Expose a lazy-loaded getDb() factory
The system SHALL expose a `getDb()` function that opens the SQLite connection on first call and caches it for subsequent calls within the same process. It SHALL NOT open the database at module import time.

#### Scenario: Database not opened at import
- **WHEN** the session-recorder module is imported but getDb() is not called
- **THEN** no SQLite connection is opened and no file I/O occurs

### Requirement: Support tburn record interactive flow
The system SHALL implement an interactive CLI flow for `tburn record` that prompts the user for: task description, category (list of categories), spec file path (optional), and quality rating (1–5). After gathering input, it SHALL run the estimator and analyzer on the spec (if provided), generate an insight, and write the session.

#### Scenario: Record with spec file provided
- **WHEN** the user runs `tburn record` and provides a spec file path
- **THEN** the system analyzes the spec, shows token counts and top waste, generates an insight, and saves the session

#### Scenario: Record without spec file
- **WHEN** the user runs `tburn record` and skips the spec file prompt
- **THEN** the session is saved with null prompt_raw and null waste_breakdown; tokens_sent and tokens_optimal default to 0

### Requirement: Generate unique session IDs
The system SHALL generate a session ID using `crypto.randomUUID()` (Node.js built-in). No external UUID library is required.

#### Scenario: IDs are unique across sessions
- **WHEN** ten sessions are inserted in sequence
- **THEN** all ten id values are distinct UUID strings
