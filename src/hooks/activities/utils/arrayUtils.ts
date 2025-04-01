
/**
 * Utility functions for array operations in activity hooks
 */
import { Player, Activity } from "@/types/player";

/**
 * Checks if two player arrays are equal by comparing IDs and activities
 */
export const arePlayersEqual = (playersA: Player[], playersB: Player[]): boolean => {
  if (playersA.length !== playersB.length) return false;
  
  for (let i = 0; i < playersA.length; i++) {
    const playerA = playersA[i];
    const playerB = playersB[i];
    
    if (playerA.id !== playerB.id) return false;
    
    if (!arraysEqual(playerA.activities || [], playerB.activities || [])) {
      return false;
    }
  }
  
  return true;
};

/**
 * Checks if two arrays have the same values (regardless of order)
 */
export const arraysEqual = (a: any[], b: any[]): boolean => {
  if (a.length !== b.length) return false;
  
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  
  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) return false;
  }
  
  return true;
};

/**
 * Preserves match data when updating an activity
 * Ensures important fields like result, homeScore, awayScore, and player_stats are preserved
 */
export const preserveMatchData = (existingActivity: Activity, updatedActivity: Activity): Activity => {
  return {
    ...existingActivity,
    ...updatedActivity,
    // Preserve the result data if not explicitly set in the update
    result: updatedActivity.result ?? existingActivity.result,
    homeScore: updatedActivity.homeScore ?? existingActivity.homeScore,
    awayScore: updatedActivity.awayScore ?? existingActivity.awayScore,
    // Merge player_stats objects instead of replacing
    player_stats: {
      ...(existingActivity.player_stats || {}),
      ...(updatedActivity.player_stats || {})
    }
  };
};
