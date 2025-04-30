
import { supabase } from "@/lib/supabase/client";
import { Activity } from "@/types/player";
import { SaveApproachResult, ActivitySaveData } from "./types";

/**
 * Multiple approaches to save activity data to the database
 * Each approach is tried in sequence for maximum reliability
 */

/**
 * Approach 1: League-only update if we're just changing league
 */
export const leagueOnlyUpdate = async (
  data: ActivitySaveData
): Promise<SaveApproachResult> => {
  const { activity, formattedActivity, isNewActivity } = data;
  
  if (isNewActivity || activity.leagueId === undefined) {
    return { saved: false };
  }
  
  console.log("Trying league-only update for activity:", activity.id);
  
  // Create a minimal update payload with just the league field
  const leagueUpdatePayload = {
    league_id: formattedActivity.league_id,
  };
  
  const { error } = await supabase
    .from('activities')
    .update(leagueUpdatePayload)
    .eq('id', activity.id);
    
  if (!error) {
    console.log("League-only update successful for activity:", activity.id);
    return { saved: true };
  } else {
    console.error("League-only update failed:", error.message, error.details);
    return { saved: false, error };
  }
};

/**
 * Approach 2: Score-only update if we're just changing scores
 */
export const scoreOnlyUpdate = async (
  data: ActivitySaveData
): Promise<SaveApproachResult> => {
  const { activity, formattedActivity, isNewActivity } = data;
  
  if (isNewActivity || 
      (activity.homeScore === undefined && activity.awayScore === undefined)) {
    return { saved: false };
  }
  
  console.log("Trying score-only update for activity:", activity.id);
  
  // Create a minimal update payload with just the score-related fields
  const scoreUpdatePayload = {
    home_score: formattedActivity.home_score,
    away_score: formattedActivity.away_score,
    is_win: formattedActivity.is_win,
    result: formattedActivity.result,
    player_stats: formattedActivity.player_stats
  };
  
  const { error } = await supabase
    .from('activities')
    .update(scoreUpdatePayload)
    .eq('id', activity.id);
    
  if (!error) {
    console.log("Score-only update successful for activity:", activity.id);
    return { saved: true };
  } else {
    console.error("Score-only update failed:", error.message, error.details);
    return { saved: false, error };
  }
};

/**
 * Approach 3: Direct update if it's an existing activity
 */
export const directUpdate = async (
  data: ActivitySaveData
): Promise<SaveApproachResult> => {
  const { activity, formattedActivity, isNewActivity } = data;
  
  if (isNewActivity) {
    return { saved: false };
  }
  
  console.log("Trying direct update for existing activity:", activity.id);
  
  const { error } = await supabase
    .from('activities')
    .update(formattedActivity)
    .eq('id', activity.id);
    
  if (!error) {
    console.log("Direct update successful for activity:", activity.id);
    return { saved: true };
  } else {
    console.error("Direct update failed:", error.message, error.details);
    return { saved: false, error };
  }
};

/**
 * Approach 4: Standard upsert for any activity
 */
export const upsertActivity = async (
  data: ActivitySaveData
): Promise<SaveApproachResult> => {
  const { activity, formattedActivity } = data;
  
  console.log("Trying upsert for activity:", activity.id);
  
  const { error } = await supabase
    .from('activities')
    .upsert(formattedActivity);
    
  if (!error) {
    console.log("Upsert successful for activity:", activity.id);
    return { saved: true };
  } else {
    console.error("Upsert failed:", error.message, error.details);
    return { saved: false, error };
  }
};

/**
 * Approach 5: Direct insert for new activities
 */
export const directInsert = async (
  data: ActivitySaveData
): Promise<SaveApproachResult> => {
  const { activity, formattedActivity, isNewActivity } = data;
  
  if (!isNewActivity) {
    return { saved: false };
  }
  
  console.log("Trying direct insert for new activity:", activity.id);
  
  const { error } = await supabase
    .from('activities')
    .insert(formattedActivity);
    
  if (!error) {
    console.log("Direct insert successful for activity:", activity.id);
    return { saved: true };
  } else {
    console.error("Direct insert failed:", error.message, error.details);
    return { saved: false, error };
  }
};
