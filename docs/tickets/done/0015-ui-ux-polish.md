# 0015 — UI/UX Polish Pass

## Goal
Improve UI clarity and reduce friction across key flows.
Align navigation and flows to the trip-centric dashboard model.

## Scope
- Make `/` a trip dashboard with upcoming trip cards.
- Make trip detail the primary workspace (overview + itinerary + collaborators).
- Remove global libraries from user nav; keep as admin-only.
- Add dashboard layout with trip cards, search, and status pills.
- Review Trips, Itinerary, Places, Cities, Activities pages for consistency.
- Reduce repetitive navigation and improve hierarchy.
- Tidy forms, spacing, and empty states.
- Identify and fix current UX inefficiencies.
- Capture user flows in `docs/ux/user-flows.md`.
- Align navigation so global libraries are admin-only.

## Acceptance criteria
- Clearer page hierarchy and navigation aligned to trip-centric flow.
- Dashboard exists at `/` with trip cards and “Create trip” CTA.
- Trip detail includes itinerary and group management in one context.
- Global libraries are hidden for non-admins.
- Cleaner forms and fewer redundant actions.
- UX issues documented or resolved.
- User flows documented in `docs/ux/user-flows.md`.

## Progress notes
- Dashboard, trip detail, itinerary, and auth UI updated to match Wandr style.
- City chips added to itinerary day headers (see `docs/tickets/done/0024-itinerary-city-chips.md`).

## Completion notes
- Follow-up UX items moved into separate tickets (map, inspiration, admin library, visual direction, memories).
