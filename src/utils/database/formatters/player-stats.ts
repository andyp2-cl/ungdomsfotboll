
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
  
  // Make sure goals and assists are objects, not numbers
  const goals = typeof playerStatsJson.goals === 'object' ? playerStatsJson.goals || {} : {};
  const assists = typeof playerStatsJson.assists === 'object' ? playerStatsJson.assists || {} : {};
  
  // Create a properly formatted object
  return {
    ...playerStatsJson,
    goals,
    assists
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
      let stats = typeof item.player_stats === 'string' 
        ? JSON.parse(item.player_stats) 
        : item.player_stats;
      
      // Ensure stats is an object
      if (typeof stats !== 'object' || stats === null) {
        stats = {};
      }
        
      return {
        goals: stats.goals || {},
        assists: stats.assists || {},
        scores: {
          home: item.home_score,
          away: item.away_score
        },
        isWin: isWinValue,
        cup_matches: Array.isArray(stats.cup_matches) ? stats.cup_matches : []
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

/**
 * Merges two player stats objects together, with the second one taking precedence
 */
export const mergePlayerStats = (baseStats: Partial<PlayerStats>, newStats: Partial<PlayerStats>): PlayerStats => {
  // Initialize the result with base structure
  const result: PlayerStats = {
    goals: { ...(baseStats.goals || {}) },
    assists: { ...(baseStats.assists || {}) }
  };
  
  // Merge new stats over base stats
  if (newStats.goals) {
    result.goals = { ...result.goals, ...newStats.goals };
  }
  
  if (newStats.assists) {
    result.assists = { ...result.assists, ...newStats.assists };
  }
  
  // Handle cup_matches separately to ensure arrays are properly merged
  if (newStats.cup_matches) {
    result.cup_matches = [
      ...(baseStats.cup_matches || []),
      ...newStats.cup_matches
    ];
    // Remove duplicates
    result.cup_matches = [...new Set(result.cup_matches)];
  } else if (baseStats.cup_matches) {
    result.cup_matches = [...baseStats.cup_matches];
  }
  
  // Handle isWin
  if (newStats.isWin !== undefined) {
    result.isWin = newStats.isWin;
  } else if (baseStats.isWin !== undefined) {
    result.isWin = baseStats.isWin;
  }
  
  // Handle scores
  if (newStats.scores) {
    result.scores = { ...(baseStats.scores || {}), ...newStats.scores };
  } else if (baseStats.scores) {
    result.scores = { ...baseStats.scores };
  }
  
  return result;
};
