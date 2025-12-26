import type { CreateTripInput, Trip, UpdateTripInput } from "@tripplanner/shared";
import { apiRequest } from "./client";

export async function listTrips() {
  return apiRequest<Trip[]>("/trips");
}

export async function createTrip(payload: CreateTripInput) {
  return apiRequest<Trip>("/trips", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getTrip(tripId: string) {
  return apiRequest<Trip>(`/trips/${tripId}`);
}

export async function updateTrip(tripId: string, payload: UpdateTripInput) {
  return apiRequest<Trip>(`/trips/${tripId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
