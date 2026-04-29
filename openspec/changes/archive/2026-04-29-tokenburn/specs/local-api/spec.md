## ADDED Requirements

### Requirement: Serve GET /api/sessions with optional limit
The system SHALL implement `GET /api/sessions?limit=<n>` which returns a JSON array of session objects ordered by created_at descending. The `limit` query parameter defaults to 50. All columns of the sessions table SHALL be returned. `waste_breakdown` SHALL be parsed from JSON string to object before sending.

#### Scenario: Sessions returned with default limit
- **WHEN** GET /api/sessions is called with no query parameters and the database has 100 sessions
- **THEN** a JSON array of 50 sessions is returned, newest first

#### Scenario: Custom limit respected
- **WHEN** GET /api/sessions?limit=10 is called
- **THEN** exactly 10 sessions are returned

### Requirement: Serve GET /api/sessions/:id — single session
The system SHALL implement `GET /api/sessions/:id` which returns a single session object. If no session with the given id exists, the response SHALL be 404 with `{ error: "Not found" }`.

#### Scenario: Session found
- **WHEN** GET /api/sessions/<existing-id> is called
- **THEN** a 200 response with the session object is returned

#### Scenario: Session not found
- **WHEN** GET /api/sessions/<nonexistent-id> is called
- **THEN** a 404 response with `{ error: "Not found" }` is returned

### Requirement: Serve GET /api/patterns — all pattern rows
The system SHALL implement `GET /api/patterns` which returns a JSON array of all pattern rows ordered by total_tokens descending.

#### Scenario: Patterns returned in token-impact order
- **WHEN** GET /api/patterns is called and the database has 3 patterns
- **THEN** a JSON array of 3 patterns is returned, sorted by total_tokens descending

### Requirement: Serve GET /api/kpis — aggregate KPI object
The system SHALL implement `GET /api/kpis` which returns a single JSON object with: `totalSessions`, `totalTokensSent`, `totalTokensSaved`, `avgSavingsPct`, `avgQuality`, `topPattern` (the waste_type of the pattern with the most total_tokens).

#### Scenario: KPIs computed correctly
- **WHEN** GET /api/kpis is called after 3 sessions have been recorded
- **THEN** totalSessions === 3 and avgSavingsPct is the mean of per-session savings percentages

#### Scenario: Empty database
- **WHEN** GET /api/kpis is called on an empty database
- **THEN** all numeric fields are 0 and topPattern is null

### Requirement: Serve GET /api/templates — list template files
The system SHALL implement `GET /api/templates` which reads all `.md` files in the `templates/` directory relative to the CLI package root and returns a JSON array with: `name` (filename without extension), `content` (raw file content), `tokenCount` (estimated token count).

#### Scenario: Templates listed with token counts
- **WHEN** GET /api/templates is called and the templates/ directory has 4 files
- **THEN** a JSON array of 4 objects is returned, each with name, content, and tokenCount

### Requirement: Serve POST /api/sessions/:id/quality — update quality rating
The system SHALL implement `POST /api/sessions/:id/quality` which accepts `{ quality: number }` in the request body and updates the quality column for the specified session. The quality value MUST be an integer between 1 and 5 inclusive. Invalid values SHALL return 400.

#### Scenario: Valid quality rating saved
- **WHEN** POST /api/sessions/<id>/quality with body `{ "quality": 4 }` is called
- **THEN** the session row is updated and a 200 response with `{ success: true }` is returned

#### Scenario: Quality out of range rejected
- **WHEN** POST /api/sessions/<id>/quality with body `{ "quality": 6 }` is called
- **THEN** a 400 response with an error message is returned and the database is not modified

### Requirement: Express server enables CORS for localhost dashboard
The system SHALL configure the Express server with CORS headers permitting requests from `http://localhost:<port>` and `http://127.0.0.1:<port>` to support the Vite dev proxy during development.

#### Scenario: CORS headers present on API response
- **WHEN** the dashboard dev server proxies a request to the Express API
- **THEN** the response includes an `Access-Control-Allow-Origin` header

### Requirement: Express server opens SQLite in WAL mode
The system SHALL open the SQLite database with `PRAGMA journal_mode=WAL` to allow concurrent access from the CLI and the dashboard server without locking errors.

#### Scenario: Concurrent CLI and server access
- **WHEN** the Express server has the database open and `tburn analyze` is run simultaneously
- **THEN** neither process throws a locking error
