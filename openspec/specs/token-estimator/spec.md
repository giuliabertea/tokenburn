# token-estimator

## Purpose

Counts tokens in text using tiktoken cl100k_base encoding (approximating the GitHub Copilot tokenizer). Provides lazy-loaded async token estimation and savings computation.

## Requirements

### Requirement: Count tokens in a spec file using cl100k_base encoding
The system SHALL count tokens in any text file using the tiktoken cl100k_base encoding, which approximates the tokenizer used by GitHub Copilot. The estimator SHALL expose a function `estimateTokens(text: string): Promise<number>` that resolves to an exact integer token count. The function is async because the tiktoken WASM binary is lazy-loaded on first call.

#### Scenario: Count tokens in a typical spec file
- **WHEN** the estimator receives a markdown spec string of ~500 words
- **THEN** it returns an integer token count consistent with cl100k_base encoding (within ±1 of the tiktoken reference implementation)

#### Scenario: Count tokens in an empty string
- **WHEN** the estimator receives an empty string
- **THEN** it returns 0

### Requirement: Compute optimal token estimate and savings percentage
The system SHALL compute an "optimal" token estimate by applying the compressor to the input and counting tokens in the compressed output. It SHALL expose a function `computeSavings(raw: string): { tokensSent: number; tokensOptimal: number; savingsPct: number }`.

#### Scenario: Compute savings on a verbose spec
- **WHEN** computeSavings is called on a spec containing at least two detectable waste patterns
- **THEN** tokensOptimal is less than tokensSent, and savingsPct equals Math.round((1 - tokensOptimal / tokensSent) * 100)

#### Scenario: Savings percentage is never negative
- **WHEN** the compressor produces output equal to or longer than the input (e.g. spec is already minimal)
- **THEN** savingsPct is 0 and tokensOptimal equals tokensSent

### Requirement: Lazy-load the tiktoken encoder
The system SHALL initialize the tiktoken WASM binary only on first call to the estimator, not at module import time. Subsequent calls SHALL reuse the cached encoder instance.

#### Scenario: CLI starts without loading tiktoken
- **WHEN** the `tburn` process starts and no estimator function is called
- **THEN** the tiktoken WASM binary is not loaded and startup completes in under 200 ms

#### Scenario: Encoder is initialized exactly once
- **WHEN** estimateTokens is called twice in the same process
- **THEN** the WASM binary is initialized only once (second call reuses the cached instance)
