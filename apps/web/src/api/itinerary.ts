import type { CreateTripDayInput, TripDay } from "@tripplanner/shared";
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
