
import { supabase } from "@/lib/supabase/client";
import { Activity } from "@/types/player";
import { formatActivityFromDatabase } from "@/utils/database/formatters/activity";

// Get activities from Supabase
export const getStoredActivities = async (): Promise<Activity[]> => {
  try {
    // First, check database connection
    const { data: testData, error: testError } = await supabase
      .from('leagues')
      .select('count')
      .limit(1);
      
    if (testError) {
      console.error("Database connection test failed before fetching activities:", testError);
      // Try to refresh session and try again
      try {
        await supabase.auth.refreshSession();
        console.log("Session refreshed, retrying activities fetch");
      } catch (refreshError) {
        console.error("Failed to refresh session:", refreshError);
      }
    }
    
    // First, get all activities
    let { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*');
      
    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
      
      // If we have a 401 error, try to refresh session and retry
      if (activitiesError.code === '401' || activitiesError.message.includes('JWT')) {
        try {
          await supabase.auth.refreshSession();
          console.log("Session refreshed after 401, retrying activities fetch");
          
          // Retry after session refresh
          const { data: retryData, error: retryError } = await supabase
            .from('activities')
            .select('*');
            
          if (retryError) {
            throw retryError;
          }
          
          // Use retry data if successful
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
    
    // Log all cup type activities and matches with cup references
    const cupActivities = activities.filter(a => a.type === 'cup');
    const matchesWithCupName = activities.filter(a => a.type === 'match' && a.cupName);
    
    console.log(`Found ${cupActivities.length} cup activities and ${matchesWithCupName.length} matches with cupName`);
    console.log("Cup names found:", [...new Set([
      ...cupActivities.map(c => c.name),
      ...matchesWithCupName.map(m => m.cupName).filter(Boolean)
    ])]);
    
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
    
    // For cup activities, find matches that have this cup as parent
    const cupActivitiesArray = activities.filter(a => a.type === 'cup');
    
    // First pass: ensure all cup activities have a matches array
    cupActivitiesArray.forEach(cupActivity => {
      if (!cupActivity.matches) {
        cupActivity.matches = [];
      }
    });
    
    // Second pass: Process cup-match relationships
    cupActivitiesArray.forEach(cupActivity => {
      // Look for matches that reference this cup via cupId
      const matchesByCupId = activities.filter(a => 
        a.cupId === cupActivity.id && a.type === 'match'
      );
      
      // Look for matches that reference this cup via cupName
      const matchesByCupName = activities.filter(a => 
        a.type === 'match' && a.cupName === cupActivity.name
      );
      
      // Combine both sets of matches, removing duplicates
      const allMatches = [...matchesByCupId];
      
      // Add matches by name if they aren't already included by ID
      matchesByCupName.forEach(match => {
        if (!allMatches.some(m => m.id === match.id)) {
          allMatches.push(match);
        }
      });
      
      // Update the cup's matches array with all found matches
      cupActivity.matches = allMatches.map(m => m.id);
      
      console.log(`Cup ${cupActivity.name} (${cupActivity.id}) has ${cupActivity.matches.length} matches after linking`);
    });
    
    console.log("Retrieved and linked activities from Supabase:", activities.length);
    
    // Store a successful DB connection flag
    localStorage.setItem('sb-connection-test', 'true');
    
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
