## Domain overview

- **User** owns trips, places, and activities.
- **Trip** represents a travel plan with optional start/end dates.
- **Group** is a shared container for multiple users managing trips together.
- **GroupMember** assigns users to groups with a role.
- **Itinerary** is a one-to-one container for a trip’s days.
- **TripDay** is a dated, ordered day within an itinerary.
- **Place** is a point of interest (POI) owned by a user.
- **City** is a global location library entry (shared across users).
- **Activity** is a user-owned item (tour, booking, note) that can optionally
  reference a Place.

## Day attachments

TripDay content is attached through ordered join tables:

- **TripDayCity**: cities assigned to a day in a stable order.
- **TripDayPlace**: places assigned to a day in a stable order.
- **TripDayActivity**: activities assigned to a day in a stable order.

## Data rules

- Dates are stored in UTC and displayed in the user's timezone.
- Ordering within a day is explicit and stable via `position`.
