
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "@/types/player";
import { formatActivityForDatabase } from "@/utils/database/formatters";
import { updateActivityParticipants } from "./participants";
import { updateCupMatches } from "./cup-matches";
import { normalizePlayerStats } from "@/utils/database/formatters/player-stats";

// Save activities to Supabase
export const saveActivities = async (activities: Activity[]): Promise<void> => {
  console.log("Saving activities to Supabase:", activities.length);
  
  try {
    for (const activity of activities) {
      // Clone the activity to avoid mutations during processing
      const activityToSave = { ...activity };
      
      // Normalize player_stats to ensure it's always an object before saving
      const normalizedPlayerStats = normalizePlayerStats(activityToSave.player_stats);
      
      // Create a clean activity object with normalized player_stats
      const normalizedActivity = {
        ...activityToSave,
        player_stats: normalizedPlayerStats
      };
      
      const formattedActivity = formatActivityForDatabase(normalizedActivity);
      
      console.log("Saving activity with details:", {
        id: normalizedActivity.id,
        name: normalizedActivity.name,
        type: normalizedActivity.type,
        cupName: normalizedActivity.cupName,
        matches: normalizedActivity.matches?.length || 0,
        isWin: normalizedActivity.isWin,
        homeScore: normalizedActivity.homeScore,
        awayScore: normalizedActivity.awayScore
      });
      
      // Check if activity already exists to determine if this is an update or create
      const { data: existingActivity } = await supabase
        .from('activities')
        .select('id')
        .eq('id', activity.id)
        .single();
      
      const isNewActivity = !existingActivity;
      
      // Ensure cup_name is properly set if cupName exists (new field)
      if (normalizedActivity.cupName) {
        formattedActivity.cup_name = normalizedActivity.cupName;
        console.log(`Setting cup_name to ${normalizedActivity.cupName} for ${normalizedActivity.name}`);
      }
      
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
      
      // For cup activities, we'll use the new cupName approach instead of the complex relationship
      if (activity.type === 'match' && activity.cupName) {
        console.log(`Match ${activity.name} is part of cup: ${activity.cupName}`);
      }
    }
  } catch (error) {
    console.error("Error saving activities to Supabase:", error);
    throw error;
  }
};
