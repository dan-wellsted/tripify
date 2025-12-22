import type { CreatePlaceInput, Place, UpdatePlaceInput } from "@tripplanner/shared";
import { apiRequest } from "./client";

export async function listPlaces() {
  return apiRequest<Place[]>("/places");
}

export async function createPlace(payload: CreatePlaceInput) {
  return apiRequest<Place>("/places", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getPlace(placeId: string) {
  return apiRequest<Place>(`/places/${placeId}`);
}

export async function updatePlace(placeId: string, payload: UpdatePlaceInput) {
  return apiRequest<Place>(`/places/${placeId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deletePlace(placeId: string) {
  return apiRequest<void>(`/places/${placeId}`, {
    method: "DELETE"
  });
}
