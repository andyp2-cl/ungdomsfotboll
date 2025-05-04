
/**
 * Cache maintenance operations: clear cache, tag management, and statistics
 */
import { CacheStats } from './types';

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
export function updateCacheStats(incrementSaves = false, incrementHits = false): void {
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
export function getApiCacheStats(): CacheStats {
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
