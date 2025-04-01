
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "./types";
import { formatActivityForDatabase } from "@/utils/database/formatters";
import { updateActivityParticipants } from "./participants";
import { updateCupMatches } from "./cupMatches";

// Save activities to Supabase
export const saveActivities = async (activities: Activity[]): Promise<void> => {
  console.log("Saving activities to Supabase:", activities.length);
  
  try {
    for (const activity of activities) {
      // Clone the activity to avoid mutations during processing
      const activityToSave = { ...activity };
      
      // Normalize player_stats to ensure it's always an object before saving
      let normalizedPlayerStats;
      
      if (!activityToSave.player_stats) {
        normalizedPlayerStats = { goals: {}, assists: {} };
      } else if (typeof activityToSave.player_stats === 'string') {
        try {
          normalizedPlayerStats = JSON.parse(activityToSave.player_stats);
          // If still a string after parsing (double-stringified), parse again
          if (typeof normalizedPlayerStats === 'string') {
            normalizedPlayerStats = JSON.parse(normalizedPlayerStats);
          }
        } catch (e) {
          console.error("Error parsing player_stats string:", e);
          normalizedPlayerStats = { goals: {}, assists: {} };
        }
      } else {
        // Already an object, just ensure required properties exist
        normalizedPlayerStats = {
          ...activityToSave.player_stats,
          goals: activityToSave.player_stats.goals || {},
          assists: activityToSave.player_stats.assists || {}
        };
      }
      
      // Create a clean activity object with normalized player_stats
      const normalizedActivity = {
        ...activityToSave,
        player_stats: normalizedPlayerStats
      };
      
      const formattedActivity = formatActivityForDatabase(normalizedActivity);
      
      console.log("Saving activity with player_stats:", {
        id: normalizedActivity.id,
        name: normalizedActivity.name,
        playerStatsType: typeof normalizedActivity.player_stats
      });
      
      // Check if activity already exists to determine if this is an update or create
      const { data: existingActivity } = await supabase
        .from('activities')
        .select('id')
        .eq('id', activity.id)
        .single();
      
      const isNewActivity = !existingActivity;
      
      // Upsert the activity
      const { error: upsertError } = await supabase
        .from('activities')
        .upsert(formattedActivity, { onConflict: 'id' });
        
      if (upsertError) {
        console.error("Error upserting activity:", upsertError);
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
      await updateActivityParticipants(normalizedActivity);
      
      // For cup activities, handle cup-match relationships
      if (activity.type === 'cup') {
        console.log(`Processing cup-match relationships for cup ${activity.name}`);
        await updateCupMatches(normalizedActivity, activities);
      }
    }
  } catch (error) {
    console.error("Error saving activities to Supabase:", error);
    throw error;
  }
};
