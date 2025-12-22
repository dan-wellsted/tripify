import type { City, CreateCityInput, UpdateCityInput } from "@tripplanner/shared";
import { apiRequest } from "./client";

export async function listCities() {
  return apiRequest<City[]>("/cities");
}

export async function createCity(payload: CreateCityInput) {
  return apiRequest<City>("/cities", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getCity(cityId: string) {
  return apiRequest<City>(`/cities/${cityId}`);
}

export async function updateCity(cityId: string, payload: UpdateCityInput) {
  return apiRequest<City>(`/cities/${cityId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deleteCity(cityId: string) {
  return apiRequest<void>(`/cities/${cityId}`, {
    method: "DELETE"
  });
}
