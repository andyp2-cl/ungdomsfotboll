
import { Activity } from "@/types/player";
import { getActivitiesFromCache } from "./cache-operations";
import { toast } from "sonner";

/**
 * Handle errors when fetching activities
 * Attempts to provide fallback data from cache
 */
export const handleFetchError = (error: unknown, showToast: boolean = false): Activity[] => {
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
    const cachedActivities = getActivitiesFromCache();
    if (cachedActivities && cachedActivities.length > 0) {
      console.log("Using cached activities as fallback");
      if (showToast) {
        toast.warning("Kunde inte hämta nya aktiviteter. Visar cachade aktiviteter.");
      }
      return cachedActivities;
    }
  } catch (cacheError) {
    console.error("Error using cached activities:", cacheError);
  }
  
  if (showToast) {
    toast.error("Kunde inte hämta aktiviteter och ingen cache hittades.");
  }
  
  return [];
};
