# 0001 — Auth Sessions (Cookie-Based)

## Status
Accepted

## Context
We need email/password authentication for the API with session handling for the web app.
The system is a web-first experience with a future mobile client.

## Decision
Use cookie-based sessions (server-side sessions) for the initial auth implementation.
Sessions store the user id, and the API issues an HttpOnly cookie.

## Rationale
- Simple integration with the web app.
- Server can invalidate sessions immediately.
- Avoids storing long-lived tokens in browser storage.

## Consequences
- Requires CSRF considerations for state-changing endpoints.
- For mobile or third-party clients, we may later add a token-based flow.
