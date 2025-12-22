# 0009 — Timezone Display Handling

## Goal
Standardize UTC storage and user-timezone display on the frontend.

## Scope
- Add shared helpers for date parsing/formatting.
- Ensure API payloads remain ISO strings in UTC.
- Wire UI to display dates in user timezone.

## Acceptance criteria
- Dates are stored as UTC in DB and API.
- Frontend displays in local timezone consistently.
