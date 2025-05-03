
import { Activity } from "@/types/player";

// Key for storing activities in localStorage
const CACHE_KEY = 'cachedActivities';
const CACHE_TIME_KEY = 'cachedActivitiesTime';
const CACHE_VERSION = 'v2'; // Increment this when cache format changes

/**
 * Stores activities in localStorage cache
 */
export const cacheActivities = async (activities: Activity[]): Promise<void> => {
  try {
    // Store the data with a timestamp
    const cacheObj = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      activities: activities
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(activities));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    console.log(`Stored ${activities.length} activities in cache`);
    
    // Also store in a versioned cache key
    localStorage.setItem(`${CACHE_KEY}_${CACHE_VERSION}`, JSON.stringify(cacheObj));
  } catch (error) {
    console.error("Error caching activities:", error);
    
    // Try with a smaller subset if the error might be storage quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Store only essential fields for each activity
      const essentialActivities = activities.map(activity => ({
        id: activity.id,
        name: activity.name,
        date: activity.date,
        type: activity.type,
        time: activity.time,
        participants: activity.participants
      }));
      
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(essentialActivities));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        console.log(`Stored ${essentialActivities.length} essential-only activities in cache`);
      } catch (fallbackError) {
        console.error("Even essential-only caching failed:", fallbackError);
      }
    }
  }
};

/**
 * Retrieves activities from localStorage cache
 */
export const getActivitiesFromCache = (): Activity[] | null => {
  try {
    // Try the versioned cache first (more complete with metadata)
    const versionedCache = localStorage.getItem(`${CACHE_KEY}_${CACHE_VERSION}`);
    if (versionedCache) {
      const cacheObj = JSON.parse(versionedCache);
      console.log(`Retrieved ${cacheObj.activities.length} activities from versioned cache`);
      return cacheObj.activities;
    }
    
    // Fall back to the simple cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) {
      console.log('No cached activities found');
      return null;
    }
    
    const activities = JSON.parse(cachedData);
    console.log(`Retrieved ${activities.length} activities from simple cache`);
    return activities;
  } catch (error) {
    console.error("Error retrieving activities from cache:", error);
    return null;
  }
};

/**
 * Checks if the cache should be refreshed based on age
 */
export const shouldRefreshCache = (): boolean => {
  const cacheTimeStr = localStorage.getItem(CACHE_TIME_KEY);
  if (!cacheTimeStr) return true;
  
  const cacheTime = parseInt(cacheTimeStr, 10);
  const now = Date.now();
  const cacheAge = now - cacheTime;
  const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes
  
  return cacheAge > MAX_CACHE_AGE;
};

/**
 * Clears the activities cache
 */
export const clearActivitiesCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
  localStorage.removeItem(`${CACHE_KEY}_${CACHE_VERSION}`);
  console.log('Activities cache cleared');
};

/**
 * Gets the age of the cache in seconds
 */
export const getCacheAge = (): number | null => {
  const cacheTimeStr = localStorage.getItem(CACHE_TIME_KEY);
  if (!cacheTimeStr) return null;
  
  const cacheTime = parseInt(cacheTimeStr, 10);
  const now = Date.now();
  return Math.round((now - cacheTime) / 1000);
};
