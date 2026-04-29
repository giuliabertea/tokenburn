TASK: Implement CRUD REST endpoints for a resource
STACK: [specify: Express/FastAPI/Rails/NestJS + ORM]
CONSTRAINTS:
- GET /resources → paginated list (limit, offset)
- POST /resources → create, return 201 with created object
- GET /resources/:id → single resource or 404
- PUT /resources/:id → full update, return updated object
- DELETE /resources/:id → soft delete, return 204
OUTPUT: Route handlers, input validation, error handling, and database queries for all five endpoints
NEVER:
- Expose internal database IDs in responses if a public slug exists
- Return 200 for creation — always 201
- Allow unvalidated input to reach the database layer
