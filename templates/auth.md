TASK: Implement user authentication (register + login + protected routes)
STACK: [specify: JWT / session / OAuth + framework]
CONSTRAINTS:
- Hash passwords with bcrypt (cost factor ≥ 12)
- Return short-lived access token (15 min) + refresh token (7 days)
- Protect routes with middleware/guard that validates token signature and expiry
- Invalidate refresh tokens on logout (store in DB or Redis)
- Rate-limit login endpoint (5 attempts per minute per IP)
OUTPUT: Register handler, login handler, refresh handler, logout handler, auth middleware
NEVER:
- Store plaintext passwords or reversibly encoded passwords
- Return the password hash in any response
- Use symmetric JWT secret under 256 bits
