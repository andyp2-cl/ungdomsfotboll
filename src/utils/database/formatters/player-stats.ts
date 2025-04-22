
import { PlayerStats } from "@/types/player";
import { 
  normalizePlayerStats as normalizePlayerStatsUtil, 
  mergePlayerStats as mergePlayerStatsUtil, 
  formatPlayerStatsFromDatabase as formatStats 
} from "@/utils/player-stats";

/**
 * Helper function to normalize player stats from various formats into a consistent structure
 * @deprecated Use normalizePlayerStats from @/utils/player-stats instead
 */
export const normalizePlayerStats = (playerStatsJson: any): PlayerStats => {
  return normalizePlayerStatsUtil(playerStatsJson);
};

/**
 * Formats player stats from database format to application format
 * @deprecated Use formatPlayerStatsFromDatabase from @/utils/player-stats instead
 */
export const formatPlayerStatsFromDatabase = (item: any): PlayerStats => {
  return formatStats(item);
};

/**
 * Merges two player stats objects together, with the second one taking precedence
 * @deprecated Use mergePlayerStats from @/utils/player-stats instead
 */
export const mergePlayerStats = (baseStats: Partial<PlayerStats>, newStats: Partial<PlayerStats>): PlayerStats => {
  return mergePlayerStatsUtil(baseStats, newStats);
};
