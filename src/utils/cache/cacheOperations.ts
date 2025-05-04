
/**
 * Core cache operations for storing and retrieving API responses
 */
import { CachedData, CacheOptions } from './types';
import { updateCacheStats } from './cacheManagement';

/** Default cache lifetime in seconds */
export const DEFAULT_TTL = 300; // 5 minutes

/**
 * Store API response in cache
 */
export function cacheApiResponse<T>(key: string, data: T, options: CacheOptions = {}): void {
  try {
    const { ttl = DEFAULT_TTL, tag } = options;
    
    // Don't store undefined or null values
    if (data === undefined || data === null) {
      return;
    }
    
    const timestamp = Date.now();
    const expiresAt = timestamp + (ttl * 1000);
    
    // Store the data with metadata
    const cacheEntry: CachedData<T> = {
      data,
      timestamp,
      expiresAt
    };
    
    // Save to localStorage
    localStorage.setItem(`api-cache:${key}`, JSON.stringify(cacheEntry));
    
    // If this entry has a tag, add it to the tag index
    if (tag) {
      try {
        // Get existing tag index
        const tagIndex = JSON.parse(localStorage.getItem(`api-cache-tag:${tag}`) || '[]');
        
        // Add this key if not already in the index
        if (!tagIndex.includes(key)) {
          tagIndex.push(key);
          localStorage.setItem(`api-cache-tag:${tag}`, JSON.stringify(tagIndex));
        }
      } catch (e) {
        console.error(`Failed to update tag index for tag ${tag}:`, e);
      }
    }
    
    // Update cache stats
    updateCacheStats(true);
    
  } catch (e) {
    console.error("Failed to cache API response:", e);
  }
}

/**
 * Get cached API response if available and not expired
 */
export function getCachedApiResponse<T>(key: string, options: CacheOptions = {}): T | null {
  try {
    const { forceRefresh = false } = options;
    
    // If force refresh is requested, bypass cache
    if (forceRefresh) {
      return null;
    }
    
    // Try to get cached entry
    const cachedJson = localStorage.getItem(`api-cache:${key}`);
    if (!cachedJson) {
      return null;
    }
    
    // Parse the cached entry
    const cached = JSON.parse(cachedJson) as CachedData<T>;
    const now = Date.now();
    
    // Check if expired
    if (now > cached.expiresAt) {
      console.log(`Cache expired for ${key}, age: ${((now - cached.timestamp) / 1000).toFixed(0)}s`);
      
      // Clean up expired entry
      localStorage.removeItem(`api-cache:${key}`);
      
      // Update cache stats
      updateCacheStats();
      
      return null;
    }
    
    // Update cache hit stats
    updateCacheStats(false, true);
    
    // Log cache hit
    console.log(`Cache hit for ${key}, age: ${((now - cached.timestamp) / 1000).toFixed(0)}s, expires in ${((cached.expiresAt - now) / 1000).toFixed(0)}s`);
    
    return cached.data;
  } catch (e) {
    console.error("Failed to retrieve cached API response:", e);
    return null;
  }
}
