export type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const API_URL = import.meta.env.VITE_API_URL?.toString() ?? "/api";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const apiPayload = payload as ApiErrorPayload | null;
    const message = apiPayload?.error?.message ?? "Request failed";
    const code = apiPayload?.error?.code ?? "UNKNOWN";
    throw new ApiError(message, response.status, code);
  }

  return payload as T;
}
