
import { Activity } from "@/types/player";
import { toast } from "sonner";

/**
 * Caches backup data to localStorage for redundancy
 */
export const cacheBackupData = (backupData: any): boolean => {
  try {
    localStorage.setItem('cachedActivities', JSON.stringify(backupData.activities));
    localStorage.setItem('cachedActivitiesTime', Date.now().toString());
    localStorage.setItem('cachedActivitiesCount', backupData.activities.length.toString());
    
    // Immediately cache matches for redundancy
    const matchActivities = backupData.activities.filter((a: Activity) => a.type === 'match');
    if (matchActivities && matchActivities.length > 0) {
      localStorage.setItem('cachedMatchActivities', JSON.stringify(matchActivities));
      localStorage.setItem('cachedMatchActivitiesTime', Date.now().toString());
      localStorage.setItem('cachedMatchActivitiesCount', matchActivities.length.toString());
      console.log(`Cached ${matchActivities.length} match activities for redundancy`);
    }
    
    return true;
  } catch (cacheError) {
    console.error("Error directly caching backup data (non-critical):", cacheError);
    return false;
  }
};

/**
 * Force a cache update to ensure we get fresh data after restore
 */
export const refreshCaches = (): void => {
  localStorage.setItem('sb-activities-last-update', '0');
  localStorage.setItem('sb-activities-fetch-time', '0');
  localStorage.setItem('sb-connection-test-time', '0');
};
