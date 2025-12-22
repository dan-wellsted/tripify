import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput
} from "@tripplanner/shared";
import { ApiError, apiRequest } from "./client";

export async function registerUser(payload: RegisterInput) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload: LoginInput) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function logoutUser() {
  return apiRequest<void>("/auth/logout", {
    method: "POST"
  });
}

export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const response = await apiRequest<{ user: AuthUser }>("/auth/me");
    return response.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}
