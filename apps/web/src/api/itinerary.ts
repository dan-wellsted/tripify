import type {
  CreateTripDayInput,
  CreateTripDayActivityInput,
  CreateTripDayCityInput,
  CreateTripDayPlaceInput,
  ReorderInput,
  TripDayActivityWithActivity,
  TripDayCityWithCity,
  TripDay,
  TripDayPlaceWithPlace
} from "@tripplanner/shared";
import { apiRequest } from "./client";

export async function listTripDays(tripId: string) {
  return apiRequest<TripDay[]>(`/trips/${tripId}/days`);
}

export async function createTripDay(tripId: string, payload: CreateTripDayInput) {
  return apiRequest<TripDay>(`/trips/${tripId}/days`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function reorderTripDays(tripId: string, payload: ReorderInput) {
  return apiRequest<void>(`/trips/${tripId}/days/reorder`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function reorderTripDayActivities(
  tripId: string,
  dayId: string,
  payload: ReorderInput
) {
  return apiRequest<void>(`/trips/${tripId}/days/${dayId}/activities/reorder`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function reorderTripDayCities(
  tripId: string,
  dayId: string,
  payload: ReorderInput
) {
  return apiRequest<void>(`/trips/${tripId}/days/${dayId}/cities/reorder`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function reorderTripDayPlaces(
  tripId: string,
  dayId: string,
  payload: ReorderInput
) {
  return apiRequest<void>(`/trips/${tripId}/days/${dayId}/places/reorder`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function listTripDayActivities(tripId: string, dayId: string) {
  return apiRequest<TripDayActivityWithActivity[]>(
    `/trips/${tripId}/days/${dayId}/activities`
  );
}

export async function addTripDayActivity(
  tripId: string,
  dayId: string,
  payload: CreateTripDayActivityInput
) {
  return apiRequest<TripDayActivityWithActivity>(
    `/trips/${tripId}/days/${dayId}/activities`,
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function deleteTripDayActivity(
  tripId: string,
  dayId: string,
  dayActivityId: string
) {
  return apiRequest<void>(
    `/trips/${tripId}/days/${dayId}/activities/${dayActivityId}`,
    {
      method: "DELETE"
    }
  );
}

export async function listTripDayCities(tripId: string, dayId: string) {
  return apiRequest<TripDayCityWithCity[]>(
    `/trips/${tripId}/days/${dayId}/cities`
  );
}

export async function addTripDayCity(
  tripId: string,
  dayId: string,
  payload: CreateTripDayCityInput
) {
  return apiRequest<TripDayCityWithCity>(
    `/trips/${tripId}/days/${dayId}/cities`,
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function deleteTripDayCity(
  tripId: string,
  dayId: string,
  dayCityId: string
) {
  return apiRequest<void>(
    `/trips/${tripId}/days/${dayId}/cities/${dayCityId}`,
    {
      method: "DELETE"
    }
  );
}

export async function listTripDayPlaces(tripId: string, dayId: string) {
  return apiRequest<TripDayPlaceWithPlace[]>(
    `/trips/${tripId}/days/${dayId}/places`
  );
}

export async function addTripDayPlace(
  tripId: string,
  dayId: string,
  payload: CreateTripDayPlaceInput
) {
  return apiRequest<TripDayPlaceWithPlace>(
    `/trips/${tripId}/days/${dayId}/places`,
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function deleteTripDayPlace(
  tripId: string,
  dayId: string,
  dayPlaceId: string
) {
  return apiRequest<void>(
    `/trips/${tripId}/days/${dayId}/places/${dayPlaceId}`,
    {
      method: "DELETE"
    }
  );
}
