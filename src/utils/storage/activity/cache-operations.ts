
import { Activity } from "@/types/player";
import { saveToCache, getFromCache } from "@/utils/cache";

/**
 * Cache activities locally for offline access and performance
 */
export const cacheActivities = (activities: Activity[]): void => {
  try {
    // Don't cache if the list is empty
    if (!activities || activities.length === 0) {
      console.warn("Attempted to cache empty activities list, aborting");
      return;
    }
    
    // Extract just match activities for separate backup
    const matchActivities = activities.filter(a => a.type === 'match');
    
    // Store in localStorage for offline fallback (legacy method)
    localStorage.setItem('cachedActivities', JSON.stringify(activities));
    localStorage.setItem('cachedActivitiesTime', Date.now().toString());
    localStorage.setItem('cachedActivitiesCount', activities.length.toString());
    
    // Store matches separately for additional redundancy
    if (matchActivities && matchActivities.length > 0) {
      localStorage.setItem('cachedMatchActivities', JSON.stringify(matchActivities));
      localStorage.setItem('cachedMatchActivitiesTime', Date.now().toString());
      localStorage.setItem('cachedMatchActivitiesCount', matchActivities.length.toString());
      
      console.log(`Cached ${matchActivities.length} match activities separately for redundancy`);
      
      // Store match data with longer TTL for better preservation
      saveToCache('match-activities', matchActivities, { 
        ttl: 60 * 60 * 24 * 7, // 7 days
        tag: 'match-activities' 
      });
    }
    
    // Also store in the API cache system with a longer TTL
    saveToCache('activities', activities, { 
      ttl: 60 * 60, // 1 hour
      tag: 'activities' 
    });
    
    console.log(`Cached ${activities.length} activities successfully`);
  } catch (error) {
    console.error("Error caching activities:", error);
  }
};

/**
 * Retrieve activities from cache, with special handling for match data
 */
export const getActivitiesFromCache = (showToast: boolean = false): Activity[] | null => {
  try {
    // Try the standard cache first
    const cachedData = getFromCache<Activity[]>('activities');
    
    if (cachedData && cachedData.length > 0) {
      // Check if we have match activities in the cache
      const matchActivities = cachedData.filter(a => a.type === 'match');
      console.log(`Found ${matchActivities.length} match activities in standard cache`);
      
      if (matchActivities.length > 0) {
        return cachedData;
      }
    }
    
    // If no match data in standard cache, try the match-specific cache
    const cachedMatchData = getFromCache<Activity[]>('match-activities');
    const standardCachedData = localStorage.getItem('cachedActivities');
    const matchOnlyCachedData = localStorage.getItem('cachedMatchActivities');
    
    // If we have both general activities and match-specific activities, merge them
    if (standardCachedData && matchOnlyCachedData) {
      try {
        const activities = JSON.parse(standardCachedData);
        const matchActivities = JSON.parse(matchOnlyCachedData);
        
        // Create a merged set without duplicates
        const existingIds = new Set(activities.map((a: Activity) => a.id));
        const mergedActivities = [...activities];
        
        matchActivities.forEach((match: Activity) => {
          if (!existingIds.has(match.id)) {
            mergedActivities.push(match);
            existingIds.add(match.id);
          }
        });
        
        console.log(`Created merged cache with ${mergedActivities.length} activities including ${matchActivities.length} matches`);
        return mergedActivities;
      } catch (e) {
        console.error("Error merging cached data:", e);
      }
    }
    
    // Fall back to any cache that has data, prioritizing match data
    if (cachedMatchData && cachedMatchData.length > 0) {
      console.log(`Using special match cache with ${cachedMatchData.length} activities`);
      return cachedMatchData;
    }
    
    if (matchOnlyCachedData) {
      try {
        const matchActivities = JSON.parse(matchOnlyCachedData);
        console.log(`Using localStorage match cache with ${matchActivities.length} activities`);
        return matchActivities;
      } catch (e) {
        console.error("Error parsing cached match activities:", e);
      }
    }
    
    // Last resort - regular localStorage cache
    if (standardCachedData) {
      try {
        const activities = JSON.parse(standardCachedData);
        console.log(`Using regular localStorage cache with ${activities.length} activities`);
        return activities;
      } catch (e) {
        console.error("Error parsing cached activities:", e);
      }
    }
    
    // No usable cache found
    return null;
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
