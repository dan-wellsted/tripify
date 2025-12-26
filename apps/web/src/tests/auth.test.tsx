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
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("auth pages", () => {
  it("shows login error from API", async () => {
    const fetchMock = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>(
      (input: Parameters<typeof fetch>[0]) => {
      const requestUrl = input instanceof Request ? input.url : input.toString();
      if (requestUrl.includes("/auth/me")) {
        return Promise.resolve(
          jsonResponse({ error: { code: "UNAUTHORIZED", message: "No session" } }, 401)
        );
      }

      if (requestUrl.includes("/auth/login")) {
        return Promise.resolve(
          jsonResponse(
            { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } },
            401
          )
        );
      }

      return Promise.resolve(jsonResponse({}));
    });

    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    renderApp(["/login"]);

    await userEvent.type(
      await screen.findByLabelText(/email/i),
      "test@example.com"
    );
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it("submits register form", async () => {
    const fetchMock = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>(
      (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
      const requestUrl = input instanceof Request ? input.url : input.toString();
      if (requestUrl.includes("/auth/me")) {
        return Promise.resolve(
          jsonResponse({ error: { code: "UNAUTHORIZED", message: "No session" } }, 401)
        );
      }

      if (requestUrl.includes("/auth/register")) {
        const body = init?.body ? JSON.parse(init.body.toString()) : null;
        return Promise.resolve(
          jsonResponse({
            user: {
              id: "user-1",
              email: body.email,
              name: body.name ?? null
            },
            session: {
              id: "session-1"
            }
          })
        );
      }

      return Promise.resolve(jsonResponse({}));
    });

    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    renderApp(["/register"]);

    await userEvent.type(await screen.findByLabelText(/name/i), "Test User");
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
