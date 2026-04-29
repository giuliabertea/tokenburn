STACK: Go 1.22, chi router, pgx v5, sqlc
CONVENTIONS:
- Define handler functions as http.HandlerFunc; group by resource in separate files
- Use chi middleware for logging, recovery, and auth
- Return errors explicitly; never panic in request handlers
- Write SQL in .sql files; generate typed Go code with sqlc
CODE STYLE:
- Package names: lowercase single word, no underscores
- Error variables: var ErrNotFound = errors.New("not found")
- JSON tags on all exported struct fields
NEVER:
- Use global state or init() for handler-level dependencies; inject via closure or struct
- Ignore returned errors
- Use fmt.Errorf without %w when wrapping errors
