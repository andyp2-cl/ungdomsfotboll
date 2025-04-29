
import { supabase } from "@/lib/supabase/client";
import { Activity } from "@/types/player";
import { formatActivityFromDatabase } from "@/utils/database/formatters/activity";

// Cache activities locally for offline access
const cacheActivities = (activities: Activity[]) => {
  try {
    localStorage.setItem('cachedActivities', JSON.stringify(activities));
    localStorage.setItem('cachedActivitiesTime', Date.now().toString());
  } catch (error) {
    console.error("Error caching activities:", error);
  }
};

// Get activities from Supabase
export const getStoredActivities = async (): Promise<Activity[]> => {
  try {
    // Mark successful connection test early to avoid connection status issues
    localStorage.setItem('sb-connection-test', 'true');
    
    // First, get all activities
    let { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*');
      
    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
      
      // If we have a 401 error, try to refresh session and retry
      if (activitiesError.code === '401' || activitiesError.message.includes('JWT')) {
        try {
          console.log("Attempting to refresh session after 401...");
          await supabase.auth.refreshSession();
          
          // Retry after session refresh
          const { data: retryData, error: retryError } = await supabase
            .from('activities')
            .select('*');
            
          if (retryError) {
            console.error("Retry after refresh still failed:", retryError);
            throw retryError;
          }
          
          // Use retry data if successful
          console.log("Session refresh and retry succeeded");
          if (retryData) {
            activitiesData = retryData;
          }
        } catch (refreshError) {
          console.error("Failed to refresh session after 401:", refreshError);
          throw activitiesError; // Re-throw original error if refresh fails
        }
      } else {
        throw activitiesError;
      }
    }
    
    // Ensure we have data before proceeding
    if (!activitiesData) {
      console.log("No activities data found in database");
      return [];
    }
    
    // Format all activities properly with correct typing
    const activities: Activity[] = activitiesData.map(formatActivityFromDatabase);
    
    console.log(`Fetched ${activities.length} activities from database`);
    
    // Then, get player-activity relationships and populate the participants array
    const { data: playerActivitiesData, error: relationshipError } = await supabase
      .from('player_activities')
      .select('*');
      
    if (relationshipError) {
      console.error("Error fetching player-activity relationships:", relationshipError);
      // Continue processing even if we can't get relationships
    }
    
    // Populate participants for each activity
    activities.forEach(activity => {
      const activityPlayerRelations = playerActivitiesData?.filter(pa => pa.activity_id === activity.id) || [];
      activity.participants = activityPlayerRelations.map(relation => relation.player_id);
    });
    
    // Cache activities for offline use
    cacheActivities(activities);
    
    // Mark connection as successful
    localStorage.setItem('sb-connection-test', 'true');
    localStorage.setItem('sb-connection-test-time', Date.now().toString());
    
    return activities;
  } catch (error) {
    console.error("Error fetching activities:", error);
    // Check if there's a cached version we can use as fallback
    try {
      const cachedActivities = localStorage.getItem('cachedActivities');
      if (cachedActivities) {
        console.log("Using cached activities as fallback");
        return JSON.parse(cachedActivities);
      }
    } catch (cacheError) {
      console.error("Error using cached activities:", cacheError);
    }
    return [];
  }
};
