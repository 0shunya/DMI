import { API_URL } from "./config.js";

const CACHE_VERSION = "v2";
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_PREFIX = `dmi-api-${CACHE_VERSION}:`;
const memoryCache = new Map();

function cacheKey(path) {
  return `${CACHE_PREFIX}${API_URL}${path}`;
}

function readCache(key) {
  const now = Date.now();
  const memoryEntry = memoryCache.get(key);
  if (memoryEntry?.expiresAt > now) return { hit: true, data: memoryEntry.data };
  memoryCache.delete(key);

  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return { hit: false };
    const entry = JSON.parse(stored);
    if (entry.expiresAt > now) {
      memoryCache.set(key, entry);
      return { hit: true, data: entry.data };
    }
    sessionStorage.removeItem(key);
  } catch {
    // Private browsing or a full session store should never break API requests.
  }
  return { hit: false };
}

function writeCache(key, data) {
  const entry = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  memoryCache.set(key, entry);
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Keep the in-memory cache when sessionStorage is unavailable or full.
  }
}

function clearCache() {
  memoryCache.clear();
  try {
    Object.keys(sessionStorage).filter((key) => key.startsWith(CACHE_PREFIX)).forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Cache invalidation is best effort.
  }
}

export async function api(path, { token, ...options } = {}) {
  const method = (options.method || "GET").toUpperCase();
  const cacheable = method === "GET" && !token && options.cache !== "no-store";
  const key = cacheKey(path);
  if (cacheable) {
    const cached = readCache(key);
    if (cached.hit) return cached.data;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) {
    clearCache();
    return null;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    throw new Error(typeof detail === "string" ? detail : `Request failed (${response.status})`);
  }
  if (cacheable) writeCache(key, data);
  else if (method !== "GET") clearCache();
  return data;
}
