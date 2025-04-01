
// This file is now deprecated - import from src/hooks/activities/utils/playerStatsUtils instead
import { normalizePlayerStats as normalizePlayerStatsUtil } from "@/hooks/activities/utils/playerStatsUtils";

/**
 * Utility to ensure player_stats is always a properly formatted object
 * @deprecated Use normalizePlayerStats from @/hooks/activities/utils/playerStatsUtils instead
 */
export function normalizePlayerStats(playerStats: any) {
  return normalizePlayerStatsUtil(playerStats);
}
