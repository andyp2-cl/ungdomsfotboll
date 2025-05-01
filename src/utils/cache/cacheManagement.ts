
import { CacheOptions, CacheStats } from './types';

/**
 * Cached data management functionality
 */

// Cache counters for statistics
let cacheHits = 0;
let cacheSaves = 0;

/**
 * Clear entries from localStorage by tag or all cache entries
 * @param tag Optional tag to filter entries to clear
 */
export function clearCache(tag?: string): void {
  // If no tag is provided, clear all cache entries
  if (!tag) {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache:')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} cache entries`);
    return;
  }
  
  // Clear by tag
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith('cache:')) {
      try {
        const entry = JSON.parse(localStorage.getItem(key) || '{}');
        
        if (entry && entry._tag === tag) {
          keysToRemove.push(key);
        }
      } catch (error) {
        console.error(`Error parsing cache entry at key ${key}`, error);
      }
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`Cleared ${keysToRemove.length} cache entries with tag '${tag}'`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  let totalEntries = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cache:')) {
      totalEntries++;
    }
  }
  
  return {
    totalEntries,
    totalSaves: cacheSaves,
    totalHits: cacheHits,
    hitRate: cacheSaves > 0 ? cacheHits / cacheSaves : 0
  };
}

/**
 * Remove expired items from cache
 */
export function cleanupCache(): void {
  const now = Date.now();
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith('cache:')) {
      try {
        const entry = JSON.parse(localStorage.getItem(key) || '{}');
        
        if (entry && entry.expiresAt < now) {
          keysToRemove.push(key);
        }
      } catch (error) {
        console.error(`Error parsing cache entry at key ${key}`, error);
      }
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  if (keysToRemove.length > 0) {
    console.log(`Removed ${keysToRemove.length} expired cache entries`);
  }
}

// Export internal counters for testing
export function _getCacheCounters() {
  return {
    hits: cacheHits,
    saves: cacheSaves
  };
}

// Update hit counter
export function _incrementHits() {
  cacheHits++;
}

// Update save counter
export function _incrementSaves() {
  cacheSaves++;
}
