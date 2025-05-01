
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
  
  // Always try to fetch from database first when online
  if (navigator.onLine) {
    try {
      // Mark connection test early to avoid status issues
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
      
      return activities;
    } catch (error) {
      console.error("Failed to fetch from database, trying cache:", error);
      // On error, try to use cache as fallback
      const cachedActivities = getActivitiesFromCache(showToast);
      if (cachedActivities && cachedActivities.length > 0) {
        return cachedActivities;
      }
      
      return handleFetchError(error, showToast);
    }
  } else {
    // When offline, use the cache if available
    console.log("Device is offline, using cached activities");
    const cachedData = getActivitiesFromCache(showToast);
    return cachedData || [];
  }
};
