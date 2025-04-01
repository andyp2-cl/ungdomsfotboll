
import { Activity } from "@/types/player";

/**
 * Preserves match data when updating an activity
 * Ensures that player statistics are not lost when updating an activity
 */
export function preserveMatchData(oldActivity: Activity, newActivity: Activity): Activity {
  // Correctly parse player_stats if they're strings
  const parsePlayerStats = (stats: any) => {
    if (!stats) return { goals: {}, assists: {} };
    
    if (typeof stats === 'string') {
      try {
        const parsed = JSON.parse(stats);
        // Check for double-stringified JSON
        return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
      } catch (e) {
        console.error("Error parsing player_stats:", e);
        return { goals: {}, assists: {} };
      }
    }
    
    return stats;
  };
  
  // Parse both old and new player_stats
  const oldPlayerStats = parsePlayerStats(oldActivity.player_stats);
  const newPlayerStats = parsePlayerStats(newActivity.player_stats);
  
  return {
    ...newActivity,
    // Merge player_stats, giving precedence to new data
    player_stats: {
      ...oldPlayerStats,
      ...newPlayerStats,
      // Ensure goals and assists are preserved
      goals: {
        ...(oldPlayerStats?.goals || {}),
        ...(newPlayerStats?.goals || {})
      },
      assists: {
        ...(oldPlayerStats?.assists || {}),
        ...(newPlayerStats?.assists || {})
      },
      // Use the new score data
      scores: newPlayerStats?.scores || oldPlayerStats?.scores,
      // Use the new win status
      isWin: newActivity.isWin
    }
  };
}
