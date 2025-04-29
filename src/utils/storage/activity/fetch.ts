
import { supabase } from "@/lib/supabase/client";
import { Activity } from "@/types/player";
import { formatActivityFromDatabase } from "@/utils/database/formatters/activity";
import { getCachedApiResponse, cacheApiResponse } from "@/utils/cache/apiCache";
import { toast } from "sonner";

// Cache activities locally for offline access and performance
const cacheActivities = (activities: Activity[]) => {
  try {
    // Store in localStorage for offline fallback (legacy method)
    localStorage.setItem('cachedActivities', JSON.stringify(activities));
    localStorage.setItem('cachedActivitiesTime', Date.now().toString());
    
    // Also store in the API cache system with a 15-minute TTL
    cacheApiResponse('activities', activities, { 
      ttl: 15 * 60, // 15 minutes
      tag: 'activities' 
    });
    
    console.log(`Cached ${activities.length} activities successfully`);
  } catch (error) {
    console.error("Error caching activities:", error);
  }
};

// Get activities from Supabase with improved caching and error handling
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
    try {
      const cachedData = getCachedApiResponse<Activity[]>('activities');
      
      if (cachedData && cachedData.length > 0) {
        if (showToast) {
          toast.info(`Visar ${cachedData.length} cachade aktiviteter (offline läge)`);
        }
        return cachedData;
      }
      
      // Fallback to legacy cache
      const legacyCachedData = localStorage.getItem('cachedActivities');
      return legacyCachedData ? JSON.parse(legacyCachedData) : [];
    } catch (error) {
      console.error("Error reading cached activities:", error);
      return [];
    }
  }
  
  // If online and not forcing a refresh, try to use the cache first
  if (!forceRefresh) {
    const cachedActivities = getCachedApiResponse<Activity[]>('activities');
    
    if (cachedActivities && cachedActivities.length > 0) {
      console.log(`Using ${cachedActivities.length} cached activities, age: ${
        ((Date.now() - Number(localStorage.getItem('cachedActivitiesTime') || 0)) / 1000).toFixed(0)
      }s`);
      
      // In background, refresh the cache if it's older than 5 minutes
      const cacheTime = Number(localStorage.getItem('cachedActivitiesTime') || 0);
      const cacheAge = (Date.now() - cacheTime) / 1000;
      
      if (cacheAge > 300) { // 5 minutes
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
    console.error("Error fetching activities:", error);
    
    // Log detailed error info
    if (error instanceof Error) {
      localStorage.setItem('sb-activities-fetch-error', JSON.stringify({
        message: error.message,
        stack: error.stack,
        time: Date.now()
      }));
    }
    
    // Check if there's a cached version
    try {
      const cachedActivities = getCachedApiResponse<Activity[]>('activities');
      if (cachedActivities && cachedActivities.length > 0) {
        console.log("Using cached activities as fallback");
        if (showToast) {
          toast.warning("Kunde inte hämta nya aktiviteter. Visar cachade aktiviteter.");
        }
        return cachedActivities;
      }
      
      // Fallback to legacy cache
      const legacyCachedData = localStorage.getItem('cachedActivities');
      if (legacyCachedData) {
        console.log("Using legacy cached activities as fallback");
        return JSON.parse(legacyCachedData);
      }
    } catch (cacheError) {
      console.error("Error using cached activities:", cacheError);
    }
    
    if (showToast) {
      toast.error("Kunde inte hämta aktiviteter och ingen cache hittades.");
    }
    return [];
  }
};

// Internal function to fetch activities from database
async function fetchActivitiesFromDB(options: { 
  showToast?: boolean; 
  silent?: boolean
} = {}): Promise<Activity[]> {
  const { showToast = false, silent = false } = options;
  
  // Show loading toast for long operations if not silent
  let loadingToastId: string | null = null;
  const loadingToastTimeout = setTimeout(() => {
    if (!silent) {
      loadingToastId = toast.loading("Hämtar aktiviteter från databasen...");
    }
  }, 500);
  
  try {
    // First, get all activities with timeout protection
    const fetchPromise = supabase.from('activities').select('*');
    
    // Set up a timeout for the fetch
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Hämtning av aktiviteter tog för lång tid")), 8000);
    });
    
    // Race the fetch against the timeout
    const { data: activitiesData, error: activitiesError } = await Promise.race([
      fetchPromise,
      timeoutPromise.then(() => { throw new Error("Hämtning av aktiviteter tog för lång tid"); })
    ]) as any;
    
    // Clear loading toast timeout
    clearTimeout(loadingToastTimeout);
    
    if (activitiesError) {
      // Clear loading toast if it was shown
      if (loadingToastId && !silent) {
        toast.dismiss(loadingToastId);
      }
      
      console.error("Error fetching activities:", activitiesError);
      throw activitiesError;
    }
    
    // Ensure we have data before proceeding
    if (!activitiesData) {
      console.log("No activities data found in database");
      
      // Clear loading toast if it was shown
      if (loadingToastId && !silent) {
        toast.dismiss(loadingToastId);
      }
      
      return [];
    }
    
    // Format all activities properly with correct typing
    const activities: Activity[] = activitiesData.map(formatActivityFromDatabase);
    
    console.log(`Fetched ${activities.length} activities from database`);
    
    // Then, get player-activity relationships
    try {
      const { data: playerActivitiesData } = await supabase
        .from('player_activities')
        .select('*');
      
      // Populate participants for each activity
      if (playerActivitiesData) {
        activities.forEach(activity => {
          const activityPlayerRelations = playerActivitiesData.filter(pa => pa.activity_id === activity.id) || [];
          activity.participants = activityPlayerRelations.map(relation => relation.player_id);
        });
      }
    } catch (relError) {
      console.error("Error fetching player-activity relationships:", relError);
      // Continue with activities without participants
    }
    
    // Clear loading toast and show success if appropriate
    if (loadingToastId && !silent) {
      toast.dismiss(loadingToastId);
      if (showToast) {
        toast.success(`Hämtade ${activities.length} aktiviteter`);
      }
    }
    
    return activities;
  } catch (error) {
    // Clear loading toast and show error if appropriate
    clearTimeout(loadingToastTimeout);
    if (loadingToastId && !silent) {
      toast.dismiss(loadingToastId);
    }
    
    if (!silent) {
      toast.error(`Hämtning av aktiviteter misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    }
    
    throw error;
  }
}
