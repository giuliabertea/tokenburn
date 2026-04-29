STACK: NestJS, TypeScript, TypeORM, PostgreSQL
CONVENTIONS:
- One module per domain feature; export only what other modules need
- Use class-validator decorators on all DTOs; enable global ValidationPipe
- Inject dependencies via constructor; never instantiate services manually
- Use @nestjs/config for all environment access; never process.env directly in services
CODE STYLE:
- PascalCase for classes and decorators; camelCase for methods and properties
- Suffix: Controller, Service, Module, Dto, Entity, Guard, Interceptor
- Explicit return types on all public methods
NEVER:
- Put business logic in controllers; keep them thin
- Use any type; use unknown and type-narrow instead
- Catch exceptions in services unless you re-throw a NestJS HttpException
