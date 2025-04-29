
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

// Get activities from Supabase with fallback to cached data
export const getStoredActivities = async (): Promise<Activity[]> => {
  // First check if we're online
  if (!navigator.onLine) {
    console.log("Device is offline, using cached activities");
    try {
      const cachedData = localStorage.getItem('cachedActivities');
      return cachedData ? JSON.parse(cachedData) : [];
    } catch (error) {
      console.error("Error reading cached activities:", error);
      return [];
    }
  }
  
  try {
    // Mark successful connection test early to avoid connection status issues
    localStorage.setItem('sb-connection-test', 'true');
    
    // First, get all activities with timeout protection
    const fetchPromise = supabase.from('activities').select('*');
    
    // Set up a timeout for the fetch
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Fetch activities timeout")), 5000);
    });
    
    // Race the fetch against the timeout
    const { data: activitiesData, error: activitiesError } = await Promise.race([
      fetchPromise,
      timeoutPromise.then(() => { throw new Error("Fetch activities timeout"); })
    ]) as any;
    
    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
      throw activitiesError;
    }
    
    // Ensure we have data before proceeding
    if (!activitiesData) {
      console.log("No activities data found in database");
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
    
    // Cache activities for offline use
    cacheActivities(activities);
    
    // Mark connection as successful
    localStorage.setItem('sb-connection-test', 'true');
    localStorage.setItem('sb-connection-test-time', Date.now().toString());
    
    return activities;
  } catch (error) {
    console.error("Error fetching activities:", error);
    
    // Check if there's a cached version
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
