# 0008 — Deterministic Itinerary Ordering

## Goal
Ensure itinerary/day ordering is deterministic and stable across updates.

## Scope
- Decide ordering strategy (e.g., explicit position or date + sequence).
- Implement ordering fields and update logic.
- Add tests to verify stable ordering.

## Acceptance criteria
- Reordering is deterministic and does not drift.
- API returns items in stable order.
