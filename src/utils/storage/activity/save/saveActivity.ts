
import { supabase } from "@/lib/supabase/client";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "@/types/player";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";
import { updateActivityParticipants } from "../participants";
import { updateCupMatches } from "../cup-matches";
import { normalizePlayerStats } from "@/utils/player-stats";
import { SaveActivityResult } from "./types";
import { 
  leagueOnlyUpdate, 
  scoreOnlyUpdate, 
  directUpdate, 
  upsertActivity, 
  directInsert 
} from "./saveActivityApproaches";

/**
 * Save a single activity to the database with multiple fallback approaches
 */
export const saveActivity = async (activity: Activity): Promise<SaveActivityResult> => {
  try {
    console.log("Saving activity to Supabase:", activity.id);
    
    // Clone the activity to avoid mutations during processing
    const activityToSave = structuredClone(activity);
    
    // Set cupId to the activity's id if it's a cup type
    if (activityToSave.type === "cup") {
      activityToSave.cupId = activityToSave.id;
    }
    
    // Normalize player_stats to ensure it's always an object
    const normalizedPlayerStats = normalizePlayerStats(activityToSave.player_stats);
    
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
      leagueId: normalizedActivity.leagueId,
      date: normalizedActivity.date,
      homeScore: normalizedActivity.homeScore,
      awayScore: normalizedActivity.awayScore,
      result: normalizedActivity.result,
      isWin: normalizedActivity.isWin
    });
    
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
      league_id: cleanFormattedActivity.league_id,
      home_score: cleanFormattedActivity.home_score,
      away_score: cleanFormattedActivity.away_score,
      is_win: cleanFormattedActivity.is_win,
      result: cleanFormattedActivity.result
    }));
    
    const activitySaveData = {
      activity: normalizedActivity,
      formattedActivity: cleanFormattedActivity,
      isNewActivity
    };
    
    // Try each saving approach in sequence
    let saved = false;
    let lastError = null;
    
    // Approach 1: League-only update
    const leagueResult = await leagueOnlyUpdate(activitySaveData);
    if (leagueResult.saved) {
      saved = true;
    } else {
      lastError = leagueResult.error || lastError;
      
      // Approach 2: Score-only update
      const scoreResult = await scoreOnlyUpdate(activitySaveData);
      if (scoreResult.saved) {
        saved = true;
      } else {
        lastError = scoreResult.error || lastError;
        
        // Approach 3: Direct update
        const updateResult = await directUpdate(activitySaveData);
        if (updateResult.saved) {
          saved = true;
        } else {
          lastError = updateResult.error || lastError;
          
          // Approach 4: Upsert
          const upsertResult = await upsertActivity(activitySaveData);
          if (upsertResult.saved) {
            saved = true;
          } else {
            lastError = upsertResult.error || lastError;
            
            // Approach 5: Direct insert
            const insertResult = await directInsert(activitySaveData);
            if (insertResult.saved) {
              saved = true;
            } else {
              lastError = insertResult.error || lastError;
            }
          }
        }
      }
    }
    
    if (!saved) {
      console.error("All save approaches failed for activity:", activity.id);
      if (lastError) {
        console.error("Last error:", lastError.message, lastError.details);
      }
      return {
        success: false,
        error: lastError,
        message: `Failed to save activity: ${lastError?.message || 'Unknown error'}`
      };
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
        await updateCupMatches(normalizedActivity, []);
        console.log(`Updated ${normalizedActivity.matches.length} matches for cup: ${normalizedActivity.name}`);
      } catch (cupMatchError) {
        console.error("Error updating cup matches:", cupMatchError);
      }
    }
    
    return {
      success: true,
      isNew: isNewActivity
    };
    
  } catch (error) {
    console.error("Error saving activity to Supabase:", error);
    return {
      success: false,
      error,
      message: error.message || "Unknown error saving activity"
    };
  }
};

/**
 * Save multiple activities to the database
 */
export const saveActivities = async (activities: Activity[]): Promise<void> => {
  console.log("Saving activities to Supabase:", activities.length);
  
  try {
    for (const activity of activities) {
      try {
        await saveActivity(activity);
      } catch (activityError) {
        console.error("Error processing activity:", activity.id, activityError);
        // Continue with other activities instead of failing the entire batch
      }
    }
  } catch (error) {
    console.error("Error saving activities to Supabase:", error);
    throw error;
  }
};
