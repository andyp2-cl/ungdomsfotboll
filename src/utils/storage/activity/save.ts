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
  console.log("[saveActivities] Starting save of", activities.length, "activities");
  
  try {
    // First check if Supabase is properly configured
    const isConnected = await isSupabaseConfigured();
    
    if (!isConnected) {
      throw new Error("Supabase connection is not properly configured or is not working");
    }
    
    // Process all activities first to ensure they're valid
    const processedActivities = activities.map(activity => {
      const activityToSave = structuredClone(activity);
      
      // Set cupId to the activity's id if it's a cup type
      if (activityToSave.type === "cup") {
        activityToSave.cupId = activityToSave.id;
        console.log(`[saveActivities] Setting cupId for cup activity: ${activityToSave.id}`);
      }
      
      // Normalize player_stats
      const normalizedPlayerStats = normalizePlayerStats(activityToSave.player_stats);
      
      return {
        ...activityToSave,
        player_stats: normalizedPlayerStats
      };
    });
    
    // Save activities in batches to avoid timeouts
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < processedActivities.length; i += batchSize) {
      batches.push(processedActivities.slice(i, i + batchSize));
    }
    
    console.log(`[saveActivities] Processing ${batches.length} batches of activities`);
    
    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`[saveActivities] Processing batch ${batchIndex + 1}/${batches.length}`);
      
      // Process each activity in the batch
      for (const activity of batch) {
        try {
          console.log(`[saveActivities] Processing activity: ${activity.name} (${activity.id})`);
          
          // Check if activity exists
          const { data: existingActivity, error: checkError } = await supabase
            .from('activities')
            .select('id')
            .eq('id', activity.id)
            .single();
            
          if (checkError && checkError.code !== 'PGRST116') {
            console.error("[saveActivities] Error checking if activity exists:", checkError);
            throw checkError;
          }
          
          const isNewActivity = !existingActivity;
          
          // Format and clean the activity for database storage
          const formattedActivity = formatActivityForDatabase(activity);
          const cleanFormattedActivity = JSON.parse(JSON.stringify(formattedActivity));
          
          // Save the activity
          const { error: upsertError } = await supabase
            .from('activities')
            .upsert(cleanFormattedActivity);
            
          if (upsertError) {
            console.error("[saveActivities] Error upserting activity:", upsertError);
            throw upsertError;
          }
          
          console.log(`[saveActivities] ${isNewActivity ? 'Created' : 'Updated'} activity: ${activity.name}`);
          
          // Handle participants
          if (activity.participants && activity.participants.length > 0) {
            console.log(`[saveActivities] Updating ${activity.participants.length} participants for activity: ${activity.name}`);
            await updateActivityParticipants(activity);
            
            // Verify participants were saved correctly
            const { data: verifyData, error: verifyError } = await supabase
              .from('player_activities')
              .select('*')
              .eq('activity_id', activity.id);
              
            if (verifyError) {
              console.error("[saveActivities] Error verifying participants:", verifyError);
              throw verifyError;
            }
            
            const savedParticipantCount = verifyData?.length || 0;
            if (savedParticipantCount !== activity.participants.length) {
              console.error(`[saveActivities] Participant count mismatch: Expected ${activity.participants.length}, got ${savedParticipantCount}`);
              throw new Error('Participant verification failed');
            }
            
            console.log(`[saveActivities] Verified ${savedParticipantCount} participants saved correctly`);
          }
          
          // Handle cup matches if this is a cup activity
          if (activity.type === "cup" && activity.matches && activity.matches.length > 0) {
            console.log(`[saveActivities] Updating ${activity.matches.length} matches for cup: ${activity.name}`);
            await updateCupMatches(activity, activities);
            
            // Verify cup matches were saved correctly
            const { data: cupData, error: cupError } = await supabase
              .from('activities')
              .select('player_stats')
              .eq('id', activity.id)
              .single();
              
            if (cupError) {
              console.error("[saveActivities] Error verifying cup matches:", cupError);
              throw cupError;
            }
            
            const savedMatches = cupData?.player_stats?.cup_matches || [];
            if (savedMatches.length !== activity.matches.length) {
              console.error(`[saveActivities] Cup match count mismatch: Expected ${activity.matches.length}, got ${savedMatches.length}`);
              throw new Error('Cup match verification failed');
            }
            
            console.log(`[saveActivities] Verified ${savedMatches.length} cup matches saved correctly`);
          }
          
          // Log the change
          try {
            await logDatabaseChange(
              isNewActivity ? 'create' : 'update',
              'activity',
              activity.id,
              `${isNewActivity ? 'Created' : 'Updated'} activity: ${activity.name} on ${activity.date}`
            );
          } catch (logError) {
            console.error("[saveActivities] Error logging database change (continuing anyway):", logError);
          }
          
        } catch (error) {
          console.error(`[saveActivities] Error processing activity ${activity.id}:`, error);
          throw error;
        }
      }
    }
    
    console.log("[saveActivities] Successfully saved all activities");
  } catch (error) {
    console.error("[saveActivities] Error saving activities:", error);
    throw error;
  }
};
