# waste-analyzer

## Purpose

Detects and quantifies 7 waste patterns in spec text, returning results ranked by token impact.

## Requirements

### Requirement: Detect seven waste patterns in a spec
The system SHALL expose a function `analyzeWaste(text: string): WasteResult[]` where `WasteResult = { pattern: WastePattern; tokensSaved: number; occurrences: number }`. It SHALL detect all seven waste patterns: `redundant_context`, `verbose_spec_style`, `dead_code_in_scope`, `repeated_instructions`, `over_commented_spec`, `unnecessary_examples`, `off_scope_context`.

#### Scenario: Verbose spec style detected
- **WHEN** the spec has an average words-per-instruction above 20
- **THEN** `verbose_spec_style` appears in the result with a non-zero tokensSaved estimate

#### Scenario: Repeated instructions detected
- **WHEN** the same phrase appears 2 or more times across different sections
- **THEN** `repeated_instructions` appears in the result with occurrences ≥ 2

#### Scenario: No waste detected in a minimal spec
- **WHEN** the spec is already minimal (short sentences, no duplicates, no comments)
- **THEN** analyzeWaste returns an empty array or all patterns with tokensSaved === 0

### Requirement: Return results sorted by token impact descending
The system SHALL return WasteResult entries sorted by `tokensSaved` descending so the highest-impact pattern is first.

#### Scenario: Highest-impact pattern is first
- **WHEN** analyzeWaste detects both `verbose_spec_style` (240 tokens) and `redundant_context` (180 tokens)
- **THEN** verbose_spec_style is the first element in the returned array

### Requirement: Detect redundant context
The system SHALL flag `redundant_context` when the same entity (identified by noun phrase matching) is described in two or more distinct sections of the spec. The tokensSaved estimate SHALL be the token count of the duplicate descriptions.

#### Scenario: Same entity in two sections
- **WHEN** "User" entity is described in both a "Context" section and a "Requirements" section
- **THEN** `redundant_context` is detected with occurrences === 2

### Requirement: Detect verbose spec style
The system SHALL flag `verbose_spec_style` when the average word count per instruction line exceeds 20 words. Instruction lines are non-blank lines that are not headings or code blocks.

#### Scenario: Average above threshold
- **WHEN** the spec has 10 instruction lines averaging 25 words each
- **THEN** `verbose_spec_style` is detected

#### Scenario: Average at or below threshold
- **WHEN** all instruction lines have 15 words or fewer
- **THEN** `verbose_spec_style` is not detected

### Requirement: Detect over-commented spec
The system SHALL flag `over_commented_spec` when the ratio of comment lines (lines starting with `//` or `#`) to total non-blank lines exceeds 0.4.

#### Scenario: Comment ratio above threshold
- **WHEN** 5 of 10 non-blank lines are comment lines (ratio 0.5)
- **THEN** `over_commented_spec` is detected

### Requirement: Detect unnecessary examples
The system SHALL flag `unnecessary_examples` when an example block (lines under an "Example:" or "e.g." heading) mirrors the type signature already present in the same section.

#### Scenario: Example mirrors type signature
- **WHEN** a section contains a TypeScript type and an example that is just an instantiation of that type
- **THEN** `unnecessary_examples` is detected

### Requirement: Produce a ranked top-3 waste summary
The system SHALL expose a function `topWaste(results: WasteResult[], n?: number): WasteResult[]` that returns the top N patterns by token impact. Default N is 3.

#### Scenario: Returns top 3 by default
- **WHEN** analyzeWaste returns 5 patterns and topWaste is called with no N argument
- **THEN** the returned array has exactly 3 elements, sorted descending by tokensSaved
