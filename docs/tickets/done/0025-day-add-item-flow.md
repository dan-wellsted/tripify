# 0025 — Day Add Item Flow

## Goal
Make adding places/activities/notes to a trip day fast and intuitive.

## Scope
- Add a single “Add item” button per day.
- Modal with quick input + toggle (Place / Activity / Note).
- Optional time + notes fields.
- Optional “Save to library” for places/activities.
- Default to speed-first flow; allow expanded structure.

## Acceptance criteria
- Users can add a place, activity, or note from one modal.
- Activity can optionally link to a place.
- Quick path is one primary input + save.

## Completion notes
- Added single “Add item” modal with Activity/Place/Note modes.
- Activity mode supports type + start/end time + optional place link.
- Place mode creates and attaches a place; notes supported.
