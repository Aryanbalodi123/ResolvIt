const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" && payload?.message ? payload.message : "Request failed";
    throw new Error(message);
  }

  return payload;
}

export async function apiRequest(path, options = {}) {
  try {
    const authToken = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });

    return parseResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "API server is unreachable. Start it with: npm run dev:api (or npm run dev:all)."
      );
    }

    throw error;
  }
}
