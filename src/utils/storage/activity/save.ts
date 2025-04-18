
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
      
      // Format the activity for database storage
      const formattedActivity = formatActivityForDatabase(normalizedActivity);
      
      // Log detailed information about the activity being saved
      console.log("Saving activity with details:", {
        id: normalizedActivity.id,
        name: normalizedActivity.name,
        type: normalizedActivity.type,
        cupId: normalizedActivity.cupId,
        cupName: normalizedActivity.cupName,
        cup_id: formattedActivity.cup_id,
        cup_name: formattedActivity.cup_name,
        date: normalizedActivity.date,
        participants: normalizedActivity.participants?.length || 0,
        matches: normalizedActivity.matches?.length || 0,
        isWin: normalizedActivity.isWin,
        homeScore: normalizedActivity.homeScore,
        awayScore: normalizedActivity.awayScore
      });
      
      // Check if activity already exists to determine if this is an update or create
      const { data: existingActivity, error: checkError } = await supabase
        .from('activities')
        .select('id')
        .eq('id', activity.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking if activity exists:", checkError);
        throw checkError;
      }
      
      const isNewActivity = !existingActivity;
      
      // Upsert the activity - this is where we actually save to the database
      const { error: upsertError } = await supabase
        .from('activities')
        .upsert(formattedActivity);
        
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
      try {
        await updateActivityParticipants(normalizedActivity);
        console.log(`Updated participants for activity: ${activity.name} (${activity.participants?.length || 0} participants)`);
      } catch (participantError) {
        console.error("Error updating activity participants:", participantError);
        throw participantError;
      }
    }
  } catch (error) {
    console.error("Error saving activities to Supabase:", error);
    throw error;
  }
};
