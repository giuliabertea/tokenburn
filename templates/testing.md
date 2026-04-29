TASK: Write unit and integration tests for [module/feature]
STACK: [specify: Jest/Vitest/RSpec/Pytest + assertion library]
CONSTRAINTS:
- Unit tests: pure functions and isolated business logic, no I/O
- Integration tests: test the full request-response cycle with a real (test) database
- Each test has one assertion per behavior; group related assertions with describe/context
- Use factories or fixtures for test data; no hardcoded magic values
- Aim for ≥ 80% branch coverage on the module under test
OUTPUT: Test files mirroring the source structure, covering happy path, edge cases, and error paths
NEVER:
- Mock the database in integration tests
- Write tests that depend on execution order
- Leave skipped or pending tests in the committed test suite
