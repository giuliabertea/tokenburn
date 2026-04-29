STACK: Python 3.12, FastAPI, SQLAlchemy 2, Pydantic v2
CONVENTIONS:
- Define request/response schemas as Pydantic BaseModel subclasses
- Use async def for all route handlers; sync only for CPU-bound tasks
- Place database models in models/, schemas in schemas/, routers in routers/
- Validate all inputs at the Pydantic layer; never validate manually in route handlers
CODE STYLE:
- Type-annotate every function signature including return types
- Use snake_case for all identifiers
- Raise HTTPException with explicit status_code and detail
NEVER:
- Use mutable default arguments in function signatures
- Commit secrets or connection strings; use pydantic-settings with .env files
- Return raw ORM objects from routes; always serialize through a response schema
