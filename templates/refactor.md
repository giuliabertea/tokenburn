TASK: Refactor [module/function] for clarity and maintainability
STACK: [specify: language + framework]
CONSTRAINTS:
- Preserve all existing public interfaces and return types
- Extract repeated logic into named helper functions (DRY)
- Replace magic numbers and strings with named constants
- Reduce cyclomatic complexity: max 10 per function
- All existing tests must pass after refactor; add tests for any new helpers
OUTPUT: Refactored source file(s) with the same exported API; updated or new tests
NEVER:
- Change observable behavior while refactoring
- Introduce new dependencies during a refactor PR
- Leave TODO comments in production code
