
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";

/**
 * Core sync operations to handle database synchronization
 */

/**
 * Process pending updates by sending them to the database
 * Returns success and failure counts
 */
export const syncPendingUpdates = async (): Promise<{ 
  successCount: number; 
  failureCount: number;
  remainingUpdates: Record<string, any>; 
}> => {
  try {
    // Get pending updates from localStorage
    const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
    if (!pendingUpdatesJson) {
      return { successCount: 0, failureCount: 0, remainingUpdates: {} };
    }
    
    const pendingUpdates = JSON.parse(pendingUpdatesJson);
    const activityIds = Object.keys(pendingUpdates);
    
    if (activityIds.length === 0) {
      return { successCount: 0, failureCount: 0, remainingUpdates: {} };
    }
    
    console.log(`Found ${activityIds.length} pending score updates to sync`);
    
    // Check for active user session before proceeding
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No active session, sync will be performed when user logs in");
      return { successCount: 0, failureCount: 0, remainingUpdates: pendingUpdates };
    }
    
    // Process each pending update
    let successCount = 0;
    let failureCount = 0;
    
    for (const activityId of activityIds) {
      const pendingUpdate = pendingUpdates[activityId];
      
      try {
        const success = await syncSingleActivity(activityId, pendingUpdate, session.access_token);
        
        if (success) {
          delete pendingUpdates[activityId];
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        failureCount++;
        console.error(`Exception syncing activity ${activityId}:`, error);
      }
    }
    
    // Update localStorage with remaining updates
    if (Object.keys(pendingUpdates).length > 0) {
      localStorage.setItem('pendingScoreUpdates', JSON.stringify(pendingUpdates));
      console.log(`${successCount} updates synced, ${Object.keys(pendingUpdates).length} remaining`);
    } else {
      localStorage.removeItem('pendingScoreUpdates');
      console.log("All pending updates synced successfully");
    }
    
    return { successCount, failureCount, remainingUpdates: pendingUpdates };
  } catch (error) {
    console.error("Error syncing pending updates:", error);
    return { successCount: 0, failureCount: 0, remainingUpdates: {} };
  }
};

/**
 * Sync a single activity to database using multiple approaches
 * Returns true if sync was successful
 */
const syncSingleActivity = async (
  activityId: string, 
  pendingUpdate: any, 
  token: string
): Promise<boolean> => {
  console.log(`Syncing activity ${activityId}`);
  
  // APPROACH 1: Direct REST API call with auth token
  try {
    const apiUrl = `https://zkrruihxszziifyogzko.supabase.co/rest/v1/activities?id=eq.${activityId}`;
    
    // First check if the activity exists
    const checkResponse = await fetch(`${apiUrl}&select=id`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!checkResponse.ok) {
      console.error(`Activity ${activityId} check failed:`, await checkResponse.text());
      return false;
    }
    
    const checkData = await checkResponse.json();
    if (!checkData.length) {
      console.error(`Activity ${activityId} not found`);
      return false;
    }
    
    // Once we confirmed the activity exists, update it
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        home_score: pendingUpdate.homeScore,
        away_score: pendingUpdate.awayScore,
        is_win: pendingUpdate.isWin,
        result: pendingUpdate.result,
        player_stats: {
          goals: {},
          assists: {},
          scores: {
            home: pendingUpdate.homeScore,
            away: pendingUpdate.awayScore
          },
          isWin: pendingUpdate.isWin,
          cup_matches: [],
          matches: 0,
          wins: 0,
          draws: 0,
          losses: 0
        }
      })
    });
    
    if (response.ok) {
      console.log(`Successfully synced activity ${activityId} via direct REST API`);
      return true;
    }
    
    console.warn(`Failed to sync activity ${activityId}:`, await response.text());
  } catch (error) {
    console.error("Error in direct API approach:", error);
  }
  
  // APPROACH 2: Use Supabase client as fallback
  try {
    console.log(`Trying Supabase client for activity ${activityId}`);
    
    const { error } = await supabase
      .from('activities')
      .update({
        home_score: pendingUpdate.homeScore,
        away_score: pendingUpdate.awayScore,
        is_win: pendingUpdate.isWin,
        result: pendingUpdate.result,
        player_stats: {
          goals: {},
          assists: {},
          scores: {
            home: pendingUpdate.homeScore,
            away: pendingUpdate.awayScore
          },
          isWin: pendingUpdate.isWin,
          cup_matches: [],
          matches: 0,
          wins: 0,
          draws: 0,
          losses: 0
        }
      })
      .eq('id', activityId);
      
    if (!error) {
      console.log(`Successfully synced activity ${activityId} via Supabase client`);
      return true;
    }
    
    console.warn(`Failed with Supabase client approach:`, error);
  } catch (error) {
    console.error("Error in Supabase client approach:", error);
  }
  
  // APPROACH 3: Try with minimal update as last resort
  try {
    const apiUrl = `https://zkrruihxszziifyogzko.supabase.co/rest/v1/activities?id=eq.${activityId}`;
    
    const minimalResponse = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        home_score: pendingUpdate.homeScore,
        away_score: pendingUpdate.awayScore
      })
    });
    
    if (minimalResponse.ok) {
      console.log(`Successfully synced activity ${activityId} with minimal update`);
      return true;
    } else {
      console.error(`All sync attempts failed for activity ${activityId}`);
    }
  } catch (error) {
    console.error("Error in minimal update approach:", error);
  }
  
  return false;
};
