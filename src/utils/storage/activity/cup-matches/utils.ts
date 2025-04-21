
import { Activity } from "@/types/player";
import { Json } from "@/types/supabase";

/**
 * Extract cup matches array from player_stats
 */
export function extractCupMatchesFromPlayerStats(playerStats: any): string[] {
  // Handle string format (needs parsing)
  if (typeof playerStats === 'string') {
    try {
      const parsedStats = JSON.parse(playerStats);
      if (parsedStats && typeof parsedStats === 'object') {
        return Array.isArray(parsedStats.cup_matches) ? parsedStats.cup_matches : [];
      }
    } catch (e) {
      console.error("Error parsing player_stats JSON:", e);
      return [];
    }
  }
  
  // Handle object format
  if (playerStats && typeof playerStats === 'object' && 'cup_matches' in playerStats) {
    return Array.isArray(playerStats.cup_matches) ? playerStats.cup_matches : [];
  }
  
  return [];
}

/**
 * Safely update player stats with cup matches
 */
export function addMatchToPlayerStats(playerStats: any, matchId: string): Record<string, any> {
  let updatedStats = playerStats;
  
  // If playerStats is a string, parse it first
  if (typeof updatedStats === 'string') {
    try {
      updatedStats = JSON.parse(updatedStats);
    } catch (e) {
      updatedStats = { goals: {}, assists: {} };
    }
  }
  
  // If playerStats is null/undefined or not an object, initialize it
  if (!updatedStats || typeof updatedStats !== 'object') {
    updatedStats = { goals: {}, assists: {} };
  }
  
  // Get existing cup matches or initialize as empty array
  let cupMatches = Array.isArray(updatedStats.cup_matches) ? updatedStats.cup_matches : [];
  
  // Add the match if not already present
  if (!cupMatches.includes(matchId)) {
    cupMatches.push(matchId);
  }
  
  // Return updated player stats
  return {
    ...updatedStats,
    cup_matches: cupMatches
  };
}
