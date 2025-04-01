
import { Activity } from "@/types/player";

/**
 * Preserves match data when updating an activity
 * Ensures that player statistics are not lost when updating an activity
 */
export function preserveMatchData(oldActivity: Activity, newActivity: Activity): Activity {
  // Ensure we have a clean player_stats object to work with
  const ensureValidStats = (stats: any) => {
    if (!stats) return { goals: {}, assists: {} };
    
    // Handle string-encoded JSON (can happen due to form submissions or API responses)
    if (typeof stats === 'string') {
      try {
        // Try to parse JSON string
        let parsed = JSON.parse(stats);
        // Handle double-stringified JSON (this happens sometimes)
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            console.warn("Double-string parse failed:", e);
          }
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing player_stats string:", e);
        return { goals: {}, assists: {} };
      }
    }
    
    // Always ensure we have a valid structure
    return {
      ...stats,
      goals: stats.goals || {},
      assists: stats.assists || {}
    };
  };
  
  // Parse both old and new player_stats to ensure they're valid objects
  const oldPlayerStats = ensureValidStats(oldActivity.player_stats);
  const newPlayerStats = ensureValidStats(newActivity.player_stats);
  
  // Create updated activity with properly merged player_stats - ensure it's always an object, never a string
  const mergedStats = {
    ...oldPlayerStats,
    ...newPlayerStats,
    // Explicitly ensure goals and assists are preserved and merged
    goals: {
      ...(oldPlayerStats.goals || {}),
      ...(newPlayerStats.goals || {})
    },
    assists: {
      ...(oldPlayerStats.assists || {}),
      ...(newPlayerStats.assists || {})
    },
    // Use the new score data
    scores: {
      home: newActivity.homeScore,
      away: newActivity.awayScore
    },
    // Use the new win status
    isWin: newActivity.isWin
  };
  
  // Create final updated activity
  const updatedActivity = {
    ...newActivity,
    player_stats: mergedStats
  };
  
  console.log("Preserving match data:", {
    oldActivity: {
      id: oldActivity.id,
      hasPlayerStats: !!oldActivity.player_stats,
      playerStatsType: typeof oldActivity.player_stats,
      playerStats: oldActivity.player_stats
    },
    newActivity: {
      id: newActivity.id,
      hasPlayerStats: !!newActivity.player_stats,
      playerStatsType: typeof newActivity.player_stats,
      playerStats: newActivity.player_stats
    },
    result: {
      hasPlayerStats: !!updatedActivity.player_stats,
      playerStatsType: typeof updatedActivity.player_stats,
      playerStats: updatedActivity.player_stats
    }
  });
  
  return updatedActivity;
}
