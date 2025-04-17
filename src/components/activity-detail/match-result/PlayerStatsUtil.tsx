
import { Activity, PlayerStats } from "@/types/player";

/**
 * Prepares updated player stats object with match result data
 */
export const prepareUpdatedPlayerStats = (
  activity: Activity,
  homeScore?: number,
  awayScore?: number,
  isWin?: boolean,
  isHome?: boolean
): PlayerStats => {
  // Start with existing player_stats or create a new object
  let playerStats = typeof activity.player_stats === 'string'
    ? safeParseJson(activity.player_stats)
    : { ...(activity.player_stats || {}) };
  
  // Ensure required structures exist
  playerStats.goals = playerStats.goals || {};
  playerStats.assists = playerStats.assists || {};
  
  // Add the scores and win status
  playerStats.scores = {
    home: homeScore ?? 0,
    away: awayScore ?? 0
  };
  
  // Store the win status
  playerStats.isWin = isWin;
  
  // Add isHome information for context
  playerStats.isHomeMatch = isHome;
  
  return playerStats;
};

/**
 * Safely parse JSON string to object
 */
const safeParseJson = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    return { goals: {}, assists: {} };
  }
};
