
import { CachedData, CacheOptions } from './types';
import { cleanupCache, _incrementHits, _incrementSaves } from './cacheManagement';

/**
 * Core cache operations for fetching and storing data
 */

// Default TTL in seconds (1 hour)
const DEFAULT_TTL = 3600;

/**
 * Save data to cache with specified options
 * 
 * @param key Cache key
 * @param data Data to cache
 * @param options Cache options
 */
export function saveToCache<T>(key: string, data: T, options?: CacheOptions): void {
  try {
    const ttl = options?.ttl || DEFAULT_TTL;
    const now = Date.now();
    
    const cacheEntry: CachedData<T> & { _tag?: string } = {
      data,
      timestamp: now,
      expiresAt: now + (ttl * 1000)
    };
    
    // Add tag if provided
    if (options?.tag) {
      cacheEntry._tag = options.tag;
    }
    
    localStorage.setItem(`cache:${key}`, JSON.stringify(cacheEntry));
    _incrementSaves();
  } catch (error) {
    console.error(`Error saving data to cache for key ${key}:`, error);
  }
}

/**
 * Get data from cache
 * 
 * @param key Cache key
 * @param options Cache options
 * @returns The cached data or null if not found or expired
 */
export function getFromCache<T>(key: string, options?: CacheOptions): T | null {
  try {
    // Skip cache if forceRefresh is true
    if (options?.forceRefresh) {
      return null;
    }
    
    const cacheItem = localStorage.getItem(`cache:${key}`);
    if (!cacheItem) {
      return null;
    }
    
    const cached = JSON.parse(cacheItem) as CachedData<T>;
    const now = Date.now();
    
    // Return null if expired
    if (cached.expiresAt < now) {
      localStorage.removeItem(`cache:${key}`);
      return null;
    }
    
    _incrementHits();
    return cached.data;
  } catch (error) {
    console.error(`Error retrieving data from cache for key ${key}:`, error);
    return null;
  }
}

/**
 * Wrapper for async operations with caching
 * 
 * @param key Cache key
 * @param fetchFn Function that fetches the data
 * @param options Cache options
 * @returns The data from cache or from the fetch function
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  // Clean up expired cache entries occasionally (1% chance)
  if (Math.random() < 0.01) {
    cleanupCache();
  }
  
  // Try to get from cache first
  const cachedData = getFromCache<T>(key, options);
  if (cachedData !== null) {
    return cachedData;
  }
  
  // Fetch fresh data
  try {
    const data = await fetchFn();
    saveToCache<T>(key, data, options);
    return data;
  } catch (error) {
    console.error(`Error in cachedFetch for key ${key}:`, error);
    throw error;
  }
}
