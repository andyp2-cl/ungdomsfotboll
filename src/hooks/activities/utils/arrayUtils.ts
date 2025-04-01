/**
 * Utility functions for array operations in activity hooks
 */
import { Activity, Player } from "@/types/player";

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
 * Ensures that important data like player stats, results, and scores are not lost
 */
export const preserveMatchData = (originalActivity: Activity, updatedActivity: Activity): Activity => {
  // Start with the updated activity as the base
  const result: Activity = {
    ...updatedActivity
  };
  
  // Special handling for match data to ensure it's preserved
  if (originalActivity.type === 'match' || updatedActivity.type === 'match') {
    console.log('Preserving match data:', {
      original: {
        result: originalActivity.result,
        homeScore: originalActivity.homeScore,
        awayScore: originalActivity.awayScore,
        isWin: originalActivity.isWin
      },
      updated: {
        result: updatedActivity.result,
        homeScore: updatedActivity.homeScore,
        awayScore: updatedActivity.awayScore,
        isWin: updatedActivity.isWin
      }
    });
    
    // Keep the result if it exists in either version, with preference for the updated one
    result.result = updatedActivity.result || originalActivity.result;
    
    // For scores, prefer updated values but fall back to original if not present
    result.homeScore = updatedActivity.homeScore !== undefined ? updatedActivity.homeScore : originalActivity.homeScore;
    result.awayScore = updatedActivity.awayScore !== undefined ? updatedActivity.awayScore : originalActivity.awayScore;
    
    // Make sure the result string and scores are in sync
    if (result.homeScore !== undefined && result.awayScore !== undefined) {
      result.result = `${result.homeScore}-${result.awayScore}`;
    }
    
    // Preserve win status, prioritizing the updated version
    result.isWin = updatedActivity.isWin !== undefined ? updatedActivity.isWin : originalActivity.isWin;
    
    // Ensure player_stats are properly merged and consistently store score data
    result.player_stats = {
      // Start with original stats or empty objects
      goals: { ...(originalActivity.player_stats?.goals || {}) },
      assists: { ...(originalActivity.player_stats?.assists || {}) },
      // Keep or create scores object, ensuring it's always in sync with the activity scores
      scores: {
        home: result.homeScore,
        away: result.awayScore
      },
      isWin: result.isWin
    };
    
    // Merge in new stats if they exist
    if (updatedActivity.player_stats?.goals) {
      result.player_stats.goals = {
        ...result.player_stats.goals,
        ...updatedActivity.player_stats.goals
      };
    }
    
    if (updatedActivity.player_stats?.assists) {
      result.player_stats.assists = {
        ...result.player_stats.assists,
        ...updatedActivity.player_stats.assists
      };
    }

    console.log('Preserved match data result:', {
      result: result.result,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      isWin: result.isWin,
      player_stats: result.player_stats
    });
  }
  
  return result;
};
