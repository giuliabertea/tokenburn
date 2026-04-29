## ADDED Requirements

### Requirement: Generate a specific, actionable insight string
The system SHALL expose a function `generateInsight(session: Session, history: Session[]): string` that returns 1–2 sentences. The insight SHALL always name the exact waste pattern and suggest a concrete action. Generic fallback strings (e.g., "Keep writing lean specs") are forbidden.

#### Scenario: Recurring pattern identified
- **WHEN** the session's top waste pattern appears in more than 2 of the last 10 sessions in history
- **THEN** the insight names the pattern and suggests a specific remedy (e.g., referencing the relevant template)

#### Scenario: New pattern not seen before
- **WHEN** the session's top waste pattern has not appeared in any of the last 10 sessions
- **THEN** the insight acknowledges it as a new pattern and explains what it means

#### Scenario: Session is more efficient than personal average
- **WHEN** session.tokens_sent is below the average tokens_sent of the last 10 history entries
- **THEN** the insight notes the improvement and identifies what contributed to it

### Requirement: Detect recurring waste patterns
The system SHALL flag a pattern as "recurring" if it appears in more than 2 of the last 10 sessions in history. The threshold is strictly greater than 2.

#### Scenario: Pattern in 3 of last 10 sessions is recurring
- **WHEN** a waste pattern appears in sessions 1, 4, and 7 of the last 10
- **THEN** generateInsight treats it as recurring and mentions frequency in the output

#### Scenario: Pattern in 2 of last 10 sessions is not recurring
- **WHEN** a waste pattern appears in exactly 2 of the last 10 sessions
- **THEN** generateInsight does not treat it as recurring

### Requirement: Recommend templates for recurring patterns
The system SHALL map each waste pattern to a recommended template file and include the file path in the insight when the pattern is recurring.

Pattern-to-template map:
- `verbose_spec_style` → `templates/auth.md` (or the most relevant template by category)
- `redundant_context` → `templates/crud.md`
- `repeated_instructions` → `templates/refactor.md`
- `over_commented_spec` → `templates/testing.md`
- `unnecessary_examples`, `dead_code_in_scope`, `off_scope_context` → generic template reference

#### Scenario: verbose_spec_style is recurring
- **WHEN** verbose_spec_style is flagged as recurring for an auth-category session
- **THEN** the insight mentions `templates/auth.md` as a reference

### Requirement: Compare session efficiency to personal average
The system SHALL compute the efficiency ratio `session.tokens_optimal / session.tokens_sent` and compare it to the average of the same ratio across the last 10 history sessions. The insight SHALL quantify the difference (e.g., "12% more efficient than your average").

#### Scenario: Session below average efficiency
- **WHEN** session efficiency ratio is 0.60 and personal average is 0.75
- **THEN** insight mentions the session was less efficient than average with a percentage figure

#### Scenario: No history available
- **WHEN** history array is empty
- **THEN** generateInsight returns a first-session message that still names the top pattern and explains it
