# 0004 — Auth UI (login/register/logout/me)

## Goal
Implement frontend authentication flows for the web app so users can register, log in, view current session, and log out.

## Scope
- Add auth pages/components for register and login.
- Add a minimal session-aware header or panel with current user + logout.
- Wire API calls to the backend auth endpoints.

## Constraints
- Use shared schemas from `packages/shared` for request/response typing where applicable.
- Keep UI minimal but functional; no design system beyond Chakra (already installed).
- Do not add OAuth or forgot password.
- Errors should display the API error message.

## Routes
- `/login`
- `/register`

## API endpoints
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

## Acceptance criteria
- Register flow creates a user and stores session cookie.
- Login flow creates a session cookie.
- Logout clears the session and updates UI.
- `GET /auth/me` drives the session-aware UI state.
- Basic error handling on invalid credentials or validation errors.

## Tests
- Add minimal frontend tests for auth form submission and error handling (if test setup exists).

## Verification
- Manual: register → logout → login → me shows user → logout clears UI
