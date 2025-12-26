# 0010 — Groups/Collaboration (foundation)

## Goal
Lay groundwork for shared trips (multi-person trip management such as couples).

## Scope
- Add Group model and Trip membership relations to support multiple managers.
- Update auth/session to support group context later.
- No UI required beyond minimal plumbing.

## Acceptance criteria
- Data model supports multi-user trip management (e.g., couples).
- No breaking changes to existing trip ownership behavior.
