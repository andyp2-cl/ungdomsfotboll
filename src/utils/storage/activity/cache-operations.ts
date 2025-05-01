
import { Activity } from "@/types/player";
import { saveToCache, getFromCache } from "@/utils/cache";

/**
 * Cache activities locally for offline access and performance
 */
export const cacheActivities = (activities: Activity[]): void => {
  try {
    // Store in localStorage for offline fallback (legacy method)
    localStorage.setItem('cachedActivities', JSON.stringify(activities));
    localStorage.setItem('cachedActivitiesTime', Date.now().toString());
    
    // Also store in the API cache system with a 15-minute TTL
    saveToCache('activities', activities, { 
      ttl: 15 * 60, // 15 minutes
      tag: 'activities' 
    });
    
    console.log(`Cached ${activities.length} activities successfully`);
  } catch (error) {
    console.error("Error caching activities:", error);
  }
};

/**
 * Retrieve activities from cache
 */
export const getActivitiesFromCache = (showToast: boolean = false): Activity[] | null => {
  try {
    const cachedData = getFromCache<Activity[]>('activities');
    
    if (cachedData && cachedData.length > 0) {
      return cachedData;
    }
    
    // Fallback to legacy cache
    const legacyCachedData = localStorage.getItem('cachedActivities');
    return legacyCachedData ? JSON.parse(legacyCachedData) : null;
  } catch (error) {
    console.error("Error reading cached activities:", error);
    return null;
  }
};

/**
 * Check if we should refresh the cache based on its age
 */
export const shouldRefreshCache = (): boolean => {
  const cacheTime = Number(localStorage.getItem('cachedActivitiesTime') || 0);
  const cacheAge = (Date.now() - cacheTime) / 1000;
  
  return cacheAge > 300; // 5 minutes
};
