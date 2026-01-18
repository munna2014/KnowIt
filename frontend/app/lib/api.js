const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

// Cache for preventing duplicate requests
const requestCache = new Map();
// Cache for user data to prevent excessive API calls
const userDataCache = {
  data: null,
  timestamp: 0,
  ttl: 30000, // 30 seconds
};

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
  
  // Update cache
  userDataCache.data = user;
  userDataCache.timestamp = Date.now();
  
  // Trigger storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'auth_user',
    newValue: JSON.stringify(user),
    storageArea: localStorage
  }));
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function getAuthUser() {
  if (typeof window === "undefined") return null;
  
  // Check cache first
  if (userDataCache.data && (Date.now() - userDataCache.timestamp) < userDataCache.ttl) {
    return userDataCache.data;
  }
  
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    // Update cache
    userDataCache.data = user;
    userDataCache.timestamp = Date.now();
    return user;
  } catch (error) {
    return null;
  }
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  
  // Clear cache
  userDataCache.data = null;
  userDataCache.timestamp = 0;
  requestCache.clear();
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    data,
    headers = {},
    token = getAuthToken(),
    skipCache = false,
  } = options;

  const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  const url = `${baseUrl}/${cleanPath}`;

  // Create cache key for GET requests
  const cacheKey = `${method}:${url}:${token}`;
  
  // For GET requests, check cache to prevent duplicates
  if (method === "GET" && !skipCache && requestCache.has(cacheKey)) {
    console.log("Returning cached request for:", cacheKey);
    return requestCache.get(cacheKey);
  }

  const requestHeaders = { Accept: "application/json", ...headers };
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  if (data && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const requestPromise = fetch(url, {
    method,
    headers: requestHeaders,
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
  }).then(async (response) => {
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
      
      // Clear cache on error to prevent stale data
      if (requestCache.has(cacheKey)) {
        requestCache.delete(cacheKey);
      }
      
      throw error;
    }

    return payload;
  }).catch((error) => {
    // Remove failed request from cache
    if (requestCache.has(cacheKey)) {
      requestCache.delete(cacheKey);
    }
    throw error;
  });

  // Cache GET requests
  if (method === "GET" && !skipCache) {
    requestCache.set(cacheKey, requestPromise);
    
    // Clear cache after 30 seconds
    setTimeout(() => {
      requestCache.delete(cacheKey);
    }, 30000);
  }

  return requestPromise;
}

// Helper function to get fresh user data
export async function refreshUserData() {
  try {
    const data = await apiRequest("profile", { skipCache: true });
    if (data?.user) {
      saveAuthUser(data.user);
      return data.user;
    }
    return null;
  } catch (error) {
    console.warn("Could not refresh user data:", error.message);
    return null;
  }
}

// Helper function to clear all caches
export function clearAllCaches() {
  requestCache.clear();
  userDataCache.data = null;
  userDataCache.timestamp = 0;
}
