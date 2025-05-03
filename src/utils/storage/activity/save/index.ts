
import { Activity } from "@/types/player";
import { saveActivity } from "./saveActivity";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { supabase } from "@/lib/supabase/client";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";
import { toast } from "sonner";

// Main export function for saving activities
export async function saveActivities(activities: Activity[]): Promise<boolean> {
  try {
    console.log(`Saving ${activities.length} activities to storage`);
    
    // Track how many were saved successfully
    let successCount = 0;
    let errorCount = 0;
    
    // Create a copy of activities to avoid mutations
    const activitiesToSave = JSON.parse(JSON.stringify(activities));

    // Process each activity
    for (const activity of activitiesToSave) {
      try {
        // Always save to local storage as first layer of reliability
        saveToLocalStorage(activity);
        
        // Then try to save to database with our most robust approach
        await saveToDatabase(activity);
        successCount++;
        console.log(`Activity ${activity.id} saved successfully`);
      } catch (error) {
        console.error(`Failed to save activity ${activity.id}:`, error);
        errorCount++;
        
        // Continue with next activity rather than aborting the whole batch
      }
    }
    
    // Show toast only if at least one activity had an issue
    if (errorCount > 0) {
      toast.warning(`${errorCount} aktiviteter kunde inte sparas i databasen, men finns lokalt.`);
    } else if (successCount > 0) {
      toast.success(`${successCount} aktiviteter sparades framgångsrikt`);
    }
    
    // Return success if at least one activity was saved
    return successCount > 0;
  } catch (error) {
    console.error("Error in saveActivities:", error);
    
    // Try to log the error
    try {
      await logDatabaseChange('error', 'activity', 'batch', `Error saving activities: ${error.message || 'Unknown error'}`);
    } catch (logError) {
      // Just log to console if logging to database fails
      console.error("Failed to log error to database:", logError);
    }
    
    return false;
  }
}

// Function to save activity to local storage
function saveToLocalStorage(activity: Activity): void {
  try {
    // Get existing activities from localStorage
    const existingActivitiesJson = localStorage.getItem('activities');
    const existingActivities = existingActivitiesJson ? JSON.parse(existingActivitiesJson) : [];
    
    // Create a map for faster lookups
    const activitiesMap = new Map(existingActivities.map((a: Activity) => [a.id, a]));
    
    // Update or add the new activity
    activitiesMap.set(activity.id, activity);
    
    // Convert back to array and save
    const updatedActivities = Array.from(activitiesMap.values());
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
    
    // Also save to pendingUpdates for guaranteed sync later
    const pendingUpdates = JSON.parse(localStorage.getItem('pendingActivityUpdates') || '{}');
    pendingUpdates[activity.id] = {
      ...activity,
      pendingSync: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('pendingActivityUpdates', JSON.stringify(pendingUpdates));
    
    // Save match scores separately for easier access
    if (activity.type === 'match' && (activity.homeScore !== undefined || activity.awayScore !== undefined)) {
      const matchScores = JSON.parse(localStorage.getItem('matchScores') || '{}');
      matchScores[activity.id] = {
        homeScore: activity.homeScore,
        awayScore: activity.awayScore,
        isWin: activity.isWin,
        result: activity.result || `${activity.homeScore}-${activity.awayScore}`,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('matchScores', JSON.stringify(matchScores));
      console.log(`Match score for ${activity.id} saved to local storage:`, matchScores[activity.id]);
    }
    
    console.log(`Activity ${activity.id} saved to local storage`);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    throw error;
  }
}

// Function to save activity to database with multiple fallbacks
async function saveToDatabase(activity: Activity): Promise<boolean> {
  try {
    // Format activity for database
    const formattedActivity = formatActivityForDatabase(activity);
    
    // Log what we're saving to help debug
    console.log("Saving to database:", {
      id: formattedActivity.id,
      home_score: formattedActivity.home_score,
      away_score: formattedActivity.away_score,
      is_win: formattedActivity.is_win,
      result: formattedActivity.result
    });
    
    // Try direct update with Supabase first
    const { error } = await supabase
      .from('activities')
      .upsert(formattedActivity);
    
    if (!error) {
      console.log(`Activity ${activity.id} saved to database successfully`);
      
      // Log the successful update
      await logDatabaseChange('update', 'activity', activity.id, 'Successfully saved to database');
      
      // Remove from pending updates if it exists
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingActivityUpdates') || '{}');
      if (pendingUpdates[activity.id]) {
        delete pendingUpdates[activity.id];
        localStorage.setItem('pendingActivityUpdates', JSON.stringify(pendingUpdates));
      }
      
      return true;
    }
    
    console.warn("Initial database save failed:", error.message);
    
    // Try the fallback method with optimized parameters
    // This will try multiple database update approaches
    const { success } = await tryOptimizedUpdate(activity.id, formattedActivity);
    
    if (success) {
      console.log(`Activity ${activity.id} saved to database using fallback method`);
      await logDatabaseChange('update', 'activity', activity.id, 'Successfully saved using fallback method');
      return true;
    }
    
    throw new Error("All database save methods failed");
  } catch (error) {
    console.error(`Error saving activity ${activity.id} to database:`, error);
    await logDatabaseChange('error', 'activity', activity.id, `Failed to save: ${error.message || 'Unknown error'}`);
    throw error;
  }
}

// Optimized database update with multiple approaches
async function tryOptimizedUpdate(activityId: string, activity: any): Promise<{success: boolean, error?: any}> {
  try {
    // Try REST API approach first (most reliable)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const apiUrl = `https://zkrruihxszziifyogzko.supabase.co/rest/v1/activities?id=eq.${activityId}`;
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
          'Authorization': token ? `Bearer ${token}` : '',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(activity)
      });
      
      if (response.ok) {
        return { success: true };
      }
      console.warn("REST API approach failed:", await response.text());
    } catch (e) {
      console.error("REST API error:", e);
    }
    
    // Try using the INSERT method with upsert
    try {
      // Use the correct method for Supabase JS v2
      const { error } = await supabase
        .from('activities')
        .upsert(activity);
        
      if (!error) {
        return { success: true };
      }
      console.warn("Insert with upsert failed:", error);
    } catch (e) {
      console.error("Insert with upsert error:", e);
    }
    
    // Try scores-only update - this is the most important part for match results
    try {
      // Focus specifically on the match result fields
      const scoresOnly = {
        home_score: activity.home_score,
        away_score: activity.away_score,
        is_win: activity.is_win,
        result: activity.result
      };
      
      console.log("Attempting scores-only update with:", scoresOnly);
      
      const { error } = await supabase
        .from('activities')
        .update(scoresOnly)
        .eq('id', activityId);
        
      if (!error) {
        console.log("Scores-only update succeeded");
        return { success: true };
      }
      console.warn("Scores-only update failed:", error);
    } catch (e) {
      console.error("Scores update error:", e);
    }
    
    // Return false but we'll still have the local storage backup
    return { success: false, error: "All database methods failed, falling back to local storage only" };
    
  } catch (error) {
    console.error("All optimized update methods failed:", error);
    return { success: false, error };
  }
}
