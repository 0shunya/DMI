import { API_URL } from "./config.js";

const CACHE_VERSION = "v5";
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_PREFIX = `dmi-api-${CACHE_VERSION}:`;
const memoryCache = new Map();

function tokenFingerprint(token) {
  if (!token) return "public";
  let hash = 5381;
  for (let index = 0; index < token.length; index += 1) {
    hash = ((hash << 5) + hash) ^ token.charCodeAt(index);
  }
  return `user-${(hash >>> 0).toString(16)}`;
}

function cacheKey(path, token) {
  return `${CACHE_PREFIX}${API_URL}:${tokenFingerprint(token)}:${path}`;
}

function readCache(key) {
  const now = Date.now();
  const memoryEntry = memoryCache.get(key);
  if (memoryEntry?.expiresAt > now) return memoryEntry.data;
  memoryCache.delete(key);

  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;
    const entry = JSON.parse(stored);
    if (entry.expiresAt > now) {
      memoryCache.set(key, entry);
      return entry.data;
    }
    sessionStorage.removeItem(key);
  } catch {
    // Private browsing or a full session store should never break API requests.
  }
  return null;
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

function clearCache(token) {
  const scope = `${CACHE_PREFIX}${API_URL}:${tokenFingerprint(token)}:`;
  [...memoryCache.keys()].filter((key) => key.startsWith(scope)).forEach((key) => memoryCache.delete(key));
  try {
    Object.keys(sessionStorage).filter((key) => key.startsWith(scope)).forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Cache invalidation is best effort.
  }
}

export function clearSessionCache(token) {
  clearCache(token);
}

export async function api(path, { token, ...options } = {}) {
  const method = (options.method || "GET").toUpperCase();
  const isGet = method === "GET";
  const cacheable = isGet && options.cache !== "no-store";
  const shouldWriteCache = isGet;
  const key = cacheKey(path, token);
  if (cacheable) {
    const cached = readCache(key);
    if (cached !== null) return cached;
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
    clearCache(token);
    return null;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    throw new Error(typeof detail === "string" ? detail : `Request failed (${response.status})`);
  }
  if (shouldWriteCache) writeCache(key, data);
  else clearCache(token);
  return data;
}
