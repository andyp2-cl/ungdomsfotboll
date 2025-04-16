
import { PlayerStats } from "@/types/player";

/**
 * Helper function to normalize player stats from various formats into a consistent structure
 */
export const normalizePlayerStats = (playerStatsJson: any): PlayerStats => {
  // If player_stats is undefined or null, create an empty object
  if (!playerStatsJson) {
    return { goals: {}, assists: {} };
  }
  
  // If player_stats is a string, parse it
  if (typeof playerStatsJson === 'string') {
    try {
      playerStatsJson = JSON.parse(playerStatsJson);
    } catch (e) {
      console.error("Error parsing player_stats string:", e);
      return { goals: {}, assists: {} };
    }
  }
  
  // Create a properly formatted object
  return {
    ...playerStatsJson,
    goals: playerStatsJson.goals || {},
    assists: playerStatsJson.assists || {}
  };
};

/**
 * Formats player stats from database format to application format
 */
export const formatPlayerStatsFromDatabase = (item: any): PlayerStats => {
  if (!item) {
    return {
      goals: {},
      assists: {},
      scores: {
        home: undefined,
        away: undefined
      },
      isWin: undefined,
      cup_matches: []
    };
  }
  
  // Explicit handling of isWin to avoid undefined reference issues
  const isWinValue = item.is_win === true ? true : item.is_win === false ? false : undefined;
  
  if (item.player_stats) {
    try {
      const stats = typeof item.player_stats === 'string' 
        ? JSON.parse(item.player_stats) 
        : item.player_stats;
        
      return {
        goals: stats.goals || {},
        assists: stats.assists || {},
        scores: {
          home: item.home_score,
          away: item.away_score
        },
        isWin: isWinValue,
        cup_matches: stats.cup_matches || []
      };
    } catch (e) {
      console.error("Error parsing player_stats JSON:", e);
    }
  }
  
  // Return default structure if parsing fails or no stats exist
  return {
    goals: {},
    assists: {},
    scores: {
      home: item.home_score,
      away: item.away_score
    },
    isWin: isWinValue,
    cup_matches: []
  };
};
