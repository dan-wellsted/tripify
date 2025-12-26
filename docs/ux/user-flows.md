# User Flows

Use this doc to capture UX discussion flows before changing UI.

## Current flows

### Sign up + create trip
- Visit `/` landing page.
- Navigate to register and create an account.
- Arrive on trips list and create a trip with optional dates.
- Open the trip detail to confirm summary.
- Jump into itinerary if dates are set.

### Log in + resume trip
- Visit `/login` and authenticate.
- Land on home and navigate to trips.
- Select an existing trip to resume.
- Continue into itinerary or edit trip details.

### Build itinerary
- Create or open a trip with dates.
- Visit itinerary view for the trip.
- Review generated days and add day-specific items.
- Reorder day items as needed.

### Add places, cities, activities
- Search and select from global libraries within the trip context.
- Attach items to specific itinerary days.
- (Admin only) manage global libraries separately.

### Manage groups
- Navigate to Groups from top nav.
- Create a group and add members by email.
- Assign a trip to a group from trip detail.

## Proposed flows

### Primary planning flow
- Start from trips list, create a trip with dates.
- Open itinerary, add places/cities/activities per day.
- Review trip summary and share as needed.

### Collaboration flow
- Create a group and add members.
- Assign a trip to the group.
- Collaborators access the trip from their trip list.

## Open questions
- Should itinerary creation be a required step in trip creation?
- Where should global libraries live in the navigation hierarchy?
- Do we need a guided flow for first-time trip setup?
- How should admins update the global libraries (seed data vs. UI tools)?

### UX rules
- A user can add one or many trips. These will be shown on the / page once logged in.
- Once a trip is created, it can be accessed on the / page. All management of the trip will be done within the context of the trip
- Things that can be managed within the trip: groups (who else can edit and view), itinery (what will be done in a specific timebox), activities (adding these to itinery), add place / city to itinery. 
- Global libraries are admin-only; users only select from them inside a trip.
