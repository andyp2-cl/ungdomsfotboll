
import { Activity } from "@/types/player";

/**
 * Helper function to safely parse player_stats
 */
export function safelyParsePlayerStats(stats: any) {
  if (!stats) return { goals: {}, assists: {} };
  
  // If already an object, ensure it has required structure
  if (typeof stats !== 'string') {
    return {
      ...stats,
      goals: stats.goals || {},
      assists: stats.assists || {}
    };
  }
  
  // Handle string-encoded JSON
  try {
    const parsed = JSON.parse(stats);
    // Check for double-stringified JSON
    if (typeof parsed === 'string') {
      try {
        const doubleDecoded = JSON.parse(parsed);
        return {
          ...doubleDecoded,
          goals: doubleDecoded.goals || {},
          assists: doubleDecoded.assists || {}
        };
      } catch (e) {
        console.error("Error parsing double-stringified JSON:", e);
        return { goals: {}, assists: {} };
      }
    }
    
    return {
      ...parsed,
      goals: parsed.goals || {},
      assists: parsed.assists || {}
    };
  } catch (e) {
    console.error("Error parsing player_stats JSON:", e);
    return { goals: {}, assists: {} };
  }
}

/**
 * Prepare updated player stats object with scoring information
 */
export function prepareUpdatedPlayerStats(
  activity: Activity,
  homeScore: number | undefined,
  awayScore: number | undefined,
  isWin: boolean | undefined,
  isHome: boolean
) {
  // Parse existing player_stats safely and ensure it's not a string
  const existingPlayerStats = safelyParsePlayerStats(activity.player_stats);
  
  // Prepare updated player_stats - ensure it's a complete object
  return {
    ...existingPlayerStats,
    goals: existingPlayerStats.goals || {},
    assists: existingPlayerStats.assists || {},
    scores: {
      home: homeScore,
      away: awayScore
    },
    isWin
  };
}
