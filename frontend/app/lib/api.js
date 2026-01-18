const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
}

export function saveAuthToken(token) {
  if (typeof window === "undefined") return;
  if (!token) return;
  localStorage.setItem("auth_token", token);
}

export function saveAuthUser(user) {
  if (typeof window === "undefined") return;
  if (!user) return;
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function getAuthUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    data,
    headers = {},
    token = getAuthToken(),
  } = options;

  const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  const url = `${baseUrl}/${cleanPath}`;

  const requestHeaders = { Accept: "application/json", ...headers };
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  if (data && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      payload?.message || payload?.error || "Request failed. Try again.";
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
