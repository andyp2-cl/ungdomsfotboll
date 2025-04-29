
/**
 * Type definitions for API cache system
 */

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheOptions {
  /** Cache lifetime in seconds */
  ttl?: number;
  /** Force refresh regardless of cache state */
  forceRefresh?: boolean;
  /** Cache tag for grouping related cache entries */
  tag?: string;
}

export interface CacheStats {
  totalEntries: number;
  totalSaves: number;
  totalHits: number;
  hitRate: number;
}
