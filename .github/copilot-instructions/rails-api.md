STACK: Rails 7.1 API mode, Ruby 3.3, PostgreSQL, RSpec
CONVENTIONS:
- Inherit controllers from ApplicationController (API::Base); render JSON only
- Use strong parameters in every controller action that accepts input
- Keep models thin: validations and associations only; business logic in service objects
- Name service objects with a verb: CreateUser, ProcessPayment
CODE STYLE:
- snake_case everywhere; SCREAMING_SNAKE_CASE for constants
- Use symbols for hash keys; avoid string keys in Ruby code
- Raise ActiveRecord::RecordNotFound; rescue in ApplicationController for 404
NEVER:
- Use before_action for complex business logic; keep filters to auth and param prep
- Render HTML or redirect from an API controller
- Skip database-level validations when Rails validations exist
