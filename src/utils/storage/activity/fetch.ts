
import { Activity } from "@/types/player";
import { toast } from "sonner";
import { cacheActivities, getActivitiesFromCache } from "./cache-operations";
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
  
  if (showToast) {
    toast.loading("Hämtar aktiviteter från servern...");
  }
  
  // ALWAYS try to fetch from database when online, regardless of forceRefresh
  if (navigator.onLine) {
    try {
      // Reset cached connection test to ensure we're actually trying to connect
      localStorage.removeItem('sb-connection-test');
      
      // Fetch fresh data from database - always try when online
      const activities = await fetchActivitiesFromDB({ 
        showToast,
        silent: !showToast
      });
      
      // Calculate and log performance
      const endTime = performance.now();
      console.log(`Fetched ${activities.length} activities from database in ${(endTime - startTime).toFixed(2)}ms`);
      
      // Cache the results every time we get fresh data
      if (activities && activities.length > 0) {
        cacheActivities(activities);
        if (showToast) {
          toast.dismiss();
          toast.success(`${activities.length} aktiviteter hämtade`);
        }
      } else {
        if (showToast) {
          toast.dismiss();
          toast.warning("Inga aktiviteter hämtades, försöker med lokal cache");
        }
        
        // Even if no data returned, mark as successful connection if no error was thrown
        localStorage.setItem('sb-connection-test', 'true');
        localStorage.setItem('sb-connection-test-time', Date.now().toString());
        
        // Try to use cache as fallback if we got empty data but no error
        const cachedActivities = getActivitiesFromCache();
        if (cachedActivities && cachedActivities.length > 0) {
          return cachedActivities;
        }
      }
      
      return activities;
    } catch (error) {
      console.error("Failed to fetch from database, trying cache:", error);
      toast.dismiss();
      
      // On error, always try to use cache as fallback
      const cachedActivities = getActivitiesFromCache(false);
      if (cachedActivities && cachedActivities.length > 0) {
        if (showToast) {
          toast.warning("Kunde inte ansluta till databasen. Visar cachad data.");
        }
        return cachedActivities;
      }
      
      // If we can't get from cache either, handle the error properly
      if (showToast) {
        toast.error("Kunde inte hämta aktiviteter. Kontrollera din anslutning.");
      }
      return handleFetchError(error, showToast);
    }
  } else {
    // When offline, use the cache and be clear about it
    console.log("Device is offline, using cached activities");
    const cachedData = getActivitiesFromCache(false);
    
    if (showToast) {
      toast.dismiss();
      if (!cachedData || cachedData.length === 0) {
        toast.warning("Ingen data tillgänglig offline. Anslut till internet för att ladda data.");
      } else {
        toast.info(`Visar ${cachedData.length} cachade aktiviteter (offline-läge)`);
      }
    }
    
    return cachedData || [];
  }
};
