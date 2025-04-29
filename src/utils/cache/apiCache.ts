
/**
 * Simple cache system for API responses to minimize network requests
 */

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  /** Cache lifetime in seconds */
  ttl?: number;
  /** Force refresh regardless of cache state */
  forceRefresh?: boolean;
  /** Cache tag for grouping related cache entries */
  tag?: string;
}

/** Default cache lifetime in seconds */
const DEFAULT_TTL = 300; // 5 minutes

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

/**
 * Clear all or specific cached API responses
 */
export function clearApiCache(options: { key?: string; tag?: string } = {}): void {
  try {
    const { key, tag } = options;
    
    // Clear a specific key
    if (key) {
      localStorage.removeItem(`api-cache:${key}`);
      console.log(`Cleared cache for ${key}`);
      return;
    }
    
    // Clear by tag
    if (tag) {
      const tagIndex = JSON.parse(localStorage.getItem(`api-cache-tag:${tag}`) || '[]');
      
      // Clear all keys in this tag
      tagIndex.forEach((taggedKey: string) => {
        localStorage.removeItem(`api-cache:${taggedKey}`);
      });
      
      // Clear the tag index itself
      localStorage.removeItem(`api-cache-tag:${tag}`);
      
      console.log(`Cleared ${tagIndex.length} cached items with tag "${tag}"`);
      return;
    }
    
    // Clear all cache entries if no specific key or tag
    const keysToRemove: string[] = [];
    
    // Find all cache keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('api-cache:')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found cache keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear all tag indexes
    const tagKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('api-cache-tag:')) {
        tagKeysToRemove.push(key);
      }
    }
    tagKeysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleared ${keysToRemove.length} cached API responses`);
    
    // Reset cache stats
    localStorage.setItem('api-cache-stats', JSON.stringify({
      totalSaves: 0,
      totalHits: 0,
      lastCleared: Date.now()
    }));
    
  } catch (e) {
    console.error("Failed to clear API cache:", e);
  }
}

/**
 * Helper to update cache statistics
 */
function updateCacheStats(incrementSaves = false, incrementHits = false): void {
  try {
    const statsJson = localStorage.getItem('api-cache-stats');
    const stats = statsJson ? JSON.parse(statsJson) : { totalSaves: 0, totalHits: 0 };
    
    if (incrementSaves) {
      stats.totalSaves = (stats.totalSaves || 0) + 1;
    }
    
    if (incrementHits) {
      stats.totalHits = (stats.totalHits || 0) + 1;
    }
    
    localStorage.setItem('api-cache-stats', JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to update cache stats:", e);
  }
}

/**
 * Get cache statistics
 */
export function getApiCacheStats(): { totalEntries: number; totalSaves: number; totalHits: number; hitRate: number } {
  try {
    // Count entries
    let totalEntries = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('api-cache:')) {
        totalEntries++;
      }
    }
    
    // Get usage stats
    const statsJson = localStorage.getItem('api-cache-stats');
    const stats = statsJson ? JSON.parse(statsJson) : { totalSaves: 0, totalHits: 0 };
    
    // Calculate hit rate
    const totalRequests = stats.totalSaves + stats.totalHits;
    const hitRate = totalRequests > 0 ? (stats.totalHits / totalRequests) * 100 : 0;
    
    return {
      totalEntries,
      totalSaves: stats.totalSaves || 0,
      totalHits: stats.totalHits || 0,
      hitRate
    };
  } catch (e) {
    console.error("Failed to get cache stats:", e);
    return { totalEntries: 0, totalSaves: 0, totalHits: 0, hitRate: 0 };
  }
}
