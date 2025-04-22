
import { normalizePlayerStats } from "@/utils/player-stats";

/**
 * Utility functions for handling player stats
 */

/**
 * Ensures player_stats is properly normalized to a consistent object format
 * Handles string JSON, double-stringified JSON, and ensures required properties exist
 * @deprecated Use normalizePlayerStats from @/utils/player-stats instead
 */
export function normalizePlayerStats(playerStats: any) {
  return normalizePlayerStats(playerStats);
}
