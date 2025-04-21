
import { PlayerStats } from "@/types/player";

/**
 * Helper function to normalize player stats from various formats into a consistent structure
 */
export const normalizePlayerStats = (playerStatsJson: any): PlayerStats => {
  // If player_stats is undefined or null, create an empty object
  if (!playerStatsJson) {
    return { 
      goals: {}, 
      assists: {},
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0
    };
  }
  
  // If player_stats is a string, parse it
  if (typeof playerStatsJson === 'string') {
    try {
      playerStatsJson = JSON.parse(playerStatsJson);
    } catch (e) {
      console.error("Error parsing player_stats string:", e);
      return { 
        goals: {}, 
        assists: {},
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0
      };
    }
  }
  
  // Create a properly formatted object
  return {
    ...playerStatsJson,
    goals: playerStatsJson.goals || {},
    assists: playerStatsJson.assists || {},
    matches: playerStatsJson.matches || 0,
    wins: playerStatsJson.wins || 0,
    draws: playerStatsJson.draws || 0,
    losses: playerStatsJson.losses || 0
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
      cup_matches: [],
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0
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
        cup_matches: stats.cup_matches || [],
        isWin: isWinValue,
        matches: stats.matches || 0,
        wins: stats.wins || 0,
        draws: stats.draws || 0,
        losses: stats.losses || 0
      };
    } catch (e) {
      console.error("Error parsing player_stats JSON:", e);
    }
  }
  
  // Return default structure if parsing fails or no stats exist
  return {
    goals: {},
    assists: {},
    isWin: isWinValue,
    cup_matches: [],
    matches: 0,
    wins: 0,
    draws: 0,
    losses: 0
  };
};
