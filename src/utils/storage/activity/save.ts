
import { supabase } from "@/lib/supabase/client";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "@/types/player";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";
import { updateActivityParticipants } from "./participants";
import { updateCupMatches } from "./cup-matches";
import { normalizePlayerStats } from "@/utils/player-stats";

// Save activities to Supabase with enhanced error handling and multiple fallback approaches
export const saveActivities = async (activities: Activity[]): Promise<void> => {
  console.log("Saving activities to Supabase:", activities.length);
  
  try {
    for (const activity of activities) {
      // Clone the activity to avoid mutations during processing
      const activityToSave = structuredClone(activity);
      
      // Set cupId to the activity's id if it's a cup type
      if (activityToSave.type === "cup") {
        activityToSave.cupId = activityToSave.id;
      }
      
      // Normalize player_stats to ensure it's always an object
      let normalizedPlayerStats = normalizePlayerStats(activityToSave.player_stats);
      
      // Create a clean activity object with normalized player_stats
      const normalizedActivity = {
        ...activityToSave,
        player_stats: normalizedPlayerStats
      };
      
      console.log("Saving activity with details:", {
        id: normalizedActivity.id,
        name: normalizedActivity.name,
        type: normalizedActivity.type,
        cupId: normalizedActivity.cupId,
        date: normalizedActivity.date,
        homeScore: normalizedActivity.homeScore,
        awayScore: normalizedActivity.awayScore,
        result: normalizedActivity.result,
        isWin: normalizedActivity.isWin
      });
      
      try {
        // Check if activity already exists
        const { data: existingActivity } = await supabase
          .from('activities')
          .select('id')
          .eq('id', activity.id)
          .maybeSingle();
        
        const isNewActivity = !existingActivity;
        
        // Format the activity for database storage
        const formattedActivity = formatActivityForDatabase(normalizedActivity);
        
        // Make a safe copy of the formatted activity to avoid circular references
        const cleanFormattedActivity = JSON.parse(JSON.stringify(formattedActivity));
        console.log("Data being sent to Supabase:", JSON.stringify({
          id: cleanFormattedActivity.id,
          name: cleanFormattedActivity.name,
          home_score: cleanFormattedActivity.home_score,
          away_score: cleanFormattedActivity.away_score,
          is_win: cleanFormattedActivity.is_win,
          result: cleanFormattedActivity.result
        }));
        
        // CRITICAL FIX: First try updating only specific fields that need to change
        let saved = false;
        let lastError = null;
        
        // Approach 1: Score-only update if we're just changing scores
        if (!isNewActivity && 
            (normalizedActivity.homeScore !== undefined || normalizedActivity.awayScore !== undefined)) {
          console.log("Trying score-only update for activity:", activity.id);
          
          // Create a minimal update payload with just the score-related fields
          const scoreUpdatePayload = {
            home_score: cleanFormattedActivity.home_score,
            away_score: cleanFormattedActivity.away_score,
            is_win: cleanFormattedActivity.is_win,
            result: cleanFormattedActivity.result,
            player_stats: cleanFormattedActivity.player_stats
          };
          
          const { error: scoreUpdateError } = await supabase
            .from('activities')
            .update(scoreUpdatePayload)
            .eq('id', activity.id);
            
          if (!scoreUpdateError) {
            saved = true;
            console.log("Score-only update successful for activity:", activity.id);
          } else {
            lastError = scoreUpdateError;
            console.error("Score-only update failed:", scoreUpdateError.message, scoreUpdateError.details);
          }
        }
            
        // Approach 2: Direct update if it's an existing activity
        if (!saved && !isNewActivity) {
          console.log("Trying direct update for existing activity:", activity.id);
          const { error: updateError } = await supabase
            .from('activities')
            .update(cleanFormattedActivity)
            .eq('id', activity.id);
            
          if (!updateError) {
            saved = true;
            console.log("Direct update successful for activity:", activity.id);
          } else {
            lastError = updateError;
            console.error("Direct update failed:", updateError.message, updateError.details);
          }
        }
        
        // Approach 3: Standard upsert if update failed or it's a new activity
        if (!saved) {
          console.log("Trying upsert for activity:", activity.id);
          const { error: upsertError } = await supabase
            .from('activities')
            .upsert(cleanFormattedActivity);
            
          if (!upsertError) {
            saved = true;
            console.log("Upsert successful for activity:", activity.id);
          } else {
            lastError = upsertError;
            console.error("Upsert failed:", upsertError.message, upsertError.details);
          }
        }
        
        // Approach 4: Insert directly if all else failed and it's a new activity
        if (!saved && isNewActivity) {
          console.log("Trying direct insert for new activity:", activity.id);
          const { error: insertError } = await supabase
            .from('activities')
            .insert(cleanFormattedActivity);
            
          if (!insertError) {
            saved = true;
            console.log("Direct insert successful for activity:", activity.id);
          } else {
            lastError = insertError;
            console.error("Direct insert failed:", insertError.message, insertError.details);
          }
        }
          
        if (!saved) {
          console.error("All save approaches failed for activity:", activity.id);
          if (lastError) {
            console.error("Last error:", lastError.message, lastError.details);
          }
          throw new Error(`Failed to save activity: ${lastError?.message || 'Unknown error'}`);
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
            console.log(`Updated participants for activity: ${activity.name}`);
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
