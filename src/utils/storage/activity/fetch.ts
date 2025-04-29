
import { Activity } from "@/types/player";
import { toast } from "sonner";
import { cacheActivities, getActivitiesFromCache, shouldRefreshCache } from "./cache-operations";
import { fetchActivitiesFromDB } from "./fetch-operations";
import { handleFetchError } from "./error-handling";

/**
 * Get activities from Supabase with improved caching and error handling
 */
export const getStoredActivities = async (context?: any): Promise<Activity[]> => {
  // Handle both TanStack Query context and our custom options format
  let forceRefresh = false;
  let showToast = false;
  
  if (context && typeof context === 'object') {
    // If it's a TanStack Query context, check meta
    if (context.meta) {
      forceRefresh = !!context.meta.forceRefresh;
      showToast = !!context.meta.showToast;
    } 
    // If it's our custom options object
    else if ('forceRefresh' in context || 'showToast' in context) {
      forceRefresh = !!context.forceRefresh;
      showToast = !!context.showToast;
    }
  }
  
  // Start timing for performance measurement
  const startTime = performance.now();
  
  // Check if we're online
  if (!navigator.onLine) {
    console.log("Device is offline, using cached activities");
    
    // When offline, always use the cache if available
    const cachedData = getActivitiesFromCache(showToast);
    return cachedData || [];
  }
  
  // If online and not forcing a refresh, try to use the cache first
  if (!forceRefresh) {
    const cachedActivities = getActivitiesFromCache();
    
    if (cachedActivities && cachedActivities.length > 0) {
      console.log(`Using ${cachedActivities.length} cached activities, age: ${
        ((Date.now() - Number(localStorage.getItem('cachedActivitiesTime') || 0)) / 1000).toFixed(0)
      }s`);
      
      // In background, refresh the cache if it's older than 5 minutes
      if (shouldRefreshCache()) {
        console.log("Cache is older than 5 minutes, refreshing in background");
        
        // Background refresh without waiting for result
        setTimeout(() => {
          fetchActivitiesFromDB({ silent: true }).catch(err => {
            console.error("Background refresh failed:", err);
          });
        }, 100);
      }
      
      return cachedActivities;
    }
  }
  
  try {
    // Mark successful connection test early to avoid connection status issues
    localStorage.setItem('sb-connection-test', 'true');
    
    // Fetch from database
    const activities = await fetchActivitiesFromDB({ 
      showToast,
      silent: !showToast && !forceRefresh
    });
    
    // Calculate and log performance
    const endTime = performance.now();
    console.log(`Fetched ${activities.length} activities from database in ${(endTime - startTime).toFixed(2)}ms`);
    
    // Cache the results
    cacheActivities(activities);
    
    // Mark connection as successful
    localStorage.setItem('sb-connection-test', 'true');
    localStorage.setItem('sb-connection-test-time', Date.now().toString());
    localStorage.setItem('sb-activities-fetch-time', endTime.toString());
    localStorage.setItem('sb-activities-fetch-duration', (endTime - startTime).toString());
    
    return activities;
  } catch (error) {
    return handleFetchError(error, showToast);
  }
};
