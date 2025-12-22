import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "../app";
import { AuthProvider } from "../features/auth/AuthProvider";

const theme = extendTheme({});

function renderApp(initialEntries: string[]) {
  return render(
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </ChakraProvider>
  );
}

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body)
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("auth pages", () => {
  it("shows login error from API", async () => {
    const fetchMock = vi.fn((input: RequestInfo) => {
      if (input.toString().includes("/auth/me")) {
        return jsonResponse({ error: { code: "UNAUTHORIZED", message: "No session" } }, 401);
      }

      if (input.toString().includes("/auth/login")) {
        return jsonResponse(
          { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } },
          401
        );
      }

      return jsonResponse({});
    });

    vi.stubGlobal("fetch", fetchMock as typeof fetch);

    renderApp(["/login"]);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it("submits register form", async () => {
    const fetchMock = vi.fn((input: RequestInfo, init?: RequestInit) => {
      if (input.toString().includes("/auth/me")) {
        return jsonResponse({ error: { code: "UNAUTHORIZED", message: "No session" } }, 401);
      }

      if (input.toString().includes("/auth/register")) {
        const body = init?.body ? JSON.parse(init.body.toString()) : null;
        return jsonResponse({
          user: {
            id: "user-1",
            email: body.email,
            name: body.name ?? null
          },
          session: {
            id: "session-1"
          }
        });
      }

      return jsonResponse({});
    });

    vi.stubGlobal("fetch", fetchMock as typeof fetch);

    renderApp(["/register"]);

    await userEvent.type(screen.getByLabelText(/name/i), "Test User");
    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "Password1234");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({ method: "POST" })
    );
  });
});
