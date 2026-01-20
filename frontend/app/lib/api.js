const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

// Cache for preventing duplicate requests
const requestCache = new Map();
// Cache for user data to prevent excessive API calls
const userDataCache = {
  data: null,
  timestamp: 0,
  ttl: 30000, // 30 seconds
};

// Enhanced cache for blog posts with localStorage persistence
const blogPostsCache = {
  data: null,
  timestamp: 0,
  ttl: 300000, // 5 minutes for blog posts
  key: 'blog_posts_cache'
};

// Cache for individual blog post details
const blogDetailsCache = new Map();

function shouldUseBlogPostsCache(path) {
  if (!path.startsWith("blog-posts")) return false;
  const queryIndex = path.indexOf("?");
  if (queryIndex === -1) return false;
  const params = new URLSearchParams(path.slice(queryIndex + 1));
  if (params.get("status") !== "published") return false;
  const disallowed = ["user_id", "category", "search", "page", "limit"];
  return !disallowed.some((key) => params.has(key));
}

// Get cached blog posts from localStorage
function getCachedBlogPosts() {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(blogPostsCache.key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > blogPostsCache.ttl) {
      localStorage.removeItem(blogPostsCache.key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn("Error reading cached blog posts:", error);
    return null;
  }
}

// Save blog posts to localStorage cache
function setCachedBlogPosts(data) {
  if (typeof window === "undefined") return;
  
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(blogPostsCache.key, JSON.stringify(cacheData));
    
    // Also update memory cache
    blogPostsCache.data = data;
    blogPostsCache.timestamp = Date.now();
  } catch (error) {
    console.warn("Error caching blog posts:", error);
  }
}

// Clear blog posts cache
function clearBlogPostsCache() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(blogPostsCache.key);
  blogPostsCache.data = null;
  blogPostsCache.timestamp = 0;
}

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
    useLocalStorage = false,
  } = options;

  const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  const url = `${baseUrl}/${cleanPath}`;

  // Create cache key for GET requests
  const cacheKey = `${method}:${url}:${token}`;
  
  // Special handling for blog posts with localStorage cache
  if (method === "GET" && !skipCache && shouldUseBlogPostsCache(path)) {
    const cachedPosts = getCachedBlogPosts();
    if (cachedPosts) {
      console.log("Returning cached blog posts from localStorage");
      return Promise.resolve(cachedPosts);
    }
  }
  
  // For GET requests, check memory cache to prevent duplicates
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
    let text = "";
    let payload = null;
    
    try {
      text = await response.text();
      if (text) {
        payload = JSON.parse(text);
      }
    } catch (parseError) {
      console.warn("Failed to parse response:", parseError);
      payload = { message: text || "Invalid response format" };
    }

    if (!response.ok) {
      const message =
        payload?.message || payload?.error || `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;

      if (
        typeof window !== "undefined" &&
        response.status === 403 &&
        payload?.message === "You have been banned from this server."
      ) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.href = "/component/banned";
      }
      
      // Handle Laravel validation errors specifically
      if (response.status === 422 && payload?.errors) {
        error.errors = payload.errors;
        // Create a more readable message from validation errors
        const errorMessages = Object.values(payload.errors).flat();
        error.message = errorMessages.join(', ');
      }
      
      // Clear cache on error to prevent stale data
      if (requestCache.has(cacheKey)) {
        requestCache.delete(cacheKey);
      }
      
      throw error;
    }

    // Cache blog posts in localStorage for faster subsequent loads
    if (method === "GET" && shouldUseBlogPostsCache(path) && payload) {
      setCachedBlogPosts(payload);
    }

    return payload;
  }).catch((error) => {
    // Remove failed request from cache
    if (requestCache.has(cacheKey)) {
      requestCache.delete(cacheKey);
    }
    
    // If it's already our custom error, just re-throw it
    if (error.status) {
      throw error;
    }
    
    // Handle network errors or other fetch errors
    const networkError = new Error(error.message || "Network error occurred");
    networkError.status = 0;
    networkError.payload = null;
    throw networkError;
  });

  // Cache GET requests in memory
  if (method === "GET" && !skipCache) {
    requestCache.set(cacheKey, requestPromise);
    
    // Clear memory cache after appropriate time
    const cacheTimeout = path.includes("blog-posts") ? 300000 : 30000; // 5 minutes for blog posts, 30 seconds for others
    setTimeout(() => {
      requestCache.delete(cacheKey);
    }, cacheTimeout);
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
  clearBlogPostsCache();
  blogDetailsCache.clear();
}

// Export cache management functions
export { getCachedBlogPosts, setCachedBlogPosts, clearBlogPostsCache };
