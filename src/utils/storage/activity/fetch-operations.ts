
import { supabase } from "@/lib/supabase/client";
import { Activity } from "@/types/player";
import { formatActivityFromDatabase } from "@/utils/database/formatters/activity";
import { toast } from "sonner";

/**
 * Fetch activities from the database
 */
export async function fetchActivitiesFromDB(options: { 
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
