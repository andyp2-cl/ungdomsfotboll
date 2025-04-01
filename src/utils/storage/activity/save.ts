
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
      // Normalize player_stats to ensure it's always an object before saving
      let normalizedPlayerStats;
      if (!activity.player_stats) {
        normalizedPlayerStats = { goals: {}, assists: {} };
      } else if (typeof activity.player_stats === 'string') {
        try {
          normalizedPlayerStats = JSON.parse(activity.player_stats);
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
          ...activity.player_stats,
          goals: activity.player_stats.goals || {},
          assists: activity.player_stats.assists || {}
        };
      }
      
      // Create a clean activity object with normalized player_stats
      const normalizedActivity = {
        ...activity,
        player_stats: normalizedPlayerStats
      };
      
      const formattedActivity = formatActivityForDatabase(normalizedActivity);
      
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
      await logDatabaseChange(
        isNewActivity ? 'create' : 'update',
        'activity',
        activity.id,
        `${isNewActivity ? 'Created' : 'Updated'} activity: ${activity.name} on ${activity.date}`
      );
      
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
