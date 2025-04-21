
import { PlayerStats } from "@/types/player";

/**
 * Normalize player stats to ensure consistent data structure
 * This is necessary because the stats can be null or undefined
 */
export const normalizePlayerStats = (stats?: PlayerStats | null): PlayerStats => {
  if (!stats) {
    return {
      goals: {},
      assists: {},
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0
    };
  }

  // For goals and assists, make sure they're objects
  if (!stats.goals || typeof stats.goals !== 'object') {
    stats.goals = {};
  }
  
  if (!stats.assists || typeof stats.assists !== 'object') {
    stats.assists = {};
  }

  // Make sure numeric values are numbers
  if (stats.matches !== undefined && typeof stats.matches !== 'number') {
    stats.matches = Number(stats.matches) || 0;
  }
  
  if (stats.wins !== undefined && typeof stats.wins !== 'number') {
    stats.wins = Number(stats.wins) || 0;
  }
  
  if (stats.draws !== undefined && typeof stats.draws !== 'number') {
    stats.draws = Number(stats.draws) || 0;
  }
  
  if (stats.losses !== undefined && typeof stats.losses !== 'number') {
    stats.losses = Number(stats.losses) || 0;
  }

  // Ensure cup_matches exists if needed
  if (stats.cup_matches === undefined) {
    stats.cup_matches = [];
  }

  return stats as PlayerStats;
};

/**
 * Merge player stats from two different sources
 * Useful when updating activity stats
 */
export const mergePlayerStats = (
  original?: PlayerStats | null,
  updates?: Partial<PlayerStats> | null
): PlayerStats => {
  // Start with normalized original stats
  const normalizedOriginal = normalizePlayerStats(original);
  
  // If no updates, just return normalized original
  if (!updates) {
    return normalizedOriginal;
  }
  
  // Create a deep clone of the normalized original
  const merged = JSON.parse(JSON.stringify(normalizedOriginal)) as PlayerStats;
  
  // Update goals if provided
  if (updates.goals) {
    merged.goals = { ...merged.goals, ...updates.goals };
  }
  
  // Update assists if provided
  if (updates.assists) {
    merged.assists = { ...merged.assists, ...updates.assists };
  }
  
  // Update numeric values if provided
  if (updates.matches !== undefined) {
    merged.matches = Number(updates.matches) || 0;
  }
  
  if (updates.wins !== undefined) {
    merged.wins = Number(updates.wins) || 0;
  }
  
  if (updates.draws !== undefined) {
    merged.draws = Number(updates.draws) || 0;
  }
  
  if (updates.losses !== undefined) {
    merged.losses = Number(updates.losses) || 0;
  }
  
  // Update cup matches if provided
  if (updates.cup_matches) {
    merged.cup_matches = [...updates.cup_matches];
  }
  
  // Update isWin if provided
  if (updates.isWin !== undefined) {
    merged.isWin = updates.isWin;
  }
  
  // Update scores if provided
  if (updates.scores) {
    merged.scores = { ...updates.scores };
  }
  
  return merged;
};
