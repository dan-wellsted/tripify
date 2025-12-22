import type {
  ActivityWithPlace,
  CreateActivityInput,
  UpdateActivityInput
} from "@tripplanner/shared";
import { apiRequest } from "./client";

export async function listActivities() {
  return apiRequest<ActivityWithPlace[]>("/activities");
}

export async function createActivity(payload: CreateActivityInput) {
  return apiRequest<ActivityWithPlace>("/activities", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getActivity(activityId: string) {
  return apiRequest<ActivityWithPlace>(`/activities/${activityId}`);
}

export async function updateActivity(
  activityId: string,
  payload: UpdateActivityInput
) {
  return apiRequest<ActivityWithPlace>(`/activities/${activityId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deleteActivity(activityId: string) {
  return apiRequest<void>(`/activities/${activityId}`, {
    method: "DELETE"
  });
}
