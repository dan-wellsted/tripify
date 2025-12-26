# 0024 — Itinerary City Chips

## Goal
Let users attach one or more cities to each trip day with a compact UI.

## Scope
- Add a “Cities” row per day with chips.
- “+ Add city” opens a modal with search + multi-select.
- Support ordering/removal of cities per day.
- Use global city library for search results.

## Acceptance criteria
- Day cards show attached city chips.
- Cities can be added via searchable modal.
- City order is preserved per day.

## Completion notes
- Added inline city chips in the day header with reorder/remove.
- Added searchable multi-select modal for cities.
