
import { Activity } from "@/types/player";

/**
 * Ensures that match data is preserved when updating activities
 * This is crucial to prevent match results from being lost during updates
 */
export const preserveMatchData = (originalActivity: Activity, updatedActivity: Activity): Activity => {
  if (originalActivity.type !== 'match' && updatedActivity.type !== 'match') {
    return updatedActivity;
  }

  const result = { ...updatedActivity };

  // Ensure match result data is not lost
  if (updatedActivity.homeScore === undefined && originalActivity.homeScore !== undefined) {
    console.log("Preserving homeScore:", originalActivity.homeScore);
    result.homeScore = originalActivity.homeScore;
  }

  if (updatedActivity.awayScore === undefined && originalActivity.awayScore !== undefined) {
    console.log("Preserving awayScore:", originalActivity.awayScore);
    result.awayScore = originalActivity.awayScore;
  }

  // Preserve the result string
  if (updatedActivity.result === undefined && originalActivity.result !== undefined) {
    console.log("Preserving result string:", originalActivity.result);
    result.result = originalActivity.result;
  }

  // Preserve isWin status
  if (updatedActivity.isWin === undefined && originalActivity.isWin !== undefined) {
    console.log("Preserving isWin status:", originalActivity.isWin);
    result.isWin = originalActivity.isWin;
  }

  // Ensure player_stats is preserved and merged correctly
  if (originalActivity.player_stats) {
    result.player_stats = {
      ...(result.player_stats || {}),
      goals: { 
        ...(originalActivity.player_stats.goals || {}),
        ...(result.player_stats?.goals || {})
      },
      assists: {
        ...(originalActivity.player_stats.assists || {}),
        ...(result.player_stats?.assists || {})
      },
      scores: {
        home: result.homeScore !== undefined ? result.homeScore : originalActivity.player_stats.scores?.home,
        away: result.awayScore !== undefined ? result.awayScore : originalActivity.player_stats.scores?.away
      },
      isWin: result.isWin !== undefined ? result.isWin : originalActivity.player_stats.isWin
    };
  }

  return result;
};

/**
 * Helper function to check if two player arrays are equal
 * Used for optimizing rerenders when player lists don't change
 */
export const arePlayersEqual = (playersA: string[], playersB: string[]): boolean => {
  if (playersA.length !== playersB.length) return false;
  
  // Create sorted copies to compare regardless of order
  const sortedA = [...playersA].sort();
  const sortedB = [...playersB].sort();
  
  return sortedA.every((playerId, index) => playerId === sortedB[index]);
};
