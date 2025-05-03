
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
  
  console.log(`Getting activities with forceRefresh=${forceRefresh}, showToast=${showToast}`);
  
  // Check if we need to force a refresh based on last fetch time
  const lastFetchTime = localStorage.getItem('sb-activities-fetch-time');
  const shouldForceRefresh = forceRefresh || 
    !lastFetchTime || 
    (Date.now() - parseInt(lastFetchTime, 10) > 1000 * 60 * 5); // 5 minutes
  
  if (shouldForceRefresh && showToast) {
    toast.info("Hämtar färsk data från servern", { duration: 2000 });
  }
  
  // Cache diagnostics - log what's currently in cache
  try {
    const cacheDiagnostics = getActivitiesFromCache();
    console.log(`Cache diagnostic check: ${cacheDiagnostics ? cacheDiagnostics.length : 0} activities in cache`);
    if (cacheDiagnostics && cacheDiagnostics.length > 0) {
      console.log(`Cache contains ${cacheDiagnostics.filter(a => a.type === 'match').length} matches`);
      console.log(`First cached activity: ${JSON.stringify(cacheDiagnostics[0]?.id)} - ${cacheDiagnostics[0]?.name}`);
    } else {
      console.log("Cache is empty or invalid");
    }
  } catch (e) {
    console.error("Error checking cache diagnostics:", e);
  }
  
  // Try to fetch from database first if online, regardless of forceRefresh
  if (navigator.onLine) {
    try {
      // Reset cached connection test to ensure we're actually trying to connect
      if (shouldForceRefresh) {
        localStorage.removeItem('sb-connection-test');
        localStorage.removeItem('sb-activities-fetch-time');
        console.log("Force refresh - cleared connection test cache");
      }
      
      // Fetch fresh data from database - always try when online
      const activities = await fetchActivitiesFromDB({ 
        showToast,
        silent: !showToast,
        forceRefresh: shouldForceRefresh,
        retryCount: shouldForceRefresh ? 2 : 0 // More aggressive retry when forcing refresh
      });
      
      // Calculate and log performance
      const endTime = performance.now();
      console.log(`Fetched ${activities.length} activities from database in ${(endTime - startTime).toFixed(2)}ms`);
      
      // Cache the results every time we get fresh data
      if (activities && activities.length > 0) {
        await cacheActivities(activities);
        
        // Log match data specifically for debugging issues
        const matchActivities = activities.filter(a => a.type === 'match');
        console.log(`Cached ${matchActivities.length} match activities`);
        
        // Show matches with scores for debugging
        const matchesWithScores = matchActivities.filter(m => 
          m.homeScore !== undefined && m.awayScore !== undefined);
        console.log(`Found ${matchesWithScores.length} matches with scores`);
        
        return activities;
      } else {
        if (showToast) {
          toast.warning("Inga aktiviteter hämtades från databasen, försöker med lokal cache");
        }
        
        // Even if no data returned, mark as successful connection if no error was thrown
        localStorage.setItem('sb-connection-test', 'true');
        localStorage.setItem('sb-connection-test-time', Date.now().toString());
      }
    } catch (error) {
      console.error("Failed to fetch from database, trying cache:", error);
      toast.dismiss();
      
      if (showToast) {
        toast.warning("Kunde inte ansluta till databasen. Försöker med lokal cache.");
      }
    }
  } else {
    // When offline, alert about it
    console.log("Device is offline, using cached activities");
    if (showToast) {
      toast.info("Du är offline. Visar cachade aktiviteter.");
    }
  }
  
  // If we get here, try to use cached data as fallback
  try {
    const cachedActivities = getActivitiesFromCache();
    if (cachedActivities && cachedActivities.length > 0) {
      console.log(`Using ${cachedActivities.length} cached activities`);
      
      // Log cache diagnostics
      const matchActivities = cachedActivities.filter(a => a.type === 'match');
      console.log(`Found ${matchActivities.length} cached match activities`);
      
      return cachedActivities;
    } else {
      console.warn("No activities found in cache");
      
      // Try to load activities directly from localStorage as last resort
      const rawCachedData = localStorage.getItem('cachedActivities');
      if (rawCachedData) {
        try {
          const parsedActivities = JSON.parse(rawCachedData);
          console.log(`Last resort: Loaded ${parsedActivities.length} activities from raw localStorage`);
          return parsedActivities;
        } catch (e) {
          console.error("Failed to parse raw localStorage cached activities:", e);
        }
      }
    }
  } catch (cacheError) {
    console.error("Error getting activities from cache:", cacheError);
  }
  
  // No data from database or cache
  if (showToast) {
    toast.error("Kunde inte hämta aktiviteter. Kontrollera din anslutning.");
  }
  
  return [];
};
