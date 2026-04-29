## ADDED Requirements

### Requirement: Apply seven compression rules in fixed order
The system SHALL expose a pure function `compress(input: string): string` that applies seven rules sequentially to produce a leaner version of the input. Rules MUST be applied in the following order: (1) strip inline comments restating the variable name, (2) collapse multi-line descriptions to one structured line, (3) replace verbose CRUD descriptions with REST shorthand, (4) remove filler phrases, (5) deduplicate repeated constraints, (6) replace example blocks with typed signatures, (7) collapse excessive whitespace.

#### Scenario: Compress a spec with all seven waste types present
- **WHEN** compress is called on a spec containing all seven waste types
- **THEN** the output is shorter than the input and each rule has been applied at least once

#### Scenario: Rules are applied in the correct order
- **WHEN** a spec contains both filler phrases and redundant comments
- **THEN** comments are stripped before filler phrases are removed (rule 1 before rule 4)

### Requirement: Compressor output is deterministic
The system SHALL produce identical output for identical input across any number of invocations, Node.js versions, and operating systems. No randomness or LLM calls are permitted inside the compressor.

#### Scenario: Same input always produces same output
- **WHEN** compress is called ten times with the same input string
- **THEN** all ten return values are strictly equal (===)

#### Scenario: Vitest snapshot test captures compressor output
- **WHEN** the vitest snapshot suite runs
- **THEN** all snapshot assertions pass without diff (output matches stored snapshots)

### Requirement: Remove filler phrases
The system SHALL remove the following phrases from spec text (case-insensitive): "please", "make sure to", "you should", "it is important", "note that", "keep in mind", "remember to", "be sure to". Removal SHALL not leave double spaces or broken punctuation.

#### Scenario: Filler phrase at start of sentence
- **WHEN** a sentence begins with "Please make sure to validate the input"
- **THEN** the output is "Validate the input" with correct capitalization

#### Scenario: Filler phrase in the middle of a sentence
- **WHEN** a sentence contains "it is important that you validate"
- **THEN** the filler is removed and the surrounding words are joined cleanly

### Requirement: Replace verbose CRUD descriptions with REST shorthand
The system SHALL replace common verbose CRUD descriptions with REST shorthand equivalents. Examples: "create a new user" → `POST /users`, "get all users" or "list users" → `GET /users`, "update user by id" → `PUT /users/:id`, "delete user" → `DELETE /users/:id`.

#### Scenario: Verbose list description replaced
- **WHEN** the spec contains the phrase "get all users" in a description block
- **THEN** the output contains `GET /users` in place of the verbose phrase

### Requirement: Deduplicate repeated constraints across sections
The system SHALL detect constraint lines (lines beginning with `-` or `*`) that appear two or more times verbatim across different sections and retain only the first occurrence.

#### Scenario: Duplicate constraint removed
- **WHEN** the spec contains "- Validate input" in two different sections
- **THEN** the output contains "- Validate input" exactly once

### Requirement: Achieve at least 30% token reduction on canonical test fixtures
The system SHALL reduce token count by at least 30% when compress is applied to the test fixtures provided with the project (which are authored to contain detectable waste patterns).

#### Scenario: 30% reduction on auth.md fixture
- **WHEN** compress is applied to the `templates/auth.md` test fixture (verbose version)
- **THEN** the token count of the output is at most 70% of the token count of the input

### Requirement: Preserve code blocks and type signatures unchanged
The system SHALL not modify the content inside fenced code blocks (``` or ~~~) or TypeScript type signatures when applying any compression rule.

#### Scenario: Code block content preserved
- **WHEN** the spec contains a fenced code block with TypeScript code
- **THEN** the code block content is identical in the compressed output
