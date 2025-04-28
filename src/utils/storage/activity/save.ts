
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "@/types/player";
import { formatActivityForDatabase } from "@/utils/database/formatters";
import { updateActivityParticipants } from "./participants";
import { updateCupMatches } from "./cup-matches";
import { normalizePlayerStats } from "@/utils/database/formatters/player-stats";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// Save activities to Supabase
export const saveActivities = async (activities: Activity[]): Promise<void> => {
  console.log("Saving activities to Supabase:", activities.length);
  
  try {
    // First check if Supabase is properly configured
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      throw new Error("Supabase connection is not properly configured or is not working");
    }
    
    for (const activity of activities) {
      // Clone the activity to avoid mutations during processing
      const activityToSave = structuredClone(activity);
      
      // Set cupId to the activity's id if it's a cup type
      if (activityToSave.type === "cup") {
        activityToSave.cupId = activityToSave.id;
        console.log(`Setting cupId for cup activity: ${activityToSave.id}`);
      }
      
      // Normalize player_stats to ensure it's always an object before saving
      const normalizedPlayerStats = normalizePlayerStats(activityToSave.player_stats);
      
      // Create a clean activity object with normalized player_stats
      const normalizedActivity = {
        ...activityToSave,
        player_stats: normalizedPlayerStats
      };
      
      // Log detailed information about the activity being saved
      console.log("Saving activity with details:", {
        id: normalizedActivity.id,
        name: normalizedActivity.name,
        type: normalizedActivity.type,
        cupId: normalizedActivity.cupId,
        date: normalizedActivity.date,
        participants: normalizedActivity.participants?.length || 0,
        matches: normalizedActivity.matches?.length || 0,
      });
      
      try {
        // Check if activity already exists to determine if this is an update or create
        const { data: existingActivity, error: checkError } = await supabase
          .from('activities')
          .select('id')
          .eq('id', activity.id)
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') {
          console.error("Error checking if activity exists:", checkError.message, checkError.details);
        }
        
        const isNewActivity = !existingActivity;
        
        // Format the activity for database storage
        const formattedActivity = formatActivityForDatabase(normalizedActivity);
        
        // Make a safe copy of the formatted activity to avoid circular references
        const cleanFormattedActivity = JSON.parse(JSON.stringify(formattedActivity));
        console.log("Data being sent to Supabase:", JSON.stringify(cleanFormattedActivity));
        
        // Try multiple approaches to handle potential RLS issues
        let upsertError;
        
        // First try: standard upsert
        const upsertResult = await supabase
          .from('activities')
          .upsert(cleanFormattedActivity);
          
        upsertError = upsertResult.error;
        
        // If that failed, try direct update if it's an existing activity
        if (upsertError && !isNewActivity) {
          console.log("Upsert failed, trying direct update:", upsertError.message);
          
          const updateResult = await supabase
            .from('activities')
            .update(cleanFormattedActivity)
            .eq('id', activity.id);
            
          upsertError = updateResult.error;
        }
          
        if (upsertError) {
          console.error("Error saving activity:", upsertError.message, upsertError.details);
          throw upsertError;
        }
        
        console.log(`${isNewActivity ? 'Created' : 'Updated'} activity: ${activity.name} (${activity.id})`);
        
        // Log the change
        try {
          await logDatabaseChange(
            isNewActivity ? 'create' : 'update',
            'activity',
            activity.id,
            `${isNewActivity ? 'Created' : 'Updated'} activity: ${activity.name} on ${activity.date}`
          );
        } catch (logError) {
          // Don't fail the operation if logging fails
          console.error("Error logging database change (continuing anyway):", logError);
        }
        
        // Handle player-activity relationships
        try {
          if (normalizedActivity.participants && normalizedActivity.participants.length > 0) {
            await updateActivityParticipants(normalizedActivity);
            console.log(`Updated participants for activity: ${activity.name} (${normalizedActivity.participants?.length || 0} participants)`);
          }
        } catch (participantError) {
          console.error("Error updating activity participants:", participantError);
        }
        
        // Handle cup matches if this is a cup activity
        if (normalizedActivity.type === "cup" && normalizedActivity.matches && normalizedActivity.matches.length > 0) {
          try {
            await updateCupMatches(normalizedActivity, activities);
            console.log(`Updated ${normalizedActivity.matches.length} matches for cup: ${normalizedActivity.name}`);
          } catch (cupMatchError) {
            console.error("Error updating cup matches:", cupMatchError);
          }
        }
      } catch (activityError) {
        console.error("Error processing activity:", normalizedActivity.id, activityError);
        // Continue with other activities instead of failing the entire batch
      }
    }
  } catch (error) {
    console.error("Error saving activities to Supabase:", error);
    throw error;
  }
};
